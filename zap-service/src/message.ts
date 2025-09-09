import { ResponseIA } from "./@type";

export function message(response: ResponseIA) {
  return `✅ *Chamado criado com sucesso! ID: ${response.glpiTicketId}*  

👤 *Solicitante:* ${response.userRequest || "Usuário"}  
📝 *Título:* ${response.title}  
⚠️ *Urgência:* ${response.urgencyText}  
📞 *Ramal:* 139  

📢 Nossa equipe de *Suporte de TI* entrará em contato em breve.`;
}
