import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import timeout from "connect-timeout";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(timeout("10s"));
app.use(express.json());

// Proxy para GLPI
app.use(
  "/glpi",
  createProxyMiddleware({
    target: "http://localhost:5001",
    changeOrigin: true,
    pathRewrite: { "^/glpi": "" },
  })
);

// Proxy para WhatsApp
app.use(
  "/zap",
  createProxyMiddleware({
    target: "http://localhost:5002",
    changeOrigin: true,
    pathRewrite: { "^/zap": "" },
  })
);

app.listen(PORT, () =>
  console.log(`Proxy rodando em http://localhost:${PORT}`)
);
