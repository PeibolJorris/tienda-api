// Importa db/esquema.sql en la base de datos de PRODUCCIÓN (Aiven).
// 1. Crea tienda-api/.env.produccion con DB_HOST, DB_PORT, DB_USER, DB_PASSWORD (los de Aiven)
// 2. Desde tienda-api:   node db/importar.js
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { readFile } from 'fs/promises';

dotenv.config({ path: '.env.produccion' });

const sql = await readFile(new URL('./esquema.sql', import.meta.url), 'utf8');
const conexion = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  multipleStatements: true, // permite ejecutar todo el .sql de golpe
});
await conexion.query(sql);
const [productos] = await conexion.query('SELECT id, nombre FROM tienda.productos');
console.log('✅ Esquema importado. Productos:', productos.map((p) => p.nombre).join(', '));
await conexion.end();
