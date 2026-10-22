import { ProgramaRepository } from "../repositories/programaRepository.js";
import { ParticipacionRepository } from "../repositories/participacionRepository.js";
import { BeneficiarioRepository } from "../repositories/beneficiarioRepository.js";
import { NotificacionService } from "./notificacionService.js";
import { query } from "../database/db.js";

/**
 * Servicio de Negocio: Programas y Participaciones
 */
export class ProgramaService {
  /**
   * Obtiene la lista completa de programas
   */
  static async obtenerProgramas() {
    return await ProgramaRepository.findAll();
  }

  /**
   * Obtiene un programa por ID
   */
  static async obtenerProgramaPorId(id) {
    return await ProgramaRepository.findById(id);
  }

  /**
   * Obtiene programas por línea de trabajo
   */
  static async obtenerProgramasPorLinea(id_linea) {
    return await ProgramaRepository.findByLinea(id_linea);
  }

  /**
   * Lista participaciones con filtros
   */
  static async listarParticipaciones() {
    return await ParticipacionRepository.findAll();
  }

  /**
   * Actualiza el estado de una participación y genera notificación con color.
   * inscrito=amarillo, en proceso=azul, finalizado=verde, retirado=rojo
   */
  static async actualizarEstado(id, estado) {
    const fila = await ParticipacionRepository.updateEstado(id, estado);
    if (!fila) return null;

    // Datos extra para el mensaje de la notificación
    try {
      const extra = await query(
        `SELECT b.nombre, b.codigo_interno, p.nombre AS programa_nombre
         FROM participacion pa
         JOIN beneficiario b ON b.id_beneficiario = pa.id_beneficiario
         JOIN programa p ON p.id_programa = pa.id_programa
         WHERE pa.id_participacion = $1`,
        [id],
      );
      const row = extra.rows[0];
      if (row) {
        await NotificacionService.notificarCambioEstadoVinculacion({
          id_beneficiario: fila.id_beneficiario,
          id_participacion: fila.id_participacion,
          estado: fila.estado || estado,
          nombreBeneficiario: row.nombre,
          codigoInterno: row.codigo_interno,
          nombrePrograma: row.programa_nombre,
        });
      }
    } catch (err) {
      // No romper el cambio de estado si falla la notificación
      console.error("[ProgramaService.actualizarEstado] notif:", err.message);
    }

    return fila;
  }

  /**
   * Vincula un beneficiario a un programa (crea participación)
   * y notifica el estado inicial (por defecto "inscrito").
   */
  static async vincularBeneficiario({
    id_beneficiario,
    id_programa,
    fecha_vinculacion,
    estado,
  }) {
    // Verificar que el programa existe
    const programa = await ProgramaRepository.findById(id_programa);
    if (!programa) {
      const err = new Error("Programa no encontrado.");
      err.status = 404;
      throw err;
    }

    // Verificar que el beneficiario existe
    const beneficiario = await BeneficiarioRepository.findById(id_beneficiario);
    if (!beneficiario) {
      const err = new Error("Beneficiario no encontrado.");
      err.status = 404;
      throw err;
    }

    try {
      const participacion = await ParticipacionRepository.create({
        id_beneficiario,
        id_programa,
        fecha_vinculacion,
        estado,
      });

      // Notificar el estado de vinculación (inscrito por defecto)
      try {
        await NotificacionService.notificarCambioEstadoVinculacion({
          id_beneficiario,
          id_participacion: participacion.id_participacion,
          estado: participacion.estado || estado || "inscrito",
          nombreBeneficiario: beneficiario.nombre,
          codigoInterno: beneficiario.codigo_interno,
          nombrePrograma: programa.nombre,
        });
      } catch (err) {
        console.error(
          "[ProgramaService.vincularBeneficiario] notif:",
          err.message,
        );
      }

      return participacion;
    } catch (err) {
      // Violación de UNIQUE (id_beneficiario, id_programa)
      if (err.code === "23505") {
        const error = new Error(
          "El beneficiario ya está vinculado a este programa.",
        );
        error.status = 409;
        throw error;
      }
      throw err;
    }
  }

  /**
   * Obtiene participaciones de un beneficiario
   */
  static async obtenerParticipacionesBeneficiario(id_beneficiario) {
    return await ParticipacionRepository.findByBeneficiario(id_beneficiario);
  }

  /**
   * Elimina una participación
   */
  static async eliminarParticipacion(id) {
    return await ParticipacionRepository.delete(id);
  }
}
