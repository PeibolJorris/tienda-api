import { pool } from '../config/db.js';

export async function buscarTodas() {
  const [filas] = await pool.query('SELECT id, nombre, slug FROM categorias ORDER BY nombre');
  return filas;
}
