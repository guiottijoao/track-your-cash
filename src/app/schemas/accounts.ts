import { z } from "zod";

export const createAccountSchema = z.object({
  external_id: z.string(),
  name: z.string().min(1),
  type: z.enum(["BANK", "CREDIT"]),
  subtype: z.enum(["CHECKING_ACCOUNT", "SAVINGS_ACCOUNT", "CREDIT_CARD"]),
  number: z.string(),
  currency_code: z.string().length(3),
  balance: z.number(),
  owner: z.string().optional(),
  connector_name: z.string(),
  connector_image_url: z.string().url(),
  credit_limit: z.number().optional(),
  available_credit_limit: z.number().optional(),
  balance_due_date: z.iso.datetime().optional(),
  minimum_payment: z.number().optional(),
});

export const updateAccountSchema = createAccountSchema.partial();