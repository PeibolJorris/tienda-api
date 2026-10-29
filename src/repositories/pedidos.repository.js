import { pool } from '../config/db.js';

export async function buscarDeUsuario(usuarioId) {
  const [filas] = await pool.query(
    'SELECT id, total, estado, creado_en FROM pedidos WHERE usuario_id = ? ORDER BY creado_en DESC',
    [usuarioId]
  );
  return filas;
}

// Para el panel de admin: todos los pedidos con el nombre y email de quien compró.
export async function buscarTodos() {
  const [filas] = await pool.query(
    `SELECT pe.id, pe.total, pe.estado, pe.creado_en, u.nombre AS cliente, u.email
     FROM pedidos pe JOIN usuarios u ON pe.usuario_id = u.id
     ORDER BY pe.creado_en DESC`
  );
  return filas;
}

export async function buscarPorId(id) {
  const [filas] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [id]);
  return filas[0] ?? null;
}

// Para la página de éxito: Stripe nos devuelve el session_id, no el id del pedido.
export async function buscarPorSesionStripe(sessionId) {
  const [filas] = await pool.query('SELECT * FROM pedidos WHERE stripe_session = ?', [sessionId]);
  return filas[0] ?? null;
}

// Las líneas del pedido con el nombre y la imagen de cada producto.
export async function buscarLineas(pedidoId) {
  const [filas] = await pool.query(
    `SELECT pl.producto_id, pl.cantidad, pl.precio_unit, p.nombre, p.imagen
     FROM pedido_lineas pl JOIN productos p ON pl.producto_id = p.id
     WHERE pl.pedido_id = ?`,
    [pedidoId]
  );
  return filas;
}
