import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import { Response, NextFunction } from "express";

import database from "../connection/database";
import { AuthRequest } from "../interfaces/request";
import { JwtPayload, UserData } from "../interfaces";

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers["authorization"];

  try {
    if (!header) throw "Token não enviado!";
    const token = header && header.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const secret = process.env.JWT_SECRET as string;

    const { id } = jwt.verify(token, secret) as JwtPayload;

    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    const user = rows && rows[0];

    if (!user) throw "Token inválido!";

    req.user = user as UserData;
    next();
  } catch (error) {
    res.status(403).json({ message: error ?? "Token inválido ou expirado" });
  }
};

export default authMiddleware;
