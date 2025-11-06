import { Router } from "express";
import { getUser, getUsers } from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getUsers);
router.get("/:id", authMiddleware, getUser);

export default router;
