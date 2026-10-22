/**
 * Esquema de Validación: Atenciones
 * Adaptado a la tabla atencion(id_beneficiario, id_programa, descripcion, fecha_atencion)
 */
export class AtencionSchema {
  /**
   * Valida el registro de una nueva atención
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
      descripcion: data.descripcion ? String(data.descripcion).trim() : null,
      fecha_atencion: data.fecha_atencion || null,
      tipo: data.tipo ? String(data.tipo).trim() : null,
      responsable: data.responsable ? String(data.responsable).trim() : null,
      entidad: data.entidad ? String(data.entidad).trim() : null,
      resultado: data.resultado ? String(data.resultado).trim() : null,
      remision: data.remision ? String(data.remision).trim() : null,
    };

    if (isNaN(sanitized.id_beneficiario)) {
      errors.push('El id_beneficiario debe ser un número válido.');
    }
    if (isNaN(sanitized.id_programa)) {
      errors.push('El id_programa debe ser un número válido.');
    }

    return { isValid: errors.length === 0, errors, value: sanitized };
  }
}
