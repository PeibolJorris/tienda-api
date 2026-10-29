import jwt from "jsonwebtoken";

export function verificarToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ error: "Token requerido" });

  try {
    req.usuario = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}

export function soloAdmin(req, res, next) {
  if (req.usuario.rol !== "admin")
    return res.status(403).json({ error: "Se requiere rol admin" });
  next();
}
