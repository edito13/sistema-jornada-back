import dotenv from "dotenv";
import Jwt from "jsonwebtoken";
import { UserData } from "../interfaces";

dotenv.config();

const secret = process.env.JWT_SECRET as string;
const expiresIn = process.env.JWT_EXPIRES_IN as Jwt.SignOptions["expiresIn"];

const generateToken = (data: UserData) => {
  const token = Jwt.sign(data, secret, { expiresIn });
  return token;
};

export default generateToken;
