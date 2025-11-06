import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import adminMiddleware from "../middlewares/admin.middleware";
import { createAdmin, login, register } from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/create-admin", authMiddleware, adminMiddleware, createAdmin);

export default router;
