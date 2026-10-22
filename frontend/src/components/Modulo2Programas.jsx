import { useState, useEffect } from "react";
import { Link2, CheckCircle2, Building2, UserCheck, X } from "lucide-react";
import Paginador from "./paginador";
import { api } from "../services/api";

const POR_PAGINA = 10;

function fechaValida(valor) {
  if (!valor) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const anio = Number(valor.slice(0, 4));
  if (anio < 1900 || anio > 2100) return null;
  return valor;
}

export default function Modulo2Programas({
  selectedBeneficiarioId,
  abrirVinculacion,
  onVinculacionAbierta,
}) {
  const [programas, setProgramas] = useState([]);
  const [vinculaciones, setVinculaciones] = useState([]);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [filtroSexo, setFiltroSexo] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroPrograma, setFiltroPrograma] = useState("");
  const [filtroLinea, setFiltroLinea] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const [formData, setFormData] = useState({
    beneficiario_id: selectedBeneficiarioId || "",
    programa_id: "PROG-01",
    fecha_vinculacion: new Date().toISOString().split("T")[0],
    estado: "inscrito",
    observaciones: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, vRes] = await Promise.all([
        api.getProgramas(),
        api.getVinculaciones(),
      ]);
      const listaProgramas = pRes.data || [];
      setProgramas(listaProgramas);
      setVinculaciones(vRes.data || []);
      setFormData((prev) => ({
        ...prev,
        beneficiario_id: selectedBeneficiarioId
          ? String(selectedBeneficiarioId)
          : prev.beneficiario_id,
        programa_id: listaProgramas.some(
          (p) => String(p.id_programa || p.id) === String(prev.programa_id),
        )
          ? prev.programa_id
          : String(
              listaProgramas[0]?.id_programa || listaProgramas[0]?.id || "",
            ),
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBeneficiarioId]);

  useEffect(() => {
    if (!abrirVinculacion) return;
    setShowModal(true);
    onVinculacionAbierta?.();
  }, [abrirVinculacion]);

  useEffect(() => {
    if (!selectedBeneficiarioId) return;
    api
      .getFichaConsolidada(selectedBeneficiarioId)
      .then((res) => {
        if (res?.data) {
          setBeneficiarios([res.data]);
          setFormData((prev) => ({
            ...prev,
            beneficiario_id: String(res.data.id || res.data.id_beneficiario),
          }));
        }
      })
      .catch(console.error);
  }, [selectedBeneficiarioId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.beneficiario_id) {
      alert("Seleccione un beneficiario.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.vincularBeneficiario({
        id_beneficiario: formData.beneficiario_id,
        id_programa: formData.programa_id,
        fecha_vinculacion: formData.fecha_vinculacion,
        estado: formData.estado,
      });
      if (res.success) {
        setSuccessMsg("¡Beneficiario vinculado exitosamente al programa!");
        setShowModal(false);
        setFormData({
          beneficiario_id: "",
          programa_id: "PROG-01",
          fecha_vinculacion: new Date().toISOString().split("T")[0],
          estado: "inscrito",
          observaciones: "",
        });
        await loadData();
      }
    } catch (err) {
      alert(err.message || "Error al vincular programa");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEstado = async (vincId, nuevoEstado) => {
    try {
      await api.updateEstadoVinculacion(vincId, { estado: nuevoEstado });
      await loadData();
    } catch (err) {
      alert(err.message || "Error al actualizar estado");
    }
  };

  const limpiarFiltros = () => {
    setFiltroTexto("");
    setFiltroPrograma("");
    setFiltroLinea("");
    setFiltroEstado("");
    setFiltroSexo("");
    setPagina(1);
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "inscrito":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
            Inscrito
          </span>
        );
      case "en proceso":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            En Proceso
          </span>
        );
      case "finalizado":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Finalizado
          </span>
        );
      case "retirado":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            Retirado
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            {estado}
          </span>
        );
    }
  };

  const programasUnicos = [
    ...new Set(vinculaciones.map((v) => v.programa_nombre).filter(Boolean)),
  ];
  const lineasUnicas = [
    ...new Set(
      vinculaciones
        .map((v) => v.linea_nombre || v.linea_trabajo)
        .filter(Boolean),
    ),
  ];

  const q = filtroTexto.trim().toLowerCase();
  const vinculacionesFiltradas = vinculaciones.filter((v) => {
    const texto =
      `${v.beneficiario_nombre || ""} ${v.codigo_interno || ""} ${v.documento || ""}`.toLowerCase();
    const linea = v.linea_nombre || v.linea_trabajo || "";
    const sexo = (v.sexo || "").toLowerCase().trim();

    // Normaliza variantes: mujer/femenino, hombre/masculino
    const sexoCoincide =
      !filtroSexo ||
      (filtroSexo === "femenino"
        ? sexo === "femenino" || sexo === "mujer" || sexo === "f"
        : filtroSexo === "masculino"
          ? sexo === "masculino" || sexo === "hombre" || sexo === "m"
          : sexo === filtroSexo);

    return (
      (!q || texto.includes(q)) &&
      (!filtroPrograma || v.programa_nombre === filtroPrograma) &&
      (!filtroLinea || linea === filtroLinea) &&
      (!filtroEstado || (v.estado || "inscrito") === filtroEstado) &&
      sexoCoincide
    );
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(vinculacionesFiltradas.length / POR_PAGINA),
  );
  const paginaSegura = Math.min(pagina, totalPaginas);
  const visibles = vinculacionesFiltradas.slice(
    (paginaSegura - 1) * POR_PAGINA,
    paginaSegura * POR_PAGINA,
  );
  const hayFiltro = Boolean(
    q || filtroPrograma || filtroLinea || filtroEstado || filtroSexo,
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-600 text-white">
              Módulo 2
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              Programas y Vinculación
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Permite articular al beneficiario con las{" "}
            <strong>3 líneas de intervención</strong> (Humanitaria,
            Salud/Bienestar e Integración Socioeconómica) y monitorear su
            estado: <em>inscrito, en proceso, finalizado o retirado</em>.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all text-sm shrink-0"
        >
          <Link2 className="w-4 h-4" />
          Nueva Vinculación
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div>
        <h3 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-3">
          Oferta de Programas URABÁ PAÍS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {programas.map((prog) => {
            const countInscritos = vinculaciones.filter(
              (v) => v.programa_id === prog.id,
            ).length;
            return (
              <div
                key={prog.id_programa || prog.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {prog.codigo}
                    </span>
                    <span className="text-xs font-semibold text-sky-600 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />{" "}
                      {prog.organizacion_lider}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">
                    {prog.nombre}
                  </h4>
                  <div className="text-[11px] font-semibold text-slate-500 mb-2">
                    {prog.linea_trabajo}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {prog.descripcion}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Participantes activos:</span>
                  <span className="font-bold text-slate-800 bg-sky-50 px-2 py-0.5 rounded-full">
                    {countInscritos} vinculados
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800 text-sm">
              Registro de Vinculaciones Activas ({vinculacionesFiltradas.length}{" "}
              de {vinculaciones.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Un beneficiario puede estar en varios programas
          </span>
        </div>

        <div className="p-4 border-b border-slate-100 grid grid-cols-1 md:grid-cols-6 gap-2">
          <input
            value={filtroTexto}
            onChange={(e) => {
              setFiltroTexto(e.target.value);
              setPagina(1);
            }}
            placeholder="Nombre, código o documento"
            className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
          <select
            value={filtroPrograma}
            onChange={(e) => {
              setFiltroPrograma(e.target.value);
              setPagina(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
          >
            <option value="">Programas</option>
            {programasUnicos.map((nombre) => (
              <option key={nombre} value={nombre}>
                {nombre}
              </option>
            ))}
          </select>
          <select
            value={filtroLinea}
            onChange={(e) => {
              setFiltroLinea(e.target.value);
              setPagina(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
          >
            <option value="">Líneas</option>
            {lineasUnicas.map((nombre) => (
              <option key={nombre} value={nombre}>
                {nombre}
              </option>
            ))}
          </select>
          <select
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value);
              setPagina(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
          >
            <option value="">Estados</option>
            <option value="inscrito">Inscrito</option>
            <option value="en proceso">En proceso</option>
            <option value="finalizado">Finalizado</option>
            <option value="retirado">Retirado</option>
          </select>
          <select
            value={filtroSexo}
            onChange={(e) => {
              setFiltroSexo(e.target.value);
              setPagina(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
          >
            <option value="">Sexo</option>
            <option value="femenino">Femenino</option>
            <option value="masculino">Masculino</option>
          </select>
          {hayFiltro && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="md:col-span-6 text-xs font-semibold text-blue-700 text-left"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {vinculaciones.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No hay vinculaciones registradas aún.
          </div>
        ) : vinculacionesFiltradas.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Ninguna vinculación coincide con el filtro.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Beneficiario</th>
                    <th className="px-4 py-3">Programa</th>
                    <th className="px-4 py-3">Línea de Intervención</th>
                    <th className="px-4 py-3">Fecha Vinculación</th>
                    <th className="px-4 py-3">Estado de Participación</th>
                    <th className="px-4 py-3 text-right">Actualizar Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibles.map((v) => (
                    <tr
                      key={v.id_participacion || v.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {v.beneficiario_nombre || "Sin nombre"}
                        </div>
                        <div className="font-mono text-xs text-sky-700">
                          {v.codigo_interno}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-slate-800">
                        {v.programa_nombre}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">
                        {v.linea_nombre || v.linea_trabajo}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono text-slate-600">
                        {String(v.fecha_vinculacion || "").slice(0, 10)}
                      </td>
                      <td className="px-4 py-3.5">
                        {getEstadoBadge(v.estado)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <select
                          value={v.estado || "inscrito"}
                          onChange={(e) =>
                            handleUpdateEstado(
                              v.id_participacion || v.id,
                              e.target.value,
                            )
                          }
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white font-medium text-slate-700 focus:ring-1 focus:ring-sky-500 cursor-pointer"
                        >
                          <option value="inscrito">Inscrito</option>
                          <option value="en proceso">En Proceso</option>
                          <option value="finalizado">Finalizado</option>
                          <option value="retirado">Retirado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paginador
              pagina={paginaSegura}
              total={vinculacionesFiltradas.length}
              porPagina={POR_PAGINA}
              onChange={setPagina}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800">
                  Vincular Beneficiario a Programa
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Beneficiario *
                </label>
                <select
                  value={formData.beneficiario_id}
                  required
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      beneficiario_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">-- Seleccionar Persona Registrada --</option>
                  {beneficiarios.map((b) => {
                    const id = b.id || b.id_beneficiario;
                    const nombre =
                      b.nombre ||
                      `${b.nombres || ""} ${b.apellidos || ""}`.trim();
                    return (
                      <option key={id} value={id}>
                        {b.codigo_interno || id} - {nombre} (
                        {b.numero_documento || b.documento || "Sin doc"})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Programa / Proyecto *
                </label>
                <select
                  value={formData.programa_id}
                  onChange={(e) =>
                    setFormData({ ...formData, programa_id: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                >
                  {programas.map((p) => {
                    const id = p.id_programa || p.id;
                    return (
                      <option key={id} value={id}>
                        {p.nombre} ({p.linea_nombre || "Sin línea"})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha Vinculación
                  </label>
                  <input
                    type="date"
                    required
                    min="1900-01-01"
                    max="2100-12-31"
                    value={formData.fecha_vinculacion}
                    onChange={(e) => {
                      const val = fechaValida(e.target.value);
                      if (val === null) return;
                      setFormData({ ...formData, fecha_vinculacion: val });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({ ...formData, estado: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="inscrito">Inscrito</option>
                    <option value="en proceso">En Proceso</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="retirado">Retirado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observaciones de Ingreso
                </label>
                <textarea
                  rows="2"
                  placeholder="Detalles sobre el motivo o ruta de ingreso..."
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData({ ...formData, observaciones: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  {submitting ? "Vinculando..." : "Confirmar Vinculación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
