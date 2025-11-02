import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor funcionando!");
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

export default app;
