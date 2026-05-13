import { Router } from "express";
import {
  getCertificate,
  listCertificates,
  listUserCertificates,
} from "../controllers/certificate.controller";
import authMiddleware from "../middlewares/auth.middleware";
import adminMiddleware from "../middlewares/admin.middleware";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, listCertificates);
router.get("/usuario/:id_user", authMiddleware, listUserCertificates);
router.get("/:id_inscricao", authMiddleware, getCertificate);

export default router;
