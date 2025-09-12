import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
export function urgencyTextToNumber(txt: string) {
  if (!txt) return 3;
  const t = txt.toString().toLowerCase();
  if (t.includes("urgente") || t.includes("crítica") || t.includes("critica"))
    return 5;
  if (t.includes("alta")) return 4;
  if (t.includes("média") || t.includes("media") || t.includes("normal"))
    return 3;
  if (t.includes("baixa") || t.includes("baixo")) return 2;
  return Number.isFinite(+t) ? Math.min(Math.max(+t, 1), 5) : 3;
}

export function extractJSON(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start)
    throw new Error("JSON não encontrado");
  const candidate = text.slice(start, end + 1);
  return JSON.parse(candidate);
}

export function getStatusText(status: number): string {
  switch (status) {
    case 1:
      return "Novo";
    case 2:
      return "Em andamento";
    case 3:
      return "Agendado";
    case 4:
      return "Pendente";
    case 5:
      return "Esperando Aprovação";
    case 6:
      return "Solucionado";
    default:
      return "Desconhecido";
  }
}
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr; // fallback caso não seja válido

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
export function buildTicketMessage(
  ticket: any,
  status: number,
  dateMod: string
) {
  // Mapear status para emoji
  const statusEmojis: Record<number, string> = {
    1: "🆕", // Novo
    2: "🏃‍♂️🚀", // Em andamento
    3: "⏳", // Esperando
    4: "⛔", // Pendente
    5: "🧑‍💻", // Em pausa
    6: "✅🎯🎉", // Fechado
  };

  const statusEmoji = statusEmojis[status] || "❔";

  return {
    message: `⚠️ Chamado *${ticket.glpiTicketId}* foi alterado! ⚠️

📌 *Título:* ${ticket.title}
🔔 *Status:* ** *${getStatusText(status)}* ${statusEmoji} **

🕒 *Última modificação:* ${formatDate(dateMod)}`,
    number: ticket.phone,
  };
}
