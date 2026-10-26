import React, { useState, useEffect } from "react";
import {
  HeartHandshake,
  Clock,
  Plus,
  CheckCircle2,
  FileCheck,
  Check,
  X,
} from "lucide-react";
import Paginador from "./Paginador";
import { api } from "../services/api";

const POR_PAGINA = 10;

function fechaValida(valor) {
  if (!valor) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const anio = Number(valor.slice(0, 4));
  if (anio < 1900 || anio > 2100) return null;
  return valor;
}

export default function Modulo3Atenciones({ selectedBeneficiarioId }) {
  const [activeSubTab, setActiveSubTab] = useState("atenciones");
  const [atenciones, setAtenciones] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtencion, setPaginaAtencion] = useState(1);
  const [paginaSeguimiento, setPaginaSeguimiento] = useState(1);

  const [showAtencionModal, setShowAtencionModal] = useState(false);
  const [showSeguimientoModal, setShowSeguimientoModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [filtroTextoAtencion, setFiltroTextoAtencion] = useState("");
  const [filtroTextoSeguimiento, setFiltroTextoSeguimiento] = useState("");
  const [filtroPrograma, setFiltroPrograma] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroEstadoSeg, setFiltroEstadoSeg] = useState("");

  const [formAtencion, setFormAtencion] = useState({
    beneficiario_id: selectedBeneficiarioId || "",
    fecha: new Date().toISOString().split("T")[0],
    tipo_atencion: "Entrega de Kit de Emergencia / Habitabilidad",
    linea_trabajo: "Asistencia humanitaria y protección",
    descripcion: "",
    responsable: "",
    entidad: "COOPI",
    resultado: "",
    remision: "Ninguna",
  });

  const [formSeguimiento, setFormSeguimiento] = useState({
    beneficiario_id: selectedBeneficiarioId || "",
    fecha: new Date().toISOString().split("T")[0],
    avance_novedad: "",
    observaciones: "",
    accion_pendiente: "",
    proximo_contacto: "",
    estado_pendiente: "pendiente",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [aRes, sRes, bRes] = await Promise.all([
        api.getAtenciones(),
        api.getSeguimientos(),
        api.getBeneficiarios(),
      ]);

      setAtenciones(
        (aRes.data || []).map((a) => ({
          ...a,
          id: a.id_atencion || a.id,
          fecha: String(a.fecha_atencion || a.fecha || "").slice(0, 10),
          beneficiario_nombre: a.beneficiario_nombre || "",
          tipo_atencion:
            a.tipo || a.tipo_atencion || a.programa_nombre || "Atención",
          linea_trabajo: a.linea_trabajo || a.linea_nombre || "",
          descripcion: a.descripcion || "",
          responsable: a.responsable || "",
          entidad: a.entidad || "",
          resultado: a.resultado || "",
        })),
      );

      setSeguimientos(
        (sRes.data || []).map((s) => {
          const pendienteBool =
            s.accion_pendiente === true ||
            s.accion_pendiente === "true" ||
            s.accion_pendiente === 1;
          return {
            ...s,
            id: s.id_seguimiento || s.id,
            fecha: String(s.fecha_seguimiento || s.fecha || "").slice(0, 10),
            beneficiario_nombre: s.beneficiario_nombre || "",
            avance_novedad: s.avance || s.avance_novedad || s.observacion || "",
            accion_pendiente: s.accion_pendiente_detalle || "",
            proximo_contacto: s.proximo_contacto
              ? String(s.proximo_contacto).slice(0, 10)
              : "",
            // Solo el booleano decide el estado visual
            estado_pendiente: pendienteBool ? "pendiente" : "completado",
          };
        }),
      );

      setBeneficiarios(bRes.data || []);

      if (selectedBeneficiarioId) {
        setFormAtencion((prev) => ({
          ...prev,
          beneficiario_id: selectedBeneficiarioId,
        }));
        setFormSeguimiento((prev) => ({
          ...prev,
          beneficiario_id: selectedBeneficiarioId,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBeneficiarioId]);

  const handleCreateAtencion = async (e) => {
    e.preventDefault();
    if (!formAtencion.beneficiario_id) {
      alert("Seleccione un beneficiario.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.createAtencion({
        id_beneficiario: Number(formAtencion.beneficiario_id),
        id_programa: Number(formAtencion.id_programa) || 1,
        descripcion: formAtencion.descripcion,
        fecha_atencion: formAtencion.fecha,
        tipo: formAtencion.tipo_atencion,
        responsable: formAtencion.responsable,
        entidad: formAtencion.entidad,
        resultado: formAtencion.resultado,
        remision:
          formAtencion.remision === "Ninguna" ? null : formAtencion.remision,
      });

      if (res.success) {
        setSuccessMsg("Información almacenada con éxito");
        setShowAtencionModal(false);
        setFormAtencion({
          beneficiario_id: "",
          fecha: new Date().toISOString().split("T")[0],
          tipo_atencion: "Entrega de Kit de Emergencia / Habitabilidad",
          linea_trabajo: "Asistencia humanitaria y protección",
          descripcion: "",
          responsable: "",
          entidad: "COOPI",
          resultado: "",
          remision: "Ninguna",
        });
        await loadData();
      }
    } catch (err) {
      alert(err.message || "Error al registrar atención");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSeguimiento = async (e) => {
    e.preventDefault();
    if (!formSeguimiento.beneficiario_id) {
      alert("Seleccione un beneficiario.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.createSeguimiento({
        id_beneficiario: Number(formSeguimiento.beneficiario_id),
        fecha_seguimiento: formSeguimiento.fecha,
        avance: formSeguimiento.avance_novedad,
        observacion: formSeguimiento.observaciones,
        accion_pendiente_detalle: formSeguimiento.accion_pendiente,
        proximo_contacto: formSeguimiento.proximo_contacto || null,
      });

      if (res.success) {
        setSuccessMsg("Información almacenada con éxito");
        setShowSeguimientoModal(false);
        setFormSeguimiento({
          beneficiario_id: "",
          fecha: new Date().toISOString().split("T")[0],
          avance_novedad: "",
          observaciones: "",
          accion_pendiente: "",
          proximo_contacto: "",
          estado_pendiente: "pendiente",
        });
        await loadData();
      } else {
        alert(res.message || "No se pudo guardar el seguimiento.");
      }
    } catch (err) {
      alert(err.message || "Error al registrar seguimiento");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSeguimiento = async (id) => {
    try {
      await api.toggleSeguimiento(id);
      await loadData();
    } catch (err) {
      alert(err.message || "Error al alternar estado");
    }
  };

  const programasAtencion = [
    ...new Set(
      atenciones
        .map((a) => a.programa_nombre || a.tipo_atencion)
        .filter(Boolean),
    ),
  ];

  const qAtencion = filtroTextoAtencion.trim().toLowerCase();
  const atencionesFiltradas = atenciones.filter((a) => {
    const texto =
      `${a.beneficiario_nombre || ""} ${a.codigo_interno || ""} ${a.documento || ""}`.toLowerCase();
    const programa = a.programa_nombre || a.tipo_atencion || "";
    return (
      (!qAtencion || texto.includes(qAtencion)) &&
      (!filtroPrograma || programa === filtroPrograma) &&
      (!filtroFecha || a.fecha === filtroFecha)
    );
  });

  const qSeguimiento = filtroTextoSeguimiento.trim().toLowerCase();
  const seguimientosFiltrados = seguimientos.filter((s) => {
    const texto =
      `${s.beneficiario_nombre || ""} ${s.codigo_interno || ""} ${s.documento || ""}`.toLowerCase();
    return (
      (!qSeguimiento || texto.includes(qSeguimiento)) &&
      (!filtroEstadoSeg || s.estado_pendiente === filtroEstadoSeg)
    );
  });

  const totalAtencion = Math.max(
    1,
    Math.ceil(atencionesFiltradas.length / POR_PAGINA),
  );
  const paginaAtencionSegura = Math.min(paginaAtencion, totalAtencion);
  const atencionesVisibles = atencionesFiltradas.slice(
    (paginaAtencionSegura - 1) * POR_PAGINA,
    paginaAtencionSegura * POR_PAGINA,
  );

  const totalSeguimiento = Math.max(
    1,
    Math.ceil(seguimientosFiltrados.length / POR_PAGINA),
  );
  const paginaSeguimientoSegura = Math.min(paginaSeguimiento, totalSeguimiento);
  const seguimientosVisibles = seguimientosFiltrados.slice(
    (paginaSeguimientoSegura - 1) * POR_PAGINA,
    paginaSeguimientoSegura * POR_PAGINA,
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-600 text-white">
              Módulo 3
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              Atención y Seguimiento
            </h2>
          </div>
          <div className="mt-2 text-xs text-slate-700 bg-white/80 backdrop-blur-sm p-2.5 rounded-xl border border-blue-200">
            <strong>Diferencia clave requerida por la guía:</strong>
            <br />• <em>Atención o Ayuda:</em> Registra{" "}
            <u>lo que se entregó o realizó</u> (bienes, orientación, servicios
            de salud).
            <br />• <em>Seguimiento:</em> Registra <u>lo que cambió</u>{" "}
            (avances/novedades) y <u>lo que queda pendiente</u> (acciones
            futuras).
          </div>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setShowAtencionModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Registrar Atención
          </button>
          <button
            onClick={() => setShowSeguimientoModal(true)}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Clock className="w-4 h-4" /> Añadir Seguimiento
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveSubTab("atenciones")}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === "atenciones"
              ? "border-blue-600 text-blue-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Atenciones y Ayudas Entregadas ({atencionesFiltradas.length} de{" "}
          {atenciones.length})
        </button>
        <button
          onClick={() => setActiveSubTab("seguimientos")}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === "seguimientos"
              ? "border-sky-600 text-sky-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          Seguimientos y Acciones Pendientes ({
            seguimientosFiltrados.length
          } de {seguimientos.length})
        </button>
      </div>

      {activeSubTab === "atenciones" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              value={filtroTextoAtencion}
              onChange={(e) => {
                setFiltroTextoAtencion(e.target.value);
                setPaginaAtencion(1);
              }}
              placeholder="Nombre, código o documento"
              className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
            <select
              value={filtroPrograma}
              onChange={(e) => {
                setFiltroPrograma(e.target.value);
                setPaginaAtencion(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
            >
              <option value="">Todos los programas</option>
              {programasAtencion.map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
            <input
              type="date"
              min="1900-01-01"
              max="2100-12-31"
              value={filtroFecha}
              onChange={(e) => {
                setFiltroFecha(e.target.value);
                setPaginaAtencion(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
            {(filtroTextoAtencion || filtroPrograma || filtroFecha) && (
              <button
                type="button"
                onClick={() => {
                  setFiltroTextoAtencion("");
                  setFiltroPrograma("");
                  setFiltroFecha("");
                  setPaginaAtencion(1);
                }}
                className="md:col-span-4 text-xs font-semibold text-blue-700 text-left"
              >
                Limpiar
              </button>
            )}
          </div>
          {atencionesFiltradas.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Ninguna atención coincide con el filtro.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Beneficiario</th>
                      <th className="px-4 py-3">Programa</th>
                      <th className="px-4 py-3">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {atencionesVisibles.map((a) => (
                      <tr
                        key={a.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {a.fecha || "Sin fecha"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {a.beneficiario_nombre || "Sin nombre"}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="font-semibold text-slate-800">
                            {a.tipo_atencion}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            {a.linea_trabajo}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          {a.descripcion}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Paginador
                pagina={paginaAtencionSegura}
                total={atencionesFiltradas.length}
                porPagina={POR_PAGINA}
                onChange={setPaginaAtencion}
              />
            </>
          )}
        </div>
      )}

      {activeSubTab === "seguimientos" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              value={filtroTextoSeguimiento}
              onChange={(e) => {
                setFiltroTextoSeguimiento(e.target.value);
                setPaginaSeguimiento(1);
              }}
              placeholder="Nombre, código o documento"
              className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
            />
            <select
              value={filtroEstadoSeg}
              onChange={(e) => {
                setFiltroEstadoSeg(e.target.value);
                setPaginaSeguimiento(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="completado">Completado</option>
            </select>
            {(filtroTextoSeguimiento || filtroEstadoSeg) && (
              <button
                type="button"
                onClick={() => {
                  setFiltroTextoSeguimiento("");
                  setFiltroEstadoSeg("");
                  setPaginaSeguimiento(1);
                }}
                className="md:col-span-3 text-xs font-semibold text-blue-700 text-left"
              >
                Limpiar
              </button>
            )}
          </div>

          {seguimientosVisibles.map((s) => {
            const isPendiente = s.estado_pendiente === "pendiente";
            return (
              <div
                key={s.id}
                className={`bg-white rounded-2xl border p-4 shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isPendiente
                    ? "border-amber-200 bg-amber-50/20"
                    : "border-slate-200"
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">
                      {s.fecha || "Sin fecha"}
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      {s.beneficiario_nombre || "Sin nombre"}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isPendiente
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {isPendiente ? "Pendiente Activo" : "Completado"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">
                    <strong>Avance / Novedad:</strong>{" "}
                    {s.avance_novedad || "Sin detalle"}
                  </p>
                  {s.accion_pendiente && (
                    <p className="text-xs text-amber-900">
                      <strong>Compromiso:</strong> {s.accion_pendiente}
                      {s.proximo_contacto ? ` · ${s.proximo_contacto}` : ""}
                    </p>
                  )}
                </div>
                <div className="shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleSeguimiento(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      isPendiente
                        ? "bg-amber-100 hover:bg-emerald-600 hover:text-white text-amber-800"
                        : "bg-slate-100 hover:bg-amber-100 text-slate-600"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isPendiente
                      ? "Marcar como Completado"
                      : "Reabrir como Pendiente"}
                  </button>
                </div>
              </div>
            );
          })}

          <Paginador
            pagina={paginaSeguimientoSegura}
            total={seguimientosFiltrados.length}
            porPagina={POR_PAGINA}
            onChange={setPaginaSeguimiento}
          />
        </div>
      )}

      {showAtencionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800">
                  Registrar Atención o Ayuda Entregada
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAtencionModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAtencion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Beneficiario Receptor *
                </label>
                <select
                  value={formAtencion.beneficiario_id}
                  required
                  onChange={(e) =>
                    setFormAtencion({
                      ...formAtencion,
                      beneficiario_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Seleccionar Persona --</option>
                  {beneficiarios.map((b) => (
                    <option
                      key={b.id_beneficiario || b.id}
                      value={b.id_beneficiario || b.id}
                    >
                      {b.codigo_interno} - {b.nombres} {b.apellidos}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha Entrega
                  </label>
                  <input
                    type="date"
                    required
                    min="1900-01-01"
                    max="2100-12-31"
                    value={formAtencion.fecha}
                    onChange={(e) => {
                      const val = fechaValida(e.target.value);
                      if (val === null) return;
                      setFormAtencion({ ...formAtencion, fecha: val });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Línea de Intervención
                  </label>
                  <select
                    value={formAtencion.linea_trabajo}
                    onChange={(e) =>
                      setFormAtencion({
                        ...formAtencion,
                        linea_trabajo: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Asistencia humanitaria y protección">
                      Asistencia Humanitaria
                    </option>
                    <option value="Salud y bienestar">Salud y Bienestar</option>
                    <option value="Integración socioeconómica y cohesión social">
                      Integración Socioeconómica
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Ayuda / Servicio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Entrega de Kit de Higiene Familiar"
                  value={formAtencion.tipo_atencion}
                  onChange={(e) =>
                    setFormAtencion({
                      ...formAtencion,
                      tipo_atencion: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsable
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre del funcionario"
                    value={formAtencion.responsable}
                    onChange={(e) =>
                      setFormAtencion({
                        ...formAtencion,
                        responsable: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Entidad Ejecutora
                  </label>
                  <select
                    value={formAtencion.entidad}
                    onChange={(e) =>
                      setFormAtencion({
                        ...formAtencion,
                        entidad: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="COOPI">COOPI</option>
                    <option value="Fundación HIAS Colombia">
                      Fundación HIAS
                    </option>
                    <option value="Fondazione L'Albero della Vita (FADV)">
                      FADV
                    </option>
                    <option value="Humanity and Inclusion (HI)">HI</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción Breve de lo Entregado *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Detallar lo que se entregó o realizó..."
                  value={formAtencion.descripcion}
                  onChange={(e) =>
                    setFormAtencion({
                      ...formAtencion,
                      descripcion: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Resultado
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Firma de recibo a satisfacción"
                    value={formAtencion.resultado}
                    onChange={(e) =>
                      setFormAtencion({
                        ...formAtencion,
                        resultado: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Remisión (Si aplica)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Remitida a HIAS / Hospital"
                    value={formAtencion.remision}
                    onChange={(e) =>
                      setFormAtencion({
                        ...formAtencion,
                        remision: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAtencionModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  {submitting ? "Guardando..." : "Guardar Atención"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSeguimientoModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800">
                  Añadir Seguimiento (Avance y Pendiente)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSeguimientoModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSeguimiento} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Beneficiario *
                </label>
                <select
                  value={formSeguimiento.beneficiario_id}
                  required
                  onChange={(e) =>
                    setFormSeguimiento({
                      ...formSeguimiento,
                      beneficiario_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Seleccionar Persona --</option>
                  {beneficiarios.map((b) => (
                    <option
                      key={b.id_beneficiario || b.id}
                      value={b.id_beneficiario || b.id}
                    >
                      {b.codigo_interno} - {b.nombres} {b.apellidos}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha Registro
                  </label>
                  <input
                    type="date"
                    required
                    min="1900-01-01"
                    max="2100-12-31"
                    value={formSeguimiento.fecha}
                    onChange={(e) => {
                      const val = fechaValida(e.target.value);
                      if (val === null) return;
                      setFormSeguimiento({ ...formSeguimiento, fecha: val });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Próximo Contacto
                  </label>
                  <input
                    type="date"
                    min="1900-01-01"
                    max="2100-12-31"
                    value={formSeguimiento.proximo_contacto}
                    onChange={(e) => {
                      const val = fechaValida(e.target.value);
                      if (val === null) return;
                      setFormSeguimiento({
                        ...formSeguimiento,
                        proximo_contacto: val,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Avance, Cambio o Novedad (Lo que cambió) *
                </label>
                <textarea
                  rows="2"
                  required
                  placeholder="Describa el cambio observado en las condiciones o avances del proceso..."
                  value={formSeguimiento.avance_novedad}
                  onChange={(e) =>
                    setFormSeguimiento({
                      ...formSeguimiento,
                      avance_novedad: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Acción Pendiente (Compromiso a gestionar) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cita de control o entrega de certificación"
                  value={formSeguimiento.accion_pendiente}
                  onChange={(e) =>
                    setFormSeguimiento({
                      ...formSeguimiento,
                      accion_pendiente: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observaciones Generales
                </label>
                <input
                  type="text"
                  placeholder="Detalles adicionales del entorno familiar..."
                  value={formSeguimiento.observaciones}
                  onChange={(e) =>
                    setFormSeguimiento({
                      ...formSeguimiento,
                      observaciones: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSeguimientoModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  {submitting ? "Guardando..." : "Guardar Seguimiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white px-8 py-9 text-center shadow-2xl">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h3 className="mt-5 text-xl font-bold text-slate-900">
              Información almacenada con éxito
            </h3>
            <button
              type="button"
              onClick={() => setSuccessMsg(null)}
              className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
