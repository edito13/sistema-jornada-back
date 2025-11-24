import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
  inscrever_se,
  cancelarInscricao,
  listaInscricoes,
} from "../controllers/inscricoes.controller";

const router = Router();

router.post("/inscrever_se/:id", authMiddleware, inscrever_se);
router.get("/listaInscricoes/:id", authMiddleware, listaInscricoes);
router.delete("/cancelarInscricao/:id", authMiddleware, cancelarInscricao);

export default router;
