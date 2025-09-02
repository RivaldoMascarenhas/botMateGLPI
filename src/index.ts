import * as dotenv from "dotenv";
import pino from "pino";
import pinoPretty from "pino-pretty";
import cors from "cors";
import express from "express";
import router from "./routers/venom_send_text.ts";

dotenv.config();

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(cors());
app.use("/", router);
export const logger = pino(pinoPretty({ translateTime: "SYS:standard" }));

if (
  !process.env.GLPI_URL ||
  !process.env.GLPI_APP_TOKEN ||
  !process.env.GLPI_USER_TOKEN
) {
  logger.error("Configure GLPI_URL, GLPI_APP_TOKEN e GLPI_USER_TOKEN no .env");
  process.exit(1);
}

app.listen(process.env.PORT, () => {
  logger.info(`Servidor rodando na porta ${process.env.PORT}`);
});
