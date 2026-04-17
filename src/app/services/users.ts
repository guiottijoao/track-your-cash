import prisma from "../../lib/prisma";
import { User, Prisma } from "../../../generated/prisma";

export const getAll = async (): Promise<User[]> => {
  return prisma.user.findMany();
};

export const findById = async (id: number): Promise<User> => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const err: any = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return user;
};

export const create = async (data: Prisma.UserCreateInput): Promise<User> => {
  // UserCreateInput is a type created by Prisma (no need to create one manually)
  try {
    return prisma.user.create({ data });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      throw Object.assign(new Error("Email already in use"), { status: 409 });
    }
    throw err;
  }
};

export const update = async (
  id: number,
  data: Prisma.UserUpdateInput,
): Promise<User> => {
  try {
    return prisma.user.update({
      where: { id },
      data,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        throw Object.assign(new Error("User not found"), { status: 404 });
      }
      if (err.code === "P2002") {
        throw Object.assign(new Error("Email already in use"), { status: 409 });
      }
    }
    throw err;
  }
};

export const remove = async (id: number): Promise<void> => {
  try {
    await prisma.user.delete({ where: { id } });
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
