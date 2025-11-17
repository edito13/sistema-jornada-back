import { Router } from "express";
import {
  createFaculdade,
  deleteFaculdade,
  getFaculdades,
} from "../controllers/faculdade.controller";

const router = Router();

router.get("/", getFaculdades);
router.post("/", createFaculdade);
router.delete("/:id", deleteFaculdade);

export default router;
