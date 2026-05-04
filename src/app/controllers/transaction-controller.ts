import { Request, Response, NextFunction } from "express";
import * as transactionService from "../services/transactions";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../schemas/transaction";
import * as z from "zod";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const transactions = await transactionService.getAll();
    res.status(200).json(transactions);
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
    const transaction = await transactionService.findById(id);
    res.status(200).json(transaction);
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
    const parsed = createTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: z.flattenError(parsed.error) });
    }
    const { accountId, ...rest } = parsed.data;
    const transaction = await transactionService.create({
      ...rest,
      account: { connect: { id: accountId } },
    });
    res.status(201).json(transaction);
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
    const parsed = updateTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: z.flattenError(parsed.error) });
    }
    const id = Number(req.params.id);
    const { accountId, ...rest } = parsed.data;
    const data = accountId
      ? { ...rest, account: { connect: { id: accountId } } }
      : rest;
    const transaction = await transactionService.update(id, data);
    res.status(200).json(transaction);
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
    await transactionService.remove(id);
    res.status(204).json();
  } catch (err) {
    next(err);
  }
};
