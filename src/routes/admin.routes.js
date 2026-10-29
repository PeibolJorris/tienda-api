import { Router } from 'express';
import { verificarToken, soloAdmin } from '../middlewares/auth.middleware.js';
import * as pedidos from '../controllers/pedidos.controller.js';

const router = Router();

// Todo lo de /api/admin: primero ¿hay sesión?, luego ¿es admin?
router.use(verificarToken, soloAdmin);

router.get('/pedidos', pedidos.listarTodos);

export default router;
