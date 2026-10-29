import * as svc from '../services/pedidos.service.js';

export async function listar(req, res, next) {
  try {
    res.json({ datos: await svc.listarDeUsuario(req.usuario.id) });
  } catch (e) { next(e); }
}

export async function detalle(req, res, next) {
  try {
    res.json({ datos: await svc.detalle(req.params.id, req.usuario) });
  } catch (e) { next(e); }
}

export async function detallePorSesion(req, res, next) {
  try {
    res.json({ datos: await svc.detallePorSesion(req.params.sessionId, req.usuario) });
  } catch (e) { next(e); }
}

export async function listarTodos(req, res, next) {
  try {
    res.json({ datos: await svc.listarTodos() });
  } catch (e) { next(e); }
}
