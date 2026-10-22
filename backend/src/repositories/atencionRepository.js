import { query } from '../database/db.js';

/**
 * Repositorio de Persistencia: Atenciones
 * Consultas SQL contra la tabla atencion.
 */
export class AtencionRepository {
  /**
   * Obtiene todas las atenciones con datos de beneficiario y programa
   */
  static async findAll({ id_beneficiario, id_programa } = {}) {
    let sql = `
      SELECT a.id_atencion, a.id_beneficiario, a.id_programa,
             a.descripcion, a.fecha_atencion, a.tipo, a.responsable, a.entidad, a.resultado, a.remision,
             b.nombre AS beneficiario_nombre, b.codigo_interno, b.documento,
             p.nombre AS programa_nombre,
             lt.nombre AS linea_nombre
      FROM atencion a
      JOIN beneficiario b ON b.id_beneficiario = a.id_beneficiario
      JOIN programa p ON p.id_programa = a.id_programa
      JOIN linea_trabajo lt ON lt.id_linea = p.id_linea
    `;
    const conditions = [];
    const params = [];

    if (id_beneficiario) {
      params.push(id_beneficiario);
      conditions.push(`a.id_beneficiario = $${params.length}`);
    }
    if (id_programa) {
      params.push(id_programa);
      conditions.push(`a.id_programa = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY a.fecha_atencion DESC';

    const res = await query(sql, params);
    return res.rows;
  }

  /**
   * Busca una atención por ID
   */
  static async findById(id) {
    const res = await query(`
      SELECT a.id_atencion, a.id_beneficiario, a.id_programa,
             a.descripcion, a.fecha_atencion, a.tipo, a.responsable, a.entidad, a.resultado, a.remision,
             b.nombre AS beneficiario_nombre,
             p.nombre AS programa_nombre,
             lt.nombre AS linea_nombre
      FROM atencion a
      JOIN beneficiario b ON b.id_beneficiario = a.id_beneficiario
      JOIN programa p ON p.id_programa = a.id_programa
      JOIN linea_trabajo lt ON lt.id_linea = p.id_linea
      WHERE a.id_atencion = $1
    `, [id]);
    return res.rows[0] || null;
  }

  /**
   * Obtiene atenciones de un beneficiario
   */
  static async findByBeneficiario(id_beneficiario) {
    const res = await query(`
      SELECT a.id_atencion, a.id_beneficiario, a.id_programa,
       a.descripcion, a.fecha_atencion,
       a.tipo, a.responsable, a.entidad, a.resultado, a.remision,
       p.nombre AS programa_nombre,
       lt.nombre AS linea_nombre
      FROM atencion a
      JOIN programa p ON p.id_programa = a.id_programa
      JOIN linea_trabajo lt ON lt.id_linea = p.id_linea
      WHERE a.id_beneficiario = $1
      ORDER BY a.fecha_atencion DESC
    `, [id_beneficiario]);
    return res.rows;
  }

  /**
   * Crea un nuevo registro de atención
   */
  static async create({ id_beneficiario, id_programa, descripcion, fecha_atencion, tipo, responsable, entidad, resultado, remision }) {
    const res = await query(`
      INSERT INTO atencion (
        id_beneficiario, id_programa, descripcion, fecha_atencion,
        tipo, responsable, entidad, resultado, remision
      )
      VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      id_beneficiario, id_programa, descripcion || null, fecha_atencion || null,
      tipo || null, responsable || null, entidad || null, resultado || null, remision || null,
    ]);
    return res.rows[0];
  }

  /**
   * Elimina una atención
   */
  static async delete(id) {
    const res = await query(
      'DELETE FROM atencion WHERE id_atencion = $1 RETURNING id_atencion',
      [id]
    );
    return res.rowCount > 0;
  }

  /**
   * Cuenta total de atenciones
   */
  static async count() {
    const res = await query('SELECT COUNT(*)::int AS total FROM atencion');
    return res.rows[0].total;
  }
}
