import { Request, Response, NextFunction } from "express";
import * as userService from "../services/users";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { z } from "zod";
import { idSchema } from "../schemas/generic/id.schema";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: z.flattenError(parsed.error) });
    }
    const token = await userService.register(
      parsed.data.name,
      parsed.data.email,
      parsed.data.password,
    );
    res.status(201).json(token);
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
    const { token, user } = await userService.login(
      parsed.data.email,
      parsed.data.password,
    );
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      path: "/",
    });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("auth_token", { path: "/" });
  return res.json({ message: "Logged out" });
};
