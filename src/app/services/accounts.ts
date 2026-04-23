import prisma from "../../lib/prisma";
import { Account, Prisma } from "../../../generated/prisma";

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
