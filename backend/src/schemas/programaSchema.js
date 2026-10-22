/**
 * Esquema de Validación: Programas
 * Adaptado a la tabla programa(nombre, id_linea)
 */
export class ProgramaSchema {
  /**
   * Valida la creación de un programa
   */
  static validateCreate(data = {}) {
    const errors = [];

    if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim() === '') {
      errors.push('El nombre del programa es obligatorio.');
    }

    if (!data.id_linea) {
      errors.push('El campo id_linea es obligatorio.');
    }

    const sanitized = {
      nombre: (data.nombre || '').trim(),
      id_linea: parseInt(data.id_linea)
    };

    if (isNaN(sanitized.id_linea)) {
      errors.push('El id_linea debe ser un número válido.');
    }

    return { isValid: errors.length === 0, errors, value: sanitized };
  }
}
