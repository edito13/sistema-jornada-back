import { Router } from "express";
import {
  createPalestrante,
  deletePalestrante,
  editPalestrante,
  getPalestrantes,
  getPalestrante,
} from "../controllers/palestrante.controller";
import authMiddleware from "../middlewares/auth.middleware";
import adminMiddleware from "../middlewares/admin.middleware";

const router = Router();

router.get("/", getPalestrantes);
router.get("/:id", getPalestrante);
router.post("/", authMiddleware, adminMiddleware, createPalestrante);
router.put("/:id", authMiddleware, adminMiddleware, editPalestrante);
router.delete("/:id", authMiddleware, adminMiddleware, deletePalestrante);

export default router;
