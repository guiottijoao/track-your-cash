import { z } from "zod";
import { registry } from "../../config/openapi";
import { idSchema } from "./generic/id.schema";

export const createTransactionSchema = z.object({
  accountId: z.number().int().positive().openapi({ example: 1 }),
  external_id: z.string().openapi({ example: "txn-001" }),
  description: z.string().min(1).openapi({ example: "Grocery Store" }),
  amount: z.number().openapi({ example: -152.35 }),
  currency_code: z.string().length(3).openapi({ example: "USD" }),
  date: z.iso.datetime().openapi({ example: "2026-06-23T10:30:00.000Z" }),
  type: z.string().min(1).openapi({ example: "DEBIT" }),
  status: z.string().min(1).openapi({ example: "POSTED" }),
  original_category: z.string().optional().openapi({ example: "Groceries" }),
  category: z.string().min(1).openapi({ example: "Food" }),
  installment_number: z.number().int().positive().optional().openapi({ example: 1 }),
  installment_total: z.number().int().positive().optional().openapi({ example: 12 }),
});

export const updateTransactionSchema = createTransactionSchema.partial();

const transactionResponseSchema = z.object({
  id: z.number().int().openapi({ example: 10 }),
  accountId: z.number().int().openapi({ example: 1 }),
  external_id: z.string().openapi({ example: "txn-001" }),
  description: z.string().openapi({ example: "Grocery Store" }),
  amount: z.number().openapi({ example: -152.35 }),
  currency_code: z.string().openapi({ example: "USD" }),
  date: z.iso.datetime().openapi({ example: "2026-06-23T10:30:00.000Z" }),
  type: z.string().openapi({ example: "DEBIT" }),
  status: z.string().openapi({ example: "POSTED" }),
  original_category: z.string().nullable().openapi({ example: "Groceries" }),
  category: z.string().openapi({ example: "Food" }),
  installment_number: z.number().int().nullable().openapi({ example: null }),
  installment_total: z.number().int().nullable().openapi({ example: null }),
  created_at: z.iso.datetime().openapi({ example: "2026-06-23T10:35:00.000Z" }),
});

const messageErrorSchema = z.object({
  message: z.string(),
});

const validationErrorSchema = z.object({
  errors: z.unknown(),
});

registry.registerPath({
  method: "get",
  path: "/transactions",
  summary: "List transactions",
  responses: {
    200: {
      description: "Transactions returned successfully",
      content: {
        "application/json": {
          schema: z.array(transactionResponseSchema),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/transactions/{id}",
  summary: "Get transaction by id",
  request: {
    params: idSchema,
  },
  responses: {
    200: {
      description: "Transaction returned successfully",
      content: {
        "application/json": {
          schema: transactionResponseSchema,
        },
      },
    },
    404: {
      description: "Transaction not found",
      content: {
        "application/json": {
          schema: messageErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/transactions",
  summary: "Create transaction",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createTransactionSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Transaction created successfully",
      content: {
        "application/json": {
          schema: transactionResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid data",
      content: {
        "application/json": {
          schema: validationErrorSchema,
        },
      },
    },
    404: {
      description: "Account not found",
      content: {
        "application/json": {
          schema: messageErrorSchema,
        },
      },
    },
    409: {
      description: "Transaction already exists",
      content: {
        "application/json": {
          schema: messageErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/transactions/{id}",
  summary: "Update transaction",
  request: {
    params: idSchema,
    body: {
      content: {
        "application/json": {
          schema: updateTransactionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Transaction updated successfully",
      content: {
        "application/json": {
          schema: transactionResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid data",
      content: {
        "application/json": {
          schema: validationErrorSchema,
        },
      },
    },
    404: {
      description: "Transaction or account not found",
      content: {
        "application/json": {
          schema: messageErrorSchema,
        },
      },
    },
    409: {
      description: "Transaction with this external id already exists",
      content: {
        "application/json": {
          schema: messageErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/transactions/{id}",
  summary: "Delete transaction",
  request: {
    params: idSchema,
  },
  responses: {
    204: { description: "Transaction deleted successfully" },
    404: {
      description: "Transaction not found",
      content: {
        "application/json": {
          schema: messageErrorSchema,
        },
      },
    },
  },
});
