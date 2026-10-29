import * as repo from '../repositories/pedidos.repository.js';
import { crearError } from '../utils/errores.js';

export function listarDeUsuario(usuarioId) {
  return repo.buscarDeUsuario(usuarioId);
}

export function listarTodos() {
  return repo.buscarTodos();
}

// Un cliente solo puede ver SUS pedidos; un admin, cualquiera.
// Si no es suyo respondemos 404 (no 403) para no revelar qué ids existen.
async function conLineas(pedido, usuario) {
  if (!pedido) throw crearError(404, 'Pedido no encontrado');
  if (pedido.usuario_id !== usuario.id && usuario.rol !== 'admin')
    throw crearError(404, 'Pedido no encontrado');
  return { ...pedido, lineas: await repo.buscarLineas(pedido.id) };
}

export async function detalle(id, usuario) {
  return conLineas(await repo.buscarPorId(id), usuario);
}

export async function detallePorSesion(sessionId, usuario) {
  return conLineas(await repo.buscarPorSesionStripe(sessionId), usuario);
}
