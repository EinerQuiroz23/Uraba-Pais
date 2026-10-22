import { query } from '../database/db.js';

/**
 * Repositorio de Persistencia: Líneas de Trabajo
 * Consultas SQL contra la tabla linea_trabajo.
 */
export class LineaTrabajoRepository {
  /**
   * Obtiene todas las líneas de trabajo
   */
  static async findAll() {
    const res = await query('SELECT id_linea, nombre FROM linea_trabajo ORDER BY id_linea');
    return res.rows;
  }

  /**
   * Busca una línea de trabajo por ID
   */
  static async findById(id) {
    const res = await query('SELECT id_linea, nombre FROM linea_trabajo WHERE id_linea = $1', [id]);
    return res.rows[0] || null;
  }

  /**
   * Crea una nueva línea de trabajo
   */
  static async create(nombre) {
    const res = await query(
      'INSERT INTO linea_trabajo (nombre) VALUES ($1) RETURNING id_linea, nombre',
      [nombre]
    );
    return res.rows[0];
  }

  /**
   * Actualiza el nombre de una línea de trabajo
   */
  static async update(id, nombre) {
    const res = await query(
      'UPDATE linea_trabajo SET nombre = $1 WHERE id_linea = $2 RETURNING id_linea, nombre',
      [nombre, id]
    );
    return res.rows[0] || null;
  }

  /**
   * Elimina una línea de trabajo
   */
  static async delete(id) {
    const res = await query(
      'DELETE FROM linea_trabajo WHERE id_linea = $1 RETURNING id_linea',
      [id]
    );
    return res.rowCount > 0;
  }

  /**
   * Obtiene líneas de trabajo con sus programas agrupados
   */
  static async findAllWithProgramas() {
    const res = await query(`
      SELECT 
        lt.id_linea,
        lt.nombre AS linea_nombre,
        COALESCE(json_agg(
          json_build_object('id_programa', p.id_programa, 'nombre', p.nombre)
        ) FILTER (WHERE p.id_programa IS NOT NULL), '[]') AS programas
      FROM linea_trabajo lt
      LEFT JOIN programa p ON p.id_linea = lt.id_linea
      GROUP BY lt.id_linea, lt.nombre
      ORDER BY lt.id_linea
    `);
    return res.rows;
  }
}
