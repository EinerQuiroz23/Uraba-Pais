import { ReporteService } from '../services/reporteService.js';

/**
 * Controlador HTTP: Reportes y Métricas
 */
export class ReporteController {
  /** GET /api/reportes/metricas */
  static async getMetricas(req, res) {
    try {
      const metricas = await ReporteService.calcularMetricasConsolidadas();
      return res.json({ success: true, ...metricas });
    } catch (error) {
      console.error('[ReporteController.getMetricas]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /** GET /api/reportes/resumen */
  static async getResumen(req, res) {
    try {
      const resumen = await ReporteService.obtenerResumenGeneral();
      return res.json({ success: true, data: resumen });
    } catch (error) {
      console.error('[ReporteController.getResumen]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
