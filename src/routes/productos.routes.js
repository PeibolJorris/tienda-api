import { Router } from "express";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware.js";
import * as ctrl from "../controllers/productos.controller.js";

const router = Router();

router.get("/", ctrl.listar); // público
router.get("/:id", ctrl.detalle); // público
router.post("/", verificarToken, soloAdmin, ctrl.crear);
router.put("/:id", verificarToken, soloAdmin, ctrl.actualizar);
router.delete("/:id", verificarToken, soloAdmin, ctrl.eliminar);

export default router;
