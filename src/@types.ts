export interface ResponseIA {
  title: string;
  description: string;
  urgencyText:
    | "Muito Baixa"
    | "Baixa"
    | "Média"
    | "Alta"
    | "Muito Alta"
    | "Crítica";
  error?: string;
}
