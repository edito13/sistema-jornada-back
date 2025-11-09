import { UserData } from ".";
import { Request } from "express";

export interface AuthRequest extends Request {
  user?: UserData;
}
