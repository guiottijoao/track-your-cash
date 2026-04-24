import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import accountRoutes from "./accounts";

const router = Router();

router.use("/accounts", accountRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;
