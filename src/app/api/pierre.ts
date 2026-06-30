export async function getTransactions(apiKey: string): Promise<any> {
  const response = await fetch(
    "https://www.pierre.finance/tools/api/get-transactions",
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );
  if (!response.ok) {
    throw Object.assign(new Error("Pierre API error."), {
      status: response.status,
    });
  }
  return await response.json();
}

export async function getAccounts(apiKey: string): Promise<any> {
  const response = await fetch(
    "https://www.pierre.finance/tools/api/get-accounts",
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );
  if (!response.ok) {
    throw Object.assign(new Error("Pierre API error."), {
      status: response.status,
    });
  }
  return await response.json();
}
