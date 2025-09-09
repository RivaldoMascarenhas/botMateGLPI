import * as dotenv from "dotenv";
import pino from "pino";
import pinoPretty from "pino-pretty";
import cors from "cors";
import express from "express";
import venomRouter from "./routers/create_new_ticket";
import helmet from "helmet";
import compression from "compression";
import timeout from "connect-timeout";

dotenv.config();

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());
app.use(timeout("20s"));
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
