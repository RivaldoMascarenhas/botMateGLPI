import dotenv from "dotenv";
import pino from "pino";
import pinoPretty from "pino-pretty";
import cors from "cors";
import express from "express";

process = dotenv.config();
const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(cors());
const logger = pino(pinoPretty({ translateTime: "SYS:standard" }));

if (
  !process.env.GLPI_URL ||
  !process.env.GLPI_APP_TOKEN ||
  !process.env.GLPI_USER_TOKEN
) {
  logger.error("Configure GLPI_URL, GLPI_APP_TOKEN e GLPI_USER_TOKEN no .env");
  process.exit(1);
}
