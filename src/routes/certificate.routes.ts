import { Router } from "express";
import { getCertificate } from "../controllers/certificate.controller";

const router = Router();

router.get("/certificado/:id_inscricao", getCertificate);

export default router;
