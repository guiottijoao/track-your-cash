import { z } from "zod";

const paymentDataPayerSchema = z.object({
  name: z.string().nullable(),
  document: z.string().nullable(),
});

const paymentDataRecieverSchema = z.object({
  name: z.string().nullable(),
  document: z.string().nullable(),
});

const pierreTransactionPaymentDataSchema = z.object({
  payer: paymentDataPayerSchema,
  reciever: paymentDataRecieverSchema,
});

const pierreTransactionMerchantSchema = z.object({
  name: z.string().nullable(),
  category: z.string().nullable(),
});

const pierreAccountCreditDataSchema = z.object({
  brand: z.string(),
  level: z.string(),
  status: z.string(),
  creditLimit: z.string(),
  balanceDueDate: z.string(),
  minimumPayment: z.string(),
  balanceCloseDate: z.string().nullable(),
  availableCreditLimit: z.string(),
});

const pierreTransactionSchema = z.object({
  id: z.string(),
  account_id: z.string(),
  description: z.string(),
  category: z.string().nullable(),
  original_category: z.string().nullable(),
  tr_confidence: z.string().nullable(),
  tr_reasoning: z.string().nullable(),
  tr_source: z.string().nullable(),
  currency_code: z.string(),
  amount: z.number(),
  amount_in_account_currency: z.number().nullable(),
  date: z.string(),
  installment_due_date: z.string(),
  balance: z.number().nullable(),
  type: z.enum(["DEBIT", "CREDIT"]),
  status: z.enum(["POSTED", "PENDING"]),
  payment_data: pierreTransactionPaymentDataSchema,
  credit_card_data: z.unknown(),
  merchant: pierreTransactionMerchantSchema.nullable(),
  account_item_id: z.string(),
  account_name: z.string(),
  connector_name: z.string(),
  connector_image_url: z.string(),
  account_type: z.enum(["BANK", "CREDIT", "INVESTMENT", "LOAN"]),
  account_subtype: z.enum([
    "CHECKING_ACCOUNT",
    "SAVINGS_ACCOUNT",
    "CREDIT_CARD",
    "PAYMENT_ACCOUNT",
  ]),
  account_credit_data: pierreAccountCreditDataSchema.nullable(),
  item_bank_name: z.string(),
  manual_transaction: z.boolean(),
});

const pierreTransactionsFiltersSchema = z.object({
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  accountType: z.string().nullable(),
  accountSubtype: z.string().nullable(),
  format: z.string(),
});

export const pierreGetTransactionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(pierreTransactionSchema),
  count: z.number(),
  message: z.string().nullable(),
  filters: pierreTransactionsFiltersSchema,
  timestamp: z.string(),
});
