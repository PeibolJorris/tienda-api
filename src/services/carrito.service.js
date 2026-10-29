import * as repo from '../repositories/carrito.repository.js';
import * as productos from '../repositories/productos.repository.js';
import { crearError } from '../utils/errores.js';

function comprobarCantidad(cantidad) {
  if (!Number.isInteger(cantidad) || cantidad < 1)
    throw crearError(400, 'La cantidad debe ser un entero mayor que 0');
}

// Todas devuelven el carrito actualizado, así el frontend no tiene que pedirlo otra vez.
export function obtener(usuarioId) {
  return repo.buscarDeUsuario(usuarioId);
}

export async function agregar(usuarioId, { productoId, cantidad = 1 }) {
  cantidad = Number(cantidad);
  comprobarCantidad(cantidad);
  const producto = await productos.buscarPorId(productoId);
  if (!producto) throw crearError(404, 'Producto no encontrado');

  await repo.agregar(usuarioId, producto.id, cantidad);
  return repo.buscarDeUsuario(usuarioId);
}

export async function cambiarCantidad(usuarioId, productoId, { cantidad }) {
  cantidad = Number(cantidad);
  if (cantidad === 0) return quitar(usuarioId, productoId); // poner 0 = quitarlo
  comprobarCantidad(cantidad);

  const cambiados = await repo.cambiarCantidad(usuarioId, productoId, cantidad);
  if (!cambiados) throw crearError(404, 'Ese producto no está en tu carrito');
  return repo.buscarDeUsuario(usuarioId);
}

export async function quitar(usuarioId, productoId) {
  const borrados = await repo.quitar(usuarioId, productoId);
  if (!borrados) throw crearError(404, 'Ese producto no está en tu carrito');
  return repo.buscarDeUsuario(usuarioId);
}
