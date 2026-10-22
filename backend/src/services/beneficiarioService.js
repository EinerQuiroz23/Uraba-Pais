import { BeneficiarioRepository } from "../repositories/beneficiarioRepository.js";
import { ParticipacionRepository } from "../repositories/participacionRepository.js";
import { AtencionRepository } from "../repositories/atencionRepository.js";
import { SeguimientoRepository } from "../repositories/seguimientoRepository.js";
import { MunicipioRepository } from "../repositories/municipioRepository.js";

function formatFecha(valor) {
  if (!valor) return "";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return String(valor).slice(0, 10);
  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const anio = fecha.getUTCFullYear();
  return `${dia}/${mes}/${anio}`;
}

function textoClave(valor, porDefecto) {
  if (!valor) return porDefecto;
  const limpio = String(valor).toLowerCase().replace(/_/g, " ");
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

/**
 * Convierte fila de DB al formato que usa el frontend
 */
function toFrontendShape(row) {
  if (!row) return null;

  const nombreCompleto = (row.nombre || "").trim();
  const partes = nombreCompleto.split(/\s+/);
  let nombres = nombreCompleto;
  let apellidos = "";
  if (partes.length >= 2) {
    // mitad simple: primeras palabras = nombres, resto = apellidos
    const mid = Math.ceil(partes.length / 2);
    nombres = partes.slice(0, mid).join(" ");
    apellidos = partes.slice(mid).join(" ");
  }

  const id = row.id_beneficiario;
  return {
    id,
    id_beneficiario: id,
    codigo_interno: row.codigo_interno,
    nombres,
    apellidos,
    nombre: nombreCompleto,
    tipo_documento:
      row.tipo_documento || (row.documento ? "CC" : "SIN_DOCUMENTO"),
    numero_documento: row.documento || "",
    documento: row.documento || null,
    telefono: row.telefono || "",
    municipio: row.municipio_nombre || row.municipio || "",
    municipio_nombre: row.municipio_nombre || row.municipio || "",
    id_municipio: row.id_municipio,
    direccion_comunidad: row.zona
      ? textoClave(row.zona, "")
      : row.direccion_comunidad || "",
    condicion_poblacional: row.tipo_poblacion
      ? textoClave(row.tipo_poblacion, "Comunidad de acogida")
      : row.condicion_poblacional || "Comunidad de acogida",
    discapacidad: row.discapacidad || "Ninguna",
    genero: row.sexo
      ? textoClave(row.sexo, "No especificado")
      : row.genero || "No especificado",
    fecha_nacimiento: row.fecha_nacimiento || "",
    edad: row.edad ?? null,
    zona: row.zona || "",
    familiares: row.familiares || [],
    autorizacion_datos: row.autorizacion_datos ?? true,
  };
}

/** Calcula edad exacta a partir de YYYY-MM-DD (sin desfase de zona horaria) */
function calcularEdadDesdeFecha(fechaStr) {
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

export class BeneficiarioService {
  static async listarBeneficiarios({ search, id_municipio } = {}) {
    const list = await BeneficiarioRepository.findAll({ search, id_municipio });
    return list.map(toFrontendShape);
  }

  static async obtenerFichaConsolidada(id) {
    const beneficiario = await BeneficiarioRepository.findById(id);
    if (!beneficiario) return null;

    const [participaciones, atenciones, seguimientos, familiares] =
      await Promise.all([
        ParticipacionRepository.findByBeneficiario(id),
        AtencionRepository.findByBeneficiario(id),
        SeguimientoRepository.findByBeneficiario(id),
        BeneficiarioRepository.findFamiliares(id),
      ]);

    const pendientes = seguimientos.filter(
      (s) => s.accion_pendiente === true,
    ).length;

    const base = toFrontendShape({ ...beneficiario, familiares });

    return {
      ...base,
      participaciones,
      vinculaciones: participaciones.map((p) => ({
        id: p.id_participacion,
        programa_nombre: p.programa_nombre,
        linea_trabajo: p.linea_nombre,
        fecha_vinculacion: formatFecha(p.fecha_vinculacion),
        estado: p.estado || "inscrito",
      })),
      atenciones: atenciones.map((a) => ({
        id: a.id_atencion,
        tipo_atencion: a.tipo || a.programa_nombre,
        fecha: formatFecha(a.fecha_atencion),
        descripcion: a.descripcion,
        responsable: a.responsable || "",
        entidad: a.entidad || "",
        resultado: a.resultado || "",
      })),
      seguimientos: seguimientos.map((s) => ({
        id: s.id_seguimiento,
        fecha: formatFecha(s.fecha_seguimiento),
        avance_novedad: s.avance || s.observacion || "",
        estado_pendiente: s.accion_pendiente ? "pendiente" : "completado",
        accion_pendiente: s.accion_pendiente_detalle || "",
        proximo_contacto: s.proximo_contacto
          ? String(s.proximo_contacto).slice(0, 10)
          : "",
      })),
      resumen: {
        total_programas: participaciones.length,
        total_atenciones: atenciones.length,
        total_seguimientos: seguimientos.length,
        seguimientos_pendientes: pendientes,
      },
    };
  }

  static async verificarDuplicado({ documento }) {
    if (!documento || documento.trim() === "") {
      return { isDuplicate: false };
    }

    const existente = await BeneficiarioRepository.findByDocumento(
      documento.trim(),
    );
    if (existente) {
      return {
        isDuplicate: true,
        reason: `Ya existe un beneficiario registrado con el documento ${documento}.`,
        existingBeneficiary: toFrontendShape(existente),
      };
    }
    return { isDuplicate: false };
  }

  /**
   * Resuelve id_municipio si solo viene el nombre (Apartadó, Turbo, Necoclí...)
   */
  static async resolverMunicipio({ id_municipio, municipio_nombre }) {
    if (id_municipio) {
      const m = await MunicipioRepository.findById(id_municipio);
      if (!m) {
        const err = new Error("El municipio especificado no existe.");
        err.status = 400;
        throw err;
      }
      return m.id_municipio;
    }

    if (municipio_nombre) {
      let m = await MunicipioRepository.findByNombre(municipio_nombre);
      // fallback por si el nombre no coincide exacto
      if (!m) {
        const todos = await MunicipioRepository.findAll();
        m = todos.find(
          (x) => x.nombre.toLowerCase() === municipio_nombre.toLowerCase(),
        );
      }
      if (!m) {
        const err = new Error(
          `El municipio "${municipio_nombre}" no existe. Use uno de los registrados (Apartadó, Turbo, Necoclí...).`,
        );
        err.status = 400;
        throw err;
      }
      return m.id_municipio;
    }

    const err = new Error("Debe indicar id_municipio o municipio.");
    err.status = 400;
    throw err;
  }

  static async registrarBeneficiario(data) {
    const id_municipio = await this.resolverMunicipio({
      id_municipio: data.id_municipio,
      municipio_nombre: data.municipio || data.municipio_nombre,
    });

    if (data.documento && String(data.documento).trim() !== "") {
      const duplicado = await this.verificarDuplicado({
        documento: data.documento,
      });
      if (duplicado.isDuplicate) {
        const err = new Error(duplicado.reason);
        err.status = 409;
        err.isDuplicate = true;
        err.existingBeneficiary = duplicado.existingBeneficiary;
        throw err;
      }
    }

    // Mapear campos del frontend → columnas reales de la BD
    // genero → sexo | direccion_comunidad → zona | condicion_poblacional → tipo_poblacion
    const sexo = data.sexo || data.genero || null;
    const zona = data.zona || data.direccion_comunidad || null;
    const tipo_poblacion =
      data.tipo_poblacion || data.condicion_poblacional || null;

    // Edad: siempre desde fecha de nacimiento si viene; si no, usa la que manden
    let edadFinal = null;
    if (data.fecha_nacimiento) {
      edadFinal = calcularEdadDesdeFecha(data.fecha_nacimiento);
    }
    if (edadFinal == null && data.edad != null && data.edad !== "") {
      const n = Number(data.edad);
      if (!Number.isNaN(n)) edadFinal = n;
    }

    const creado = await BeneficiarioRepository.create({
      nombre: (data.nombre || "").trim(),
      documento: data.documento ? String(data.documento).trim() : null,
      telefono: data.telefono ? String(data.telefono).trim() : null,
      id_municipio,
      tipo_documento: data.tipo_documento || null,
      sexo: sexo ? String(sexo).trim() : null,
      edad: edadFinal,
      zona: zona ? String(zona).trim() : null,
      nacionalidad: data.nacionalidad || null,
      tipo_poblacion: tipo_poblacion ? String(tipo_poblacion).trim() : null,
    });

    const completo = await BeneficiarioRepository.findById(
      creado.id_beneficiario,
    );
    return toFrontendShape(completo);
  }

  static async actualizarBeneficiario(id, updateData) {
    const data = { ...updateData };

    if (data.id_municipio || data.municipio || data.municipio_nombre) {
      data.id_municipio = await this.resolverMunicipio({
        id_municipio: data.id_municipio,
        municipio_nombre: data.municipio || data.municipio_nombre,
      });
    }

    // Mapear frontend → BD
    if (data.genero !== undefined && data.sexo === undefined) {
      data.sexo = data.genero;
    }
    // zona: si viene explícita, se respeta; si no, se usa dirección/comunidad
    if (data.zona === undefined && data.direccion_comunidad !== undefined) {
      data.zona = data.direccion_comunidad;
    }
    if (
      data.condicion_poblacional !== undefined &&
      data.tipo_poblacion === undefined
    ) {
      data.tipo_poblacion = data.condicion_poblacional;
    }
    if (data.numero_documento !== undefined && data.documento === undefined) {
      data.documento = data.numero_documento;
    }
    // nombre desde nombres + apellidos si viene así
    if (!data.nombre && (data.nombres || data.apellidos)) {
      data.nombre = `${data.nombres || ""} ${data.apellidos || ""}`.trim();
    }

    // Si mandan fecha_nacimiento, recalcular edad (casos viejos sin edad)
    if (data.fecha_nacimiento) {
      const calc = calcularEdadDesdeFecha(data.fecha_nacimiento);
      if (calc != null) data.edad = calc;
    }

    const dbData = {};
    if (data.nombre !== undefined) dbData.nombre = data.nombre;
    if (data.documento !== undefined) dbData.documento = data.documento;
    if (data.telefono !== undefined) dbData.telefono = data.telefono;
    if (data.id_municipio !== undefined)
      dbData.id_municipio = data.id_municipio;
    if (data.tipo_documento !== undefined)
      dbData.tipo_documento = data.tipo_documento;
    if (data.sexo !== undefined) dbData.sexo = data.sexo;
    // Solo actualizar edad si viene calculada desde fecha_nacimiento o se fuerza
    if (data.edad !== undefined && data.edad !== null && data.edad !== "") {
      dbData.edad = Number(data.edad);
    }
    if (data.zona !== undefined) dbData.zona = data.zona;
    if (data.nacionalidad !== undefined)
      dbData.nacionalidad = data.nacionalidad;
    if (data.tipo_poblacion !== undefined)
      dbData.tipo_poblacion = data.tipo_poblacion;

    const updated = await BeneficiarioRepository.update(id, dbData);
    if (!updated) return null;
    const completo = await BeneficiarioRepository.findById(id);
    return toFrontendShape(completo);
  }

  static async eliminarBeneficiario(id) {
    return await BeneficiarioRepository.delete(id);
  }
}
