import { SeguimientoRepository } from "../repositories/seguimientoRepository.js";
import { BeneficiarioRepository } from "../repositories/beneficiarioRepository.js";
import { NotificacionService } from "./notificacionService.js";

/**
 * Servicio de Negocio: Seguimientos y Monitoreo
 */
export class SeguimientoService {
  /**
   * Lista seguimientos con filtros opcionales
   */
  static async listarSeguimientos({ id_beneficiario, accion_pendiente } = {}) {
    return await SeguimientoRepository.findAll({
      id_beneficiario,
      accion_pendiente,
    });
  }

  /**
   * Registra un nuevo seguimiento
   */
  static async registrarSeguimiento({
    id_beneficiario,
    fecha_seguimiento,
    observacion,
    avance,
    accion_pendiente_detalle,
    proximo_contacto,
    accion_pendiente,
  }) {
    const beneficiario = await BeneficiarioRepository.findById(id_beneficiario);
    if (!beneficiario) {
      const err = new Error("Beneficiario no encontrado.");
      err.status = 404;
      throw err;
    }

    return await SeguimientoRepository.create({
      id_beneficiario,
      fecha_seguimiento,
      observacion,
      avance,
      accion_pendiente_detalle,
      proximo_contacto,
      accion_pendiente,
    });
  }

  /**
   * Alterna el estado de acción pendiente (true ↔ false).
   * Si pasa a completado (false), genera notificación para la campanita.
   */
  static async alternarEstado(id) {
    // Guardar estado anterior para saber si pasó a completado
    const antes = await SeguimientoRepository.findById(id);
    if (!antes) {
      const err = new Error("Seguimiento no encontrado.");
      err.status = 404;
      throw err;
    }

    const resultado = await SeguimientoRepository.togglePendiente(id);
    if (!resultado) {
      const err = new Error("Seguimiento no encontrado.");
      err.status = 404;
      throw err;
    }

    // Si antes estaba pendiente (true) y ahora está completado (false) → notificar
    const pasoACompletado =
      antes.accion_pendiente === true && resultado.accion_pendiente === false;

    if (pasoACompletado) {
      try {
        const beneficiario = await BeneficiarioRepository.findById(
          resultado.id_beneficiario,
        );
        await NotificacionService.notificarAccionCompletada({
          id_beneficiario: resultado.id_beneficiario,
          id_seguimiento: resultado.id_seguimiento,
          nombreBeneficiario: beneficiario?.nombre || antes.beneficiario_nombre,
          codigoInterno: beneficiario?.codigo_interno || null,
          detalle:
            antes.accion_pendiente_detalle ||
            antes.observacion ||
            "Acción de seguimiento marcada como completada.",
        });
      } catch (err) {
        // No romper el toggle si falla la notificación
        console.error(
          "[SeguimientoService.alternarEstado] notif:",
          err.message,
        );
      }
    }

    return resultado;
  }

  /**
   * Actualiza un seguimiento
   */
  static async actualizar(id, updateData) {
    return await SeguimientoRepository.update(id, updateData);
  }

  /**
   * Elimina un seguimiento
   */
  static async eliminar(id) {
    return await SeguimientoRepository.delete(id);
  }
}
