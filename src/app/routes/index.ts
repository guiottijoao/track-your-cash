import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import accountRoutes from "./accounts";
import transactionRoutes from "./transaction";

const router = Router();

router.use("/accounts", accountRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/transactions", transactionRoutes);

export default router;
