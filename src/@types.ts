export interface ResponseIA {
  title: string; // Título resumido do problema
  description: string; // Descrição detalhada do problema
  urgencyText:
    | "Muito Baixa"
    | "Baixa"
    | "Média"
    | "Alta"
    | "Muito Alta"
    | "Crítica";
  error?: string; // Mensagem de erro, se houver
}
