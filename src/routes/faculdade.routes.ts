import { Router } from "express";
import {
  createFaculdade,
  getFaculdades,
} from "../controllers/faculdade.controller";

const router = Router();

router.get("/", getFaculdades);
router.post("/", createFaculdade);

export default router;
