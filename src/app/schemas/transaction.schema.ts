import { z } from "zod";

export const createTransactionSchema = z.object({
  accountId: z.number().int().positive(),
  external_id: z.string(),
  description: z.string().min(1),
  amount: z.number(),
  currency_code: z.string().length(3),
  date: z.iso.datetime(),
  type: z.string().min(1),
  status: z.string().min(1),
  original_category: z.string().optional(),
  category: z.string().min(1),
  installment_number: z.number().int().positive().optional(),
  installment_total: z.number().int().positive().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();
