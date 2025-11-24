import { Router } from "express";
import {
  getEditions,
  getEdition,
  createEdition,
  editEdition,
  deleteEdition,
} from "../controllers/editions.controller";
import authMiddleware from "../middlewares/auth.middleware";
import adminMiddleware from "../middlewares/admin.middleware";

const router = Router();

router.get("/", getEditions);
router.get("/:id", getEdition);
router.post("/", authMiddleware, adminMiddleware, createEdition);
router.put("/:id", authMiddleware, adminMiddleware, editEdition);
router.delete("/:id", authMiddleware, adminMiddleware, deleteEdition);

export default router;
