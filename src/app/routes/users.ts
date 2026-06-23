import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as userController from "../controllers/user-controller";
import * as apiKeyController from "../controllers/api-key-controller";

const router = Router();

router.use(authenticate);

router.get("/", userController.getAll);
router.get("/:id", userController.getById);
router.post("/", userController.create);
router.put("/:id", userController.update);
router.delete("/:id", userController.remove);

// API key
router.post("/:id/pierre-key", apiKeyController.create);
router.delete("/:id/pierre-key", apiKeyController.remove);

export default router;
