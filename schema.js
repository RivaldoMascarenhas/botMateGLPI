import { z } from "zod";

const TicketSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  urgency: z.union([z.string(), z.number()]).optional(),
  category: z.string().optional(),
  requester_name: z.string().optional(),
  extra: z.record(z.any()).optional(),
});
export { TicketSchema };
