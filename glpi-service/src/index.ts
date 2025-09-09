import * as dotenv from "dotenv";
import pino from "pino";
import pinoPretty from "pino-pretty";
import cors from "cors";
import express from "express";
import venomRouter from "./routers/venom_send_text";

dotenv.config();

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(cors());
app.use("/", venomRouter);
export const logger = pino(pinoPretty({ translateTime: "SYS:standard" }));

export const {
  ENTITY_ID,
  PORT,
  CATEGORY_ID,
  TIMEOUT,
  GLPI_USER_TOKEN,
  GLPI_APP_TOKEN,
  GLPI_URL,
  GEMINI_API_KEY,
} = process.env;
if (!GLPI_URL || !GLPI_APP_TOKEN || !GLPI_USER_TOKEN || !GEMINI_API_KEY) {
  logger.error(
    "Configure GLPI_URL, GLPI_APP_TOKEN, GLPI_USER_TOKEN e GEMINI_API_KEY no .env"
  );
  process.exit(1);
}

app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});
