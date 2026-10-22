import React from 'react';
import {
  LayoutDashboard, Compass, Users, FolderGit2, HeartHandshake,
  FileText, BarChart3, Bot, ShieldCheck, Eye, Sun, RefreshCw, X, Lock,
  Globe, Scale
} from 'lucide-react';

// Mapa de menús por rol — define qué ve cada tipo de usuario con estricto control de acceso
const MENUS_POR_ROL = {
  'Administrador': {
    badge: { label: 'Administrador', color: 'bg-blue-600 text-white border border-blue-400/40' },
    sections: [
      {
        title: 'PANEL PRINCIPAL',
        items: [
          { id: 'dashboard', label: 'Dashboard General', subtitle: 'Métricas globales y auditoría total', icon: LayoutDashboard }]
      },
      {
        title: 'GESTIÓN MISIONAL',
        items: [
          { id: 'beneficiarios', label: 'Beneficiarios - Familias', subtitle: 'Registro, búsqueda y anti-duplicados', icon: Users },
          { id: 'programas', label: 'Programas - Vinculación', subtitle: 'Líneas de trabajo y estados', icon: FolderGit2 },
          { id: 'atenciones', label: 'Atención - Seguimiento', subtitle: 'Entregas, actas y novedades', icon: HeartHandshake },
          { id: 'ficha360', label: 'Ficha completa', subtitle: 'Hoja de vida unificada completa', icon: FileText },
          { id: 'reportes', label: 'Consultas - Reportes', subtitle: 'Métricas, indicadores y CSV', icon: BarChart3 },
        ]
      },
      {
        title: 'HERRAMIENTAS',
        items: [
          { id: 'ia', label: 'Asistente IA Humanitario', subtitle: 'Recomendaciones y políticas éticas', icon: Bot },
        ]
      }
    ]
  },

  'Funcionario': {
    badge: { label: 'Funcionario', color: 'bg-blue-700 text-blue-100 border border-blue-500/40' },
    sections: [
      {
        title: 'PANEL DE CAMPO',
        items: [
          { id: 'dashboard', label: 'Mi Panel de Trabajo', subtitle: 'Cartera de casos y compromisos', icon: LayoutDashboard },
        ]
      },
      {
        title: 'OPERACIÓN HUMANITARIA',
        items: [
          { id: 'beneficiarios', label: 'Beneficiarios - Familias', subtitle: 'Buscar, consultar y registrar personas', icon: Users },
          { id: 'programas', label: 'Programas - Vinculación', subtitle: 'Inscribir a los programas del consorcio', icon: FolderGit2 },
          { id: 'atenciones', label: 'Atención - Seguimiento', subtitle: 'Registrar ayudas y compromisos activos', icon: HeartHandshake },
          { id: 'ficha360', label: 'Ficha completa', subtitle: 'Ver historial integral del beneficiario', icon: FileText },
          { id: 'reportes', label: 'Consultas - Reportes', subtitle: 'Cifras agregadas, sin datos personales', icon: BarChart3 },
        ]
      },
      {
        title: 'HERRAMIENTAS DE APOYO',
        items: [
          { id: 'ia', label: 'Asistente IA Humanitario', subtitle: 'Orientación para el trabajo de campo', icon: Bot },
        ]
      },
    ]
  },

  'Beneficiario': {
    badge: { label: 'Beneficiario', color: 'bg-cyan-700 text-white border border-cyan-500/40' },
    sections: [
      {
        title: 'MI INFORMACIÓN',
        items: [
          { id: 'ficha360', label: 'Mi ficha', subtitle: 'Solo lo que el proyecto tiene de ti', icon: FileText },
        ]
      }
    ]
  }
};

export default function SidebarLeft({
  activeTab, setActiveTab, currentRole, setCurrentRole,
  highContrast, setHighContrast, onResetData, mobileOpen, setMobileOpen,
  onOpenRolesModal, onSalir
}) {
  const menuDef = MENUS_POR_ROL[currentRole] || MENUS_POR_ROL['Administrador'];

  return (
    <>
      {/* Backdrop móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar fijo */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-in-out
          border-r border-blue-900/50 shadow-2xl
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ background: '#0c2340', color: '#e2e8f0' }}
      >
        {/* Cabecera en Azul Institucional */}
        <div className="p-5 border-b border-blue-900/60" style={{ background: 'linear-gradient(to bottom, #0f2d52, #0c2340)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logos/uraba-pais-isotipo.svg"
                alt="URABÁ PAÍS"
                className="h-10 w-10 object-contain"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-black tracking-tight text-white uppercase">URABÁ PAÍS</h1>

                </div>
                <p className="text-[10px] font-semibold tracking-wider uppercase text-blue-300">
                  plataforma
                </p>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white transition-colors bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Badge de rol activo */}
        </div>

        {/* Lista de Navegación */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-none">
          {menuDef.sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${section.locked ? 'text-slate-500' : 'text-blue-300/80'
                }`}>
                {section.locked && <Lock className="w-3 h-3 text-slate-500" />}
                {section.title}
              </div>

              <div className="space-y-0.5">
                {section.items.map((item, jdx) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id && !section.locked;
                  const isLocked = section.locked || item.id === null;

                  return (
                    <button
                      key={jdx}
                      disabled={isLocked}
                      onClick={() => !isLocked && (setActiveTab(item.id), setMobileOpen(false))}
                      className={`
                        w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 group relative
                        ${isActive
                          ? 'text-white font-bold shadow-md bg-blue-600 translate-x-0.5'
                          : isLocked
                            ? 'text-slate-500 cursor-not-allowed opacity-50'
                            : 'text-slate-300 hover:text-white hover:bg-blue-900/40 hover:translate-x-0.5 cursor-pointer'
                        }
                      `}
                    >
                      <div className={`
                        p-1.5 rounded-xl shrink-0 transition-colors
                        ${isActive
                          ? 'bg-white/20 text-white'
                          : isLocked
                            ? 'text-slate-600 bg-slate-900/40'
                            : 'text-blue-300 group-hover:text-white bg-blue-950/60'
                        }
                      `}>
                        {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs truncate">{item.label}</span>
                          {item.badge && !isLocked && (
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${isActive ? 'bg-black/30 text-white' : item.badgeColor
                              }`}>
                              {item.badge}
                            </span>
                          )}
                          {isLocked && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-slate-950 text-slate-500">
                              Bloqueado
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] truncate ${isActive ? 'text-blue-100 font-normal' : isLocked ? 'text-slate-600' : 'text-blue-300/60'
                          }`}>
                          {item.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Pie del Sidebar en Azul */}
        <div className="p-4 border-t border-blue-900/60 space-y-3" style={{ background: '#091b33' }}>

          {/* Accesibilidad y reinicio */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSalir}
              className="w-full py-2 rounded-xl border border-blue-900/80 text-blue-200 hover:text-white text-xs font-semibold bg-blue-950/40"
            >
              Salir
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
