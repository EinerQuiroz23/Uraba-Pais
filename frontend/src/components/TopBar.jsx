import React, { useState, useEffect, useRef } from "react";
import NotificacionesBell from "./NotificacionesBell";
import {
  Menu,
  Search,
  X,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  User,
  HeartHandshake,
  Scale,
  Lock,
  Sun,
  Moon,
} from "lucide-react";
import { api } from "../services/api";

export default function TopBar({
  activeTab,
  setActiveTab,
  currentRole,
  highContrast,
  setHighContrast,
  setMobileOpen,
  onSelectBeneficiario,
  onOpenRolesModal,
  onIrFicha,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (currentRole === "Beneficiario" || searchQuery.trim().length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.getBeneficiarios(
          `search=${encodeURIComponent(searchQuery.trim())}`,
        );
        setSearchResults((res.data || []).slice(0, 5));
        setShowSearchResults(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, currentRole]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard General";
      case "guia_flujo":
        return "Flujo de Demostración (Jurado)";
      case "beneficiarios":
        return "Módulo 1: Beneficiarios & Familias";
      case "programas":
        return "Módulo 2: Programas & Vinculación";
      case "atenciones":
        return "Módulo 3: Atención & Seguimiento";
      case "ficha360":
        return currentRole === "Beneficiario" ? "Mi ficha" : "Módulo 4: Ficha";
      case "reportes":
        return "Módulo 4: Consultas & Reportes";
      case "ia":
        return "Asistente IA Humanitario";
      default:
        return "Panel Principal";
    }
  };

  const getRoleBadgeStyle = () => {
    switch (currentRole) {
      case "Administrador":
        return "bg-blue-700 text-white border-blue-500";
      case "Funcionario de Campo":
        return "bg-blue-600 text-white border-blue-400";
      case "Auditor / Cooperante (AICS)":
        return "bg-sky-600 text-white border-sky-400";
      case "Consulta Pública / Comunidad":
        return "bg-cyan-700 text-white border-cyan-500";
      default:
        return "bg-blue-600 text-white border-blue-500";
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 ${
        highContrast
          ? "bg-[#0b1220] text-slate-100 border-b border-slate-800"
          : "bg-white/95 backdrop-blur-md text-slate-800 border-b border-blue-100"
      } transition-colors shadow-sm`}
    >
      {/* Franja Superior Institucional en Azul Marino */}
      <div className="px-4 sm:px-8 py-1.5 bg-blue-950 text-white flex items-center justify-between text-[11px] border-b border-blue-900">
        <div className="flex items-center gap-2"></div>

        <div className="flex items-center gap-3"></div>
      </div>

      {/* Barra de Controles y Búsqueda */}
      <div className="px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Botón Hamburger Móvil y Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-blue-50 hover:bg-blue-100 hover:text-blue-700 text-slate-700 transition-colors border border-blue-200"
            title="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5 text-blue-700" />
          </button>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`font-black text-sm tracking-tight ${highContrast ? "text-white" : "text-slate-900"}`}
              >
                {getBreadcrumbTitle()}
              </span>
            </div>
          </div>
        </div>

        {/* Buscador Universal */}
        {currentRole !== "Beneficiario" && (
          <div className="flex-1 max-w-md relative" ref={searchRef}>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600" />
              <input
                type="text"
                placeholder="Buscar por cédula, nombre o URABA-..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() =>
                  searchQuery.trim().length >= 3 && setShowSearchResults(true)
                }
                className="w-full pl-10 pr-4 py-2 text-xs bg-blue-50/50 hover:bg-blue-50/80 focus:bg-white border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-blue-200 overflow-hidden z-50 animate-in fade-in duration-150">
                <div className="p-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-[11px] font-bold text-blue-900">
                  <span>Resultados ({searchResults.length})</span>
                  <span className="text-[10px] text-blue-600 font-medium">
                    Búsqueda Rápida
                  </span>
                </div>
                <div className="divide-y divide-blue-50 max-h-60 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          onSelectBeneficiario(b.id);
                          setShowSearchResults(false);
                          setSearchQuery("");
                        }}
                        className="w-full p-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {b.nombres} {b.apellidos}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {b.tipo_documento}:{" "}
                              {b.numero_documento || "Sin doc"} · {b.municipio}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 shrink-0">
                          {b.codigo_interno}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No se encontraron coincidencias para "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón Matriz de Roles & Restricciones + Rol Activo */}
        <div className="flex items-center gap-2.5">
          {/* Campanita de notificaciones */}
          <NotificacionesBell
            currentRole={currentRole}
            onIrFicha={onIrFicha || onSelectBeneficiario}
          />

          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            aria-label={
              highContrast ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
            }
            className={`relative h-8 w-16 shrink-0 rounded-full border transition-colors duration-200 ${
              highContrast
                ? "bg-slate-800 border-slate-600"
                : "bg-sky-100 border-sky-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow transition-transform duration-200 ${
                highContrast ? "translate-x-8" : "translate-x-0"
              }`}
            >
              {highContrast ? (
                <Moon className="w-3.5 h-3.5 text-slate-800" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
            </span>
          </button>

          {/* Badge del rol actual */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-blue-100">
            <span
              className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full border shadow-sm ${getRoleBadgeStyle()}`}
            >
              {currentRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
