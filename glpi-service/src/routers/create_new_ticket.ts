import express from "express";
import { textRequestSchema } from "../schema";
import { ZodError } from "zod";
import { logger } from "../index";
import { sendTextToIA } from "../googleGenAI";
import type { ResponseIA } from "../@types";
import { glpiCreateTicket } from "../glpi/glpi";
import { prisma } from "../utils";

const venomRouter = express.Router();

venomRouter.post("/ticket", async (req, res) => {
  try {
    const body = req.body;
    const { phone, text, user } = textRequestSchema.parse(body);
    logger.info(`Recebido texto de ${phone} - ${user}: ${text}`);

    // Cooldown de 5 minutos
    const cooldownMinutes = 5;
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
      logger.error(`mensagem de erro: ${parsedResponse.error}`);
      res.status(400).json(parsedResponse);
      return;
    }

    const responseGLPI = await glpiCreateTicket(parsedResponse);
    if (!responseGLPI) {
      res.status(500).json({ error: "Erro ao criar chamado no GLPI" });
      return;
    }
    if (responseGLPI.error) {
      logger.error(`❌Erro ao criar chamado no GLPI: ${responseGLPI.error}`);
      res.status(500).json({ error: responseGLPI.error });
      return;
    }
    try {
      const savedTicket = await prisma.ticket.create({
        data: {
          title: parsedResponse.title,
          description: parsedResponse.description,
          requesttypes_id: 4, //whatsapp
          urgencyText: parsedResponse.urgencyText,
          userRequest: parsedResponse.userRequest,
          glpiTicketId: responseGLPI.id,
          phone: String(phone),
        },
      });
      logger.info(
        `Ticket salvo no banco de dados:  ${String(savedTicket.glpiTicketId)}`
      );
    } catch (error: any) {
      logger.error("Erro ao salvar ticket no banco de dados:", error);
      res
        .status(500)
        .json({ error: "Erro ao salvar ticket no banco de dados" });
      return;
    }
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
