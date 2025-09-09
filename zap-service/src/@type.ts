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
  userRequest?: string;
  error?: string;
  glpiTicketId?: number;
}
