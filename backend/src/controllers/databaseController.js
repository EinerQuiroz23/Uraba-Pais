import { ReporteService } from '../services/reporteService.js';
import { testConnection } from '../database/db.js';

/**
 * Controlador HTTP: Estado de la Base de Datos
 */
export class DatabaseController {
  /** GET /api/database/status */
  static async getStatus(req, res) {
    try {
      const connected = await testConnection();
      const resumen = await ReporteService.obtenerResumenGeneral();

      return res.json({
        success: true,
        motor: 'PostgreSQL (uraba_pais_db)',
        conexion: connected ? 'Activa' : 'Error',
        estadisticas: resumen
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}
