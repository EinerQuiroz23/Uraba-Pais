import React, { useState, useEffect } from "react";
import SidebarLeft from "./components/SidebarLeft";
import TopBar from "./components/TopBar";
import PaginaInicio from "./components/PaginaInicio";
import PaginaLogin from "./components/PaginaLogin";
import {
  DashboardAdministrador,
  DashboardFuncionario,
} from "./components/DashboardPrincipal";
import Modulo1Beneficiarios from "./components/Modulo1Beneficiarios";
import Modulo2Programas from "./components/Modulo2Programas";
import Modulo3Atenciones from "./components/Modulo3Atenciones";
import Modulo4Ficha360 from "./components/Modulo4Ficha360";
import Modulo4Reportes from "./components/Modulo4Reportes";
import ModuloDatabaseExcel from "./components/ModuloDatabaseExcel";
import AsistenteIA from "./components/AsistenteIA";
import ModalRestriccionesRoles from "./components/ModalRestriccionesRoles";
import { api } from "./services/api";
import { Lock, ShieldCheck, Scale, ArrowRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Matriz Oficial de Permisos por Rol — Define qué módulos puede acceder cada perfil
// ─────────────────────────────────────────────────────────────────────────────

function vistaDesdeUrl() {
  const path = window.location.pathname;
  if (path.startsWith("/login/sesionActiva")) return "portal";
  if (path.startsWith("/login")) return "login";
  return "inicio";
}

function sesionGuardada() {
  try {
    const raw = sessionStorage.getItem("sesion");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function ir(path) {
  window.history.pushState({}, "", path);
}

const PERMISOS_ROL = {
  Administrador: [
    "dashboard",
    "beneficiarios",
    "programas",
    "atenciones",
    "ficha360",
    "reportes",
    "ia",
  ],
  Funcionario: [
    "dashboard",
    "beneficiarios",
    "programas",
    "atenciones",
    "ficha360",
    "reportes",
    "ia",
  ],
  Beneficiario: ["ficha360"],
};

// Componente de pantalla de acceso denegado con estilo azul institucional
function AccesoDenegado({ currentRole, onGoHome, onOpenRolesModal }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 p-8 animate-in fade-in duration-300">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl bg-blue-950 border border-blue-800 text-sky-400">
        <Lock className="w-10 h-10" />
      </div>
      <div className="space-y-2 max-w-md">
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
          Control de Acceso Humanitario
        </span>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Acceso Restringido para Tu Rol
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed font-medium">
          El rol actual de{" "}
          <strong className="text-blue-700">{currentRole}</strong> no dispone de
          privilegios de acceso para esta vista. En cumplimiento del principio
          de <strong>necesidad de saber</strong> y la Ley Estatutaria 1581 de
          2012 (Habeas Data), esta sección está reservada.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 font-medium max-w-md text-left space-y-2">
        <p className="font-black text-blue-950 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Restricciones aplicadas a tu perfil:
        </p>
        {currentRole === "Funcionario" && (
          <p className="leading-relaxed">
            Como <strong>Funcionario</strong>, no tienes acceso a auditoría
            reservada. Cuentas con acceso a beneficiarios, atenciones, programas
            y fichas 360°.
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={onGoHome}
          className="px-6 py-3 rounded-2xl text-white font-black text-sm shadow-md transition-all hover:scale-[1.02] bg-blue-600 hover:bg-blue-700"
        >
          Volver a mi Panel Principal
        </button>
        {onOpenRolesModal && (
          <button
            onClick={onOpenRolesModal}
            className="px-5 py-3 rounded-2xl text-blue-700 font-bold text-sm bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all flex items-center gap-2"
          >
            <Scale className="w-4 h-4 text-blue-600" />
            Ver Matriz de Restricciones
          </button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const sesionInicial = sesionGuardada();
  const [vista, setVista] = useState(() => {
    const actual = vistaDesdeUrl();
    if (actual === "portal" && !sesionInicial) return "login";
    return actual;
  });
  const [currentRole, setCurrentRole] = useState(
    sesionInicial?.rol || "Administrador",
  );
  const [selectedBeneficiarioId, setSelectedBeneficiarioId] = useState(null);
  const [activeTab, setActiveTab] = useState(
    sesionInicial?.rol === "Beneficiario" ? "ficha360" : "dashboard",
  );
  const [highContrast, setHighContrast] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [abrirVinculacion, setAbrirVinculacion] = useState(false);
  const [abrirEdicionFicha, setAbrirEdicionFicha] = useState(false);
  const [camposFaltantesNotif, setCamposFaltantesNotif] = useState([]);

  useEffect(() => {
    if (vistaDesdeUrl() === "portal" && !sesionGuardada()) {
      window.history.replaceState({}, "", "/login");
      setVista("login");
    }

    const alNavegar = () => {
      const siguiente = vistaDesdeUrl();
      if (siguiente === "portal" && !sesionGuardada()) {
        window.history.replaceState({}, "", "/login");
        setVista("login");
        return;
      }
      setVista(siguiente);
    };

    window.addEventListener("popstate", alNavegar);
    return () => window.removeEventListener("popstate", alNavegar);
  }, []);

  // Cuando cambia el rol, volver al dashboard
  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    setActiveTab("dashboard");
  };

  const salir = () => {
    sessionStorage.removeItem("sesion");
    sessionStorage.removeItem("token");
    window.history.pushState({}, "", "/login");
    setVista("login");
  };

  const handleSelectBeneficiario = (id) => {
    setSelectedBeneficiarioId(id);
    if (PERMISOS_ROL[currentRole]?.includes("ficha360")) {
      setActiveTab("ficha360");
    } else {
      setActiveTab("dashboard");
    }
  };

  const handleStartEnrollment = (beneficiario) => {
    setSelectedBeneficiarioId(beneficiario.id || beneficiario.id_beneficiario);
    setAbrirVinculacion(true);
    if (PERMISOS_ROL[currentRole]?.includes("programas")) {
      setActiveTab("programas");
    }
  };

  const handleQuickAction = (action, ficha) => {
    setSelectedBeneficiarioId(ficha.id);
    if (
      action === "vincular" &&
      PERMISOS_ROL[currentRole]?.includes("programas")
    ) {
      setActiveTab("programas");
    } else if (
      (action === "atencion" || action === "seguimiento") &&
      PERMISOS_ROL[currentRole]?.includes("atenciones")
    ) {
      setActiveTab("atenciones");
    }
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        "¿Desea restaurar la base de datos a los valores de prueba iniciales de Urabá-País?",
      )
    ) {
      try {
        await api.resetData();
        window.location.reload();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Verificar si el rol actual tiene permiso para ver el tab activo
  const tienePermiso = PERMISOS_ROL[currentRole]?.includes(activeTab) ?? false;

  // Renderizar el Dashboard adecuado para cada rol oficial
  const renderDashboard = () => {
    if (currentRole === "Funcionario") {
      return (
        <DashboardFuncionario
          onNavigateTab={(tab) => {
            if (PERMISOS_ROL[currentRole]?.includes(tab)) setActiveTab(tab);
          }}
          onSelectBeneficiario={handleSelectBeneficiario}
          onOpenRolesModal={() => setIsRolesModalOpen(true)}
        />
      );
    }

    // Administrador (por defecto)
    return (
      <DashboardAdministrador
        onNavigateTab={(tab) => setActiveTab(tab)}
        onSelectBeneficiario={handleSelectBeneficiario}
        onOpenRolesModal={() => setIsRolesModalOpen(true)}
      />
    );
  };

  if (vista === "inicio") {
    return (
      <PaginaInicio
        onIrAlPortal={() => {
          ir("/login");
          setVista("login");
        }}
      />
    );
  }

  if (vista === "login") {
    return (
      <PaginaLogin
        onVolver={() => {
          ir("/");
          setVista("inicio");
        }}
        onEntrar={(sesion) => {
          sessionStorage.setItem("sesion", JSON.stringify(sesion));
          if (sesion.token) sessionStorage.setItem("token", sesion.token);
          handleRoleChange(sesion.rol);
          if (sesion.beneficiarioId) {
            setSelectedBeneficiarioId(sesion.beneficiarioId);
            setActiveTab("ficha360");
          }
          ir("/login/sesionActiva");
          setVista("portal");
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex ${
        highContrast
          ? "tema-oscuro bg-[#0b1220] text-slate-100"
          : "text-slate-800"
      } transition-colors duration-200 font-sans`}
      style={!highContrast ? { backgroundColor: "var(--clr-bg)" } : {}}
    >
      {/* MENÚ LATERAL IZQUIERDO EN AZUL */}
      <SidebarLeft
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={handleRoleChange}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        onResetData={handleResetData}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenRolesModal={() => setIsRolesModalOpen(true)}
        onSalir={salir}
      />

      {/* ÁREA PRINCIPAL DE CONTENIDO */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <TopBar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (PERMISOS_ROL[currentRole]?.includes(tab)) setActiveTab(tab);
          }}
          currentRole={currentRole}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
          setMobileOpen={setMobileOpen}
          onSelectBeneficiario={handleSelectBeneficiario}
          onOpenRolesModal={() => setIsRolesModalOpen(true)}
          onIrFicha={(id, modulo, tipo, metadata) => {
            setSelectedBeneficiarioId(id);

            const mapaTipo = {
              PROXIMO_CONTACTO: "atenciones",
              ACCION_PENDIENTE: "atenciones",
              ACCION_COMPLETADA: "atenciones",
              SIN_ATENCION: "atenciones",
              SIN_VINCULACION: "programas",
              INSCRITO: "programas",
              EN_PROCESO: "programas",
              PROCESO_FINALIZADO: "programas",
              RETIRADO: "programas",
              DATOS_INCOMPLETOS: "ficha360", // ← antes iba a "beneficiarios"
            };

            const destino = modulo || mapaTipo[tipo] || "ficha360";

            // Si es datos incompletos → abrir ficha en modo edición
            if (tipo === "DATOS_INCOMPLETOS") {
              let meta = metadata;
              if (typeof meta === "string") {
                try {
                  meta = JSON.parse(meta);
                } catch {
                  meta = {};
                }
              }
              setCamposFaltantesNotif(meta?.faltantes || []);
              setAbrirEdicionFicha(true);
              setActiveTab("ficha360");
              return;
            }

            setAbrirEdicionFicha(false);
            setCamposFaltantesNotif([]);

            if (PERMISOS_ROL[currentRole]?.includes(destino)) {
              setActiveTab(destino);
              if (destino === "programas") setAbrirVinculacion(true);
            } else if (PERMISOS_ROL[currentRole]?.includes("ficha360")) {
              setActiveTab("ficha360");
            } else if (PERMISOS_ROL[currentRole]?.includes("atenciones")) {
              setActiveTab("atenciones");
            }
          }}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* ── DASHBOARD según el ROL ─────────────────────────────────────── */}
          {activeTab === "dashboard" && renderDashboard()}

          {/* ── TAB CON ACCESO DENEGADO ───────────────────────────────────── */}
          {activeTab !== "dashboard" && !tienePermiso && (
            <AccesoDenegado
              currentRole={currentRole}
              onGoHome={() => setActiveTab("dashboard")}
              onOpenRolesModal={() => setIsRolesModalOpen(true)}
            />
          )}

          {/* ── MÓDULOS CON PERMISO CONCEDIDO ────────────────────────────── */}

          {activeTab === "beneficiarios" && tienePermiso && (
            <Modulo1Beneficiarios
              soloBusqueda={currentRole === "Funcionario"}
              onSelectBeneficiario={handleSelectBeneficiario}
              onStartEnrollment={handleStartEnrollment}
            />
          )}

          {activeTab === "programas" && tienePermiso && (
            <Modulo2Programas
              selectedBeneficiarioId={selectedBeneficiarioId}
              abrirVinculacion={abrirVinculacion}
              onVinculacionAbierta={() => setAbrirVinculacion(false)}
              onSelectBeneficiario={handleSelectBeneficiario}
            />
          )}

          {activeTab === "atenciones" && tienePermiso && (
            <Modulo3Atenciones
              selectedBeneficiarioId={selectedBeneficiarioId}
            />
          )}

          {activeTab === "ficha360" && tienePermiso && (
            <Modulo4Ficha360
              beneficiarioId={selectedBeneficiarioId}
              soloLectura={false}
              esBeneficiario={currentRole === "Beneficiario"}
              abrirEdicion={abrirEdicionFicha}
              camposFaltantes={camposFaltantesNotif}
              onEdicionAbierta={() => setAbrirEdicionFicha(false)}
              onBack={
                currentRole === "Beneficiario"
                  ? undefined
                  : () => setActiveTab("beneficiarios")
              }
              onQuickAction={
                currentRole === "Beneficiario" ? undefined : handleQuickAction
              }
            />
          )}

          {activeTab === "reportes" && tienePermiso && <Modulo4Reportes />}

          {activeTab === "ia" && tienePermiso && <AsistenteIA />}
        </main>

        {/* Footer Institucional en Azul */}
        <footer className="bg-white border-t border-blue-100 mt-auto py-5 no-print text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-end gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <span className="font-bold text-blue-700">
                Habeas Data (Ley 1581/2012) Garantizado
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal Interactivo de Roles y Restricciones */}
      <ModalRestriccionesRoles
        isOpen={isRolesModalOpen}
        onClose={() => setIsRolesModalOpen(false)}
        currentRole={currentRole}
        onSelectRole={handleRoleChange}
      />
    </div>
  );
}
