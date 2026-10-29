import { Router } from "express";
import Stripe from "stripe";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { pool } from "../config/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = Router();

// Crear sesión de Stripe Checkout
router.post("/crear-sesion", verificarToken, async (req, res, next) => {
  try {
    const [items] = await pool.query(
      `SELECT ci.cantidad, p.nombre, p.precio, p.id as producto_id
       FROM carrito_items ci JOIN productos p ON ci.producto_id = p.id
       WHERE ci.usuario_id = ?`,
      [req.usuario.id],
    );
    if (!items.length) return res.status(400).json({ error: "Carrito vacío" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: String(req.usuario.id),
      line_items: items.map((i) => ({
        price_data: {
          currency: "mxn",
          product_data: { name: i.nombre },
          unit_amount: Math.round(i.precio * 100),
        },
        quantity: i.cantidad,
      })),
      success_url: `${process.env.CORS_ORIGIN}/pago/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CORS_ORIGIN}/pago/cancelado`,
    });

    res.json({ url: session.url });
  } catch (e) {
    next(e);
  }
});

// Webhook: Stripe confirma el pago
router.post("/webhook", async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return res.status(400).send("Firma inválida");
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const userId = Number(s.client_reference_id);

    // Crear pedido con las líneas del carrito
    const [items] = await pool.query(
      `SELECT producto_id, cantidad, p.precio
       FROM carrito_items ci JOIN productos p ON ci.producto_id = p.id
       WHERE ci.usuario_id = ?`,
      [userId],
    );
    const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);

    const [pedido] = await pool.query(
      "INSERT INTO pedidos (usuario_id, total, estado, stripe_session) VALUES (?,?,?,?)",
      [userId, total, "pagado", s.id],
    );
    const lineas = items.map((i) => [
      pedido.insertId,
      i.producto_id,
      i.cantidad,
      i.precio,
    ]);
    await pool.query(
      "INSERT INTO pedido_lineas (pedido_id, producto_id, cantidad, precio_unit) VALUES ?",
      [lineas],
    );

    // Vaciar carrito
    await pool.query("DELETE FROM carrito_items WHERE usuario_id = ?", [
      userId,
    ]);
  }
  res.json({ recibido: true });
});

export default router;
