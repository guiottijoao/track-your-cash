import { Request, Response, NextFunction } from "express";
import * as accountService from "../services/accounts";
import { createAccountSchema, updateAccountSchema } from "../schemas/accounts.schema";
import * as z from "zod";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accounts = await accountService.getAll();
    res.status(200).json(accounts);
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
    const account = await accountService.findById(id);
    res.status(200).json(account);
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
    const parsed = createAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: z.flattenError(parsed.error) });
    }
    const account = await accountService.create({
      ...parsed.data,
      user: { connect: { id: req.user!.id } },
    });
    res.status(201).json(account);
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
    const parsed = updateAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: z.flattenError(parsed.error) });
    }
    const id = Number(req.params.id);
    const account = await accountService.update(id, parsed.data);
    res.status(200).json(account);
  } catch (err) {
    next(err);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id)
    await accountService.remove(id)
    res.status(204).json()
  } catch (err) {
    next(err)
  }
}