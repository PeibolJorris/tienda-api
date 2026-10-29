// Crea un error con código HTTP. El middleware de error de index.js lo lee:
//   res.status(err.status ?? 500).json({ error: err.message })
// Ejemplo: throw crearError(404, 'Producto no encontrado')
export function crearError(status, mensaje) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}
