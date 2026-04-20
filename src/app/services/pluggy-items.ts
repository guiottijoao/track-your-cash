import prisma from "../../lib/prisma";
import { PluggyItem, Prisma } from "../../../generated/prisma";

export const getAll = async (): Promise<PluggyItem[]> => {
  return prisma.pluggyItem.findMany();
};

export const findById = async (id: number): Promise<PluggyItem> => {
  const pluggyItem = await prisma.pluggyItem.findUnique({ where: { id } });
  if (!pluggyItem) {
    const err: any = new Error("Pluggy item not found");
    err.status = 404;
    throw err;
  }
  return pluggyItem;
};

export const create = async (
  data: Prisma.PluggyItemCreateInput,
): Promise<PluggyItem> => {
  try {
    return await prisma.pluggyItem.create({ data });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      throw Object.assign(new Error("User does not exist"), {
        status: 404,
      });
    }
    throw err;
  }
};

export const update = async (
  id: number,
  data: Prisma.PluggyItemUpdateInput,
): Promise<PluggyItem> => {
  try {
    return await prisma.pluggyItem.update({ where: { id }, data });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      throw Object.assign(new Error("User does not exist"), {
        status: 404,
      });
    }
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2016"
    ) {
      throw Object.assign(new Error("Pluggy item does not exist"), {
        status: 404,
      });
    }
    throw err;
  }
};

export const remove = async (id: number): Promise<void> => {
  try {
    await prisma.pluggyItem.delete({ where: { id } });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      throw Object.assign(new Error("Pluggy item not found"), {
        status: 404,
      });
    }
    throw err;
  }
};
