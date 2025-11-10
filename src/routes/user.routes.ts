import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
  getUser,
  getUsers,
  deleteUser,
  editar_senha,
  editar_perfil,
} from "../controllers/user.controller";

const router = Router();

// /user/

router.get("/", getUsers);
router.get("/:id", getUser);

router.delete("/:id", authMiddleware, deleteUser);
router.put("/editar_senha/", authMiddleware, editar_senha);
router.put("/editar_perfil/:id", editar_perfil);

export default router;
