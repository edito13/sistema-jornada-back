import dotenv from "dotenv";
import Jwt from "jsonwebtoken";

dotenv.config();

const secret = process.env.JWT_SECRET || "secret";
const expiresIn = (process.env.JWT_EXPIRES_IN ||
  "1d") as Jwt.SignOptions["expiresIn"];

const generateToken = (userId: number): string => {
  const token = Jwt.sign({ id: userId }, secret, { expiresIn });
  return token;
};

export default generateToken;
