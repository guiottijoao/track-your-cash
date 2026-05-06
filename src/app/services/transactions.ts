import prisma from "../../lib/prisma";
import { Transaction, Prisma } from "../../../generated/prisma";

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
