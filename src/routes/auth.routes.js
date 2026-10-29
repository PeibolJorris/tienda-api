import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller.js';

const router = Router();

// Todas públicas: son justo las que dan el token.
router.post('/registro', ctrl.registro);
router.post('/login', ctrl.login);
router.post('/google', ctrl.google);
router.post('/refrescar', ctrl.refrescar);

export default router;
