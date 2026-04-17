import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import adminMiddleware from "../middlewares/admin.middleware";
import {
  inscrever_se,
  cancelarInscricao,
  listaInscricoes,
  validarPresenca,
} from "../controllers/inscricoes.controller";

const router = Router();

router.get("/", authMiddleware, listaInscricoes);
router.post("/", authMiddleware, inscrever_se);
router.post(
  "/validar-presenca",
  authMiddleware,
  adminMiddleware,
  validarPresenca,
);
router.delete("/", authMiddleware, cancelarInscricao);
router.delete("/:id", authMiddleware, cancelarInscricao);

export default router;
