import { Router } from "express";
import {
  createFaculdade,
  deleteFaculdade,
  editFaculdade,
  getFaculdades,
} from "../controllers/faculdade.controller";
import adminMiddleware from "../middlewares/admin.middleware";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getFaculdades);
router.put("/:id", authMiddleware, adminMiddleware, editFaculdade);
router.post("/", authMiddleware, adminMiddleware, createFaculdade);
router.delete("/:id", authMiddleware, adminMiddleware, deleteFaculdade);

export default router;
