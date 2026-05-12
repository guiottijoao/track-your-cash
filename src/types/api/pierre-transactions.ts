// File only as documentation, since it was replaced by src/app/schemas/pierre-transactions.ts

export interface PierreTransaction {
  id: string;
  account_id: string;
  description: string;
  category: string | null;
  original_category: string | null;
  tr_confidence: string | null;
  tr_reasoning: string | null;
  tr_source: string | null;
  currency_code: string;
  amount: number;
  amount_in_account_currency: number | null;
  date: string;
  installment_due_date: string;
  balance: number | null;
  type: "DEBIT" | "CREDIT";
  status: "POSTED" | "PENDING";
  payment_data: PierreTransactionPaymenyData;
  credit_card_data: unknown;
  merchant: PierreTransactionMerchant | null;
  account_item_id: string;
  account_name: string;
  connector_name: string;
  connector_image_url: string;
  account_type: "BANK" | "CREDIT" | "INVESTMENT" | "LOAN";
  account_subtype:
    | "CHECKING_ACCOUNT"
    | "SAVINGS_ACCOUNT"
    | "CREDIT_CARD"
    | "PAYMENT_ACCOUNT";
  account_credit_data: PierreAccountCreditData | null;
  item_bank_name: string;
  manual_transaction: boolean;
}

export interface PierreGetTransactionsResponse {
  success: boolean;
  data: PierreTransaction[];
  count: number;
  message: string | null;
  filters: PierreTransactionsFilters;
  timestamp: string;
}

export interface PierreTransactionsFilters {
  startDate: string | null;
  endDate: string | null;
  accountType: string | null;
  accountSubtype: string | null;
  format: string;
}

export interface PierreTransactionPaymenyData {
  payer: PaymentDataPayer;
  reciever: PaymentDataReciever;
}

export interface PaymentDataPayer {
  name: string | null;
  document: string | null;
}

export interface PaymentDataReciever {
  name: string | null;
  document: string | null;
}

export interface PierreTransactionMerchant {
  name: string | null;
  category: string | null;
}

export interface PierreAccountCreditData {
  brand: string;
  level: string;
  status: string;
  creditLimit: string;
  balanceDueDate: string;
  minimumPayment: string;
  balanceCloseDate: string | null;
  availableCreditLimit: string;
}
