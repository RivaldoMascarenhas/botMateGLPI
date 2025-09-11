import axios from "axios";
import type { createTicketResponse, ResponseIA } from "../@types";
import { urgencyTextToNumber } from "../utils";
import {
  CATEGORY_ID,
  ENTITY_ID,
  GLPI_APP_TOKEN,
  GLPI_URL,
  logger,
  TIMEOUT,
} from "../index";
import {
  findUserIdByFullName,
  glpiInitSession,
  glpiKillSession,
} from "./funcoes";
import { response } from "express";

// Cria um ticket no GLPI
export async function glpiCreateTicket(newTicket: ResponseIA): Promise<any> {
  const sessionToken = await glpiInitSession();
  if (!sessionToken) {
    logger.error("❌ Falha ao iniciar sessão no GLPI");
    return response
      .status(500)
      .json({ error: "Falha ao iniciar sessão no GLPI" });
  }
  try {
    let userId = null;
    if (newTicket.userRequest) {
      userId = await findUserIdByFullName(sessionToken, newTicket.userRequest);
    }
    if (!userId) {
      logger.warn(
        `⚠️ Não foi possível encontrar o usuário "${newTicket.userRequest}". O ticket será criado sem solicitante.`
      );

      return response.status(500).json({ error: "Usuário desconhecido" });
    }
    const urgencyNumber = urgencyTextToNumber(newTicket.urgencyText);
    const ticketInput = {
      name: newTicket.title,
      content: newTicket.description,
      itilcategories_id: Number(CATEGORY_ID),
      requesttypes_id: 4, // 4 = Whatsapp
      urgency: urgencyNumber,
      impact: newTicket.impact,
      priority: urgencyNumber,
      entities_id: Number(ENTITY_ID),
      _users_id_requester: userId,
      _users_id_observer: 164,
    };
    logger.info(`📝 Criando ticket no GLPI: ${JSON.stringify(ticketInput)}`);

    const { data } = await axios.post<createTicketResponse>(
      `${GLPI_URL}/Ticket`,
      {
        input: ticketInput,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "App-Token": GLPI_APP_TOKEN,
          "Session-Token": sessionToken,
        },
        timeout: Number(TIMEOUT),
      }
    );
    logger.info(`✅ Ticket criado com sucesso: ${data?.id}`);
    await glpiKillSession(sessionToken);
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      logger.error("❌ Erro do GLPI:", error.response.data);
    } else {
      logger.error("❌ Erro ao criar ticket:", error);
    }
    await glpiKillSession(sessionToken);
    return null;
  }
}
