// Servicio unificado que consume el backend Express en /api
// e incluye persistencia local de respaldo si el servidor Express no está levantado aún.

const API_BASE = "/api";

async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw { status: res.status, ...body };
  }
  return body;
}

export const api = {
  // Beneficiarios
  getBeneficiarios: (params = "") =>
    apiRequest(`/beneficiarios${params ? "?" + params : ""}`),
  checkDuplicate: (data) =>
    apiRequest("/beneficiarios/check-duplicate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getFichaConsolidada: (idOrCode) => apiRequest(`/beneficiarios/${idOrCode}`),
  createBeneficiario: (data) =>
    apiRequest("/beneficiarios", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateBeneficiario: (idOrCode, data) =>
    apiRequest(`/beneficiarios/${idOrCode}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  addFamiliar: (idOrCode, data) =>
    apiRequest(`/beneficiarios/${idOrCode}/familiares`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Programas y Vinculaciones
  getProgramas: () => apiRequest("/programas"),
  getVinculaciones: (params = "") =>
    apiRequest(`/programas/participaciones${params ? "?" + params : ""}`),
  vincularBeneficiario: (data) =>
    apiRequest("/programas/vincular", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateEstadoVinculacion: (id, data) =>
    apiRequest(`/programas/vinculaciones/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Atenciones / Ayudas
  getAtenciones: (params = "") =>
    apiRequest(`/atenciones${params ? "?" + params : ""}`),
  createAtencion: (data) =>
    apiRequest("/atenciones", { method: "POST", body: JSON.stringify(data) }),

  // Seguimientos
  getSeguimientos: (params = "") =>
    apiRequest(`/seguimientos${params ? "?" + params : ""}`),
  createSeguimiento: (data) =>
    apiRequest("/seguimientos", { method: "POST", body: JSON.stringify(data) }),
  toggleSeguimiento: (id) =>
    apiRequest(`/seguimientos/${id}/toggle`, { method: "PATCH" }),

  // Reportes y Métricas
  getMetricas: () => apiRequest("/reportes/metricas"),
  resetData: () => apiRequest("/reportes/reset", { method: "POST" }),

  // Base de Datos Oficial y Excel Hackathon
  getDatabaseStatus: () => apiRequest("/database/status"),
  syncExcel: () => apiRequest("/database/sync-excel", { method: "POST" }),
  getSqlSchema: () => apiRequest("/database/schema"),
  getSqlDump: () => apiRequest("/database/dump-sql"),

  // ---- Notificaciones (solo Funcionario / Administrador) ----
  getNotificaciones: async (soloNoLeidas = false) => {
    const token = sessionStorage.getItem("token");
    const qs = soloNoLeidas ? "?solo_no_leidas=true" : "";
    const res = await fetch(`/api/notificaciones${qs}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Error al listar notificaciones");
    return data;
  },

  getNotificacionesCount: async () => {
    const token = sessionStorage.getItem("token");
    const res = await fetch("/api/notificaciones/count", {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Error al contar notificaciones");
    return data;
  },

  marcarNotificacionLeida: async (id) => {
    const token = sessionStorage.getItem("token");
    const res = await fetch(`/api/notificaciones/${id}/leer`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al marcar leída");
    return data;
  },

  marcarTodasNotificacionesLeidas: async () => {
    const token = sessionStorage.getItem("token");
    const res = await fetch("/api/notificaciones/leer-todas", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Error al marcar todas leídas");
    return data;
  },

  generarNotificaciones: async () => {
    const token = sessionStorage.getItem("token");
    const res = await fetch("/api/notificaciones/generar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Error al generar notificaciones");
    return data;
  },

  /** Borrar una notificación (la marca como resuelta y desaparece) */
  eliminarNotificacion: async (id) => {
    const token = sessionStorage.getItem("token");
    const res = await fetch(`/api/notificaciones/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Error al eliminar notificación");
    return data;
  },

  /** Borrar todas las notificaciones del usuario */
  eliminarTodasNotificaciones: async () => {
    const token = sessionStorage.getItem("token");
    const res = await fetch("/api/notificaciones", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Error al eliminar notificaciones");
    return data;
  },

  /** Historial de notificaciones ya borradas / resueltas */
  getNotificacionesHistorial: async () => {
    const token = sessionStorage.getItem("token");
    const res = await fetch("/api/notificaciones/historial", {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al cargar historial");
    return data;
  },
};
