import { Router } from "express";
import {
  createFaculdade,
  deleteFaculdade,
  editFaculdade,
  getFaculdades,
} from "../controllers/faculdade.controller";

const router = Router();

router.get("/", getFaculdades);
router.post("/", createFaculdade);
router.put("/:id", editFaculdade);
router.delete("/:id", deleteFaculdade);

export default router;
