import { MunicipioService } from '../services/municipioService.js';

/**
 * Controlador HTTP: Municipios
 */
export class MunicipioController {
  /** GET /api/municipios */
  static async getAll(req, res) {
    try {
      const list = await MunicipioService.listar();
      return res.json({ success: true, count: list.length, data: list });
    } catch (error) {
      console.error('[MunicipioController.getAll]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** GET /api/municipios/:id */
  static async getById(req, res) {
    try {
      const municipio = await MunicipioService.obtenerPorId(req.params.id);
      if (!municipio) {
        return res.status(404).json({ success: false, message: 'Municipio no encontrado.' });
      }
      return res.json({ success: true, data: municipio });
    } catch (error) {
      console.error('[MunicipioController.getById]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** POST /api/municipios */
  static async create(req, res) {
    try {
      const { nombre } = req.body;
      const municipio = await MunicipioService.crear(nombre);
      return res.status(201).json({ success: true, message: 'Municipio creado.', data: municipio });
    } catch (error) {
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  /** PUT /api/municipios/:id */
  static async update(req, res) {
    try {
      const { nombre } = req.body;
      const updated = await MunicipioService.actualizar(req.params.id, nombre);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Municipio no encontrado.' });
      }
      return res.json({ success: true, message: 'Municipio actualizado.', data: updated });
    } catch (error) {
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  /** DELETE /api/municipios/:id */
  static async delete(req, res) {
    try {
      const deleted = await MunicipioService.eliminar(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Municipio no encontrado o tiene beneficiarios asociados.' });
      }
      return res.json({ success: true, message: 'Municipio eliminado.' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
