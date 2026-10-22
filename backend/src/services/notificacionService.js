import { NotificacionRepository } from "../repositories/notificacionRepository.js";
import { query } from "../database/db.js";

/**
 * Módulo destino en el frontend según el tipo de alerta.
 */
const MODULO_POR_TIPO = {
  PROXIMO_CONTACTO: "atenciones",
  ACCION_PENDIENTE: "atenciones",
  SIN_VINCULACION: "programas",
  SIN_ATENCION: "atenciones",
  DATOS_INCOMPLETOS: "beneficiarios",
  EN_PROCESO: "programas",
  PROCESO_FINALIZADO: "programas",
  INSCRITO: "programas",
  RETIRADO: "programas",
  ACCION_COMPLETADA: "atenciones",
};

/** Tipos de vinculación (eventos de cambio de estado) */
const TIPOS_VINCULACION = [
  "INSCRITO",
  "EN_PROCESO",
  "PROCESO_FINALIZADO",
  "RETIRADO",
];

/** Configuración visual / mensaje por estado de vinculación */
const CONFIG_ESTADO = {
  inscrito: {
    tipo: "INSCRITO",
    prioridad: "media",
    titulo: (nombre) => `Inscrito — ${nombre}`,
    mensaje: (programa) => `El beneficiario se inscribió en "${programa}".`,
  },
  "en proceso": {
    tipo: "EN_PROCESO",
    prioridad: "media",
    titulo: (nombre) => `En proceso — ${nombre}`,
    mensaje: (programa) =>
      `Vinculado a "${programa}" y el proceso está activo. Requiere seguimiento.`,
  },
  finalizado: {
    tipo: "PROCESO_FINALIZADO",
    prioridad: "baja",
    titulo: (nombre) => `✓ Finalizado — ${nombre}`,
    mensaje: (programa) =>
      `El proceso en "${programa}" quedó finalizado correctamente.`,
  },
  retirado: {
    tipo: "RETIRADO",
    prioridad: "alta",
    titulo: (nombre) => `Retirado — ${nombre}`,
    mensaje: (programa) =>
      `El beneficiario fue retirado del programa "${programa}".`,
  },
};

export class NotificacionService {
  static async listar(id_usuario, opts = {}) {
    return NotificacionRepository.findByUsuario(id_usuario, opts);
  }

  static async listarHistorial(id_usuario, opts = {}) {
    return NotificacionRepository.findHistorial(id_usuario, opts);
  }

  static async contarNoLeidas(id_usuario) {
    return NotificacionRepository.countNoLeidas(id_usuario);
  }

  static async marcarLeida(id_notificacion, id_usuario) {
    const row = await NotificacionRepository.marcarLeida(
      id_notificacion,
      id_usuario,
    );
    if (!row) throw new Error("Notificación no encontrada");
    return row;
  }

  static async marcarTodasLeidas(id_usuario) {
    return NotificacionRepository.marcarTodasLeidas(id_usuario);
  }

  /**
   * Crea notificación cuando cambia el estado de una vinculación.
   * - inscrito  → amarillo
   * - en proceso → azul
   * - finalizado → verde
   * - retirado  → rojo
   * Las notificaciones de estados anteriores del mismo beneficiario se cierran.
   */
  static async notificarCambioEstadoVinculacion({
    id_beneficiario,
    id_participacion,
    estado,
    nombreBeneficiario,
    codigoInterno,
    nombrePrograma,
  }) {
    const estadoNorm = String(estado || "")
      .toLowerCase()
      .trim();
    const cfg = CONFIG_ESTADO[estadoNorm];
    if (!cfg) return null;

    // Cerrar notificaciones abiertas de otros estados de vinculación de este beneficiario
    await NotificacionRepository.resolverTiposVinculacion(
      id_beneficiario,
      TIPOS_VINCULACION,
    );

    const modulo = MODULO_POR_TIPO[cfg.tipo] || "programas";
    const n = await NotificacionRepository.create({
      id_beneficiario,
      tipo: cfg.tipo,
      titulo: cfg.titulo(nombreBeneficiario || "Beneficiario"),
      mensaje: cfg.mensaje(nombrePrograma || "programa"),
      prioridad: cfg.prioridad,
      enlace: `/${modulo}?beneficiario=${id_beneficiario}`,
      metadata: {
        id_participacion: id_participacion || null,
        codigo_interno: codigoInterno || null,
        programa: nombrePrograma || null,
        estado: estadoNorm,
        modulo,
        seccion: "vinculacion",
        color:
          estadoNorm === "inscrito"
            ? "amarillo"
            : estadoNorm === "en proceso"
              ? "azul"
              : estadoNorm === "finalizado"
                ? "verde"
                : estadoNorm === "retirado"
                  ? "rojo"
                  : "gris",
      },
    });
    return n;
  }

  /**
   * Notifica cuando una acción de seguimiento pasa de pendiente → completado.
   */
  static async notificarAccionCompletada({
    id_beneficiario,
    id_seguimiento,
    nombreBeneficiario,
    codigoInterno,
    detalle,
  }) {
    // Cerrar alerta de ACCION_PENDIENTE / PROXIMO_CONTACTO de ese beneficiario
    await NotificacionRepository.resolverTiposVinculacion(id_beneficiario, [
      "ACCION_PENDIENTE",
      "PROXIMO_CONTACTO",
    ]);

    const modulo = MODULO_POR_TIPO.ACCION_COMPLETADA;
    const n = await NotificacionRepository.create({
      id_beneficiario,
      tipo: "ACCION_COMPLETADA",
      titulo: `Acción completada — ${nombreBeneficiario || "Beneficiario"}`,
      mensaje:
        detalle ||
        "La acción pendiente de seguimiento fue marcada como completada.",
      prioridad: "baja",
      enlace: `/${modulo}?beneficiario=${id_beneficiario}`,
      metadata: {
        id_seguimiento: id_seguimiento || null,
        codigo_interno: codigoInterno || null,
        modulo,
        seccion: "seguimiento",
        positivo: true,
      },
    });
    return n;
  }

  /**
   * Sincroniza alertas con el estado real de la BD (condiciones ongoing).
   * NO regenera notificaciones de eventos de vinculación ni ACCION_COMPLETADA
   * (esas se crean solo al cambiar estado, y al borrarlas no vuelven).
   */
  static async generarAlertas() {
    const creadas = [];
    let resueltas = 0;

    // 1) Próximos contactos vencidos o en los próximos 3 días
    const proximos = await query(`
      SELECT s.id_seguimiento, s.id_beneficiario, s.proximo_contacto,
             s.accion_pendiente_detalle, b.nombre, b.codigo_interno
      FROM seguimiento s
      JOIN beneficiario b ON b.id_beneficiario = s.id_beneficiario
      WHERE s.proximo_contacto IS NOT NULL
        AND s.proximo_contacto <= CURRENT_DATE + INTERVAL '3 days'
        AND s.accion_pendiente = TRUE
    `);

    const idsProximos = proximos.rows.map((r) => r.id_beneficiario);
    resueltas += await NotificacionRepository.resolverObsoletas(
      "PROXIMO_CONTACTO",
      idsProximos,
    );

    for (const row of proximos.rows) {
      const abierta = await NotificacionRepository.existeAbierta(
        "PROXIMO_CONTACTO",
        row.id_beneficiario,
      );
      if (abierta) continue;

      const vencido =
        new Date(row.proximo_contacto) < new Date(new Date().toDateString());
      const modulo = MODULO_POR_TIPO.PROXIMO_CONTACTO;
      const n = await NotificacionRepository.create({
        id_beneficiario: row.id_beneficiario,
        tipo: "PROXIMO_CONTACTO",
        titulo: vencido
          ? `Contacto vencido — ${row.nombre}`
          : `Próximo contacto — ${row.nombre}`,
        mensaje: vencido
          ? `El contacto programado para ${row.proximo_contacto} ya venció. ${row.accion_pendiente_detalle || ""}`.trim()
          : `Contacto programado para ${row.proximo_contacto}. ${row.accion_pendiente_detalle || ""}`.trim(),
        prioridad: vencido ? "alta" : "media",
        enlace: `/${modulo}?beneficiario=${row.id_beneficiario}`,
        metadata: {
          id_seguimiento: row.id_seguimiento,
          codigo_interno: row.codigo_interno,
          proximo_contacto: row.proximo_contacto,
          modulo,
          seccion: "seguimiento",
        },
      });
      creadas.push(n);
    }

    // 2) Acciones pendientes
    const pendientes = await query(`
      SELECT s.id_seguimiento, s.id_beneficiario, s.accion_pendiente_detalle,
             b.nombre, b.codigo_interno
      FROM seguimiento s
      JOIN beneficiario b ON b.id_beneficiario = s.id_beneficiario
      WHERE s.accion_pendiente = TRUE
        AND (s.proximo_contacto IS NULL OR s.proximo_contacto > CURRENT_DATE + INTERVAL '3 days')
    `);

    const idsPendientes = pendientes.rows.map((r) => r.id_beneficiario);
    resueltas += await NotificacionRepository.resolverObsoletas(
      "ACCION_PENDIENTE",
      idsPendientes,
    );

    for (const row of pendientes.rows) {
      const abierta = await NotificacionRepository.existeAbierta(
        "ACCION_PENDIENTE",
        row.id_beneficiario,
      );
      if (abierta) continue;

      const modulo = MODULO_POR_TIPO.ACCION_PENDIENTE;
      const n = await NotificacionRepository.create({
        id_beneficiario: row.id_beneficiario,
        tipo: "ACCION_PENDIENTE",
        titulo: `Acción pendiente — ${row.nombre}`,
        mensaje:
          row.accion_pendiente_detalle ||
          "Hay una acción pendiente sin detalle.",
        prioridad: "media",
        enlace: `/${modulo}?beneficiario=${row.id_beneficiario}`,
        metadata: {
          id_seguimiento: row.id_seguimiento,
          codigo_interno: row.codigo_interno,
          modulo,
          seccion: "seguimiento",
        },
      });
      creadas.push(n);
    }

    // 3) Sin vinculación a programa
    const sinVinculo = await query(`
      SELECT b.id_beneficiario, b.nombre, b.codigo_interno, b.fecha_registro
      FROM beneficiario b
      WHERE NOT EXISTS (
        SELECT 1 FROM participacion p WHERE p.id_beneficiario = b.id_beneficiario
      )
    `);

    const idsSinVinculo = sinVinculo.rows.map((r) => r.id_beneficiario);
    resueltas += await NotificacionRepository.resolverObsoletas(
      "SIN_VINCULACION",
      idsSinVinculo,
    );

    for (const row of sinVinculo.rows) {
      const abierta = await NotificacionRepository.existeAbierta(
        "SIN_VINCULACION",
        row.id_beneficiario,
      );
      if (abierta) continue;

      const modulo = MODULO_POR_TIPO.SIN_VINCULACION;
      const n = await NotificacionRepository.create({
        id_beneficiario: row.id_beneficiario,
        tipo: "SIN_VINCULACION",
        titulo: `Sin programa — ${row.nombre}`,
        mensaje: `Registrado el ${row.fecha_registro || "—"} y aún no está vinculado a ningún programa.`,
        prioridad: "baja",
        enlace: `/${modulo}?beneficiario=${row.id_beneficiario}`,
        metadata: {
          codigo_interno: row.codigo_interno,
          modulo,
          seccion: "vinculacion",
        },
      });
      creadas.push(n);
    }

    // 4) Con programa pero sin ninguna atención
    const sinAtencion = await query(`
      SELECT b.id_beneficiario, b.nombre, b.codigo_interno
      FROM beneficiario b
      WHERE EXISTS (
        SELECT 1 FROM participacion p WHERE p.id_beneficiario = b.id_beneficiario
      )
      AND NOT EXISTS (
        SELECT 1 FROM atencion a WHERE a.id_beneficiario = b.id_beneficiario
      )
    `);

    const idsSinAtencion = sinAtencion.rows.map((r) => r.id_beneficiario);
    resueltas += await NotificacionRepository.resolverObsoletas(
      "SIN_ATENCION",
      idsSinAtencion,
    );

    for (const row of sinAtencion.rows) {
      const abierta = await NotificacionRepository.existeAbierta(
        "SIN_ATENCION",
        row.id_beneficiario,
      );
      if (abierta) continue;

      const modulo = MODULO_POR_TIPO.SIN_ATENCION;
      const n = await NotificacionRepository.create({
        id_beneficiario: row.id_beneficiario,
        tipo: "SIN_ATENCION",
        titulo: `Sin atención registrada — ${row.nombre}`,
        mensaje:
          "Está vinculado a un programa pero aún no tiene ninguna atención registrada.",
        prioridad: "media",
        enlace: `/${modulo}?beneficiario=${row.id_beneficiario}`,
        metadata: {
          codigo_interno: row.codigo_interno,
          modulo,
          seccion: "atenciones",
        },
      });
      creadas.push(n);
    }

    // 5) Datos incompletos del beneficiario
    const incompletos = await query(`
      SELECT b.id_beneficiario, b.nombre, b.codigo_interno,
             b.documento, b.telefono, b.sexo, b.edad, b.zona
      FROM beneficiario b
      WHERE b.documento IS NULL OR TRIM(b.documento) = ''
         OR b.telefono IS NULL OR TRIM(b.telefono) = ''
         OR b.sexo IS NULL OR TRIM(b.sexo) = ''
         OR b.edad IS NULL
         OR b.zona IS NULL OR TRIM(b.zona) = ''
    `);

    const idsIncompletos = incompletos.rows.map((r) => r.id_beneficiario);
    resueltas += await NotificacionRepository.resolverObsoletas(
      "DATOS_INCOMPLETOS",
      idsIncompletos,
    );

    for (const row of incompletos.rows) {
      const abierta = await NotificacionRepository.existeAbierta(
        "DATOS_INCOMPLETOS",
        row.id_beneficiario,
      );
      if (abierta) continue;

      const faltantes = [];
      if (!row.documento || !String(row.documento).trim())
        faltantes.push("documento");
      if (!row.telefono || !String(row.telefono).trim())
        faltantes.push("teléfono");
      if (!row.sexo || !String(row.sexo).trim()) faltantes.push("sexo");
      if (row.edad == null) faltantes.push("edad");
      if (!row.zona || !String(row.zona).trim()) faltantes.push("zona");

      const modulo = MODULO_POR_TIPO.DATOS_INCOMPLETOS;
      const n = await NotificacionRepository.create({
        id_beneficiario: row.id_beneficiario,
        tipo: "DATOS_INCOMPLETOS",
        titulo: `Datos incompletos — ${row.nombre}`,
        mensaje: `Faltan: ${faltantes.join(", ")}. Completa la ficha del beneficiario.`,
        prioridad: "baja",
        enlace: `/${modulo}?beneficiario=${row.id_beneficiario}`,
        metadata: {
          codigo_interno: row.codigo_interno,
          faltantes,
          modulo,
          seccion: "datos",
        },
      });
      creadas.push(n);
    }

    // NOTA: EN_PROCESO, FINALIZADO, INSCRITO, RETIRADO y ACCION_COMPLETADA
    // ya NO se regeneran aquí. Se crean solo al cambiar el estado
    // (programaService / seguimientoService). Así al borrarlas no vuelven.

    return {
      generadas: creadas.length,
      resueltas,
      items: creadas,
    };
  }

  static async eliminar(id_notificacion, id_usuario) {
    const row = await NotificacionRepository.eliminar(
      id_notificacion,
      id_usuario,
    );
    if (!row) throw new Error("Notificación no encontrada o ya eliminada");
    return row;
  }

  static async eliminarTodas(id_usuario) {
    return NotificacionRepository.eliminarTodas(id_usuario);
  }
}
