import { Request, Response, NextFunction } from "express";
import * as apiKeyService from "../services/api-key";
import { pierreApiKeySchema } from "../schemas/api-key.schema";
import { idSchema } from "../schemas/generic/id.schema";
import * as z from "zod";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsedBody = pierreApiKeySchema.safeParse(req.body);
    const parsedParams = idSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res
        .status(400)
        .json({ errors: z.flattenError(parsedParams.error) });
    }
    if (!parsedBody.success) {
      return res.status(400).json({ errors: z.flattenError(parsedBody.error) });
    }
    await apiKeyService.create(
      parsedParams.data.id,
      parsedBody.data.pierre_api_key,
    );
    res.status(204).send();
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
    const parsedParams = idSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res
        .status(400)
        .json({ errors: z.flattenError(parsedParams.error) });
    }
    await apiKeyService.remove(parsedParams.data.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
