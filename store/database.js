import postgres from "postgres";

const sql = postgres({
  host: "db",
  port: 5432,
  database: "cash_db",
  username: "user",
  password: "password",
});

// En lugar de await directo, creamos una función de prueba
async function checkConnection() {
  try {
    await sql`SELECT 1`;
    console.log("✅ Conexión a PostgreSQL exitosa");
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
  }
}

// La ejecutamos
checkConnection();

export default sql;
