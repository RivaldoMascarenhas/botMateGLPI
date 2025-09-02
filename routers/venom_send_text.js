import express from "express";
import { z } from "zod";
import { sendTextToIA } from "../services/ia.js";
import { logger } from "../index.js";
import { textRequestSchema } from "../schema.js";
import glpiCreateTicket from "../GLPI.js";

const router = express.Router();

router.post("/venom/text", async (req, res) => {
  try {
    const { user, phone, text } = textRequestSchema.parse(req.body);
    logger.info(`Recebida mensagem vinda do bot. ${user}: ${text}`);
    //lógica que envia para a ia
    const response = await sendTextToIA(text);
    logger.info(`Resposta da IA para ${user}: ${response}`);
    //lógica que transforma a resposta da ia em um ticket
    const newTicket = JSON.parse(response);
    newTicket = { ...newTicket, requester_name: user }; // Adiciona o nome do requerente e o telefone ao ticket

    //lógica que envia para o glpi
    const glpiResponse = await glpiCreateTicket(newTicket);

    glpiResponse = { ...glpiResponse, phone }; // Adiciona o telefone na resposta do GLPI
    logger.info(`Resposta do GLPI para ${user}: ${glpiResponse}`);

    res.json({ ticket: glpiResponse });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`Validação falhou: ${JSON.stringify(error.errors)}`);
      return res.status(400).json({ errors: error.errors });
    }
    logger.error(`Erro ao processar solicitação: ${error.message}`);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
