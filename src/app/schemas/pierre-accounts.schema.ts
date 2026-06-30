import { z } from "zod";

const pierreBankDataSchema = z.object({
  closingBalance: z.number(),
  transferNumber: z.string(),
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
  additionalCards: z.array(pierreAdditionalCardsSchema).nullable().optional(),
  isLimitFlexible: z.boolean(),
  balanceCloseDate: z.string().nullable(),
  availableCreditLimit: z.number(),
  balanceForeignCurrency: z.string().nullable(),
  disaggregatedCreditLimits: z.array(pierreDisaggregatedCreditLimitsSchema).optional(),
});

const pierreAccountSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  name: z.string(),
  type: z.enum(["BANK", "CREDIT", "INVESTMENT", "LOAN"]),
  subtype: z.enum([
    "CHECKING_ACCOUNT",
    "SAVINGS",
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
  connectorName: z.string().nullable(),
  connectorImageUrl: z.string().nullable(),
  itemLastUpdatedAt: z.string().nullable(),
});

export const pierreGetAccountResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(pierreAccountSchema),
  count: z.number(),
  timestamp: z.string(),
});
