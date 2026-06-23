import { z } from "zod";

const pierreBankDataSchema = z.object({
  closingBalance: z.number(),
  transferNumber: z.number(),
  overdraftUsedLimit: z.number(),
  overdraftContractedLimit: z.number(),
  unarrangedOverdraftAmount: z.number(),
  automaticallyInvestedBalance: z.number(),
});

const pierreAdditionalCardsSchema = z.object({
  number: z.string(),
});

const pierreDisaggregatedCreditLimitsSchema = z.object({
  usedAmount: z.number(),
  limitAmount: z.number(),
  availableAmount: z.number(),
  isLimitFlexible: z.boolean(),
  consolidationType: z.string(),
  creditLineLimitType: z.string(),
  identificationNumber: z.string(),
  usedAmountCurrencyCode: z.string(),
  limitAmountCurrencyCode: z.string(),
  availableAmountCurrencyCode: z.string(),
});

const pierreCreditDataSchema = z.object({
  brand: z.string(),
  level: z.string(),
  status: z.enum(["ACTIVE", "BLOCKED", "CANCELLED"]),
  holderType: z.string().nullable(),
  creditLimit: z.number(),
  balanceDueDate: z.string(),
  minimumPayment: z.number(),
  additionalCards: pierreAdditionalCardsSchema.nullable(),
  isLimitFlexible: z.boolean(),
  balanceCloseDate: z.string().nullable(),
  availableCreditLimit: z.number(),
  balanceForeignCurrency: z.string().nullable(),
  disaggregatedCreditLimits: pierreDisaggregatedCreditLimitsSchema,
});

const pierreAccountSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  name: z.string(),
  type: z.enum(["BANK", "CREDIT", "INVESTMENT", "LOAN"]),
  subtype: z.enum([
    "CHECKING_ACCOUNT",
    "SAVINGS_ACCOUNT",
    "CREDIT_CARD",
    "PAYMENT_ACCOUNT",
  ]),
  number: z.string(),
  currencyCode: z.string(),
  balance: z.string(),
  creditData: pierreCreditDataSchema.nullable(),
  bankData: pierreBankDataSchema.nullable(),
  marketingName: z.string().nullable(),
  taxNumber: z.string().nullable(),
  owner: z.string(),
  customName: z.string().nullable(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  connectorName: z.string(),
  connectorImageUrl: z.string(),
  itemLastUpdatedAt: z.string(),
});

export const pierreGetAccountResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(pierreAccountSchema),
  count: z.number(),
  timestamp: z.string(),
});
