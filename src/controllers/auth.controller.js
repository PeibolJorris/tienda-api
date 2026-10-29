import * as svc from '../services/auth.service.js';

export async function registro(req, res, next) {
  try {
    const resultado = await svc.registrar(req.body);
    res.status(201).json({ datos: resultado });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    res.json({ datos: await svc.login(req.body) });
  } catch (e) { next(e); }
}

export async function google(req, res, next) {
  try {
    res.json({ datos: await svc.loginGoogle(req.body) });
  } catch (e) { next(e); }
}

export async function refrescar(req, res, next) {
  try {
    res.json({ datos: await svc.refrescar(req.body) });
  } catch (e) { next(e); }
}
