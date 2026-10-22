import { query } from '../database/db.js';

/**
 * Repositorio de Persistencia: Municipios
 * Consultas SQL contra la tabla municipio.
 */
export class MunicipioRepository {
  /**
   * Obtiene todos los municipios
   */
  static async findAll() {
    const res = await query('SELECT id_municipio, nombre FROM municipio ORDER BY nombre');
    return res.rows;
  }

  /**
   * Busca un municipio por ID
   */
  static async findById(id) {
    const res = await query('SELECT id_municipio, nombre FROM municipio WHERE id_municipio = $1', [id]);
    return res.rows[0] || null;
  }

  /**
   * Busca un municipio por nombre exacto
   */
  static async findByNombre(nombre) {
    const res = await query('SELECT id_municipio, nombre FROM municipio WHERE nombre = $1', [nombre]);
    return res.rows[0] || null;
  }

  /**
   * Crea un nuevo municipio
   */
  static async create(nombre) {
    const res = await query(
      'INSERT INTO municipio (nombre) VALUES ($1) RETURNING id_municipio, nombre',
      [nombre]
    );
    return res.rows[0];
  }

  /**
   * Actualiza el nombre de un municipio
   */
  static async update(id, nombre) {
    const res = await query(
      'UPDATE municipio SET nombre = $1 WHERE id_municipio = $2 RETURNING id_municipio, nombre',
      [nombre, id]
    );
    return res.rows[0] || null;
  }

  /**
   * Elimina un municipio (solo si no tiene beneficiarios asociados)
   */
  static async delete(id) {
    const res = await query(
      'DELETE FROM municipio WHERE id_municipio = $1 RETURNING id_municipio',
      [id]
    );
    return res.rowCount > 0;
  }

  /**
   * Cuenta total de municipios
   */
  static async count() {
    const res = await query('SELECT COUNT(*)::int AS total FROM municipio');
    return res.rows[0].total;
  }
}
