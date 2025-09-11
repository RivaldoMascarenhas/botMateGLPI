import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import { ResponseIA } from "./@type";
import { infoCreateTicket, message } from "./message";
import { isValidName } from "./utils";

dotenv.config();
const PORT = process.env.PORT;
const app = express();
app.use(express.json());

// Inicia o cliente WhatsApp com persistência
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./session" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// Gera QR Code no terminal
client.on("qr", (qr) => {
  console.log("📲 Escaneie o QR Code abaixo:");
  qrcode.generate(qr, { small: true });
});

// Conectado com sucesso
client.on("ready", () => {
  console.log("✅ WhatsApp conectado com sucesso!");
});

// Lê mensagens recebidas
client.on("message", async (msg) => {
  const text = msg.body.toLowerCase();
  const sender = msg.from;
  let contact;
  try {
    contact = await client.getContactById(sender);
  } catch (error) {
    console.error(error);
  }

  // garante um nome válido
  let name =
    contact?.pushname?.split(" ")[0] ||
    contact?.name?.split(" ")[0] ||
    `${sender.replace("@c.us", "")}`;

  if (!isValidName(name)) {
    name = sender.replace("@c.us", "").replace("55", "");
  }

  if (text.toLowerCase().includes("chamado") && text.length == 7) {
    await client.sendMessage(sender, infoCreateTicket(name));
  }

  if (text.toLowerCase().includes("chamado") && text.length > 7) {
    console.log(`📩 Mensagem recebida de ${name}: ${msg.body}`);
    console.log(`📩 Enviando mensagem para o backend...`);

    try {
      const response = await axios.post<ResponseIA>(
        "http://localhost:4000/glpi/ticket",
        {
          user: name,
          phone: Number(sender.replace("@c.us", "")),
          text: msg.body,
        }
      );

      console.log(
        `📩 Chamado criado com sucesso! ID: ${response.data.glpiTicketId}`
      );
      const messageSucess = message(response.data);
      await client.sendMessage(sender, messageSucess);
    } catch (error: any) {
      console.error(error.response?.data?.error || error.message);
      const message = `❌ Erro ao criar chamado: ${
        error.response?.data?.error || "Erro desconhecido"
      }`;
      await client.sendMessage(sender, message);
    }
  }
});

// Inicia o cliente
async function start() {
  try {
    await client.initialize();
  } catch (error) {
    console.error("Erro ao iniciar o cliente:", error);
  }
}

// Inicializa cliente
start();

// Endpoint para enviar mensagem manual
app.post("/send", async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: "Números e mensagens obrigatórios." });
  }
  try {
    const chatId = number.includes("@c.us") ? number : `${number}@c.us`;
    await client.sendMessage(chatId, message);
    res.json({ status: 200, message: "Mensagem enviada com sucesso." });
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    res.status(500).json({ error: "Erro ao enviar mensagem." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});
