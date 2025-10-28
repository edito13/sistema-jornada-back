import { Router } from "express";

const router = Router();

router.get("/user", async (req, res) => {
  res.json({ message: "User route" });
});

router.get("/users", async (req, res) => {
  res.json("Users route");
});

export default router;
