import * as repo from '../repositories/productos.repository.js';
import { crearError } from '../utils/errores.js';

// El servicio tiene la LÓGICA: valida, decide errores (404, 400) y llama al repositorio.

export function listar(filtros) {
  return repo.buscarTodos(filtros);
}

export async function obtenerPorId(id) {
  const producto = await repo.buscarPorId(id);
  if (!producto) throw crearError(404, 'Producto no encontrado');
  return producto;
}

function validar({ nombre, precio, stock }, esNuevo) {
  if (esNuevo && !nombre?.trim()) throw crearError(400, 'El nombre es obligatorio');
  if (esNuevo && precio === undefined) throw crearError(400, 'El precio es obligatorio');
  if (precio !== undefined && (isNaN(precio) || Number(precio) < 0))
    throw crearError(400, 'El precio debe ser un número positivo');
  if (stock !== undefined && (!Number.isInteger(Number(stock)) || Number(stock) < 0))
    throw crearError(400, 'El stock debe ser un entero positivo');
}

export async function crear(datos) {
  validar(datos, true);
  const id = await repo.crear(datos);
  return repo.buscarPorId(id); // devolvemos el producto completo, ya guardado
}

export async function actualizar(id, datos) {
  validar(datos, false);
  await obtenerPorId(id); // lanza 404 si no existe
  await repo.actualizar(id, datos);
  return repo.buscarPorId(id);
}

export async function eliminar(id) {
  try {
    const borrados = await repo.eliminar(id);
    if (!borrados) throw crearError(404, 'Producto no encontrado');
  } catch (e) {
    // Si el producto aparece en pedidos ya hechos, MySQL no deja borrarlo (FOREIGN KEY).
    if (e.code === 'ER_ROW_IS_REFERENCED_2')
      throw crearError(409, 'No se puede borrar: el producto está en pedidos existentes');
    throw e;
  }
}
