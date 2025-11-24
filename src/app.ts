import cors from "cors";
import express from "express";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import eventsRoutes from "./routes/event.routes";
import editionRoutes from "./routes/edition.routes";
import faculdadeRoutes from "./routes/faculdade.routes";
import inscricoesRoutes from "./routes/inscricoes.routes";
import palestranteRoutes from "./routes/palestrante.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor funcionando!");
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/event", eventsRoutes);
app.use("/edition", editionRoutes);
app.use("/faculdade", faculdadeRoutes);
app.use("/inscricoes", inscricoesRoutes);
app.use("/palestrante", palestranteRoutes);

export default app;
