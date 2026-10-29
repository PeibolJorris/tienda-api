import { pool } from '../config/db.js';

// El repositorio es la ÚNICA capa que habla con MySQL.
// Devuelve datos "en crudo"; las reglas (404, validaciones) van en el servicio.

// Lista blanca de órdenes permitidos: nunca metemos en el SQL lo que escribe el usuario.
const ORDENES = {
  'precio': 'p.precio ASC',
  'precio-desc': 'p.precio DESC',
  'nombre': 'p.nombre ASC',
  'nuevos': 'p.creado_en DESC',
};

const SELECT_PRODUCTO = `
  SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen, p.stock, p.destacado,
         p.categoria_id, c.nombre AS categoria, c.slug AS categoria_slug, p.creado_en
  FROM productos p
  LEFT JOIN categorias c ON p.categoria_id = c.id`;

// filtros = req.query → { categoria: 'ropa', buscar: 'cami', orden: 'precio', destacado: '1' }
export async function buscarTodos({ categoria, buscar, orden, destacado } = {}) {
  const condiciones = [];
  const valores = [];

  if (categoria) {           // ?categoria=ropa → filtra por el slug de la categoría
    condiciones.push('c.slug = ?');
    valores.push(categoria);
  }
  if (buscar) {              // ?buscar=cami → busca en nombre o descripción
    condiciones.push('(p.nombre LIKE ? OR p.descripcion LIKE ?)');
    valores.push(`%${buscar}%`, `%${buscar}%`);
  }
  if (destacado) {           // ?destacado=1 → solo los de la portada
    condiciones.push('p.destacado = TRUE');
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const orderBy = ORDENES[orden] ?? 'p.id ASC';

  const [filas] = await pool.query(`${SELECT_PRODUCTO} ${where} ORDER BY ${orderBy}`, valores);
  return filas;
}

export async function buscarPorId(id) {
  const [filas] = await pool.query(`${SELECT_PRODUCTO} WHERE p.id = ?`, [id]);
  return filas[0] ?? null; // null si no existe
}

export async function crear({ nombre, descripcion, precio, imagen, stock, destacado, categoria_id }) {
  const [resultado] = await pool.query(
    `INSERT INTO productos (nombre, descripcion, precio, imagen, stock, destacado, categoria_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nombre, descripcion ?? null, precio, imagen ?? null, stock ?? 0, Boolean(destacado), categoria_id ?? null]
  );
  return resultado.insertId; // id del producto recién creado
}

// Solo actualiza los campos que llegan (actualización parcial).
const CAMPOS_EDITABLES = ['nombre', 'descripcion', 'precio', 'imagen', 'stock', 'destacado', 'categoria_id'];

export async function actualizar(id, datos) {
  const campos = CAMPOS_EDITABLES.filter((campo) => datos[campo] !== undefined);
  if (!campos.length) return 0;

  const set = campos.map((campo) => `${campo} = ?`).join(', ');
  const valores = campos.map((campo) => datos[campo]);

  const [resultado] = await pool.query(`UPDATE productos SET ${set} WHERE id = ?`, [...valores, id]);
  return resultado.affectedRows; // 0 si el id no existe
}

export async function eliminar(id) {
  const [resultado] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);
  return resultado.affectedRows;
}
