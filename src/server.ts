import app from "./app";
import { config } from "dotenv";

config();

const PORT = Number(process.env.PORT) || 8000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
