import { ReporteRepository } from '../repositories/reporteRepository.js';

/**
 * Servicio de Negocio: Reportes, Analítica y Métricas
 * Calcula indicadores clave del sistema URABÁ-PAÍS.
 */
export class ReporteService {
  /**
   * Genera el consolidado de métricas e indicadores
   */
  static async calcularMetricasConsolidadas() {
    const [
      beneficiariosUnicos,
      totalParticipaciones,
      totalAtenciones,
      seguimientosPendientes,
      porMunicipio,
      porPrograma,
      porLinea
    ] = await Promise.all([
      ReporteRepository.getBeneficiariosUnicos(),
      ReporteRepository.getTotalParticipaciones(),
      ReporteRepository.getTotalAtenciones(),
      ReporteRepository.getSeguimientosPendientes(),
      ReporteRepository.getBeneficiariosPorMunicipio(),
      ReporteRepository.getBeneficiariosPorPrograma(),
      ReporteRepository.getProgramasPorLinea()
    ]);

    return {
      indicadores_clave: {
        beneficiarios_unicos: beneficiariosUnicos,
        participaciones_totales: totalParticipaciones,
        atenciones_totales: totalAtenciones,
        seguimientos_pendientes: seguimientosPendientes
      },
      distribucion: {
        por_municipio: porMunicipio,
        por_programa: porPrograma,
        por_linea_trabajo: porLinea
      }
    };
  }

  /**
   * Obtiene el resumen general de la base de datos
   */
  static async obtenerResumenGeneral() {
    return await ReporteRepository.getResumenGeneral();
  }
}
