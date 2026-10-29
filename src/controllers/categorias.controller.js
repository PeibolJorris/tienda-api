import * as repo from '../repositories/categorias.repository.js';

// Sin servicio: no hay ninguna lógica que añadir, solo leer la lista.
export async function listar(req, res, next) {
  try {
    const categorias = await repo.buscarTodas();
    res.json({ datos: categorias });
  } catch (e) { next(e); }
}
