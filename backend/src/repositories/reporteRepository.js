import { query } from '../database/db.js';

/**
 * Repositorio de Persistencia: Reportes e Indicadores
 * Consultas SQL optimizadas para generar métricas y KPIs del sistema URABÁ-PAÍS.
 */
export class ReporteRepository {
  /**
   * Beneficiarios únicos registrados
   */
  static async getBeneficiariosUnicos() {
    const res = await query('SELECT COUNT(*)::int AS total FROM beneficiario');
    return res.rows[0].total;
  }

  /**
   * Total de participaciones (vinculaciones beneficiario-programa)
   */
  static async getTotalParticipaciones() {
    const res = await query('SELECT COUNT(*)::int AS total FROM participacion');
    return res.rows[0].total;
  }

  /**
   * Total de atenciones o ayudas entregadas
   */
  static async getTotalAtenciones() {
    const res = await query('SELECT COUNT(*)::int AS total FROM atencion');
    return res.rows[0].total;
  }

  /**
   * Seguimientos con acciones pendientes
   */
  static async getSeguimientosPendientes() {
    const res = await query('SELECT COUNT(*)::int AS total FROM seguimiento WHERE accion_pendiente = TRUE');
    return res.rows[0].total;
  }

  /**
   * Cantidad de beneficiarios por municipio
   */
  static async getBeneficiariosPorMunicipio() {
    const res = await query(`
      SELECT m.nombre AS municipio, COUNT(b.id_beneficiario)::int AS total
      FROM municipio m
      LEFT JOIN beneficiario b ON b.id_municipio = m.id_municipio
      GROUP BY m.id_municipio, m.nombre
      ORDER BY total DESC
    `);
    return res.rows;
  }

  /**
   * Cantidad de beneficiarios vinculados a cada programa
   */
  static async getBeneficiariosPorPrograma() {
    const res = await query(`
      SELECT p.id_programa, p.nombre AS programa,
            lt.nombre AS linea_trabajo,
            COUNT(pa.id_participacion)::int AS total_beneficiarios,
            COUNT(*) FILTER (WHERE pa.estado = 'inscrito')::int AS inscritos,
            COUNT(*) FILTER (WHERE pa.estado = 'en proceso')::int AS en_proceso,
            COUNT(*) FILTER (WHERE pa.estado = 'finalizado')::int AS finalizados
      FROM programa p
      JOIN linea_trabajo lt ON lt.id_linea = p.id_linea
      LEFT JOIN participacion pa ON pa.id_programa = p.id_programa
      GROUP BY p.id_programa, p.nombre, lt.nombre
      ORDER BY total_beneficiarios DESC
    `);
    return res.rows;
  }

  /**
   * Programas agrupados por línea de trabajo
   */
  static async getProgramasPorLinea() {
    const res = await query(`
      SELECT 
        lt.id_linea,
        lt.nombre AS linea_trabajo,
        COALESCE(json_agg(
          json_build_object(
            'id_programa', p.id_programa,
            'nombre', p.nombre,
            'total_participaciones', (
              SELECT COUNT(*)::int FROM participacion pa WHERE pa.id_programa = p.id_programa
            ),
            'total_atenciones', (
              SELECT COUNT(*)::int FROM atencion a WHERE a.id_programa = p.id_programa
            )
          )
        ) FILTER (WHERE p.id_programa IS NOT NULL), '[]') AS programas
      FROM linea_trabajo lt
      LEFT JOIN programa p ON p.id_linea = lt.id_linea
      GROUP BY lt.id_linea, lt.nombre
      ORDER BY lt.id_linea
    `);
    return res.rows;
  }

  /**
   * Resumen consolidado de estadísticas de la base de datos
   */
  static async getResumenGeneral() {
    const res = await query(`
      SELECT
        (SELECT COUNT(*)::int FROM beneficiario) AS total_beneficiarios,
        (SELECT COUNT(*)::int FROM municipio) AS total_municipios,
        (SELECT COUNT(*)::int FROM programa) AS total_programas,
        (SELECT COUNT(*)::int FROM linea_trabajo) AS total_lineas,
        (SELECT COUNT(*)::int FROM participacion) AS total_participaciones,
        (SELECT COUNT(*)::int FROM atencion) AS total_atenciones,
        (SELECT COUNT(*)::int FROM seguimiento) AS total_seguimientos,
        (SELECT COUNT(*)::int FROM seguimiento WHERE accion_pendiente = TRUE) AS seguimientos_pendientes
    `);
    return res.rows[0];
  }
}
