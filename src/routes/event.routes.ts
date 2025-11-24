import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
  createEvent,
  deleteEvent,
  editEvent,
  getEvents,
  getEvent,
} from "../controllers/event.controller";
import adminMiddleware from "../middlewares/admin.middleware";

const router = Router();

router.get("/", getEvents);
router.get("/:id", getEvent);
router.post("/", authMiddleware, adminMiddleware, createEvent);
router.put("/:id", authMiddleware, adminMiddleware, editEvent);
router.delete("/:id", authMiddleware, adminMiddleware, deleteEvent);

export default router;
