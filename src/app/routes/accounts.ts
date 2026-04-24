import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as accountController from "../controllers/account-controller";

const router = Router();

router.use(authenticate);

router.get("/", accountController.getAll);
router.get("/:id", accountController.getById);
router.post("/", accountController.create);
router.put("/:id", accountController.update);
router.delete("/:id", accountController.remove);

export default router;
