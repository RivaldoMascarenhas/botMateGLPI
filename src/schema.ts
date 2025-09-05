import { z } from "zod";

const TicketSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  urgency: z.union([z.string(), z.number()]).optional(),
  category: z.string().optional(),
  requester_name: z.string().optional(),
  extra: z.record(z.string(), z.any()).optional(),
});

const textRequestSchema = z.object({
  user: z.string().min(1, "O campo 'user' é obrigatório"),
  text: z.string().min(1, "O campo 'text' é obrigatório"),
  phone: z.number().optional(),
});

export { TicketSchema, textRequestSchema };
