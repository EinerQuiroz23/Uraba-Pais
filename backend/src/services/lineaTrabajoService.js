import { LineaTrabajoRepository } from '../repositories/lineaTrabajoRepository.js';

/**
 * Servicio de Negocio: Líneas de Trabajo
 */
export class LineaTrabajoService {
  static async listar() {
    return await LineaTrabajoRepository.findAll();
  }

  static async listarConProgramas() {
    return await LineaTrabajoRepository.findAllWithProgramas();
  }

  static async obtenerPorId(id) {
    return await LineaTrabajoRepository.findById(id);
  }

  static async crear(nombre) {
    if (!nombre || nombre.trim() === '') {
      const err = new Error('El nombre de la línea de trabajo es obligatorio.');
      err.status = 400;
      throw err;
    }
    return await LineaTrabajoRepository.create(nombre.trim());
  }

  static async actualizar(id, nombre) {
    if (!nombre || nombre.trim() === '') {
      const err = new Error('El nombre de la línea de trabajo es obligatorio.');
      err.status = 400;
      throw err;
    }
    return await LineaTrabajoRepository.update(id, nombre.trim());
  }

  static async eliminar(id) {
    return await LineaTrabajoRepository.delete(id);
  }
}
