import { MunicipioRepository } from '../repositories/municipioRepository.js';

/**
 * Servicio de Negocio: Municipios
 */
export class MunicipioService {
  static async listar() {
    return await MunicipioRepository.findAll();
  }

  static async obtenerPorId(id) {
    return await MunicipioRepository.findById(id);
  }

  static async crear(nombre) {
    if (!nombre || nombre.trim() === '') {
      const err = new Error('El nombre del municipio es obligatorio.');
      err.status = 400;
      throw err;
    }

    const existe = await MunicipioRepository.findByNombre(nombre.trim());
    if (existe) {
      const err = new Error(`El municipio "${nombre}" ya existe.`);
      err.status = 409;
      throw err;
    }

    return await MunicipioRepository.create(nombre.trim());
  }

  static async actualizar(id, nombre) {
    if (!nombre || nombre.trim() === '') {
      const err = new Error('El nombre del municipio es obligatorio.');
      err.status = 400;
      throw err;
    }
    return await MunicipioRepository.update(id, nombre.trim());
  }

  static async eliminar(id) {
    return await MunicipioRepository.delete(id);
  }
}
