import React, { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Users,
  ShieldAlert,
  ArrowRight,
  FileText,
  Phone,
  MapPin,
  Calendar,
  X,
  Plus,
} from "lucide-react";
import { api } from "../services/api";

function fechaValida(valor) {
  if (!valor) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const anio = Number(valor.slice(0, 4));
  if (anio < 1900 || anio > 2100) return null;
  return valor;
}

export default function Modulo1Beneficiarios({
  onSelectBeneficiario,
  onStartEnrollment,
  soloBusqueda = false,
}) {
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMunicipio, setFilterMunicipio] = useState("Todos");
  const [filterCondicion, setFilterCondicion] = useState("Todas");

  // Modal / Formulario
  const [showModal, setShowModal] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form State
  const initialFormState = {
    nombres: "",
    apellidos: "",
    tipo_documento: "CC",
    numero_documento: "",
    fecha_nacimiento: "",
    edad: "",
    genero: "Femenino",
    telefono: "",
    municipio: "Apartadó",
    direccion_comunidad: "",
    condicion_poblacional: "Víctima del conflicto armado",
    discapacidad: "Ninguna",
    autorizacion_datos: false,
    familiares: [],
  };

  const [formData, setFormData] = useState(initialFormState);

  // Estado para agregar familiar temporal
  const [newFamiliar, setNewFamiliar] = useState({
    nombres: "",
    parentesco: "Hijo/a",
    edad: "",
    documento: "",
    observaciones: "",
  });

  const soloNumeros = (valor, max) => valor.replace(/\D/g, "").slice(0, max);
  const soloLetras = (valor) => valor.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "");

  const loadData = async (busqueda) => {
    setLoading(true);
    try {
      const res = await api.getBeneficiarios(
        `search=${encodeURIComponent(busqueda)}`,
      );
      setBeneficiarios(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 3) {
      setBeneficiarios([]);
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => loadData(q), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Validación anti-duplicados reactiva al escribir tipo o número de documento
  useEffect(() => {
    const checkDup = async () => {
      if (
        formData.numero_documento &&
        formData.numero_documento.trim().length >= 4 &&
        formData.tipo_documento !== "SIN_DOCUMENTO"
      ) {
        try {
          const res = await api.checkDuplicate({
            tipo_documento: formData.tipo_documento,
            numero_documento: formData.numero_documento,
          });
          if (res.isDuplicate) {
            setDuplicateWarning({
              type: "error",
              message: res.reason,
              existing: res.existingBeneficiary,
            });
          } else {
            setDuplicateWarning(null);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setDuplicateWarning(null);
      }
    };

    const timer = setTimeout(checkDup, 400);
    return () => clearTimeout(timer);
  }, [formData.tipo_documento, formData.numero_documento]);

  const handleAddFamiliar = () => {
    if (!newFamiliar.nombres.trim()) return;
    setFormData({
      ...formData,
      familiares: [
        ...formData.familiares,
        { ...newFamiliar, id: `temp-${Date.now()}` },
      ],
    });
    setNewFamiliar({
      nombres: "",
      parentesco: "Hijo/a",
      edad: "",
      documento: "",
      observaciones: "",
    });
  };

  const handleRemoveFamiliar = (index) => {
    setFormData({
      ...formData,
      familiares: formData.familiares.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.autorizacion_datos) {
      alert(
        "Obligatorio: Debe registrar la autorización para el tratamiento de datos personales.",
      );
      return;
    }

    if (duplicateWarning && duplicateWarning.type === "error") {
      alert(
        "Bloqueo por Regla Anti-Duplicados: Esta persona ya se encuentra registrada en el sistema.",
      );
      return;
    }

    // Payload compatible con backend PostgreSQL + schema nuevo
    const payload = {
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      nombre: `${formData.nombres} ${formData.apellidos}`.trim(),
      numero_documento: formData.numero_documento,
      documento: formData.numero_documento || null,
      telefono: formData.telefono,
      municipio: formData.municipio,
      tipo_documento: formData.tipo_documento,
      fecha_nacimiento: formData.fecha_nacimiento,
      edad:
        formData.edad !== "" && formData.edad != null
          ? Number(formData.edad)
          : null,
      genero: formData.genero,
      direccion_comunidad: formData.direccion_comunidad,
      condicion_poblacional: formData.condicion_poblacional,
      discapacidad: formData.discapacidad,
      autorizacion_datos: formData.autorizacion_datos,
      familiares: formData.familiares,
    };

    setSubmitting(true);
    try {
      const res = await api.createBeneficiario(payload);
      if (res.success) {
        const codigo =
          res.data?.codigo_interno ||
          (res.data?.id
            ? `URB-2026-${String(res.data.id).padStart(4, "0")}`
            : "—");
        setSuccessMessage(
          `Beneficiario creado exitosamente con Código Inmutable: ${codigo}`,
        );
        setShowModal(false);
        setFormData(initialFormState);
        setDuplicateWarning(null);
        await loadData();
        if (onSelectBeneficiario && res.data?.id) {
          onSelectBeneficiario(res.data.id);
        }
      } else {
        alert(
          res.message || res.errors?.[0] || "Error al registrar beneficiario",
        );
      }
    } catch (err) {
      alert(
        err.message || err.errors?.[0] || "Error al registrar beneficiario",
      );
    } finally {
      setSubmitting(false);
    }
  };
  // Filtrado
  const filteredBeneficiarios = beneficiarios.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (b.codigo_interno && b.codigo_interno.toLowerCase().includes(q)) ||
      (b.nombres && b.nombres.toLowerCase().includes(q)) ||
      (b.apellidos && b.apellidos.toLowerCase().includes(q)) ||
      (b.numero_documento && b.numero_documento.toLowerCase().includes(q));

    const matchMuni =
      filterMunicipio === "Todos" || b.municipio === filterMunicipio;
    const matchCond =
      filterCondicion === "Todas" ||
      b.condicion_poblacional === filterCondicion;

    return matchSearch && matchMuni && matchCond;
  });

  return (
    <div className="space-y-6">
      {/* Banner explicativo del módulo */}
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-sky-600 text-white">
              Módulo 1
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              Beneficiarios y Familias (Base Central)
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Garantiza la <strong>Regla de Beneficiario Único</strong> con código
            inmutable generado por el sistema y{" "}
            <strong>control anti-duplicados</strong> previo al registro.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData(initialFormState);
            setDuplicateWarning(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all text-sm shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Registrar Nuevo Beneficiario
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Barra de Búsqueda Previa y Filtros Territorial */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar por Código Inmutable, Cédula, PPT, Nombres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterMunicipio}
              onChange={(e) => setFilterMunicipio(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="Todos">Municipio: Todos</option>
              <option value="Apartadó">Apartadó</option>
              <option value="Turbo">Turbo</option>
              <option value="Necoclí">Necoclí</option>
              <option value="Carepa">Carepa</option>
              <option value="Chigorodó">Chigorodó</option>
              <option value="Mutatá">Mutatá</option>
              <option value="San Pedro de Urabá">San Pedro de Urabá</option>
              <option value="San Juan de Urabá">San Juan de Urabá</option>
              <option value="Arboletes">Arboletes</option>
              <option value="Murindó">Murindó</option>
              <option value="Vigía del Fuerte">Vigía del Fuerte</option>
            </select>

            <select
              value={filterCondicion}
              onChange={(e) => setFilterCondicion(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="Todas">Población: Todas</option>
              <option value="Víctima del conflicto armado">
                Víctima Conflicto
              </option>
              <option value="Migrante / Refugiada">Migrante / Refugiado</option>
              <option value="Comunidad de acogida">Comunidad de Acogida</option>
              <option value="Desplazado interno">Desplazado Interno</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Beneficiarios */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            <h3 className="font-semibold text-slate-800 text-sm">
              Beneficiarios Únicos Registrados ({filteredBeneficiarios.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            1 Registro Maestro por Persona (Regla Obligatoria)
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Cargando beneficiarios...
          </div>
        ) : searchQuery.trim().length < 3 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Escribe al menos 3 letras del nombre, la cédula o el código para ver
            una ficha.
          </div>
        ) : filteredBeneficiarios.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <p>
              No se encontraron beneficiarios con los criterios de búsqueda.
            </p>
            <p className="text-xs text-slate-500">
              ¿Es una persona nueva? Haz clic en "Registrar Nuevo Beneficiario".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Código Inmutable</th>
                  <th className="px-4 py-3">Nombres y Apellidos</th>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Municipio / Zona</th>
                  <th className="px-4 py-3">Enfoque Poblacional</th>
                  <th className="px-4 py-3">Núcleo Familiar</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBeneficiarios.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-sky-700">
                      {b.codigo_interno}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      <div>
                        {b.nombres} {b.apellidos}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{b.genero}</span>
                        <span>·</span>
                        <span>
                          {b.edad ? `${b.edad} años` : "Edad no reg."}
                        </span>
                        {b.discapacidad && b.discapacidad !== "Ninguna" && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium">
                            Discapacidad: {b.discapacidad}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      {b.tipo_documento === "SIN_DOCUMENTO" ||
                      !b.numero_documento ? (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium border border-amber-200">
                          Sin Documento
                        </span>
                      ) : (
                        <span className="font-medium text-slate-700">
                          {b.tipo_documento}: {b.numero_documento}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div className="flex items-center gap-1 font-medium text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-sky-500" />
                        {b.municipio}
                      </div>
                      <div className="text-slate-400 truncate max-w-[150px]">
                        {b.direccion_comunidad || "No especificada"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {b.condicion_poblacional}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {b.familiares ? b.familiares.length : 0} integrantes
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => onSelectBeneficiario(b.id)}
                        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Ficha 360°
                      </button>
                      <button
                        onClick={() => onStartEnrollment(b)}
                        className="inline-flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Vincular
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Registro con Validación Anti-Duplicados y Habeas Data */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-800">
                  Alta de Beneficiario y Núcleo Familiar
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Alerta si se detecta duplicado */}
              {duplicateWarning && (
                <div className="p-4 rounded-xl border bg-rose-50 border-rose-200 text-rose-800 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold">{duplicateWarning.message}</p>
                    <p>
                      Nombre registrado:{" "}
                      <strong>
                        {duplicateWarning.existing.nombres}{" "}
                        {duplicateWarning.existing.apellidos}
                      </strong>{" "}
                      (Código: {duplicateWarning.existing.codigo_interno})
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        onSelectBeneficiario(duplicateWarning.existing.id);
                      }}
                      className="mt-2 inline-flex items-center gap-1 font-semibold text-rose-700 underline hover:text-rose-900"
                    >
                      Abrir Ficha Existente Ahora{" "}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Datos de Identificación */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">
                  1. Identificación y Documento
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipo de Documento
                    </label>
                    <select
                      value={formData.tipo_documento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipo_documento: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="CC">Cédula de Ciudadanía (CC)</option>
                      <option value="TI">Tarjeta de Identidad (TI)</option>
                      <option value="PPT">
                        Permiso por Protección Temporal (PPT)
                      </option>
                      <option value="PEP">
                        Permiso Especial de Permanencia (PEP)
                      </option>
                      <option value="CE">Cédula de Extranjería (CE)</option>
                      <option value="SIN_DOCUMENTO">
                        Sin Documento (Inclusivo)
                      </option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Número de Documento{" "}
                      {formData.tipo_documento === "SIN_DOCUMENTO" &&
                        "(Opcional)"}
                    </label>
                    <input
                      type="text"
                      maxlength="10"
                      placeholder={
                        formData.tipo_documento === "SIN_DOCUMENTO"
                          ? "No aplica"
                          : "Ej: 1038472910"
                      }
                      disabled={formData.tipo_documento === "SIN_DOCUMENTO"}
                      value={formData.numero_documento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          numero_documento: soloNumeros(e.target.value, 10),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombres *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Yenifer Carolina"
                      value={formData.nombres}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nombres: soloLetras(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Apellidos
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Mendoza Silva"
                      value={formData.apellidos}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          apellidos: soloLetras(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fecha de nacimiento{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min="1900-01-01"
                      max={new Date().toISOString().slice(0, 10)}
                      value={formData.fecha_nacimiento}
                      onChange={(e) => {
                        const val = e.target.value;
                        let edad = "";
                        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                          const [y, m, d] = val.split("-").map(Number);
                          const hoy = new Date();
                          let eCalc = hoy.getFullYear() - y;
                          const mes = hoy.getMonth() + 1;
                          const dia = hoy.getDate();
                          if (mes < m || (mes === m && dia < d)) eCalc -= 1;
                          if (eCalc >= 0 && eCalc <= 150) edad = eCalc;
                        }
                        setFormData({
                          ...formData,
                          fecha_nacimiento: val,
                          edad,
                        });
                      }}
                      onBlur={(e) => {
                        const val = fechaValida(e.target.value);
                        if (val === null) {
                          setFormData({
                            ...formData,
                            fecha_nacimiento: "",
                            edad: "",
                          });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Edad
                      <span className="ml-1 text-slate-400 font-normal">
                        (automática)
                      </span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={
                        formData.edad !== "" && formData.edad != null
                          ? `${formData.edad} años`
                          : "Se calcula con la fecha"
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-600 cursor-not-allowed"
                      title="Se calcula automáticamente con la fecha de nacimiento"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Género
                    </label>
                    <select
                      value={formData.genero}
                      onChange={(e) =>
                        setFormData({ ...formData, genero: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="Femenino">Femenino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Otro / No binario">
                        Otro / No binario
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Datos Territoriales y Enfoque Inclusivo */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">
                  2. Contexto Territorial & Enfoque Inclusivo
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Municipio Urabá *
                    </label>
                    <select
                      value={formData.municipio}
                      onChange={(e) =>
                        setFormData({ ...formData, municipio: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="Apartadó">Apartadó</option>
                      <option value="Turbo">Turbo</option>
                      <option value="Necoclí">Necoclí</option>
                      <option value="Carepa">Carepa</option>
                      <option value="Chigorodó">Chigorodó</option>
                      <option value="Mutatá">Mutatá</option>
                      <option value="San Pedro de Urabá">
                        San Pedro de Urabá
                      </option>
                      <option value="San Juan de Urabá">
                        San Juan de Urabá
                      </option>
                      <option value="Arboletes">Arboletes</option>
                      <option value="Murindó">Murindó</option>
                      <option value="Vigía del Fuerte">Vigía del Fuerte</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Teléfono Contacto
                    </label>
                    <input
                      type="text"
                      maxlength="10"
                      placeholder="Ej: 3201478523"
                      value={formData.telefono}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          telefono: soloNumeros(e.target.value, 10),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Discapacidad
                    </label>
                    <select
                      value={formData.discapacidad}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discapacidad: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="Ninguna">Ninguna</option>
                      <option value="Física / Movilidad">
                        Física / Movilidad
                      </option>
                      <option value="Sensorial (Visual/Auditiva)">
                        Sensorial
                      </option>
                      <option value="Cognitiva / Intelectual">Cognitiva</option>
                      <option value="Múltiple">Múltiple</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Condición Poblacional
                    </label>
                    <select
                      value={formData.condicion_poblacional}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condicion_poblacional: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="Víctima del conflicto armado">
                        Víctima del conflicto armado
                      </option>
                      <option value="Migrante / Refugiada">
                        Migrante / Refugiada
                      </option>
                      <option value="Comunidad de acogida">
                        Comunidad de acogida
                      </option>
                      <option value="Desplazado interno">
                        Desplazado interno
                      </option>
                      <option value="Población Indígena / Afro">
                        Población Indígena / Afro
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Comunidad / Vereda / Barrio
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Sector El Muelle, Vereda..."
                      value={formData.direccion_comunidad}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          direccion_comunidad: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Registro de Núcleo Familiar */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">
                    3. Núcleo Familiar ({formData.familiares.length} agregados)
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Requisito mínimo: al menos 1 integrante en demo
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Nombre del familiar"
                      value={newFamiliar.nombres}
                      onChange={(e) =>
                        setNewFamiliar({
                          ...newFamiliar,
                          nombres: soloLetras(e.target.value),
                        })
                      }
                      className="sm:col-span-2 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <select
                      value={newFamiliar.parentesco}
                      onChange={(e) =>
                        setNewFamiliar({
                          ...newFamiliar,
                          parentesco: e.target.value,
                        })
                      }
                      className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                    >
                      <option value="Hijo/a">Hijo/a</option>
                      <option value="Cónyuge / Pareja">Cónyuge / Pareja</option>
                      <option value="Madre">Madre</option>
                      <option value="Padre">Padre</option>
                      <option value="Hermano/a">Hermano/a</option>
                      <option value="Otro">Otro</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Edad"
                      value={newFamiliar.edad}
                      onChange={(e) =>
                        setNewFamiliar({
                          ...newFamiliar,
                          edad: soloNumeros(e.target.value, 3),
                        })
                      }
                      className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddFamiliar}
                      disabled={!newFamiliar.nombres.trim()}
                      className="inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-700 px-3 py-1 rounded-lg text-xs font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar Familiar
                    </button>
                  </div>
                </div>

                {formData.familiares.length > 0 && (
                  <div className="space-y-1">
                    {formData.familiares.map((fam, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg"
                      >
                        <div>
                          <strong>{fam.nombres}</strong> ({fam.parentesco},{" "}
                          {fam.edad ? `${fam.edad} años` : "edad no reg."})
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFamiliar(idx)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tratamiento de Datos Personales (Obligatorio) */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                  <input
                    type="checkbox"
                    required
                    checked={formData.autorizacion_datos}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        autorizacion_datos: e.target.checked,
                      })
                    }
                    className="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-sky-900 font-semibold block">
                      Autorización para el Tratamiento de Datos Personales
                      (Habeas Data) *
                    </strong>
                    El beneficiario o acudiente autoriza voluntariamente el uso
                    y tratamiento de sus datos conforme a los principios de
                    dignidad, confidencialidad y propósito humanitario del
                    Proyecto URABÁ-PAÍS.
                  </div>
                </label>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    (duplicateWarning && duplicateWarning.type === "error")
                  }
                  className="px-5 py-2.5 text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm disabled:opacity-50"
                >
                  {submitting
                    ? "Guardando..."
                    : "Completar Registro (Generar Código)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
