import { query } from "../database/db.js";

export class NotificacionRepository {
  /** Lista notificaciones activas (no resueltas) de un funcionario */
  static async findByUsuario(
    id_usuario,
    { soloNoLeidas = false, limit = 50 } = {},
  ) {
    const params = [id_usuario];
    let sql = `
      SELECT n.*,
             b.nombre AS beneficiario_nombre,
             b.codigo_interno
      FROM notificacion n
      LEFT JOIN beneficiario b ON b.id_beneficiario = n.id_beneficiario
      WHERE (n.id_usuario = $1 OR n.id_usuario IS NULL)
        AND (n.resuelta IS NULL OR n.resuelta = FALSE)
    `;
    if (soloNoLeidas) {
      sql += ` AND n.leida = FALSE`;
    }
    sql += ` ORDER BY n.fecha_creacion DESC, n.leida ASC LIMIT $${params.length + 1}`;
    params.push(limit);

    const res = await query(sql, params);
    return res.rows;
  }

  /** Historial: notificaciones ya resueltas/eliminadas */
  static async findHistorial(id_usuario, { limit = 50 } = {}) {
    const res = await query(
      `SELECT n.*,
              b.nombre AS beneficiario_nombre,
              b.codigo_interno
       FROM notificacion n
       LEFT JOIN beneficiario b ON b.id_beneficiario = n.id_beneficiario
       WHERE (n.id_usuario = $1 OR n.id_usuario IS NULL)
         AND n.resuelta = TRUE
       ORDER BY COALESCE(n.fecha_leida, n.fecha_creacion) DESC
       LIMIT $2`,
      [id_usuario, limit],
    );
    return res.rows;
  }

  static async countNoLeidas(id_usuario) {
    const res = await query(
      `SELECT COUNT(*)::int AS total
       FROM notificacion
       WHERE (id_usuario = $1 OR id_usuario IS NULL)
         AND leida = FALSE
         AND (resuelta IS NULL OR resuelta = FALSE)`,
      [id_usuario],
    );
    return res.rows[0]?.total ?? 0;
  }

  static async create({
    id_usuario = null,
    id_beneficiario = null,
    tipo,
    titulo,
    mensaje,
    prioridad = "media",
    enlace = null,
    metadata = null,
  }) {
    const res = await query(
      `INSERT INTO notificacion
         (id_usuario, id_beneficiario, tipo, titulo, mensaje, prioridad, enlace, metadata, leida, resuelta)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, FALSE)
       RETURNING *`,
      [
        id_usuario,
        id_beneficiario,
        tipo,
        titulo,
        mensaje,
        prioridad,
        enlace,
        metadata ? JSON.stringify(metadata) : null,
      ],
    );
    return res.rows[0];
  }

  static async marcarLeida(id_notificacion, id_usuario) {
    const res = await query(
      `UPDATE notificacion
       SET leida = TRUE, fecha_leida = NOW()
       WHERE id_notificacion = $1
         AND (id_usuario = $2 OR id_usuario IS NULL)
       RETURNING *`,
      [id_notificacion, id_usuario],
    );
    return res.rows[0] || null;
  }

  static async marcarTodasLeidas(id_usuario) {
    const res = await query(
      `UPDATE notificacion
       SET leida = TRUE, fecha_leida = NOW()
       WHERE (id_usuario = $1 OR id_usuario IS NULL)
         AND leida = FALSE
         AND (resuelta IS NULL OR resuelta = FALSE)
       RETURNING id_notificacion`,
      [id_usuario],
    );
    return res.rowCount;
  }

  /**
   * ¿Ya existe una notificación ABIERTA (no resuelta) de este tipo para el beneficiario?
   */
  static async existeAbierta(tipo, id_beneficiario) {
    const res = await query(
      `SELECT id_notificacion FROM notificacion
       WHERE tipo = $1
         AND id_beneficiario = $2
         AND (resuelta IS NULL OR resuelta = FALSE)
       LIMIT 1`,
      [tipo, id_beneficiario],
    );
    return res.rows[0] || null;
  }

  /**
   * Marca como resueltas las notificaciones de un tipo cuyas condiciones ya no aplican.
   */
  static async resolverObsoletas(tipo, idsBeneficiariosActivos = []) {
    if (idsBeneficiariosActivos.length === 0) {
      const res = await query(
        `UPDATE notificacion
         SET resuelta = TRUE, leida = TRUE, fecha_leida = COALESCE(fecha_leida, NOW())
         WHERE tipo = $1
           AND (resuelta IS NULL OR resuelta = FALSE)
         RETURNING id_notificacion`,
        [tipo],
      );
      return res.rowCount;
    }

    const res = await query(
      `UPDATE notificacion
       SET resuelta = TRUE, leida = TRUE, fecha_leida = COALESCE(fecha_leida, NOW())
       WHERE tipo = $1
         AND (resuelta IS NULL OR resuelta = FALSE)
         AND id_beneficiario IS NOT NULL
         AND NOT (id_beneficiario = ANY($2::int[]))
       RETURNING id_notificacion`,
      [tipo, idsBeneficiariosActivos],
    );
    return res.rowCount;
  }

  /** Reactiva (des-resuelve) si por algún motivo existía resuelta y el problema volvió */
  static async reabrirSiExiste(id_notificacion) {
    const res = await query(
      `UPDATE notificacion
       SET resuelta = FALSE, leida = FALSE, fecha_leida = NULL, fecha_creacion = NOW()
       WHERE id_notificacion = $1
       RETURNING *`,
      [id_notificacion],
    );
    return res.rows[0] || null;
  }

  /** Elimina (marca resuelta) una notificación concreta del usuario */
  static async eliminar(id_notificacion, id_usuario) {
    const res = await query(
      `UPDATE notificacion
       SET resuelta = TRUE, leida = TRUE, fecha_leida = COALESCE(fecha_leida, NOW())
       WHERE id_notificacion = $1
         AND (id_usuario = $2 OR id_usuario IS NULL)
         AND (resuelta IS NULL OR resuelta = FALSE)
       RETURNING *`,
      [id_notificacion, id_usuario],
    );
    return res.rows[0] || null;
  }

  /** Elimina (marca resueltas) TODAS las notificaciones visibles del usuario */
  static async eliminarTodas(id_usuario) {
    const res = await query(
      `UPDATE notificacion
       SET resuelta = TRUE, leida = TRUE, fecha_leida = COALESCE(fecha_leida, NOW())
       WHERE (id_usuario = $1 OR id_usuario IS NULL)
         AND (resuelta IS NULL OR resuelta = FALSE)
       RETURNING id_notificacion`,
      [id_usuario],
    );
    return res.rowCount;
  }

  /**
   * Resuelve notificaciones abiertas de tipos de vinculación para un beneficiario
   * (cuando cambia de estado, las anteriores del mismo beneficiario se cierran)
   */
  static async resolverTiposVinculacion(id_beneficiario, tipos = []) {
    if (!tipos.length) return 0;
    const res = await query(
      `UPDATE notificacion
       SET resuelta = TRUE, leida = TRUE, fecha_leida = COALESCE(fecha_leida, NOW())
       WHERE id_beneficiario = $1
         AND tipo = ANY($2::text[])
         AND (resuelta IS NULL OR resuelta = FALSE)
       RETURNING id_notificacion`,
      [id_beneficiario, tipos],
    );
    return res.rowCount;
  }
}
