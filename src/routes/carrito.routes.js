import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/carrito.controller.js';

const router = Router();

// El carrito es de cada usuario: TODAS las rutas necesitan token.
router.use(verificarToken);

router.get('/', ctrl.obtener);
router.post('/', ctrl.agregar);                   // body: { productoId, cantidad }
router.put('/:productoId', ctrl.cambiarCantidad); // body: { cantidad }
router.delete('/:productoId', ctrl.quitar);

export default router;
