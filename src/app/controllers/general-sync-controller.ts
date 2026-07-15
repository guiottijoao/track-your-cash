import { Request, Response, NextFunction } from "express";
import { idSchema } from "../schemas/generic/id.schema";
import z from "zod";
import { syncAccounts } from "../services/accounts";
import { syncTransactions } from "../services/transactions";

export const generalSync = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = idSchema.safeParse({ id: req.params.userId });
    if (!parsed.success) {
      return res.status(400).json({ errors: z.flattenError(parsed.error) });
    }
    await syncAccounts(parsed.data.id)
    await syncTransactions(parsed.data.id)
    return res.status(200).json({message: "Sync completed successfully"})
  } catch (err) {
    next(err)
  }
};
