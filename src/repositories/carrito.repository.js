import { pool } from '../config/db.js';

// El carrito se guarda en la tabla carrito_items: una fila por (usuario, producto).

export async function buscarDeUsuario(usuarioId) {
  const [filas] = await pool.query(
    `SELECT ci.producto_id, ci.cantidad, p.nombre, p.precio, p.imagen, p.stock
     FROM carrito_items ci
     JOIN productos p ON ci.producto_id = p.id
     WHERE ci.usuario_id = ?
     ORDER BY ci.id`,
    [usuarioId]
  );
  return filas;
}

// Si el producto ya está en el carrito, suma la cantidad en vez de duplicar la fila
// (gracias al UNIQUE(usuario_id, producto_id) de la tabla).
export async function agregar(usuarioId, productoId, cantidad) {
  await pool.query(
    `INSERT INTO carrito_items (usuario_id, producto_id, cantidad)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE cantidad = cantidad + ?`,
    [usuarioId, productoId, cantidad, cantidad]
  );
}

export async function cambiarCantidad(usuarioId, productoId, cantidad) {
  const [resultado] = await pool.query(
    'UPDATE carrito_items SET cantidad = ? WHERE usuario_id = ? AND producto_id = ?',
    [cantidad, usuarioId, productoId]
  );
  return resultado.affectedRows;
}

export async function quitar(usuarioId, productoId) {
  const [resultado] = await pool.query(
    'DELETE FROM carrito_items WHERE usuario_id = ? AND producto_id = ?',
    [usuarioId, productoId]
  );
  return resultado.affectedRows;
}
