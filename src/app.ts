import express from "express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Node + MySQL funcionando!");
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

export default app;
