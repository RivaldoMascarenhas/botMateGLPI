import express from "express";
import { textRequestSchema } from "../schema.ts";
import { ZodError } from "zod";
import { logger } from "../index.ts";
import { sendTextToIA } from "../services/ia.ts";
import type { ResponseIA } from "../@types.ts";
import { glpiCreateTicket } from "../GLPI.ts";
import type { parse } from "path";

const router = express.Router();

router.post("/venom/text", async (req, res) => {
  try {
    const { phone, text, user } = textRequestSchema.parse(req.body);
    const responseIA = await sendTextToIA(text);
    logger.info(`Resposta da IA: ${responseIA}`);

    if (!responseIA) {
      res.status(500).json({ error: "Erro ao obter resposta da IA" });
      return;
    }
    let parsedResponse: ResponseIA = JSON.parse(responseIA);
    parsedResponse = { ...parsedResponse, userResquest: user };

    const responseGLPI = await glpiCreateTicket(parsedResponse);
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

export default router;
