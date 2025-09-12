import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = 4000;

// ------------------- PROXY PARA GLPI -------------------
app.use(
  "/glpi",
  createProxyMiddleware({
    target: "http://localhost:5001",
    changeOrigin: true,
    pathRewrite: { "^/glpi": "" },
  })
);

// ------------------- PROXY PARA WHATSAPP -------------------
app.use(
  "/zap",
  createProxyMiddleware({
    target: "http://localhost:5002",
    changeOrigin: true,
    pathRewrite: { "^/zap": "" },
  })
);

// ------------------- SERVIDOR -------------------
app.listen(PORT, "10.1.11.136", () => {
  console.log(`Proxy rodando em http://10.1.11.136:${PORT}`);
});
