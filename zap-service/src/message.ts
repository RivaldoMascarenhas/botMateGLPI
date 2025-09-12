import { ResponseIA } from "./@type";

export function message(response: ResponseIA) {
  return `✅ *Chamado criado com sucesso! ID: ${response.glpiTicketId}*  

👤 *Solicitante:* ${response.userRequest || "Usuário"}  
📝 *Título:* ${response.title}  
📝 *Descrição:* ${response.description} 
📞 *Ramal:* 139  

📢 Nossa equipe de *Suporte de TI* entrará em contato em breve.`;
}
export function infoCreateTicket(name: string) {
  const message = `👋 Olá, ${name}! Para abrir um chamado: 
   
📝 Escreva **chamado**  
🙋 Informe seu **usuário do AD ou do GLPI**  
⚠️ Descreva o **problema**  

📌 Exemplos:  
- "Chamado: impressora com papel preso na sala dos professores. **SEU NOME**" 
- "Suporte na sala 2H, datashow não liga.**SEU NOME**. Abrir chamado." 
- "**SEU NOME** Meu PC não liga. Chamado. " 

**SEU NOME** = Ex: João.Silva 

💡 A ordem não importa, o sistema envia automaticamente. 🚀`;
  return message;
}
