import { NextFunction, Response } from "express";
import { UserData } from "../interfaces";
import { AuthRequest } from "../interfaces/request";

const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      error: true,
      message:
        "Acesso negado: apenas administradores podem realizar esta ação.",
    });
  }

  next();
};

export default adminMiddleware;
