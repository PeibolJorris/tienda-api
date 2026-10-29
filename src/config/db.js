import mysql from "mysql2/promise";
// mysql2/promise: versión de mysql2 que devuelve Promises en vez de callbacks.
// Así podemos usar async/await en vez de anidaciones de callbacks.

export const pool = mysql.createPool({
  host: process.env.DB_HOST, // Servidor de MySQL (localhost en desarrollo)
  port: Number(process.env.DB_PORT) || 3306, // En local 3306; en la nube (Aiven) te dan otro puerto
  // En la nube la conexión va cifrada (SSL). En local no hace falta → DB_SSL no se pone.
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  user: process.env.DB_USER, // Usuario de MySQL (normalmente root)
  password: process.env.DB_PASSWORD, // Contraseña de MySQL
  database: process.env.DB_NAME, // Nombre de la base de datos: "tienda"
  waitForConnections: true, // Si todas las conexiones están ocupadas, espera
  connectionLimit: 10, // Máximo 10 conexiones simultáneas
});

// Cómo se usa en un repositorio:
//   const [filas] = await pool.query('SELECT * FROM productos');
//
// pool.query() devuelve un array: [filas, metadatos].
// Con destructuring [filas] nos quedamos solo con los datos.
// El ? en las queries es un placeholder que mysql2 reemplaza de forma segura:
//   await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
// Esto PREVIENE inyección SQL: nunca concatenes variables directamente en la query.
