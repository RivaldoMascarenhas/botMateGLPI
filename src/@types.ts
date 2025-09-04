export interface ResponseIA {
  title: string;
  description: string;
  requesttypes_id: number;
  urgencyText:
    | "Muito Baixa"
    | "Baixa"
    | "Média"
    | "Alta"
    | "Muito Alta"
    | "Crítica";
  userResquest?: string;
  error?: string;
}
export interface initSessionResponse {
  session_token: string;
}
export interface createTicketResponse {
  id: number;
  name: string;
  content: string;
  urgency: number;
  status: number;
  users_id_recipient: number;
}
