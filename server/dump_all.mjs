import mysql from "mysql2/promise";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "public",
});

const [tables] = await pool.query("SHOW TABLES");
const tableKey = Object.keys(tables[0])[0];
const result = {};

for (const row of tables) {
  const name = row[tableKey];
  try {
    const [rows] = await pool.query(`SELECT * FROM \`${name}\``);
    result[name] = rows;
  } catch (e) {
    result[name] = [];
    console.error(`Failed to dump ${name}:`, e.message);
  }
}

fs.writeFileSync("./db_dump.json", JSON.stringify(result));
console.log("Dumped", Object.keys(result).length, "tables");
for (const [k, v] of Object.entries(result)) {
  if (v.length > 0) console.log(`  ${k}: ${v.length} rows`);
}
await pool.end();
