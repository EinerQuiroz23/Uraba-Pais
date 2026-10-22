import { BeneficiarioService } from '../services/beneficiarioService.js';
import { BeneficiarioSchema } from '../schemas/beneficiarioSchema.js';

/**
 * Controlador HTTP: Beneficiarios
 */
export class BeneficiarioController {
  /** GET /api/beneficiarios */
  static async getAll(req, res) {
    if (req.user?.rol === 'Beneficiario') {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    try {
      const { search, id_municipio } = req.query || {};
      const list = await BeneficiarioService.listarBeneficiarios({ search, id_municipio });
      return res.json({ success: true, count: list.length, data: list });
    } catch (error) {
      console.error('[BeneficiarioController.getAll]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** POST /api/beneficiarios/check-duplicate */
  static async checkDuplicate(req, res) {
    try {
      const validation = BeneficiarioSchema.validateDuplicateQuery(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, errors: validation.errors, message: validation.errors[0] });
      }
      const result = await BeneficiarioService.verificarDuplicado(validation.value);
      return res.json({ success: true, ...result });
    } catch (error) {
      console.error('[BeneficiarioController.checkDuplicate]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** GET /api/beneficiarios/:id */
  static async getFichaConsolidada(req, res) {
    if (req.user?.rol === 'Beneficiario' && Number(req.params.id) !== Number(req.user.beneficiarioId)) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    try {
      const { id } = req.params;
      const ficha = await BeneficiarioService.obtenerFichaConsolidada(parseInt(id));
      if (!ficha) {
        return res.status(404).json({ success: false, message: 'Beneficiario no encontrado.' });
      }
      return res.json({ success: true, data: ficha });
    } catch (error) {
      console.error('[BeneficiarioController.getFichaConsolidada]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** POST /api/beneficiarios */
  static async create(req, res) {
    try {
      const validation = BeneficiarioSchema.validateCreate(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, errors: validation.errors, message: validation.errors[0] });
      }

      const creado = await BeneficiarioService.registrarBeneficiario(validation.value);
      return res.status(201).json({
        success: true,
        message: 'Beneficiario registrado exitosamente.',
        data: creado
      });
    } catch (error) {
      if (error.status === 409 || error.isDuplicate) {
        return res.status(409).json({
          success: false,
          isDuplicate: true,
          message: error.message,
          existingBeneficiary: error.existingBeneficiary
        });
      }
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  /** PUT /api/beneficiarios/:id */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const validation = BeneficiarioSchema.validateUpdate(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, errors: validation.errors, message: validation.errors[0] });
      }

      const updated = await BeneficiarioService.actualizarBeneficiario(parseInt(id), validation.value);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Beneficiario no encontrado.' });
      }
      return res.json({ success: true, message: 'Beneficiario actualizado.', data: updated });
    } catch (error) {
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  /** DELETE /api/beneficiarios/:id */
  static async delete(req, res) {
    try {
      const deleted = await BeneficiarioService.eliminarBeneficiario(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Beneficiario no encontrado.' });
      }
      return res.json({ success: true, message: 'Beneficiario eliminado.' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
