// Convierte un usuario en ADMIN en la base de datos de PRODUCCIÓN (Aiven).
// Usa los datos de conexión de .env.produccion (igual que importar.js).
// Uso, desde tienda-api:   node db/hacer-admin.js tu@email.com
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: '.env.produccion' });

// process.argv = ['node', 'db/hacer-admin.js', 'tu@email.com'] → el email es la posición 2
const email = process.argv[2];
if (!email) {
  console.log('❌ Falta el email. Uso: node db/hacer-admin.js tu@email.com');
  process.exit(1);
}

const conexion = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'tienda',
  ssl: { rejectUnauthorized: false },
});

// El ? se sustituye por el email de forma segura (evita inyección SQL)
const [r] = await conexion.query("UPDATE usuarios SET rol = 'admin' WHERE email = ?", [email]);

if (r.affectedRows === 0) {
  console.log(`❌ No existe ningún usuario con el email ${email}. Regístrate primero en la web.`);
} else {
  const [[u]] = await conexion.query('SELECT id, nombre, email, rol FROM usuarios WHERE email = ?', [email]);
  console.log('✅ Ahora es admin:', u);
}
await conexion.end();
