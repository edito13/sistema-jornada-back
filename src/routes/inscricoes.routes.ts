import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
  inscrever_se,
  cancelarInscricao,
  listaInscricoes,
} from "../controllers/inscricoes.controller";

const router = Router();

router.get("/", authMiddleware, listaInscricoes);
router.post("/", authMiddleware, inscrever_se);
router.delete("/cancelarInscricao/:id", authMiddleware, cancelarInscricao);

export default router;
