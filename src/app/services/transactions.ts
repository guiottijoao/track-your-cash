import prisma from "../../lib/prisma";
import { Transaction, Prisma } from "../../../generated/prisma";
import { decrypt } from "../../utils/crypto";
import { getTransactions } from "../api/pierre";
import { pierreGetTransactionsResponseSchema } from "../schemas/pierre-transactions.schema";
import z from "zod";

export const getAll = async (): Promise<Transaction[]> => {
  return await prisma.transaction.findMany();
};

export const findById = async (id: number): Promise<Transaction> => {
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: id,
    },
  });
  if (!transaction) {
    throw Object.assign(new Error("Transaction not found"), { status: 404 });
  }
  return transaction;
};

export const create = async (
  data: Prisma.TransactionCreateInput,
): Promise<Transaction> => {
  try {
    return await prisma.transaction.create({
      data: data,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        throw Object.assign(new Error("Transaction already exists"), {
          status: 409,
        });
      }
      if (err.code === "P2003" || err.code === "P2025") {
        throw Object.assign(new Error("Account not found"), { status: 404 });
      }
    }
    throw err;
  }
};

export const update = async (
  id: number,
  data: Prisma.TransactionUpdateInput,
): Promise<Transaction> => {
  try {
    return await prisma.transaction.update({
      where: { id },
      data,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        throw Object.assign(new Error("Transaction not found"), {
          status: 404,
        });
      }
      if (err.code === "P2002") {
        throw Object.assign(
          new Error("Transaction with this external id already exists"),
          { status: 409 },
        );
      }
      if (err.code === "P2003") {
        throw Object.assign(new Error("Account not found"), { status: 404 });
      }
    }
    throw err;
  }
};

export const remove = async (id: number): Promise<void> => {
  try {
    await prisma.transaction.delete({
      where: { id },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      throw Object.assign(new Error("Transaction not found"), { status: 404 });
    }
    throw err;
  }
};

export const syncTransactions = async (userId: number): Promise<void> => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
    if (!user.pierre_api_key) {
      throw Object.assign(new Error("Pierre API ket not configured"), {
        status: 404,
      });
    }

    const decryptedKey = decrypt(user.pierre_api_key);
    const response = await getTransactions(decryptedKey);

    let parsedResponse;
    try {
      parsedResponse = pierreGetTransactionsResponseSchema.parse(response);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const flattenedError = z.flattenError(err);
        throw Object.assign(new Error(JSON.stringify(flattenedError)), {
          status: 500,
        });
      }
      throw err;
    }

    const accounts = await prisma.account.findMany({
      where: { userId },
    });

    const accountMap = new Map(
      // Transforma cada conta em um array, a estrutura toda vira uma matriz
      // [
      //  ["external_id", "id"]
      //  ["external_id", "id"]
      // ]
      accounts.map((acc) => [acc.external_id, acc.id]),
      // O map entende cada subarray como uma entry, ouseja: [chave, valor]
    );

    for (const tr of parsedResponse.data) {
      // Pega o accountId buscando pelo account_id (external_id na minha tabela) como chave
      const accountId = accountMap.get(tr.account_id);
      if (!accountId) {
        throw Object.assign(new Error("Account no found"), { status: 404 });
      }

      await prisma.transaction.upsert({
        where: {
          external_id: tr.id,
        },
        update: {
          description: tr.description,
          amount: tr.amount,
          currency_code: tr.currency_code,
          type: tr.type,
          status: tr.status,
          original_category: tr.original_category ?? null,
          category: tr.category ?? "",
          installment_due_date: new Date(tr.installment_due_date)
        },
        create: {
          accountId: accountId,
          external_id: tr.id,
          description: tr.description,
          amount: tr.amount,
          currency_code: tr.currency_code,
          date: new Date(tr.date),
          type: tr.type,
          status: tr.status,
          original_category: tr.original_category ?? null,
          category: tr.category ?? "",
          installment_due_date: new Date(tr.installment_due_date)
        },
      });
    }
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      throw Object.assign(new Error("User not found"), { status: 404 });
    }
    throw err;
  }
};
