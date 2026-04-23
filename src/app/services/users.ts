import prisma from "../../lib/prisma";
import { User, Prisma } from "../../../generated/prisma";
import bcrypt from "bcrypt";

type SafeUser = Omit<User, "password">;

export const getAll = async (): Promise<SafeUser[]> => {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, created_at: true },
  });
};

export const findById = async (id: number): Promise<SafeUser> => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, created_at: true },
  });
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 })
  }
  return user;
};

export const create = async (
  data: Prisma.UserCreateInput,
): Promise<SafeUser> => {
  // UserCreateInput is a type created by Prisma (no need to create one manually)
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await prisma.user.create({
      data: { ...data, password: hashedPassword },
      select: { id: true, name: true, email: true, created_at: true },
    });
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
): Promise<SafeUser> => {
  try {
    return await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, created_at: true },
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
