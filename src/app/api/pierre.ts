import { z } from "zod";
import { pierreGetAccountResponseSchema } from "../schemas/pierre-accounts.schema";
import { pierreGetTransactionsResponseSchema } from "../schemas/pierre-transactions.schema";

type pierreGetTransactionsResponse = z.infer<
  typeof pierreGetTransactionsResponseSchema
>;

export async function getTransactions(): Promise<pierreGetTransactionsResponse> {
  const response = await fetch(
    "https://www.pierre.finance/tools/api/get-transactions",
    {
      headers: {
        Authorization: `Bearer ${process.env.PIERRE_API_KEY}`,
      },
    },
  );
  const json = response.json();
  return pierreGetTransactionsResponseSchema.parse(json);
}
