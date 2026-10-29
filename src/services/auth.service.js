import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as usuarios from '../repositories/usuarios.repository.js';
import { crearError } from '../utils/errores.js';

// Lo que se guarda DENTRO del token. verificarToken lo deja en req.usuario.
function datosPublicos(u) {
  return { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol };
}

// Devuelve el usuario + los dos tokens:
//  - acceso: dura poco (JWT_EXPIRES_IN, 1h) y va en cada petición
//  - refresco: dura más (7d) y solo sirve para pedir un acceso nuevo
function generarTokens(usuario) {
  const publico = datosPublicos(usuario);
  const acceso = jwt.sign(publico, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN ?? '1h' });
  const refresco = jwt.sign({ id: usuario.id, tipo: 'refresco' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  });
  return { usuario: publico, acceso, refresco };
}

export async function registrar({ nombre, email, password }) {
  if (!nombre?.trim() || !email?.trim() || !password)
    throw crearError(400, 'Nombre, email y contraseña son obligatorios');
  if (password.length < 6) throw crearError(400, 'La contraseña debe tener al menos 6 caracteres');

  const emailLimpio = email.trim().toLowerCase();
  if (await usuarios.buscarPorEmail(emailLimpio)) throw crearError(409, 'Ese email ya está registrado');

  const passwordHash = await bcrypt.hash(password, 10); // nunca guardamos la contraseña tal cual
  const id = await usuarios.crear({ nombre: nombre.trim(), email: emailLimpio, passwordHash });
  return generarTokens(await usuarios.buscarPorId(id));
}

export async function login({ email, password }) {
  if (!email || !password) throw crearError(400, 'Email y contraseña son obligatorios');

  const usuario = await usuarios.buscarPorEmail(email.trim().toLowerCase());
  // Mismo mensaje en los dos casos: no damos pistas de qué emails existen.
  if (!usuario || !usuario.password_hash) throw crearError(401, 'Credenciales incorrectas');

  const correcta = await bcrypt.compare(password, usuario.password_hash);
  if (!correcta) throw crearError(401, 'Credenciales incorrectas');

  return generarTokens(usuario);
}

// Login con Google: NextAuth nos manda el id_token que le dio Google.
// Le preguntamos a Google si es auténtico antes de fiarnos del email.
export async function loginGoogle({ idToken }) {
  if (!idToken) throw crearError(400, 'Falta el token de Google');

  const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!r.ok) throw crearError(401, 'Token de Google inválido');
  const info = await r.json();

  // Si configuramos GOOGLE_CLIENT_ID, comprobamos que el token es para NUESTRA app.
  if (process.env.GOOGLE_CLIENT_ID && info.aud !== process.env.GOOGLE_CLIENT_ID)
    throw crearError(401, 'El token de Google no es de esta aplicación');
  if (info.email_verified !== 'true' && info.email_verified !== true)
    throw crearError(401, 'Email de Google no verificado');

  const email = info.email.toLowerCase();
  let usuario = await usuarios.buscarPorEmail(email);
  if (!usuario) {
    // Primera vez: lo registramos sin contraseña (password_hash = NULL)
    const id = await usuarios.crear({ nombre: info.name ?? email, email, proveedor: 'google' });
    usuario = await usuarios.buscarPorId(id);
  }
  return generarTokens(usuario);
}

// Cambia un token de refresco por un token de acceso nuevo.
export async function refrescar({ refresco }) {
  if (!refresco) throw crearError(400, 'Falta el token de refresco');
  let datos;
  try {
    datos = jwt.verify(refresco, process.env.JWT_SECRET);
  } catch {
    throw crearError(401, 'Token de refresco inválido o expirado');
  }
  if (datos.tipo !== 'refresco') throw crearError(401, 'Token de refresco inválido');

  const usuario = await usuarios.buscarPorId(datos.id);
  if (!usuario) throw crearError(401, 'El usuario ya no existe');
  return generarTokens(usuario);
}
