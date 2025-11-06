import { NextFunction, Response, Request } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    role?: string;
    [key: string]: any;
  };
}

const adminMiddleware = (
  req: AuthenticatedRequest,
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
