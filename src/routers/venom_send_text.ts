import express from "express";

const router = express.Router();

router.post("/venom/text", async (req, res) => {
  try {
    const { phone, text } = req.body;
    if (!phone || !text) {
      return res.status(400).json({ error: "Faltam dados" });
    }
    // TODO: Implementar envio de texto
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao enviar texto" });
    return;
  }
});

export default router;
