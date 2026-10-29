import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/pedidos.controller.js';

const router = Router();

router.use(verificarToken); // los pedidos son privados

router.get('/', ctrl.listar);
// Va ANTES de '/:id': si no, Express pensaría que "sesion" es un id.
router.get('/sesion/:sessionId', ctrl.detallePorSesion); // para la página de éxito del pago
router.get('/:id', ctrl.detalle);

export default router;
