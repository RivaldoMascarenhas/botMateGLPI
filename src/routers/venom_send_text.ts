import express from "express";
import { textRequestSchema } from "../schema.js";
import { ZodError } from "zod";
import { logger } from "../index.js";
import { sendTextToIA } from "../services/ia.js";
import type { ResponseIA } from "../@types.ts";
import { glpiCreateTicket } from "../GLPI.js";
import { prisma } from "../utils.js";

const venomRouter = express.Router();

venomRouter.post("/venom/ticket", async (req, res) => {
  try {
    const body = req.body;
    const { phone, text, user } = textRequestSchema.parse(body);
    logger.info(`Recebido texto de ${phone}: ${text}`);

    // Cooldown de 10 minutos
    const cooldownMinutes = 10;
    const lastTicket = await prisma.ticket.findFirst({
      where: { phone: String(phone) },
      orderBy: { createdAt: "desc" },
    });

    if (lastTicket) {
      const diffMinutes =
        (Date.now() - lastTicket.createdAt.getTime()) / 1000 / 60;
      if (diffMinutes < cooldownMinutes) {
        res.status(429).json({
          error: `Aguarde ${Math.ceil(
            cooldownMinutes - diffMinutes
          )} minutos para abrir outro chamado.`,
        });
        logger.info(
          `Aguarde ${Math.ceil(
            cooldownMinutes - diffMinutes
          )} minutos para abrir outro chamado.`
        );
        return;
      }
    }

    const responseIA = await sendTextToIA(text);
    logger.info(`Resposta da IA: ${responseIA}`);

    if (!responseIA) {
      res.status(500).json({ error: "Erro ao obter resposta da IA" });
      return;
    }
    let parsedResponse: ResponseIA = JSON.parse(responseIA);
    if (parsedResponse.error) {
      res.status(400).json(parsedResponse);
      return;
    }

    parsedResponse = { ...parsedResponse, userRequest: user };

    const responseGLPI = await glpiCreateTicket(parsedResponse);
    if (!responseGLPI) {
      res.status(500).json({ error: "Erro ao criar chamado no GLPI" });
      return;
    }
    const savedTicket = await prisma.ticket.create({
      data: {
        title: parsedResponse.title,
        description: parsedResponse.description,
        requesttypes_id: parsedResponse.requesttypes_id,
        urgencyText: parsedResponse.urgencyText,
        userRequest: parsedResponse.userRequest,
        glpiTicketId: responseGLPI.id,
        phone: String(phone),
      },
    });

    res
      .status(201)
      .json({ ...parsedResponse, glpiTicketId: responseGLPI.id, phone });
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Dados inválidos" });
    } else {
      logger.error("Erro ao enviar texto:", error?.message || error);
      res.status(500).json({ error: "Erro ao enviar texto" });
    }
    return;
  }
});

export default venomRouter;
