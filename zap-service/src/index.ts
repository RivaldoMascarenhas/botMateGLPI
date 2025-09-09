import express from "express";
import { create, Whatsapp } from "venom-bot";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import timeout from "connect-timeout";

const app = express();
const PORT = 5002;

let client: Whatsapp;

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(timeout("10s"));
app.use(express.json());

// Inicializa o WhatsApp
create()
  .then((c) => {
    client = c;
    console.log("WhatsApp service rodando 🚀");
  })
  .catch((err) => console.error(err));

// Endpoint para enviar mensagens
app.post("/send", async (req, res) => {
  const { number, message } = req.body;
  if (!client)
    return res.status(500).json({ error: "Cliente não inicializado" });

  try {
    await client.sendText(number, message);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.listen(PORT, () =>
  console.log(`Zap service rodando em http://localhost:${PORT}`)
);
