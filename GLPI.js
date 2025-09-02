import axios from "axios";
import { urgencyTextToNumber } from "./utils.js";
import { logger } from "./index.js";

const GLPI_URL = process.env.GLPI_URL;
const GLPI_APP_TOKEN = process.env.GLPI_APP_TOKEN;

async function findUserIdByName(session, name) {
  const encodedName = encodeURIComponent(name);

  const url = `${GLPI_URL}/search/User?criteria[0][field]=9&criteria[0][searchtype]=contains&criteria[0][value]=${encodedName}&forcedisplay[0]=2`;

  logger.debug(`🔍 Procurando usuário pelo nome: ${name} -> URL: ${url}`);

  try {
    const { data } = await axios.get(url, {
      headers: {
        "Session-Token": session,
        "App-Token": GLPI_APP_TOKEN,
      },
    });

    logger.debug(`📦 Resultado da busca de usuário (${name}):`, data);

    if (data?.data?.length > 0) {
      const userId = data.data[0][2]; // geralmente coluna [2] = ID
      logger.debug(`✅ Usuário encontrado: ${name} -> ID ${userId}`);
      return userId;
    }

    logger.warn(`⚠️ Nenhum usuário encontrado com nome: ${name}`);
    return null;
  } catch (error) {
    logger.error(`❌ Erro ao buscar usuário "${name}":`, error.message);
    return null;
  }
}

export async function glpiCreateTicket({
  title,
  description,
  urgencyText,
  requesterName, // NOME do requerente, ex: "Rivaldo"
}) {
  const session = await glpiInitSession();
  if (!session) throw new Error("Falha ao iniciar sessão GLPI");

  try {
    // Categoria fixa = 13
    const categoryId = 13;

    // Técnico fixo = 7 (Rivaldo)
    const tecnicoId = 7;

    // Buscar ID do requerente
    let requesterUserId = null;
    if (requesterName) {
      requesterUserId = await findUserIdByName(session, requesterName);
    }

    const urgency = urgencyTextToNumber(urgencyText);
    const impact = Number(process.env.GLPI_DEFAULT_IMPACT) || 2;
    const entity = Number(process.env.GLPI_DEFAULT_ENTITY_ID) || 1;
    const requestTypeId = Number(process.env.GLPI_DEFAULT_REQUESTTYPE_ID) || 7;

    const input = {
      name: title,
      content: description,
      status: 1,
      urgency,
      impact,
      requesttypes_id: requestTypeId,
      entities_id: entity,
      type: 1,
      itilcategories_id: categoryId,
      _users_id_assign: tecnicoId,
    };

    if (requesterUserId) input._users_id_requester = requesterUserId;

    logger.debug("📝 Montando input do ticket:", input);

    const { data } = await axios.post(
      `${GLPI_URL}/Ticket`,
      { input },
      {
        headers: {
          "App-Token": GLPI_APP_TOKEN,
          "Session-Token": session,
          "Content-Type": "application/json",
        },
        timeout: 30_000,
      }
    );

    logger.info(`🎫 Ticket criado com sucesso: ID ${data.id}`);
    return data;
  } catch (error) {
    logger.error(
      "❌ Erro ao criar ticket:",
      error.message,
      error.response?.data
    );
    throw error;
  } finally {
    await glpiKillSession(session);
  }
}
