import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as transactionController from "../controllers/transaction-controller";

const router = Router();

router.use(authenticate);

router.get("/", transactionController.getAll);
router.get("/:id", transactionController.getById);
router.post("/", transactionController.create);
router.put("/:id", transactionController.update);
router.delete("/:id", transactionController.remove);

export default router;
