import prisma from "../../lib/prisma";
import { Prisma } from "../../../generated/prisma";
import { encrypt } from "../../utils/crypto";

export const create = async (userId: number, apiKey: string): Promise<void> => {
  try {
    const encryptedKey = encrypt(apiKey);
    await prisma.user.update({
      where: { id: userId },
      data: { pierre_api_key: encryptedKey },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw Object.assign(new Error("User not found"), { status: 404 });
    }
    throw error;
  }
};

export const remove = async (userId: number): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { pierre_api_key: null },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw Object.assign(new Error("User not found"), { status: 404 });
    }
    throw error;
  }
};
