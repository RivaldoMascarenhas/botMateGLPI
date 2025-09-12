import axios from "axios";
import { buildTicketMessage, getStatusText, prisma } from "../utils";
import { glpiInitSession } from "../glpi/funcoes";
import { logger } from "..";

const GLPI_URL = process.env.GLPI_URL!;
const GLPI_APP_TOKEN = process.env.GLPI_APP_TOKEN!;

let sessionToken: string | null = null;

// -------------------
// 1. Buscar tickets abertos do bot no banco
// -------------------
async function getOpenBotTickets() {
  try {
    return await prisma.ticket.findMany({
      where: { isClosed: false }, // só tickets abertos
    });
  } catch (err: any) {
    logger.error("Erro ao buscar tickets do bot no banco:", err);
    return [];
  }
}

// -------------------
// 2. Verificar alterações no GLPI
// -------------------
async function checkTickets() {
  if (!sessionToken) return;

  const tickets = await getOpenBotTickets();

  for (const ticket of tickets) {
    try {
      const { data } = await axios.get(
        `${GLPI_URL}/Ticket/${ticket.glpiTicketId}`,
        {
          headers: {
            "Session-Token": sessionToken!,
            "App-Token": GLPI_APP_TOKEN,
          },
        }
      );

      const dateMod = data.date_mod as string;
      const status = data.status as number;

      // ✅ Corrigido: primeira vez que pegamos o ticket
      if (!ticket.dateMod) {
        await prisma.ticket.update({
          where: { glpiTicketId: ticket.glpiTicketId },
          data: {
            dateMod,
            status,
            isClosed: status === 6,
          },
        });
        continue; // não dispara log nem webhook
      }

      // Só considera alteração real se a data ou status mudaram
      if (dateMod > ticket.dateMod || status !== ticket.status) {
        logger.info(`🆕 Chamado ${ticket.glpiTicketId} foi alterado!`);
        logger.info(`Status: ${status}, Última modificação: ${dateMod}`);

        await prisma.ticket.update({
          where: { glpiTicketId: ticket.glpiTicketId },
          data: {
            dateMod,
            status,
            isClosed: status === 6, // 6 = fechado
          },
        });

        const { message, number } = buildTicketMessage(ticket, status, dateMod);
        // 👉 Aqui você pode disparar webhook / WhatsApp / notificação
        axios.post(
          "http://localhost:5002/send",
          {
            number,
            message,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (err: any) {
      logger.error(`Erro ao consultar ticket ${ticket.glpiTicketId}:`, err);
    }
  }
}

// -------------------
// 3. Loop principal
// -------------------
export async function CheckUpdateTickets() {
  try {
    sessionToken = await glpiInitSession();
    logger.info("🚀 Monitoramento de chamados iniciado...");

    setInterval(async () => {
      try {
        await checkTickets();
      } catch (err: any) {
        logger.error("Erro ao processar tickets:", err);
      }
    }, 10_000); // roda a cada 10 segundos
  } catch (err: any) {
    logger.error("Erro ao iniciar monitoramento:", err);
  }
}
