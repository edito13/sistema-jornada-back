import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import database from "../connection/database";
import { Request, Response, NextFunction } from "express";

const authMiddleware = async (
  req: Request,
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

    const { id } = jwt.verify(token, secret) as any;

    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ?",
      [id]
    );

    const user = rows && rows[0];

    if (!user) throw "Token inválido!";

    req.userId = user.id;
    next();
  } catch (error) {
    res.status(403).json({ message: "Token inválido ou expirado" });
  }
};

