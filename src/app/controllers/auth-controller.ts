import { Request, Response, NextFunction } from "express";
import * as userService from "../services/users";
import { createUserSchema } from "../schemas/user";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: z.flattenError(parsed.error) });
    }
    const result = await userService.register(
      parsed.data.name,
      parsed.data.email,
      parsed.data.password,
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ errors: z.flattenError(parsed.error) });
    const result = await userService.login(
      parsed.data.email,
      parsed.data.password,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
