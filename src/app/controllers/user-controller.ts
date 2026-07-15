import { Request, Response, NextFunction } from "express";
import * as userService from "../services/users";
import { createUserSchema, updateUserSchema } from "../schemas/user.schema";
import * as z from "zod";
import { idSchema } from "../schemas/generic/id.schema";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await userService.getAll();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const user = await userService.findById(id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: z.flattenError(parsed.error) });
    }
    const user = await userService.create(parsed.data);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: z.flattenError(parsed.error) });
    }
    const id = Number(req.params.id);
    const user = await userService.update(id, parsed.data);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    await userService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response) => {
  const user = await userService.me(req.user!.id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  return res.status(200).json(user);
};
