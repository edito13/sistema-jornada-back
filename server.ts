import app from "./src/app";
import { config } from "dotenv";

config();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
