import express from "express";
import { z } from "zod";
import { sendTextToIA } from "../services/ia.js";
import { logger } from "../index.js";
import { textRequestSchema } from "../schema.js";
import glpiCreateTicket from "../GLPI.js";

const router = express.Router();

router.post("/venom/text", async (req, res) => {
  try {
    const { user, text } = textRequestSchema.parse(req.body);
    logger.info(`Recebida mensagem vinda do bot. ${user}: ${text}`);
    //lógica que envia para a ia
    const response = await sendTextToIA(text);
    logger.info(`Resposta da IA para ${user}: ${response}`);
    const newTicket = JSON.parse(response);
    newTicket = { ...newTicket, requester_name: user }; //adiciona o nome do usuário que enviou a mensagem

    //lógica que envia para o glpi
    const glpiResponse = await glpiCreateTicket(newTicket);
    logger.info(`Resposta do GLPI para ${user}: ${glpiResponse}`);

    res.json({ response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`Validação falhou: ${JSON.stringify(error.errors)}`);
      return res.status(400).json({ errors: error.errors });
    }
    logger.error(`Erro ao enviar texto para IA: ${error.message}`);
    res.status(500).json({ error: "Error sending text to IA" });
  }
});

export default router;
