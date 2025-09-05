import axios from "axios";
import { logger } from "./index.js";
import type {
  createTicketResponse,
  initSessionResponse,
  ResponseIA,
} from "./@types.ts";
import { urgencyTextToNumber } from "./utils.js";

const GLPI_URL = process.env.GLPI_URL;
const GLPI_APP_TOKEN = process.env.GLPI_APP_TOKEN;
const GLPI_USER_TOKEN = process.env.GLPI_USER_TOKEN;
const TIMEOUT = 20000;
const CATEGORY = process.env.GLPI_DEFAULT_CATEGORY_ID || 28;
const ENTITY = process.env.GLPI_DEFAULT_ENTITY_ID || 5;

async function glpiInitSession() {
  const { data } = await axios.get<initSessionResponse>(
    `${GLPI_URL}/initSession`,
    {
      headers: {
        "Content-Type": "application/json",
        "App-Token": GLPI_APP_TOKEN,
        Authorization: `Basic ${GLPI_USER_TOKEN}`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
      timeout: TIMEOUT,
    }
  );
  return data?.session_token;
}

async function glpiKillSession(sessionToken: string) {
  try {
    await axios.get(`${GLPI_URL}/killSession`, {
      headers: {
        "App-Token": GLPI_APP_TOKEN,
        "Session-Token": sessionToken,
      },
    });
  } catch {
    // Ignorar erros ao finalizar sessão
  }
}

async function findUserIdByName(session: string, name: string) {
  const encodedName = encodeURIComponent(name);

  const url = `${GLPI_URL}/search/User?criteria[0][field]=9&criteria[0][searchtype]=contains&criteria[0][value]=${encodedName}&forcedisplay[0]=2`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        "Session-Token": session,
        "App-Token": GLPI_APP_TOKEN,
      },
    });

    if (data?.data?.length > 0) {
      const userId = data.data[0][2]; // geralmente coluna [2] = ID
      logger.debug(`✅ Usuário encontrado: ${name} -> ID ${userId}`);
      return userId;
    }

    logger.warn(`⚠️ Nenhum usuário encontrado com nome: ${name}`);
    return null;
  } catch (error: any) {
    logger.error(`❌ Erro ao buscar usuário "${name}":`, error.message);
    return null;
  }
}
export async function glpiCreateTicket(newTicket: ResponseIA) {
  const sessionToken = await glpiInitSession();
  if (!sessionToken) {
    logger.error("❌ Falha ao iniciar sessão no GLPI");
    return null;
  }
  try {
    let userId = null;
    if (newTicket.userRequest) {
      userId = await findUserIdByName(sessionToken, newTicket.userRequest);
    }
    if (!userId) {
      logger.warn(
        `⚠️ Não foi possível encontrar o usuário "${newTicket.userRequest}". O ticket será criado sem solicitante.`
      );
    }
    const urgencyNumber = urgencyTextToNumber(newTicket.urgencyText);
    const ticketInput = {
      name: newTicket.title,
      content: newTicket.description,
      itilcategories_id: Number(CATEGORY),
      requesttypes_id: newTicket.requesttypes_id,
      urgency: urgencyNumber,
      impact: urgencyNumber,
      priority: urgencyNumber,
      entities_id: Number(ENTITY),
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
        timeout: TIMEOUT,
      }
    );
    logger.info(`✅ Ticket criado com sucesso: ${data?.id}`);
    await glpiKillSession(sessionToken);
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      logger.error("❌ Erro do GLPI:", error.response.data);
    } else {
      logger.error("❌ Erro ao criar ticket:", error.message);
    }
    await glpiKillSession(sessionToken);
    return null;
  }
}
