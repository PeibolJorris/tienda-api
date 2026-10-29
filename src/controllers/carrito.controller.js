import * as svc from '../services/carrito.service.js';

// req.usuario lo pone verificarToken: aquí siempre hay un usuario identificado.

export async function obtener(req, res, next) {
  try {
    res.json({ datos: await svc.obtener(req.usuario.id) });
  } catch (e) { next(e); }
}

export async function agregar(req, res, next) {
  try {
    res.status(201).json({ datos: await svc.agregar(req.usuario.id, req.body) });
  } catch (e) { next(e); }
}

export async function cambiarCantidad(req, res, next) {
  try {
    res.json({ datos: await svc.cambiarCantidad(req.usuario.id, req.params.productoId, req.body) });
  } catch (e) { next(e); }
}

export async function quitar(req, res, next) {
  try {
    res.json({ datos: await svc.quitar(req.usuario.id, req.params.productoId) });
  } catch (e) { next(e); }
}
