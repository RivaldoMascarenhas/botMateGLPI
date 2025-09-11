export interface ResponseIA {
  title: string;
  description: string;
  requesttypes_id: number;
  impact: number;
  urgencyText:
    | "Muito Baixa"
    | "Baixa"
    | "Média"
    | "Alta"
    | "Muito Alta"
    | "Crítica";
  userRequest: string;
  error?: string;
}
export interface initSessionResponse {
  session_token: string;
}
export interface createTicketResponse {
  id: number;
  message: string;
}
