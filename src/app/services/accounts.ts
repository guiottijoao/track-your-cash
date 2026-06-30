import prisma from "../../lib/prisma";
import { Account, Prisma } from "../../../generated/prisma";
import { getAccounts } from "../api/pierre";
import { decrypt } from "../../utils/crypto";
import { pierreGetAccountResponseSchema } from "../schemas/pierre-accounts.schema";
import { z } from "zod";

export const getAll = async (): Promise<Account[]> => {
  return prisma.account.findMany();
};

export const findById = async (id: number): Promise<Account> => {
  const account = await prisma.account.findUnique({
    where: {
      id: id,
    },
  });
  if (!account) {
    throw Object.assign(new Error("Account not found"), { status: 404 });
  }
  return account;
};

export const create = async (
  data: Prisma.AccountCreateInput,
): Promise<Account> => {
  try {
    return await prisma.account.create({
      data: data,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        throw Object.assign(new Error("Account already exists"), {
          status: 409,
        });
      }
      if (err.code === "P2003") {
        throw Object.assign(new Error("User not found"), { status: 404 });
      }
    }
    throw err;
  }
};

export const update = async (
  id: number,
  data: Prisma.AccountUpdateInput,
): Promise<Account> => {
  try {
    return await prisma.account.update({
      where: { id },
      data,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        throw Object.assign(new Error("Account not found"), { status: 404 });
      }
      if (err.code === "2002") {
        throw Object.assign(
          new Error("Account with this external id already exists"),
          { status: 409 },
        );
      }
      if (err.code === "P2003") {
        throw Object.assign(new Error("User not found"), { status: 404 });
      }
    }
    throw err;
  }
};

export const remove = async (id: number): Promise<void> => {
  try {
    await prisma.account.delete({
      where: { id },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      throw Object.assign(new Error("Account not found"), { status: 404 });
    }
    throw err;
  }
};

export const syncAccounts = async (userId: number): Promise<void> => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
    if (!user.pierre_api_key) {
      throw Object.assign(new Error("Pierre API key not configured"), {
        status: 404,
      });
    }

    const decryptedKey = decrypt(user.pierre_api_key);
    const response = await getAccounts(decryptedKey);

    let parsedResponse;
    try {
      parsedResponse = pierreGetAccountResponseSchema.parse(response);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const flattenedError = z.flattenError(err);
        throw Object.assign(new Error(JSON.stringify(flattenedError)), {
          status: 500,
        });
      }
      throw err;
    }

    for (const acc of parsedResponse.data) {
      console.log(acc.creditData?.balanceDueDate)
      await prisma.account.upsert({
        where: {
          external_id: acc.id,
        },
        update: {
          balance: acc.balance,
          credit_limit: acc.creditData?.creditLimit,
          available_credit_limit: acc.creditData?.availableCreditLimit,
          balance_due_date: acc.creditData?.balanceDueDate,
          minimum_payment: acc.creditData?.minimumPayment,
          synced_at: new Date(),
        },
        create: {
          userId: userId,
          external_id: acc.id,
          name: acc.name,
          type: acc.type,
          subtype: acc.subtype,
          number: acc.number,
          currency_code: acc.currencyCode,
          balance: acc.balance,
          owner: acc.owner,
          connector_name: acc.connectorName,
          connector_image_url: acc.connectorImageUrl,
          credit_limit: acc.creditData?.creditLimit,
          available_credit_limit: acc.creditData?.availableCreditLimit,
          balance_due_date: acc.creditData?.balanceDueDate,
          minimum_payment: acc.creditData?.minimumPayment,
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
