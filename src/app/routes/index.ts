import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import accountRoutes from "./accounts";
import transactionRoutes from "./transaction";
import generalSyncRoutes from "./general-sync";

const router = Router();

router.use("/accounts", accountRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/transactions", transactionRoutes);
router.use("/general-sync", generalSyncRoutes);

export default router;
