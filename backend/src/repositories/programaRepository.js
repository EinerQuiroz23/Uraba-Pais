import { query } from '../database/db.js';

/**
 * Repositorio de Persistencia: Programas
 * Consultas SQL contra la tabla programa con JOIN a linea_trabajo.
 */
export class ProgramaRepository {
  /**
   * Obtiene todos los programas con el nombre de su línea de trabajo
   */
  static async findAll() {
    const res = await query(`
      SELECT p.id_programa, p.nombre, p.id_linea,
             lt.nombre AS linea_nombre
      FROM programa p
      JOIN linea_trabajo lt ON lt.id_linea = p.id_linea
      ORDER BY p.id_programa
    `);
    return res.rows;
  }

  /**
   * Busca un programa por ID
   */
  static async findById(id) {
    const res = await query(`
      SELECT p.id_programa, p.nombre, p.id_linea,
             lt.nombre AS linea_nombre
      FROM programa p
      JOIN linea_trabajo lt ON lt.id_linea = p.id_linea
      WHERE p.id_programa = $1
    `, [id]);
    return res.rows[0] || null;
  }

  /**
   * Busca programas por línea de trabajo
   */
  static async findByLinea(id_linea) {
    const res = await query(`
      SELECT p.id_programa, p.nombre, p.id_linea,
             lt.nombre AS linea_nombre
      FROM programa p
      JOIN linea_trabajo lt ON lt.id_linea = p.id_linea
      WHERE p.id_linea = $1
      ORDER BY p.id_programa
    `, [id_linea]);
    return res.rows;
  }

  /**
   * Crea un nuevo programa
   */
  static async create({ nombre, id_linea }) {
    const res = await query(
      'INSERT INTO programa (nombre, id_linea) VALUES ($1, $2) RETURNING id_programa, nombre, id_linea',
      [nombre, id_linea]
    );
    return res.rows[0];
  }

  /**
   * Actualiza un programa
   */
  static async update(id, { nombre, id_linea }) {
    const fields = [];
    const params = [];
    let idx = 1;

    if (nombre !== undefined) { fields.push(`nombre = $${idx++}`); params.push(nombre); }
    if (id_linea !== undefined) { fields.push(`id_linea = $${idx++}`); params.push(id_linea); }

    if (fields.length === 0) return null;

    params.push(id);
    const res = await query(
      `UPDATE programa SET ${fields.join(', ')} WHERE id_programa = $${idx} RETURNING id_programa, nombre, id_linea`,
      params
    );
    return res.rows[0] || null;
  }

  /**
   * Elimina un programa
   */
  static async delete(id) {
    const res = await query(
      'DELETE FROM programa WHERE id_programa = $1 RETURNING id_programa',
      [id]
    );
    return res.rowCount > 0;
  }
}
