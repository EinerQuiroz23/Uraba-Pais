import { SeguimientoService } from '../services/seguimientoService.js';
import { SeguimientoSchema } from '../schemas/seguimientoSchema.js';

/**
 * Controlador HTTP: Seguimientos
 */
export class SeguimientoController {
  /** GET /api/seguimientos */
  static async getAll(req, res) {
    try {
      const { id_beneficiario, accion_pendiente } = req.query || {};

      // Convertir el query string "true"/"false" a booleano
      let pendiente = undefined;
      if (accion_pendiente === 'true') pendiente = true;
      else if (accion_pendiente === 'false') pendiente = false;

      const list = await SeguimientoService.listarSeguimientos({ id_beneficiario, accion_pendiente: pendiente });
      return res.json({ success: true, count: list.length, data: list });
    } catch (error) {
      console.error('[SeguimientoController.getAll]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** POST /api/seguimientos */
  static async create(req, res) {
    try {
      const validation = SeguimientoSchema.validateCreate(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, errors: validation.errors, message: validation.errors[0] });
      }

      const nuevo = await SeguimientoService.registrarSeguimiento(validation.value);
      return res.status(201).json({
        success: true,
        message: 'Seguimiento registrado exitosamente.',
        data: nuevo
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  }

  /** PATCH /api/seguimientos/:id/toggle */
  static async toggleEstado(req, res) {
    try {
      const { id } = req.params;
      const updated = await SeguimientoService.alternarEstado(parseInt(id));
      return res.json({
        success: true,
        message: 'Estado de seguimiento actualizado.',
        data: updated
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  }

  /** DELETE /api/seguimientos/:id */
  static async delete(req, res) {
    try {
      const deleted = await SeguimientoService.eliminar(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Seguimiento no encontrado.' });
      }
      return res.json({ success: true, message: 'Seguimiento eliminado.' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
