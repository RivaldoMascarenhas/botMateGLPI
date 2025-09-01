import express from "express";
import { z } from "zod";
import { sendTextToIA } from "../services/ia.js";
import { logger } from "../index.js";
import { textRequestSchema } from "../schema.js";

const router = express.Router();

router.post("/venom/text", async (req, res) => {
  try {
    const { user, text } = textRequestSchema.parse(req.body);
    logger.info(`Recebida mensagem de ${user}: ${text}`);

    const response = await sendTextToIA(text);
    logger.info(`Resposta da IA para ${user}: ${response}`);

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
