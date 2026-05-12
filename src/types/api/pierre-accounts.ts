// File only as documentation, since it was replaced by src/app/schemas/pierre-accounts.ts

export interface PierreAccount {
  id: string;
  itemId: string;
  name: string;
  type: "BANK" | "CREDIT" | "INVESTMENT" | "LOAN";
  subtype:
    | "CHECKING_ACCOUNT"
    | "SAVINGS_ACCOUNT"
    | "CREDIT_CARD"
    | "PAYMENT_ACCOUNT";
  number: string;
  currencyCode: string;
  balance: string;
  creditData: PierreCreditData | null;
  bankData: PierreBankData | null;
  marketingName: string | null;
  taxNumber: string | null;
  owner: string;
  customName: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  connectorName: string;
  connectorImageUrl: string;
  itemLastUpdatedAt: string;
}

export interface PierreGetAccountResponse {
  success: boolean;
  data: PierreAccount[];
  count: number;
  timestamp: string;
}

export interface PierreBankData {
  closingBalance: number;
  transferNumber: number;
  overdraftUsedLimit: number;
  overdraftContractedLimit: number;
  unarrangedOverdraftAmount: number;
  automaticallyInvestedBalance: number;
}

export interface PierreCreditData {
  brand: string;
  level: string;
  status: "ACTIVE" | "BLOCKED" | "CANCELLED";
  holderType: string | null;
  creditLimit: number;
  balanceDueDate: string;
  minimumPayment: number;
  additionalCards: PierreAditionalCards | null;
  isLimitFlexible: boolean;
  balanceCloseDate: string | null;
  availableCreditLimit: number;
  balanceForeignCurrency: string | null;
  disaggregatedCreditLimits: PierreDisaggregatedCreditLimits;
}

export interface PierreAditionalCards {
  number: string;
}

export interface PierreDisaggregatedCreditLimits {
  usedAmount: number;
  limitAmount: number;
  availableAmount: number;
  isLimitFlexible: boolean;
  consolidationType: string;
  creditLineLimitType: string;
  identificationNumber: string;
  usedAmountCurrencyCode: string;
  limitAmountCurrencyCode: string;
  availableAmountCurrencyCode: string;
}