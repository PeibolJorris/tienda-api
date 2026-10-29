import { Router } from 'express';
import * as ctrl from '../controllers/categorias.controller.js';

const router = Router();

router.get('/', ctrl.listar); // pública

export default router;
