import { NotificacionService } from "../services/notificacionService.js";

/** Solo Funcionario / Admin / Operador puede ver/usar notificaciones */
function esFuncionario(req) {
  const rol = (req.user?.rol || "").toLowerCase();
  return rol === "funcionario" || rol === "admin" || rol === "operador";
}

export class NotificacionController {
  /** GET /api/notificaciones */
  static async listar(req, res) {
    try {
      if (!esFuncionario(req)) {
        return res
          .status(403)
          .json({ success: false, message: "Solo funcionarios" });
      }
      const soloNoLeidas = req.query.solo_no_leidas === "true";
      const data = await NotificacionService.listar(req.user.id, {
        soloNoLeidas,
      });
      return res.json({ success: true, count: data.length, data });
    } catch (error) {
      console.error("[NotificacionController.listar]", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** GET /api/notificaciones/historial */
  static async historial(req, res) {
    try {
      if (!esFuncionario(req)) {
        return res
          .status(403)
          .json({ success: false, message: "Solo funcionarios" });
      }
      const data = await NotificacionService.listarHistorial(req.user.id, {
        limit: 50,
      });
      return res.json({ success: true, count: data.length, data });
    } catch (error) {
      console.error("[NotificacionController.historial]", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** GET /api/notificaciones/count */
  static async contar(req, res) {
    try {
      if (!esFuncionario(req)) {
        return res.json({ success: true, total: 0 });
      }
      const total = await NotificacionService.contarNoLeidas(req.user.id);
      return res.json({ success: true, total });
    } catch (error) {
      console.error("[NotificacionController.contar]", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** PATCH /api/notificaciones/:id/leer */
  static async marcarLeida(req, res) {
    try {
      if (!esFuncionario(req)) {
        return res
          .status(403)
          .json({ success: false, message: "Solo funcionarios" });
      }
      const row = await NotificacionService.marcarLeida(
        Number(req.params.id),
        req.user.id,
      );
      return res.json({ success: true, data: row });
    } catch (error) {
      console.error("[NotificacionController.marcarLeida]", error);
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  /** PATCH /api/notificaciones/leer-todas */
  static async marcarTodas(req, res) {
    try {
      if (!esFuncionario(req)) {
        return res
          .status(403)
          .json({ success: false, message: "Solo funcionarios" });
      }
      const count = await NotificacionService.marcarTodasLeidas(req.user.id);
      return res.json({ success: true, actualizadas: count });
    } catch (error) {
      console.error("[NotificacionController.marcarTodas]", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** POST /api/notificaciones/generar */
  static async generar(req, res) {
    try {
      if (!esFuncionario(req)) {
        return res
          .status(403)
          .json({ success: false, message: "Solo funcionarios" });
      }
      const result = await NotificacionService.generarAlertas();
      return res.json({ success: true, ...result });
    } catch (error) {
      console.error("[NotificacionController.generar]", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** DELETE /api/notificaciones/:id */
  static async eliminar(req, res) {
    try {
      if (!esFuncionario(req)) {
        return res
          .status(403)
          .json({ success: false, message: "Solo funcionarios" });
      }
      const row = await NotificacionService.eliminar(
        Number(req.params.id),
        req.user.id,
      );
      return res.json({ success: true, data: row });
    } catch (error) {
      console.error("[NotificacionController.eliminar]", error);
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  /** DELETE /api/notificaciones */
  static async eliminarTodas(req, res) {
    try {
      if (!esFuncionario(req)) {
        return res
          .status(403)
          .json({ success: false, message: "Solo funcionarios" });
      }
      const count = await NotificacionService.eliminarTodas(req.user.id);
      return res.json({ success: true, eliminadas: count });
    } catch (error) {
      console.error("[NotificacionController.eliminarTodas]", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
