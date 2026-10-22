import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCheck,
  RefreshCw,
  AlertTriangle,
  Clock,
  UserX,
  X,
  CheckCircle2,
  Trash2,
  History,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { api } from "../services/api";

const ICONO_TIPO = {
  PROXIMO_CONTACTO: Clock,
  ACCION_PENDIENTE: AlertTriangle,
  SIN_VINCULACION: UserX,
  SIN_ATENCION: AlertTriangle,
  DATOS_INCOMPLETOS: AlertTriangle,
  SISTEMA: Bell,
  EN_PROCESO: Clock,
  PROCESO_FINALIZADO: CheckCircle2,
  INSCRITO: UserPlus,
  RETIRADO: UserMinus,
  ACCION_COMPLETADA: CheckCircle2,
};

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

/** Colores por tipo / prioridad */
function colorDeNotificacion(n) {
  if (n.tipo === "INSCRITO")
    return "text-amber-700 bg-amber-50 border-amber-200"; // amarillo
  if (n.tipo === "EN_PROCESO") return "text-sky-700 bg-sky-50 border-sky-200"; // azul
  if (n.tipo === "PROCESO_FINALIZADO" || n.tipo === "ACCION_COMPLETADA")
    return "text-emerald-700 bg-emerald-50 border-emerald-200"; // verde
  if (n.tipo === "RETIRADO") return "text-rose-700 bg-rose-50 border-rose-200"; // rojo

  const porPrioridad = {
    alta: "text-rose-600 bg-rose-50 border-rose-100",
    media: "text-amber-600 bg-amber-50 border-amber-100",
    baja: "text-slate-600 bg-slate-50 border-slate-100",
  };
  return porPrioridad[n.prioridad] || porPrioridad.media;
}

export default function NotificacionesBell({ currentRole, onIrFicha }) {
  const rol = String(currentRole || "").toLowerCase();
  const puedeVer =
    rol.includes("funcionario") ||
    rol.includes("administrador") ||
    rol.includes("admin") ||
    rol.includes("operador");

  const [abierto, setAbierto] = useState(false);
  const [tab, setTab] = useState("activas"); // "activas" | "historial"
  const [items, setItems] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [animar, setAnimar] = useState(false);
  const countAnterior = useRef(0);
  const ref = useRef(null);

  const cargar = async (sincronizar = false) => {
    if (!puedeVer) return;
    try {
      if (sincronizar) {
        try {
          await api.generarNotificaciones();
        } catch (_) {
          /* si falla generar, igual listamos */
        }
      }
      const [listaRes, countRes] = await Promise.all([
        api.getNotificaciones(false),
        api.getNotificacionesCount(),
      ]);
      const nuevas = listaRes.data || [];
      const total = countRes.total ?? 0;

      // Animar campanita si subió el contador (llegó notificación nueva)
      if (total > countAnterior.current && countAnterior.current >= 0) {
        setAnimar(true);
        setTimeout(() => setAnimar(false), 1200);
      }
      countAnterior.current = total;

      setItems(nuevas);
      setCount(total);
    } catch (err) {
      console.error("[Notificaciones]", err);
    }
  };

  const cargarHistorial = async () => {
    if (!puedeVer) return;
    try {
      setLoading(true);
      const res = await api.getNotificacionesHistorial();
      setHistorial(res.data || []);
    } catch (err) {
      console.error("[Historial]", err);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial + auto-refresh cada 20 s
  useEffect(() => {
    if (!puedeVer) return;
    cargar(true);
    const id = setInterval(() => cargar(true), 20000);
    return () => clearInterval(id);
  }, [puedeVer, currentRole]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function fuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, []);

  if (!puedeVer) return null;

  const handleGenerar = async () => {
    setGenerando(true);
    try {
      await api.generarNotificaciones();
      await cargar();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerando(false);
    }
  };

  const handleLeer = async (n) => {
    try {
      if (!n.leida) {
        await api.marcarNotificacionLeida(n.id_notificacion);
        setItems((prev) =>
          prev.map((x) =>
            x.id_notificacion === n.id_notificacion ? { ...x, leida: true } : x,
          ),
        );
        setCount((c) => Math.max(0, c - 1));
        countAnterior.current = Math.max(0, countAnterior.current - 1);
      }
      if (n.id_beneficiario && onIrFicha) {
        let meta = n.metadata;
        if (typeof meta === "string") {
          try {
            meta = JSON.parse(meta);
          } catch (_) {
            meta = {};
          }
        }
        const modulo =
          (meta && meta.modulo) || MODULO_POR_TIPO[n.tipo] || "atenciones";
        onIrFicha(n.id_beneficiario, modulo, n.tipo, meta || n.metadata);
        setAbierto(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeerTodas = async () => {
    try {
      await api.marcarTodasNotificacionesLeidas();
      setItems((prev) => prev.map((x) => ({ ...x, leida: true })));
      setCount(0);
      countAnterior.current = 0;
    } catch (err) {
      console.error(err);
    }
  };

  const handleEliminar = async (e, n) => {
    e.stopPropagation();
    try {
      await api.eliminarNotificacion(n.id_notificacion);
      setItems((prev) =>
        prev.filter((x) => x.id_notificacion !== n.id_notificacion),
      );
      if (!n.leida) {
        setCount((c) => Math.max(0, c - 1));
        countAnterior.current = Math.max(0, countAnterior.current - 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEliminarTodas = async () => {
    if (!window.confirm("¿Borrar todas las notificaciones?")) return;
    try {
      await api.eliminarTodasNotificaciones();
      setItems([]);
      setCount(0);
      countAnterior.current = 0;
    } catch (err) {
      console.error(err);
    }
  };

  const abrirPanel = () => {
    const next = !abierto;
    setAbierto(next);
    if (next) {
      setTab("activas");
      cargar();
    }
  };

  const cambiarTab = (t) => {
    setTab(t);
    if (t === "historial") cargarHistorial();
  };

  const renderItem = (n, esHistorial = false) => {
    const Icon = ICONO_TIPO[n.tipo] || Bell;
    const color = colorDeNotificacion(n);
    return (
      <div
        key={n.id_notificacion}
        className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 ${
          !n.leida && !esHistorial ? "bg-sky-50/40" : ""
        } ${esHistorial ? "opacity-75" : ""}`}
      >
        <button
          type="button"
          onClick={() => !esHistorial && handleLeer(n)}
          className="flex gap-3 flex-1 min-w-0 text-left"
          disabled={esHistorial}
        >
          <div
            className={`shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center ${color}`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p
                className={`text-sm leading-snug ${
                  !n.leida && !esHistorial
                    ? "font-bold text-slate-900"
                    : "font-medium text-slate-700"
                }`}
              >
                {n.titulo}
              </p>
              {!n.leida && !esHistorial && (
                <span className="shrink-0 w-2 h-2 mt-1.5 rounded-full bg-sky-500" />
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
              {n.mensaje}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              {n.codigo_interno || ""}
              {n.fecha_creacion
                ? ` · ${new Date(n.fecha_creacion).toLocaleString("es-CO", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : ""}
              {esHistorial && n.fecha_leida
                ? ` · borrada ${new Date(n.fecha_leida).toLocaleString(
                    "es-CO",
                    {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}`
                : ""}
            </p>
          </div>
        </button>
        {!esHistorial && (
          <button
            type="button"
            onClick={(e) => handleEliminar(e, n)}
            className="shrink-0 self-center p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Borrar notificación"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="relative" ref={ref}>
      {/* Estilo de animación de la campanita */}
      <style>{`
        @keyframes bell-shake {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-12deg); }
          45% { transform: rotate(10deg); }
          60% { transform: rotate(-8deg); }
          75% { transform: rotate(4deg); }
        }
        .bell-shake {
          animation: bell-shake 0.7s ease-in-out;
        }
      `}</style>

      <button
        type="button"
        onClick={abrirPanel}
        className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-sky-700 transition-colors"
        title="Notificaciones"
      >
        <Bell
          className={`w-5 h-5 ${animar ? "bell-shake text-sky-600" : ""}`}
        />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow animate-pulse">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-[380px] max-w-[92vw] bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div>
              <p className="text-sm font-bold text-slate-800">
                Alertas operativas
              </p>
              <p className="text-[11px] text-slate-500">
                {count > 0 ? `${count} sin leer` : "Todo al día"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleGenerar}
                disabled={generando}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-sky-600 transition-colors"
                title="Actualizar alertas"
              >
                <RefreshCw
                  className={`w-4 h-4 ${generando ? "animate-spin" : ""}`}
                />
              </button>
              {tab === "activas" && count > 0 && (
                <button
                  type="button"
                  onClick={handleLeerTodas}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-emerald-600 transition-colors"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {tab === "activas" && items.length > 0 && (
                <button
                  type="button"
                  onClick={handleEliminarTodas}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-rose-600 transition-colors"
                  title="Borrar todas las notificaciones"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-white hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs: Activas / Historial */}
          <div className="flex border-b border-slate-100">
            <button
              type="button"
              onClick={() => cambiarTab("activas")}
              className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                tab === "activas"
                  ? "text-sky-700 border-b-2 border-sky-500 bg-sky-50/50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Activas {count > 0 ? `(${count})` : ""}
            </button>
            <button
              type="button"
              onClick={() => cambiarTab("historial")}
              className={`flex-1 py-2 text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                tab === "historial"
                  ? "text-sky-700 border-b-2 border-sky-500 bg-sky-50/50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Historial
            </button>
          </div>

          {/* Lista */}
          <div className="max-h-[380px] overflow-y-auto">
            {tab === "activas" ? (
              items.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No hay alertas por ahora.
                  <button
                    type="button"
                    onClick={handleGenerar}
                    className="block mx-auto mt-2 text-sky-600 text-xs font-semibold hover:underline"
                  >
                    Generar desde datos actuales
                  </button>
                </div>
              ) : (
                items.map((n) => renderItem(n, false))
              )
            ) : loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Cargando historial...
              </div>
            ) : historial.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No hay notificaciones borradas todavía.
              </div>
            ) : (
              historial.map((n) => renderItem(n, true))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
