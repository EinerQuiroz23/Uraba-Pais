import { Router } from "express";
import { NotificacionController } from "../controllers/notificacionController.js";

const router = Router();

router.get("/", NotificacionController.listar);
router.get("/historial", NotificacionController.historial);
router.get("/count", NotificacionController.contar);
router.patch("/leer-todas", NotificacionController.marcarTodas);
router.patch("/:id/leer", NotificacionController.marcarLeida);
router.post("/generar", NotificacionController.generar);

// Borrar notificaciones
router.delete("/", NotificacionController.eliminarTodas);
router.delete("/:id", NotificacionController.eliminar);

export default router;
