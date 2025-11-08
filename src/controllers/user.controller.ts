import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";
import database from "../connection/database";

export const editar_perfil = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; // pegar o token
    const { nome, faculdade} = req.body;

    //pegar o usuario com esse id
    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM participantes WHERE id_participante = ?",
      [userId]
    );

    if (rows.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if(rows[0].nome != nome){
       await database.query(
            "UPDATE participantes SET nome = ? WHERE id_participante = ?",
            [nome, userId]
        );
    }

    if(rows[0].id_faculdade!= faculdade){
       await database.query(
            "UPDATE participantes SET id_faculdade = ? WHERE id_participante = ?",
            [faculdade, userId]
        );
    }
    return res.json({ message: "Perfil atualizado com sucesso" });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
};

export const editar_senha = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; 
    const {senhaantiga, senhanova} = req.body;

    //pegar o usuario
    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM participantes WHERE id_participante = ?",
      [userId]
    );

    if (rows.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const SALT_ROUNDS = 10;
    const match = await bcrypt.compare(senhaantiga, rows[0].senha);
    if(!match){
       return res.status(400).json({ error: "A senha que digitou no campo =senha antiga= está incorreta." });
    }else{
        const hash = await bcrypt.hash(senhanova, SALT_ROUNDS);
        await database.query(
            "UPDATE participantes SET senha = ? WHERE id_participante = ?",
            [hash, userId]
        )
    }

    return res.json({ message: "Senha atualizada" });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
};

export const apagarconta = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; 

    //pegar o usuario 
    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM participantes WHERE id_participante = ?",
      [userId]
    );

    if (rows.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
    }

    await database.query(
        "DELETE FROM  participantes WHERE id_participante= ? ",
        [userId]
    )

    return res.json({ message: "Perfil eliminado com sucesso" });
      
  }catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no servidor" });
  }
};
