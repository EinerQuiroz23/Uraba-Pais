import { AtencionService } from '../services/atencionService.js';
import { AtencionSchema } from '../schemas/atencionSchema.js';

/**
 * Controlador HTTP: Atenciones y Ayudas
 */
export class AtencionController {
  /** GET /api/atenciones */
  static async getAll(req, res) {
    try {
      const { id_beneficiario, id_programa } = req.query || {};
      const list = await AtencionService.listarAtenciones({ id_beneficiario, id_programa });
      return res.json({ success: true, count: list.length, data: list });
    } catch (error) {
      console.error('[AtencionController.getAll]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** POST /api/atenciones */
  static async create(req, res) {
    try {
      const validation = AtencionSchema.validateCreate(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, errors: validation.errors, message: validation.errors[0] });
      }

      const nuevaAtencion = await AtencionService.registrarAtencion(validation.value);
      return res.status(201).json({
        success: true,
        message: 'Atención registrada exitosamente.',
        data: nuevaAtencion
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  }

  /** GET /api/atenciones/:id */
  static async getById(req, res) {
    try {
      const atencion = await AtencionService.obtenerPorId(parseInt(req.params.id));
      if (!atencion) {
        return res.status(404).json({ success: false, message: 'Atención no encontrada.' });
      }
      return res.json({ success: true, data: atencion });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** DELETE /api/atenciones/:id */
  static async delete(req, res) {
    try {
      const deleted = await AtencionService.eliminar(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Atención no encontrada.' });
      }
      return res.json({ success: true, message: 'Atención eliminada.' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
