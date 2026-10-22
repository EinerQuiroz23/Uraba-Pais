import React, { useState, useEffect } from "react";
import {
  FileText,
  Users,
  FolderGit2,
  HeartHandshake,
  Clock,
  MapPin,
  Phone,
  Calendar,
  Printer,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  User,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { api } from "../services/api";

export default function Modulo4Ficha360({
  beneficiarioId,
  onBack,
  onQuickAction,
  soloLectura = false,
  esBeneficiario = false,
  abrirEdicion = false,
  camposFaltantes = [],
  onEdicionAbierta,
}) {
  const [currentId, setCurrentId] = useState(
    beneficiarioId && !Number.isNaN(Number(beneficiarioId))
      ? beneficiarioId
      : null,
  );
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [beneficiariosList, setBeneficiariosList] = useState([]);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    municipio: "",
    direccion_comunidad: "",
    edad: "",
    genero: "",
    tipo_documento: "",
    numero_documento: "",
    zona: "",
  });

  // Puede editar datos personales (funcionario/admin y también el beneficiario de su ficha)
  const puedeEditarDatos = !soloLectura || esBeneficiario;
  // Acciones de staff (vincular, atención, seguimiento): solo si NO es beneficiario
  const esStaff = !esBeneficiario && !soloLectura;

  const esFaltante = (...nombres) => {
    if (!camposFaltantes || !camposFaltantes.length) return false;
    const lista = camposFaltantes.map((c) =>
      String(c)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""),
    );
    return nombres.some((n) =>
      lista.includes(
        String(n)
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""),
      ),
    );
  };

  const claseInput = (faltante) =>
    `w-full rounded-xl border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-400 ${
      faltante
        ? "border-amber-400 ring-2 ring-amber-200 bg-amber-50"
        : "border-slate-200"
    }`;

  useEffect(() => {
    if (beneficiarioId) {
      setCurrentId(beneficiarioId);
    }
  }, [beneficiarioId]);

  useEffect(() => {
    // Solo staff carga lista para cambiar de beneficiario
    if (esBeneficiario || soloLectura) return;
    const fetchList = async () => {
      try {
        const res = await api.getBeneficiarios();
        if (res.data) setBeneficiariosList(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchList();
  }, [esBeneficiario, soloLectura]);

  const cargarFicha = async (id) => {
    if (!id || Number.isNaN(Number(id))) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.getFichaConsolidada(id);
      if (res.success) {
        setFicha(res.data);
        setForm({
          nombres: res.data.nombres || "",
          apellidos: res.data.apellidos || "",
          telefono: res.data.telefono || "",
          municipio: res.data.municipio || "",
          direccion_comunidad: res.data.direccion_comunidad || "",
          edad: res.data.edad != null ? String(res.data.edad) : "",
          genero: res.data.genero || res.data.sexo || "",
          tipo_documento: res.data.tipo_documento || "",
          numero_documento:
            res.data.numero_documento || res.data.documento || "",
          zona: res.data.zona || "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFicha(currentId);
  }, [currentId]);

  // Al llegar desde notificación DATOS_INCOMPLETOS → abrir formulario de edición
  useEffect(() => {
    if (abrirEdicion && puedeEditarDatos && currentId) {
      setEditando(true);
      setMensaje({
        tipo: "ok",
        texto:
          camposFaltantes && camposFaltantes.length
            ? `Completa los campos faltantes: ${camposFaltantes.join(", ")}.`
            : "Completa los datos faltantes del beneficiario.",
      });
      if (onEdicionAbierta) onEdicionAbierta();
    }
  }, [abrirEdicion, currentId, puedeEditarDatos]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!currentId) return;
    setGuardando(true);
    setMensaje(null);
    try {
      const payload = {
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        nombre: `${form.nombres.trim()} ${form.apellidos.trim()}`.trim(),
        telefono: form.telefono.trim() || null,
        municipio: form.municipio.trim() || null,
        direccion_comunidad: form.direccion_comunidad.trim() || null,
        genero: form.genero || null,
        sexo: form.genero || null,
        tipo_documento: form.tipo_documento || null,
        documento: form.numero_documento.trim() || null,
        numero_documento: form.numero_documento.trim() || null,
        zona: form.zona.trim() || null,
        // edad NO se envía: es fija / calculada al crear
      };
      const res = await api.updateBeneficiario(currentId, payload);
      if (res.success || res.data) {
        setMensaje({ tipo: "ok", texto: "Datos actualizados correctamente." });
        setEditando(false);
        await cargarFicha(currentId);
        try {
          await api.generarNotificaciones();
        } catch (_) {
          /* el auto-refresh de la campana lo hará en ≤20s */
        }
      } else {
        setMensaje({
          tipo: "error",
          texto: res.message || "No se pudo guardar.",
        });
      }
    } catch (err) {
      console.error(err);
      setMensaje({
        tipo: "error",
        texto: err.message || "Error al guardar los datos.",
      });
    } finally {
      setGuardando(false);
    }
  };
  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center text-slate-500 shadow-sm border border-slate-200">
        <p className="animate-pulse font-medium">
          Cargando Ficha Consolidada 360°...
        </p>
      </div>
    );
  }

  if (!ficha) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center text-slate-500 shadow-sm border border-slate-200">
        <p className="font-medium">
          Seleccione un beneficiario para visualizar su ficha consolidada.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700"
          >
            Volver al listado
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra superior: solo staff ve volver + cambiar beneficiario */}
      {esStaff && (
        <div className="flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Volver a Beneficiarios
              </button>
            )}

            {beneficiariosList.length > 0 && (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm text-xs">
                <span className="text-slate-400 font-medium">Cambiar a:</span>
                <select
                  value={currentId}
                  onChange={(e) => setCurrentId(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
                >
                  {beneficiariosList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.codigo_interno} - {b.nombres} {b.apellidos}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" /> Imprimir Ficha /
              PDF
            </button>
          </div>
        </div>
      )}

      {/* Mensaje de éxito / error */}
      {mensaje && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium border no-print ${
            mensaje.tipo === "ok"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {/* TARJETA PRINCIPAL DEL BENEFICIARIO */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-lg bg-sky-100 text-sky-800 border border-sky-200">
                {ficha.codigo_interno}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {ficha.condicion_poblacional}
              </span>
              {puedeEditarDatos && !editando && (
                <button
                  type="button"
                  onClick={() => {
                    setEditando(true);
                    setMensaje(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-lg no-print"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar datos
                </button>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900">
              {ficha.nombres} {ficha.apellidos}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {ficha.tipo_documento === "SIN_DOCUMENTO" ||
              !ficha.numero_documento
                ? "Persona sin documento de identidad"
                : `${ficha.tipo_documento}: ${ficha.numero_documento}`}
            </p>
          </div>

          {/* Métricas rápidas */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center min-w-[90px]">
              <span className="block text-2xl font-black text-blue-600">
                {ficha.resumen?.total_programas || 0}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Programas
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center min-w-[90px]">
              <span className="block text-2xl font-black text-emerald-600">
                {ficha.resumen?.total_atenciones || 0}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Atenciones
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center min-w-[90px]">
              <span className="block text-2xl font-black text-amber-600">
                {ficha.resumen?.seguimientos_pendientes || 0}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Pendientes
              </span>
            </div>
          </div>
        </div>

        {/* Formulario de edición */}
        {editando && puedeEditarDatos ? (
          <form
            onSubmit={handleGuardar}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 no-print bg-slate-50/80 border border-slate-200 rounded-2xl p-4"
          >
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Nombres
              </label>
              <input
                type="text"
                required
                value={form.nombres}
                onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                className={claseInput(false)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Apellidos
              </label>
              <input
                type="text"
                required
                value={form.apellidos}
                onChange={(e) =>
                  setForm({ ...form, apellidos: e.target.value })
                }
                className={claseInput(false)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Teléfono
                {esFaltante("telefono", "teléfono") && (
                  <span className="ml-1 text-amber-600 font-bold">· Falta</span>
                )}
              </label>
              <input
                typy="text"
                maxLength="11"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className={claseInput(esFaltante("telefono", "teléfono"))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Municipio
              </label>
              <input
                type="text"
                value={form.municipio}
                onChange={(e) =>
                  setForm({ ...form, municipio: e.target.value })
                }
                className={claseInput(false)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Comunidad / Vereda
              </label>
              <input
                type="text"
                value={form.direccion_comunidad}
                onChange={(e) =>
                  setForm({ ...form, direccion_comunidad: e.target.value })
                }
                className={claseInput(false)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Zona
                {esFaltante("zona") && (
                  <span className="ml-1 text-amber-600 font-bold">· Falta</span>
                )}
              </label>
              <select
                value={form.zona}
                onChange={(e) => setForm({ ...form, zona: e.target.value })}
                className={claseInput(esFaltante("zona"))}
              >
                <option value="">—</option>
                <option value="Urbana">Urbana</option>
                <option value="Rural">Rural</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Edad
                <span className="ml-1 text-slate-400 font-normal">
                  (fija · calculada al registro)
                </span>
              </label>
              <input
                type="text"
                readOnly
                value={
                  form.edad !== "" && form.edad != null
                    ? `${form.edad} años`
                    : "No registrada"
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Género / Sexo
                {esFaltante("sexo", "genero", "género") && (
                  <span className="ml-1 text-amber-600 font-bold">· Falta</span>
                )}
              </label>
              <select
                value={form.genero}
                onChange={(e) => setForm({ ...form, genero: e.target.value })}
                className={claseInput(esFaltante("sexo", "genero", "género"))}
              >
                <option value="">—</option>
                <option value="Mujer">Mujer</option>
                <option value="Hombre">Hombre</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Tipo documento
              </label>
              <select
                value={form.tipo_documento}
                onChange={(e) =>
                  setForm({ ...form, tipo_documento: e.target.value })
                }
                className={claseInput(false)}
              >
                <option value="">—</option>
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
                <option value="PPT">PPT</option>
                <option value="SIN_DOCUMENTO">Sin documento</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Número documento
                {esFaltante("documento") && (
                  <span className="ml-1 text-amber-600 font-bold">· Falta</span>
                )}
              </label>
              <input
                type="text"
                value={form.numero_documento}
                onChange={(e) =>
                  setForm({ ...form, numero_documento: e.target.value })
                }
                disabled={form.tipo_documento === "SIN_DOCUMENTO"}
                className={`${claseInput(esFaltante("documento"))} disabled:bg-slate-100`}
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={guardando}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-sm disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditando(false);
                  setMensaje(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-sm font-bold border border-slate-200"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          /* Datos Sociodemográficos (vista) */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">
                Municipio Urabá
              </span>
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-sky-500" />{" "}
                {ficha.municipio}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">
                Comunidad / Vereda
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block truncate">
                {ficha.direccion_comunidad || "No especificada"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">
                Edad / Género
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {ficha.edad ? `${ficha.edad} años` : "N/D"} · {ficha.genero}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">
                Teléfono Contacto
              </span>
              <span className="font-semibold text-slate-800 text-sm flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />{" "}
                {ficha.telefono || "Sin teléfono"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN NÚCLEO FAMILIAR */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-base">
              Núcleo Familiar ({ficha.familiares ? ficha.familiares.length : 0})
            </h3>
          </div>
        </div>

        {!ficha.familiares || ficha.familiares.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No se han registrado familiares para este beneficiario.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {ficha.familiares.map((fam, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs space-y-1"
              >
                <div className="font-bold text-slate-900 text-sm">
                  {fam.nombres}
                </div>
                <div className="text-indigo-700 font-semibold">
                  {fam.parentesco} ·{" "}
                  {fam.edad ? `${fam.edad} años` : "Edad no reg."}
                </div>
                {fam.documento && (
                  <div className="text-slate-500">Doc: {fam.documento}</div>
                )}
                {fam.observaciones && (
                  <div className="text-slate-400 italic text-[11px]">
                    {fam.observaciones}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DOS COLUMNAS: PROGRAMAS Y ATENCIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PROGRAMAS VINCULADOS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-base">
                Programas Vinculados
              </h3>
            </div>
            {esStaff && (
              <button
                onClick={() =>
                  onQuickAction && onQuickAction("vincular", ficha)
                }
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 no-print"
              >
                + Vincular a otro
              </button>
            )}
          </div>

          {!ficha.vinculaciones || ficha.vinculaciones.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No se encuentra vinculado a ningún programa todavía.
            </p>
          ) : (
            <div className="space-y-3">
              {ficha.vinculaciones.map((v) => (
                <div
                  key={v.id}
                  className="border border-slate-100 bg-slate-50/60 rounded-2xl p-4 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      {v.programa_nombre}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                        v.estado === "inscrito"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : v.estado === "en proceso"
                            ? "bg-sky-100 text-sky-800 border-sky-200"
                            : v.estado === "finalizado"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-rose-100 text-rose-800 border-rose-200"
                      }`}
                    >
                      {v.estado}
                    </span>
                  </div>
                  <div className="text-slate-500">{v.linea_trabajo}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50">
                    <span>Fecha vinculación: {v.fecha_vinculacion}</span>
                    {v.observaciones && <span>Obs: {v.observaciones}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HISTORIAL DE ATENCIONES */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-base">
                Atenciones y Ayudas Recibidas
              </h3>
            </div>
            {esStaff && (
              <button
                onClick={() =>
                  onQuickAction && onQuickAction("atencion", ficha)
                }
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 no-print"
              >
                + Nueva Atención
              </button>
            )}
          </div>

          {!ficha.atenciones || ficha.atenciones.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No registra atenciones ni ayudas recibidas hasta el momento.
            </p>
          ) : (
            <div className="space-y-3">
              {ficha.atenciones.map((a) => (
                <div
                  key={a.id}
                  className="border border-slate-100 bg-slate-50/60 rounded-2xl p-4 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">
                      {a.tipo_atencion}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {a.fecha}
                    </span>
                  </div>
                  <p className="text-slate-700">{a.descripcion}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1 border-t border-slate-200/50">
                    <span className="text-slate-500">
                      <strong>Responsable:</strong>{" "}
                      {a.responsable || "Sin responsable"}
                      {a.entidad ? ` (${a.entidad})` : ""}
                    </span>
                    <span className="text-emerald-700 font-medium">
                      <strong>Resultado:</strong>{" "}
                      {a.resultado || "Sin resultado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SEGUIMIENTOS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-base">
              Seguimientos y Acciones Pendientes
            </h3>
          </div>
          {esStaff && (
            <button
              onClick={() =>
                onQuickAction && onQuickAction("seguimiento", ficha)
              }
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 no-print"
            >
              + Añadir Seguimiento
            </button>
          )}
        </div>

        {!ficha.seguimientos || ficha.seguimientos.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No registra seguimientos ingresados aún.
          </p>
        ) : (
          <div className="relative pl-6 border-l-2 border-teal-200 space-y-5">
            {ficha.seguimientos.map((s) => (
              <div key={s.id} className="relative group">
                <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-teal-500 ring-4 ring-white"></span>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-400">{s.fecha}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        s.estado_pendiente === "pendiente"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {s.estado_pendiente === "pendiente"
                        ? "Acción Pendiente Activa"
                        : "Completado"}
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium">
                    <strong>Avance / Cambio:</strong> {s.avance_novedad}
                  </p>

                  {s.accion_pendiente && (
                    <div className="bg-white border border-amber-200 text-amber-900 p-2.5 rounded-xl font-medium flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Compromiso: {s.accion_pendiente}</span>
                      </div>
                      {s.proximo_contacto && (
                        <span className="text-[11px] font-mono font-bold text-amber-700">
                          Fecha contacto: {s.proximo_contacto}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
