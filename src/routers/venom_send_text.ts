import express from "express";
import { z } from "zod";
import { sendTextToIA } from "../services/ia.ts";
import { logger } from "../index.ts";
import { textRequestSchema } from "../schema.ts";
import { glpiCreateTicket } from "../GLPI.ts";
import type { ResponseIA } from "../@types.ts";

const router = express.Router();

router.post("/venom/text", async (req, res) => {
  try {
    const { user, phone, text } = textRequestSchema.parse(req.body);
    logger.info(`Recebida mensagem vinda do bot. ${user}: ${text}`);

    //lógica que envia para a ia
    const iaResponse: ResponseIA = await sendTextToIA(text);
    logger.info(`Resposta da IA para ${user}: ${iaResponse}`);

    //lógica que transforma a resposta da ia em um ticket
    let newTicket = { ...iaResponse, requester_name: user };

    //lógica que envia para o glpi
    let glpiResponse: any = await glpiCreateTicket(newTicket);

    glpiResponse = { ...glpiResponse, phone };
    logger.info(`Resposta do GLPI para ${user}: ${glpiResponse}`);

    res.json({ ticket: glpiResponse });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      logger.warn(`Validação falhou: ${JSON.stringify(error.message)}`);
      return res.status(400).json({ errors: error.message });
    }
    logger.error(`Erro ao processar solicitação: ${error.message}`);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
