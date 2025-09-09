import axios from "axios";
import {
  GLPI_APP_TOKEN,
  GLPI_URL,
  GLPI_USER_TOKEN,
  logger,
  TIMEOUT,
} from "../index";
import { initSessionResponse } from "../@types";

// Inicia uma sessão no GLPI
export async function glpiInitSession() {
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
      timeout: Number(TIMEOUT),
    }
  );
  return data?.session_token;
}

export async function glpiKillSession(sessionToken: string) {
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

// Busca o ID do usuário pelo nome
export async function findUserIdByName(session: string, name: string) {
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
