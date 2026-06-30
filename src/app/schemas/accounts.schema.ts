import { z } from "zod";
import { registry } from "../../config/openapi";

export const createAccountSchema = z.object({
  external_id: z.string().openapi({ example: "ext-001" }),
  name: z.string().min(1).openapi({ example: "My Checking" }),
  type: z.enum(["BANK", "CREDIT"]).openapi({ example: "BANK" }),
  subtype: z
    .enum(["CHECKING_ACCOUNT", "SAVINGS_ACCOUNT", "CREDIT_CARD"])
    .openapi({ example: "CHECKING_ACCOUNT" }),
  number: z.string().openapi({ example: "0001" }),
  currency_code: z.string().length(3).openapi({ example: "USD" }),
  balance: z.string().openapi({ example: 1500.75 }),
  owner: z.string().optional().openapi({ example: "John Doe" }),
  connector_name: z.string().openapi({ example: "My Bank" }),
  connector_image_url: z
    .string()
    .url()
    .openapi({ example: "https://example.com/bank.png" }),
  credit_limit: z.number().optional().openapi({ example: 5000 }),
  available_credit_limit: z.number().optional().openapi({ example: 3500 }),
  balance_due_date: z
    .string()
    .optional()
    .openapi({ example: "2026-06-23" }),
  minimum_payment: z.number().optional().openapi({ example: 250 }),
});

export const updateAccountSchema = createAccountSchema.partial();

registry.registerPath({
  method: "post",
  path: "/accounts",
  summary: "Create account",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createAccountSchema,
        },
      },
    },
  },
  responses: {
    201: { description: "Account created successfully" },
    400: { description: "Invalid data" },
    404: { description: "User not found" },
    409: { description: "Account already exists" },
  },
});
