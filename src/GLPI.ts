import axios from "axios";
import { urgencyTextToNumber } from "./utils.ts";
import { logger } from "./index.ts";

const GLPI_URL = process.env.GLPI_URL;
const GLPI_APP_TOKEN = process.env.GLPI_APP_TOKEN;
const GLPI_USER_TOKEN = process.env.GLPI_USER_TOKEN;

async function glpiInitSession() {
  const { data } = await axios.get(`${GLPI_URL}/initSession`, {
    headers: {
      "App-Token": GLPI_APP_TOKEN,
      Authorization: `Basic ${GLPI_USER_TOKEN}`,
    },
    timeout: 3000,
  });
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
export async function glpiCreateTicket() {}
