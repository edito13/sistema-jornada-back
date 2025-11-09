import fs from "fs";
import path from "path";
import database from "../connection/database";

const runMigrations = async () => {
  const migrationsDir = path.resolve("src/migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort(); // garante ordem numérica

  const connection = await database.getConnection();

  try {
    console.log("📦 Iniciando migrações...");

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");
      await connection.query(sql);
      console.log(`✅ Executada: ${file}`);
    }

    console.log("🎉 Todas as migrações foram executadas com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao executar migrações:", error);
  } finally {
    connection.release();
    process.exit(0);
  }
};

runMigrations();
