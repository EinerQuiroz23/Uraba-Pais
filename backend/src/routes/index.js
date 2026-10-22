import { Router } from "express";
import beneficiarioRoutes from "./beneficiarioRoutes.js";
import programaRoutes from "./programaRoutes.js";
import atencionRoutes from "./atencionRoutes.js";
import seguimientoRoutes from "./seguimientoRoutes.js";
import reporteRoutes from "./reporteRoutes.js";
import databaseRoutes from "./databaseRoutes.js";
import municipioRoutes from "./municipioRoutes.js";
import lineaTrabajoRoutes from "./lineaTrabajoRoutes.js";
import authRoutes from "./authRoutes.js";
import notificacionRoutes from "./notificacionRoutes.js";
import { requireAuth, requireEscritura } from "../middleware/auth.js";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use(requireAuth);
apiRouter.use(requireEscritura);
apiRouter.use("/beneficiarios", beneficiarioRoutes);
apiRouter.use("/programas", programaRoutes);
apiRouter.use("/atenciones", atencionRoutes);
apiRouter.use("/seguimientos", seguimientoRoutes);
apiRouter.use("/reportes", reporteRoutes);
apiRouter.use("/database", databaseRoutes);
apiRouter.use("/municipios", municipioRoutes);
apiRouter.use("/lineas-trabajo", lineaTrabajoRoutes);
apiRouter.use("/notificaciones", notificacionRoutes);

export default apiRouter;
