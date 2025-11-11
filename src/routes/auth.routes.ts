import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import adminMiddleware from "../middlewares/admin.middleware";
import {
  login,
  register,
  createAdmin,
  forgetPassword,
  resetPassword,
} from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgetPassword);
router.post("/create-admin", authMiddleware, adminMiddleware, createAdmin);

export default router;
