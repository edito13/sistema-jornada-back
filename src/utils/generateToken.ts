import dotenv from "dotenv";
import Jwt from "jsonwebtoken";
import { UserData } from "../interfaces";

dotenv.config();

const secret = process.env.JWT_SECRET as string;
const expiresIn = process.env.JWT_EXPIRES_IN as Jwt.SignOptions["expiresIn"];

const generateToken = (
  data: UserData,
  customExpire?: Jwt.SignOptions["expiresIn"]
) => {
  const token = Jwt.sign(data, secret, {
    expiresIn: customExpire || expiresIn,
  });
  return token;
};

export default generateToken;
