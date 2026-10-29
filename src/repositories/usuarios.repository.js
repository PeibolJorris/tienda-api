import { pool } from '../config/db.js';

export async function buscarPorEmail(email) {
  const [filas] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return filas[0] ?? null;
}

export async function buscarPorId(id) {
  const [filas] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  return filas[0] ?? null;
}

export async function crear({ nombre, email, passwordHash = null, proveedor = 'credenciales' }) {
  const [resultado] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password_hash, proveedor) VALUES (?, ?, ?, ?)',
    [nombre, email, passwordHash, proveedor]
  );
  return resultado.insertId;
}
