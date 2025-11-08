import { Router } from "express";
import { editar_perfil, editar_senha, apagarconta } from  "../controllers/user.controller";

const router = Router();

router.get("/user", async (req, res) => {
  res.json({ message: "User route" });
});

router.get("/users", async (req, res) => {
  res.json("Users route");
});

router.put("/editar_perfil", editar_perfil);
router.put("/editar_senha", editar_senha);
router.delete("/apagarconta", apagarconta);

export default router;
