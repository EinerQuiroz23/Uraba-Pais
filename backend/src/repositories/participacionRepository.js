import { query } from '../database/db.js';

/**
 * Repositorio de Persistencia: Participaciones
 * Consultas SQL contra la tabla participacion (antes "vinculaciones").
 * Gestiona la relación muchos-a-muchos entre beneficiario y programa.
 */
export class ParticipacionRepository {
  /**
   * Obtiene todas las participaciones con datos de beneficiario y programa
   */
  static async findAll() {
    const res = await query(`
      SELECT pa.id_participacion, pa.id_beneficiario, pa.id_programa,
             pa.fecha_vinculacion, pa.estado, b.nombre AS beneficiario_nombre,
             b.documento, b.sexo, p.nombre AS programa_nombre,
             lt.nombre AS linea_nombre
      FROM participacion pa
      JOIN beneficiario b ON b.id_beneficiario = pa.id_beneficiario
      JOIN programa p ON p.id_programa = pa.id_programa
      JOIN linea_trabajo lt ON lt.id_linea = p.id_linea
      ORDER BY pa.fecha_vinculacion DESC
    `);
    return res.rows;
  }

  /**
   * Busca una participación por ID
   */
  static async findById(id) {
    const res = await query(`
      SELECT pa.id_participacion, pa.id_beneficiario, pa.id_programa,
             pa.fecha_vinculacion,
             b.nombre AS beneficiario_nombre,
             p.nombre AS programa_nombre,
             lt.nombre AS linea_nombre
      FROM participacion pa
      JOIN beneficiario b ON b.id_beneficiario = pa.id_beneficiario
      JOIN programa p ON p.id_programa = pa.id_programa
      JOIN linea_trabajo lt ON lt.id_linea = p.id_linea
      WHERE pa.id_participacion = $1
    `, [id]);
    return res.rows[0] || null;
  }

  /**
   * Obtiene las participaciones de un beneficiario
   */
  static async findByBeneficiario(id_beneficiario) {
    const res = await query(`
      SELECT pa.id_participacion, pa.id_beneficiario, pa.id_programa,
             pa.fecha_vinculacion,
             p.nombre AS programa_nombre,
             lt.nombre AS linea_nombre
      FROM participacion pa
      JOIN programa p ON p.id_programa = pa.id_programa
      JOIN linea_trabajo lt ON lt.id_linea = p.id_linea
      WHERE pa.id_beneficiario = $1
      ORDER BY pa.fecha_vinculacion DESC
    `, [id_beneficiario]);
    return res.rows;
  }

  /**
   * Obtiene las participaciones de un programa
   */
  static async findByPrograma(id_programa) {
    const res = await query(`
      SELECT pa.id_participacion, pa.id_beneficiario, pa.id_programa,
             pa.fecha_vinculacion,  
             b.nombre AS beneficiario_nombre, b.documento
      FROM participacion pa
      JOIN beneficiario b ON b.id_beneficiario = pa.id_beneficiario
      WHERE pa.id_programa = $1
      ORDER BY pa.fecha_vinculacion DESC
    `, [id_programa]);
    return res.rows;
  }

  /**
   * Crea una nueva participación
   */
  static async create({ id_beneficiario, id_programa, fecha_vinculacion, estado }) {
    const res = await query(`
      INSERT INTO participacion (id_beneficiario, id_programa, fecha_vinculacion, estado)
      VALUES ($1, $2, COALESCE($3, CURRENT_DATE), COALESCE($4, 'inscrito'))
      RETURNING *
    `, [id_beneficiario, id_programa, fecha_vinculacion || null, estado || 'inscrito']);
    return res.rows[0];
  }

  /**
   * Actualiza el estado de una participación
   */
  static async updateEstado(id, estado) {
    const res = await query(`
      UPDATE participacion SET estado = $2
      WHERE id_participacion = $1
      RETURNING *
    `, [id, estado]);
    return res.rows[0] || null;
  }

  /**
   * Elimina una participación
   */
  static async delete(id) {
    const res = await query(
      'DELETE FROM participacion WHERE id_participacion = $1 RETURNING id_participacion',
      [id]
    );
    return res.rowCount > 0;
  }

  /**
   * Cuenta total de participaciones
   */
  static async count() {
    const res = await query('SELECT COUNT(*)::int AS total FROM participacion');
    return res.rows[0].total;
  }
}
