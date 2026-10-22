/**
 * Esquema de Validación: Beneficiario
 * Acepta tanto el formato simple (nombre, documento, id_municipio)
 * como el del frontend (nombres, apellidos, numero_documento, municipio)
 */
export class BeneficiarioSchema {
  /**
   * Calcula edad exacta a partir de YYYY-MM-DD
   */
  static calcularEdadDesdeFecha(fechaStr) {
    if (!fechaStr) return null;
    const s = String(fechaStr).trim().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    const [y, m, d] = s.split("-").map(Number);
    const hoy = new Date();
    let edad = hoy.getFullYear() - y;
    const mes = hoy.getMonth() + 1;
    const dia = hoy.getDate();
    if (mes < m || (mes === m && dia < d)) edad -= 1;
    if (edad < 0 || edad > 150) return null;
    return edad;
  }

  /**
   * Normaliza el body del frontend o del API simple
   */
  static normalize(data = {}) {
    // nombre completo: prioriza "nombre", si no arma con nombres + apellidos
    let nombre = (data.nombre || "").toString().trim();
    if (!nombre) {
      const nombres = (data.nombres || "").toString().trim();
      const apellidos = (data.apellidos || "").toString().trim();
      nombre = `${nombres} ${apellidos}`.trim();
    }

    // documento: prioriza "documento", si no usa numero_documento
    const documentoRaw =
      data.documento !== undefined && data.documento !== null
        ? data.documento
        : data.numero_documento;
    const documento =
      documentoRaw !== undefined &&
      documentoRaw !== null &&
      String(documentoRaw).trim() !== ""
        ? String(documentoRaw).trim()
        : null;

    const telefono =
      data.telefono !== undefined &&
      data.telefono !== null &&
      String(data.telefono).trim() !== ""
        ? String(data.telefono).trim()
        : null;

    // municipio: puede venir como id_municipio o como nombre (Apartadó, Turbo, etc.)
    let id_municipio = data.id_municipio;
    const municipio_nombre =
      data.municipio || data.municipio_nombre || data.nombre_municipio || null;

    return {
      nombre,
      documento,
      telefono,
      id_municipio:
        id_municipio !== undefined && id_municipio !== null
          ? id_municipio
          : null,
      municipio_nombre: municipio_nombre
        ? String(municipio_nombre).trim()
        : null,
      // extras del frontend
      tipo_documento: data.tipo_documento || null,
      genero: data.genero || data.sexo || null,
      sexo: data.sexo || data.genero || null,
      condicion_poblacional: data.condicion_poblacional || null,
      direccion_comunidad: data.direccion_comunidad || null,
      zona: data.zona || null,
      discapacidad: data.discapacidad || null,
      fecha_nacimiento: data.fecha_nacimiento || null,
      edad: data.edad ?? null,
      nacionalidad: data.nacionalidad || null,
      autorizacion_datos: data.autorizacion_datos,
      familiares: Array.isArray(data.familiares) ? data.familiares : [],
      nombres: data.nombres,
      apellidos: data.apellidos,
    };
  }

  static validateCreate(data = {}) {
    const errors = [];
    const n = this.normalize(data);

    if (!n.nombre) {
      errors.push("El nombre del beneficiario es obligatorio.");
    }

    // Debe venir id_municipio O nombre de municipio
    if (
      (n.id_municipio === null ||
        n.id_municipio === undefined ||
        n.id_municipio === "") &&
      !n.municipio_nombre
    ) {
      errors.push("El municipio es obligatorio (id_municipio o municipio).");
    }

    let idNum = null;
    if (
      n.id_municipio !== null &&
      n.id_municipio !== undefined &&
      n.id_municipio !== ""
    ) {
      idNum = parseInt(n.id_municipio, 10);
      if (isNaN(idNum)) {
        errors.push("El id_municipio debe ser un número válido.");
      }
    }

    // Edad: preferir cálculo desde fecha de nacimiento
    let edadCalc = null;
    if (n.fecha_nacimiento) {
      edadCalc = this.calcularEdadDesdeFecha(n.fecha_nacimiento);
    }
    if (edadCalc == null && n.edad != null && n.edad !== "") {
      const num = Number(n.edad);
      if (!Number.isNaN(num) && num >= 0 && num <= 150) {
        edadCalc = num;
      }
    }

    if (edadCalc == null) {
      errors.push(
        "La fecha de nacimiento es obligatoria para calcular la edad del beneficiario.",
      );
    }

    const sanitized = {
      nombre: n.nombre,
      documento: n.documento,
      telefono: n.telefono,
      id_municipio: idNum,
      municipio_nombre: n.municipio_nombre,
      tipo_documento: n.tipo_documento,
      genero: n.genero,
      sexo: n.sexo || n.genero,
      condicion_poblacional: n.condicion_poblacional,
      direccion_comunidad: n.direccion_comunidad,
      zona: n.zona || n.direccion_comunidad || null,
      discapacidad: n.discapacidad,
      fecha_nacimiento: n.fecha_nacimiento,
      edad: edadCalc,
      nacionalidad: n.nacionalidad,
      autorizacion_datos: n.autorizacion_datos,
      familiares: n.familiares,
    };

    return { isValid: errors.length === 0, errors, value: sanitized };
  }

  static validateUpdate(data = {}) {
    const errors = [];
    const n = this.normalize(data);
    const sanitized = {};

    if (
      data.nombre !== undefined ||
      data.nombres !== undefined ||
      data.apellidos !== undefined
    ) {
      if (!n.nombre) {
        errors.push("El nombre no puede estar vacío.");
      } else {
        sanitized.nombre = n.nombre;
      }
    }

    // Permitir nombres/apellidos sueltos para armar el nombre en el service
    if (data.nombres !== undefined) sanitized.nombres = data.nombres;
    if (data.apellidos !== undefined) sanitized.apellidos = data.apellidos;

    if (data.documento !== undefined || data.numero_documento !== undefined) {
      sanitized.documento = n.documento;
      sanitized.numero_documento =
        data.numero_documento !== undefined
          ? data.numero_documento
          : n.documento;
    }

    if (data.telefono !== undefined) {
      sanitized.telefono = n.telefono;
    }

    if (data.id_municipio !== undefined || data.municipio !== undefined) {
      if (
        n.id_municipio !== null &&
        n.id_municipio !== undefined &&
        n.id_municipio !== ""
      ) {
        const idNum = parseInt(n.id_municipio, 10);
        if (isNaN(idNum)) {
          errors.push("El id_municipio debe ser un número válido.");
        } else {
          sanitized.id_municipio = idNum;
        }
      }
      if (n.municipio_nombre) {
        sanitized.municipio_nombre = n.municipio_nombre;
      }
      // si viene municipio como texto (Apartadó, Turbo…)
      if (data.municipio !== undefined && typeof data.municipio === "string") {
        sanitized.municipio = data.municipio;
        sanitized.municipio_nombre = data.municipio;
      }
    }

    if (data.tipo_documento !== undefined) {
      sanitized.tipo_documento = data.tipo_documento || null;
    }

    if (data.genero !== undefined || data.sexo !== undefined) {
      sanitized.genero = data.genero !== undefined ? data.genero : data.sexo;
      sanitized.sexo = data.sexo !== undefined ? data.sexo : data.genero;
    }

    if (data.zona !== undefined) {
      sanitized.zona = data.zona || null;
    }

    if (data.direccion_comunidad !== undefined) {
      sanitized.direccion_comunidad = data.direccion_comunidad || null;
    }

    if (data.condicion_poblacional !== undefined) {
      sanitized.condicion_poblacional = data.condicion_poblacional || null;
    }

    if (data.nacionalidad !== undefined) {
      sanitized.nacionalidad = data.nacionalidad || null;
    }

    // Si mandan fecha_nacimiento, recalcular edad (útil para casos viejos sin edad)
    if (data.fecha_nacimiento !== undefined) {
      sanitized.fecha_nacimiento = data.fecha_nacimiento || null;
      const calc = this.calcularEdadDesdeFecha(data.fecha_nacimiento);
      if (calc != null) {
        sanitized.edad = calc;
      }
    }

    // edad directa (por si se fuerza en casos especiales)
    if (data.edad !== undefined && sanitized.edad === undefined) {
      sanitized.edad =
        data.edad === null || data.edad === "" ? null : Number(data.edad);
    }

    return { isValid: errors.length === 0, errors, value: sanitized };
  }

  static validateDuplicateQuery(data = {}) {
    const errors = [];
    // Acepta documento o numero_documento
    const doc =
      data.documento !== undefined && data.documento !== null
        ? data.documento
        : data.numero_documento;

    if (!doc || String(doc).trim() === "") {
      errors.push("Debe suministrar un documento para verificar duplicidad.");
    }

    return {
      isValid: errors.length === 0,
      errors,
      value: { documento: doc ? String(doc).trim() : "" },
    };
  }
}
