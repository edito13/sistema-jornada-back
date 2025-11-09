import fs from "fs";
import path from "path";
import database from "../connection/database";
import generateAdmin from "../utils/generateAdmin";

async function runSeeds() {
  const seedsDir = path.resolve("src/seeds");
  const files = fs
    .readdirSync(seedsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const connection = await database.getConnection();

  try {
    console.log("🌱 Iniciando seed dos dados...");

    for (const file of files) {
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");
      await connection.query(sql);
      console.log(`✅ Seed executado: ${file}`);
    }

    await generateAdmin();

    console.log("🎉 Todos os seeds foram inseridos com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao rodar seeds:", error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runSeeds();
