import { LineaTrabajoService } from '../services/lineaTrabajoService.js';

/**
 * Controlador HTTP: Líneas de Trabajo
 */
export class LineaTrabajoController {
  /** GET /api/lineas-trabajo */
  static async getAll(req, res) {
    try {
      const list = await LineaTrabajoService.listar();
      return res.json({ success: true, count: list.length, data: list });
    } catch (error) {
      console.error('[LineaTrabajoController.getAll]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** GET /api/lineas-trabajo/con-programas */
  static async getAllWithProgramas(req, res) {
    try {
      const list = await LineaTrabajoService.listarConProgramas();
      return res.json({ success: true, count: list.length, data: list });
    } catch (error) {
      console.error('[LineaTrabajoController.getAllWithProgramas]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** GET /api/lineas-trabajo/:id */
  static async getById(req, res) {
    try {
      const linea = await LineaTrabajoService.obtenerPorId(req.params.id);
      if (!linea) {
        return res.status(404).json({ success: false, message: 'Línea de trabajo no encontrada.' });
      }
      return res.json({ success: true, data: linea });
    } catch (error) {
      console.error('[LineaTrabajoController.getById]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** POST /api/lineas-trabajo */
  static async create(req, res) {
    try {
      const { nombre } = req.body;
      const linea = await LineaTrabajoService.crear(nombre);
      return res.status(201).json({ success: true, message: 'Línea de trabajo creada.', data: linea });
    } catch (error) {
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  /** PUT /api/lineas-trabajo/:id */
  static async update(req, res) {
    try {
      const { nombre } = req.body;
      const updated = await LineaTrabajoService.actualizar(req.params.id, nombre);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Línea de trabajo no encontrada.' });
      }
      return res.json({ success: true, message: 'Línea de trabajo actualizada.', data: updated });
    } catch (error) {
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  /** DELETE /api/lineas-trabajo/:id */
  static async delete(req, res) {
    try {
      const deleted = await LineaTrabajoService.eliminar(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Línea de trabajo no encontrada o tiene programas asociados.' });
      }
      return res.json({ success: true, message: 'Línea de trabajo eliminada.' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
