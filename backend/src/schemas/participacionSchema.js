/**
 * Esquema de Validación: Participaciones (vinculación beneficiario-programa)
 * Adaptado a la tabla participacion(id_beneficiario, id_programa, fecha_vinculacion)
 */
export class ParticipacionSchema {
  /**
   * Valida la solicitud de vinculación
   */
  static validateCreate(data = {}) {
    const errors = [];

    if (!data.id_beneficiario) {
      errors.push('El campo id_beneficiario es obligatorio.');
    }

    if (!data.id_programa) {
      errors.push('El campo id_programa es obligatorio.');
    }

    const sanitized = {
      id_beneficiario: parseInt(data.id_beneficiario),
      id_programa: parseInt(data.id_programa),
      fecha_vinculacion: data.fecha_vinculacion || null,
      estado: ['inscrito', 'en proceso', 'finalizado', 'retirado'].includes(data.estado)
        ? data.estado
        : 'inscrito',
    };

    if (isNaN(sanitized.id_beneficiario)) {
      errors.push('El id_beneficiario debe ser un número válido.');
    }
    if (isNaN(sanitized.id_programa)) {
      errors.push('El id_programa debe ser un número válido.');
    }

    // Validar formato de fecha si se proporciona
    if (sanitized.fecha_vinculacion) {
      const fecha = new Date(sanitized.fecha_vinculacion);
      if (isNaN(fecha.getTime())) {
        errors.push('La fecha_vinculacion no tiene un formato válido (YYYY-MM-DD).');
      }
    }

    return { isValid: errors.length === 0, errors, value: sanitized };
  }
}
