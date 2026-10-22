import { query } from '../database/db.js';

/**
 * Repositorio de Persistencia: Seguimientos
 * Consultas SQL contra la tabla seguimiento.
 */
export class SeguimientoRepository {
  /**
   * Obtiene todos los seguimientos con datos del beneficiario
   */
  static async findAll({ id_beneficiario, accion_pendiente } = {}) {
    let sql = `
      SELECT s.id_seguimiento, s.id_beneficiario, s.fecha_seguimiento,
            s.observacion, s.avance, s.accion_pendiente_detalle, s.proximo_contacto, s.accion_pendiente,
            b.nombre AS beneficiario_nombre, b.codigo_interno, b.documento
      FROM seguimiento s
      JOIN beneficiario b ON b.id_beneficiario = s.id_beneficiario
    `;
    const conditions = [];
    const params = [];

    if (id_beneficiario) {
      params.push(id_beneficiario);
      conditions.push(`s.id_beneficiario = $${params.length}`);
    }
    if (accion_pendiente !== undefined && accion_pendiente !== null) {
      params.push(accion_pendiente);
      conditions.push(`s.accion_pendiente = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY s.fecha_seguimiento DESC';

    const res = await query(sql, params);
    return res.rows;
  }

  /**
   * Busca un seguimiento por ID
   */
  static async findById(id) {
    const res = await query(`
      SELECT s.id_seguimiento, s.id_beneficiario, s.fecha_seguimiento,
             s.observacion, s.avance, s.accion_pendiente_detalle, s.proximo_contacto, s.accion_pendiente,
             b.nombre AS beneficiario_nombre
      FROM seguimiento s
      JOIN beneficiario b ON b.id_beneficiario = s.id_beneficiario
      WHERE s.id_seguimiento = $1
    `, [id]);
    return res.rows[0] || null;
  }

  /**
   * Obtiene seguimientos de un beneficiario
   */
  static async findByBeneficiario(id_beneficiario) {
    const res = await query(`
      SELECT s.id_seguimiento, s.id_beneficiario, s.fecha_seguimiento,
             s.observacion, s.avance, s.accion_pendiente_detalle, s.proximo_contacto, s.accion_pendiente
      FROM seguimiento s
      WHERE s.id_beneficiario = $1
      ORDER BY s.fecha_seguimiento DESC
    `, [id_beneficiario]);
    return res.rows;
  }

  /**
   * Crea un nuevo registro de seguimiento
   */
  static async create({ id_beneficiario, fecha_seguimiento, observacion, avance, accion_pendiente_detalle, proximo_contacto, accion_pendiente }) {
    const res = await query(`
      INSERT INTO seguimiento (
        id_beneficiario, fecha_seguimiento, observacion, avance,
        accion_pendiente_detalle, proximo_contacto, accion_pendiente
      )
      VALUES ($1, COALESCE($2, CURRENT_DATE), $3, $4, $5, $6, COALESCE($7, FALSE))
      RETURNING *
    `, [
      id_beneficiario, fecha_seguimiento || null, observacion || null, avance || null,
      accion_pendiente_detalle || null, proximo_contacto || null, accion_pendiente ?? false,
    ]);
    return res.rows[0];
  }

  /**
   * Actualiza un seguimiento
   */
  static async update(id, { observacion, accion_pendiente }) {
    const fields = [];
    const params = [];
    let idx = 1;

    if (observacion !== undefined) { fields.push(`observacion = $${idx++}`); params.push(observacion); }
    if (accion_pendiente !== undefined) { fields.push(`accion_pendiente = $${idx++}`); params.push(accion_pendiente); }

    if (fields.length === 0) return null;

    params.push(id);
    const res = await query(
      `UPDATE seguimiento SET ${fields.join(', ')} WHERE id_seguimiento = $${idx} RETURNING *`,
      params
    );
    return res.rows[0] || null;
  }

  /**
   * Alterna el estado de acción pendiente
   */
  static async togglePendiente(id) {
    const res = await query(`
      UPDATE seguimiento SET accion_pendiente = NOT accion_pendiente
      WHERE id_seguimiento = $1
      RETURNING id_seguimiento, id_beneficiario, fecha_seguimiento, observacion, accion_pendiente
    `, [id]);
    return res.rows[0] || null;
  }

  /**
   * Elimina un seguimiento
   */
  static async delete(id) {
    const res = await query(
      'DELETE FROM seguimiento WHERE id_seguimiento = $1 RETURNING id_seguimiento',
      [id]
    );
    return res.rowCount > 0;
  }

  /**
   * Cuenta seguimientos con acciones pendientes
   */
  static async countPendientes() {
    const res = await query('SELECT COUNT(*)::int AS total FROM seguimiento WHERE accion_pendiente = TRUE');
    return res.rows[0].total;
  }

  /**
   * Cuenta total de seguimientos
   */
  static async count() {
    const res = await query('SELECT COUNT(*)::int AS total FROM seguimiento');
    return res.rows[0].total;
  }
}
