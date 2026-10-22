/**
 * Esquema de Validación: Seguimientos
 * Adaptado a la tabla seguimiento(id_beneficiario, fecha_seguimiento, observacion, accion_pendiente)
 */
export class SeguimientoSchema {
  /**
   * Valida el registro de un nuevo seguimiento
   */
  static validateCreate(data = {}) {
    const errors = [];

    if (!data.id_beneficiario) {
      errors.push('El campo id_beneficiario es obligatorio.');
    }

    const detalle = data.accion_pendiente_detalle
      ? String(data.accion_pendiente_detalle).trim()
      : '';

    const sanitized = {
      id_beneficiario: parseInt(data.id_beneficiario),
      fecha_seguimiento: data.fecha_seguimiento || null,
      observacion: data.observacion ? String(data.observacion).trim() : null,
      avance: data.avance ? String(data.avance).trim() : null,
      accion_pendiente_detalle: detalle || null,
      proximo_contacto: data.proximo_contacto || null,
      accion_pendiente: Boolean(detalle),
    };

    if (isNaN(sanitized.id_beneficiario)) {
      errors.push('El id_beneficiario debe ser un número válido.');
    }

    return { isValid: errors.length === 0, errors, value: sanitized };
  }

  /**
   * Valida datos de actualización
   */
  static validateUpdate(data = {}) {
    const errors = [];
    const sanitized = {};

    if (data.observacion !== undefined) {
      sanitized.observacion = data.observacion ? String(data.observacion).trim() : null;
    }

    if (data.accion_pendiente !== undefined) {
      sanitized.accion_pendiente = data.accion_pendiente === true || data.accion_pendiente === 'true';
    }

    return { isValid: errors.length === 0, errors, value: sanitized };
  }
}
