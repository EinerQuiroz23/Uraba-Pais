import { AtencionRepository } from '../repositories/atencionRepository.js';
import { BeneficiarioRepository } from '../repositories/beneficiarioRepository.js';
import { ProgramaRepository } from '../repositories/programaRepository.js';

/**
 * Servicio de Negocio: Atenciones y Ayudas
 */
export class AtencionService {
  /**
   * Lista atenciones con filtros opcionales
   */
  static async listarAtenciones({ id_beneficiario, id_programa } = {}) {
    return await AtencionRepository.findAll({ id_beneficiario, id_programa });
  }

  /**
   * Registra una nueva atención
   */
  static async registrarAtencion({
    id_beneficiario, id_programa, descripcion, fecha_atencion, tipo, responsable, entidad, resultado, remision }) {
    // Verificar que el beneficiario existe
    const beneficiario = await BeneficiarioRepository.findById(id_beneficiario);
    if (!beneficiario) {
      const err = new Error('Beneficiario no encontrado.');
      err.status = 404;
      throw err;
    }

    // Verificar que el programa existe
    const programa = await ProgramaRepository.findById(id_programa);
    if (!programa) {
      const err = new Error('Programa no encontrado.');
      err.status = 404;
      throw err;
    }

    return await AtencionRepository.create({
      id_beneficiario, id_programa, descripcion, fecha_atencion,
      tipo, responsable, entidad, resultado, remision,
    });
  }

  /**
   * Obtiene una atención por ID
   */
  static async obtenerPorId(id) {
    return await AtencionRepository.findById(id);
  }

  /**
   * Elimina una atención
   */
  static async eliminar(id) {
    return await AtencionRepository.delete(id);
  }
}
