import { ProgramaService } from '../services/programaService.js';
import { ProgramaSchema } from '../schemas/programaSchema.js';
import { ParticipacionSchema } from '../schemas/participacionSchema.js';

/**
 * Controlador HTTP: Programas y Participaciones
 */
export class ProgramaController {
  /** GET /api/programas */
  static async getProgramas(req, res) {
    try {
      const programas = await ProgramaService.obtenerProgramas();
      return res.json({ success: true, count: programas.length, data: programas });
    } catch (error) {
      console.error('[ProgramaController.getProgramas]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** GET /api/programas/:id */
  static async getById(req, res) {
    try {
      const programa = await ProgramaService.obtenerProgramaPorId(parseInt(req.params.id));
      if (!programa) {
        return res.status(404).json({ success: false, message: 'Programa no encontrado.' });
      }
      return res.json({ success: true, data: programa });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** GET /api/programas/linea/:id_linea */
  static async getByLinea(req, res) {
    try {
      const programas = await ProgramaService.obtenerProgramasPorLinea(parseInt(req.params.id_linea));
      return res.json({ success: true, count: programas.length, data: programas });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** GET /api/programas/participaciones */
  static async getParticipaciones(req, res) {
    try {
      const participaciones = await ProgramaService.listarParticipaciones();
      return res.json({ success: true, count: participaciones.length, data: participaciones });
    } catch (error) {
      console.error('[ProgramaController.getParticipaciones]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async actualizarEstado(req, res) {
    try {
      const permitidos = ['inscrito', 'en proceso', 'finalizado', 'retirado'];
      const estado = req.body?.estado;
      if (!permitidos.includes(estado)) {
        return res.status(400).json({ success: false, message: 'Estado no válido' });
      }
      const fila = await ProgramaService.actualizarEstado(parseInt(req.params.id), estado);
      if (!fila) return res.status(404).json({ success: false, message: 'Vinculación no encontrada' });
      return res.json({ success: true, data: fila });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }


  /** POST /api/programas/vincular */
  static async vincular(req, res) {
    try {
      const validation = ParticipacionSchema.validateCreate(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, errors: validation.errors, message: validation.errors[0] });
      }

      const participacion = await ProgramaService.vincularBeneficiario(validation.value);
      return res.status(201).json({
        success: true,
        message: 'Beneficiario vinculado exitosamente al programa.',
        data: participacion
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  }
}
