import express from "express";
import cors from "cors";
import "dotenv/config"; // Carga las variables de .env en process.env automáticamente

import productosRouter from "./routes/productos.routes.js";
import categoriasRouter from "./routes/categorias.routes.js";
import authRouter from "./routes/auth.routes.js";
import carritoRouter from "./routes/carrito.routes.js";
import pedidosRouter from "./routes/pedidos.routes.js";
import stripeRouter from "./routes/stripe.routes.js";
import adminRouter from "./routes/admin.routes.js"; // 🆕 GET /api/admin/pedidos (tabla de endpoints)

const app = express();

// ⚠️ IMPORTANTE: esta línea DEBE ir ANTES de express.json().
// El webhook de Stripe necesita el body crudo (raw) para verificar la firma.
// Si express.json() lo parsea primero, la firma no coincide y Stripe rechaza el evento.
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

// cors() permite que Next.js (en otro puerto/dominio) llame a esta API.
// Sin cors, el navegador bloquea las peticiones por política de mismo origen.
app.use(cors({ origin: process.env.CORS_ORIGIN }));

// express.json() parsea el body de las peticiones POST/PUT como JSON.
// Sin esto, req.body sería undefined.
app.use(express.json());

// Cada app.use() monta un grupo de rutas bajo un prefijo.
// Ejemplo: productosRouter define GET '/' y GET '/:id',
// y aquí se montan como GET '/api/productos' y GET '/api/productos/:id'.
app.use("/api/productos", productosRouter);
app.use("/api/categorias", categoriasRouter);
app.use("/api/auth", authRouter);
app.use("/api/carrito", carritoRouter);
app.use("/api/pedidos", pedidosRouter);
app.use("/api/stripe", stripeRouter);
app.use("/api/admin", adminRouter); // 🆕

// Middleware de error global: si cualquier controlador llama a next(error),
// llega aquí. Responde con el status del error o 500 si no tiene uno.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.message });
});

app.listen(process.env.PORT, () =>
  console.log(`API en http://localhost:${process.env.PORT}`),
);
