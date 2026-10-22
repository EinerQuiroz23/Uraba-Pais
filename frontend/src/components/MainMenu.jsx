import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Compass, 
  Users, 
  FolderGit2, 
  HeartHandshake, 
  FileText, 
  BarChart3, 
  Bot, 
  ShieldCheck, 
  Eye, 
  RefreshCw, 
  Menu, 
  X, 
  Search, 
  Sun, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  MapPin,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';

export default function MainMenu({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  highContrast,
  setHighContrast,
  onResetData,
  onSelectBeneficiario
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [allBeneficiarios, setAllBeneficiarios] = useState([]);
  const searchRef = useRef(null);

  // Cargar beneficiarios para búsqueda global
  useEffect(() => {
    const fetchBeneficiarios = async () => {
      try {
        const res = await api.getBeneficiarios();
        if (res.data) setAllBeneficiarios(res.data);
      } catch (err) {
        console.error('Error cargando lista para búsqueda global:', err);
      }
    };
    fetchBeneficiarios();
  }, [activeTab]);

  // Manejador de búsqueda global en tiempo real
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const matches = allBeneficiarios.filter(b => 
      `${b.nombres} ${b.apellidos}`.toLowerCase().includes(q) ||
      (b.numero_documento && b.numero_documento.toLowerCase().includes(q)) ||
      (b.codigo_interno && b.codigo_interno.toLowerCase().includes(q))
    ).slice(0, 5);

    setSearchResults(matches);
    setShowSearchResults(true);
  }, [searchQuery, allBeneficiarios]);

  // Cerrar dropdown de búsqueda al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuSections = [
    {
      title: 'Principal',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard General',
          description: 'Métricas, KPIs y accesos rápidos',
          icon: LayoutDashboard,
          badge: 'Inicio',
          badgeColor: 'bg-sky-100 text-sky-800'
        },
        {
          id: 'guia_flujo',
          label: 'Flujo Demostración',
          description: 'Paso a paso para evaluación de jurado',
          icon: Compass,
          badge: 'Jurado',
          badgeColor: 'bg-amber-100 text-amber-800'
        }
      ]
    },
    {
      title: 'Gestión y Operación',
      items: [
        {
          id: 'beneficiarios',
          label: '1. Beneficiarios & Familias',
          description: 'Registro, búsqueda y anti-duplicados',
          icon: Users
        },
        {
          id: 'programas',
          label: '2. Programas & Vinculación',
          description: 'Líneas misionales y estados',
          icon: FolderGit2
        },
        {
          id: 'atenciones',
          label: '3. Atención & Seguimiento',
          description: 'Entregas de kits, actas y alertas',
          icon: HeartHandshake
        },
        {
          id: 'ficha360',
          label: 'Ficha Consolidada 360°',
          description: 'Hoja de vida unificada por persona',
          icon: FileText
        },
        {
          id: 'reportes',
          label: '4. Consultas & Reportes',
          description: 'Regla de conteo único y exportación',
          icon: BarChart3
        }
      ]
    },
    {
      title: 'Herramientas',
      items: [
        {
          id: 'ia',
          label: 'Asistente IA Humanitario',
          description: 'Orientación ética y consultas',
          icon: Bot,
          badge: 'Ético',
          badgeColor: 'bg-emerald-100 text-emerald-800'
        }
      ]
    }
  ];

  const handleSelectSearchResult = (beneficiarioId) => {
    setShowSearchResults(false);
    setSearchQuery('');
    if (onSelectBeneficiario) {
      onSelectBeneficiario(beneficiarioId);
    } else {
      setActiveTab('ficha360');
    }
  };

  const getBreadcrumbTitle = () => {
    for (const section of menuSections) {
      const match = section.items.find(i => i.id === activeTab);
      if (match) return match.label;
    }
    return 'Panel del Sistema';
  };

  return (
    <>
      {/* 1. TOP BAR (BARRA SUPERIOR PERMANENTE) */}
      <header className={`sticky top-0 z-30 ${highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-800'} border-b transition-colors shadow-sm`}>
        {/* Franja superior institucional */}
        <div className="border-b border-slate-100 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sky-800 tracking-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SISTEMA URABÁ-PAÍS
            </span>
            <span className="text-slate-300">|</span>
            <span className="hidden md:inline font-medium text-slate-600">
              COOPI · HIAS · FADV · Humanity & Inclusion
            </span>
            <span className="hidden lg:inline text-slate-400">
              · Financiado por Agenzia Italiana per la Cooperazione allo Sviluppo (AICS)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Regla de Conteo Activa
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <div className="flex items-center gap-1 text-slate-600">
              <MapPin className="w-3 h-3 text-sky-600" />
              <span>Apartadó · Turbo · Carepa · Chigorodó · Necoclí</span>
            </div>
          </div>
        </div>

        {/* Barra de controles principales y navegación rápida */}
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Botón para abrir el Menú Principal */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-all border border-slate-200"
              title="Abrir menú de navegación"
            >
              <Menu className="w-4 h-4 text-sky-700" />
              <span className="hidden sm:inline font-bold">Menú Principal</span>
            </button>

            {/* Breadcrumb del módulo activo */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Inicio</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60">
                {getBreadcrumbTitle()}
              </span>
            </div>
          </div>

          {/* Buscador Universal Rápido */}
          <div className="flex-1 max-w-md relative" ref={searchRef}>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Búsqueda rápida (cédula, nombre o URB-...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Resultados desplegables de búsqueda rápida */}
            {showSearchResults && (
              <div className="absolute top-full mt-1.5 w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 divide-y divide-slate-100">
                <div className="px-3 py-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Resultados para "{searchQuery}"</span>
                  <span>{searchResults.length} encontrados</span>
                </div>
                {searchResults.length > 0 ? (
                  searchResults.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleSelectSearchResult(b.id)}
                      className="w-full px-3 py-2.5 text-left hover:bg-sky-50 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700">
                          {b.nombres} {b.apellidos}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.tipo_documento}: {b.numero_documento} · {b.municipio}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                          {b.codigo_interno}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Abrir Ficha 360°</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No se encontraron coincidencias para este término.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Opciones de perfil, accesibilidad y reinicio */}
          <div className="flex items-center gap-2">
            {/* Selector de Rol */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200/60 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600 ml-1 hidden sm:inline" />
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs pr-1"
                title="Cambiar rol de usuario"
              >
                <option value="Administrador">Admin (Total)</option>
                <option value="Funcionario de Campo">Funcionario Campo</option>
                <option value="Consulta / Público">Consulta / Auditor</option>
              </select>
            </div>

            {/* Accesibilidad Alto Contraste */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              title="Alternar accesibilidad (modo alto contraste)"
              className={`p-1.5 rounded-xl border transition-colors flex items-center justify-center ${
                highContrast 
                  ? 'bg-yellow-400 text-black border-yellow-400' 
                  : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {highContrast ? <Sun className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Botón de reinicio de datos */}
            <button
              onClick={onResetData}
              title="Restaurar base de datos a los valores iniciales de prueba"
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden xl:inline">Reiniciar Datos</span>
            </button>
          </div>
        </div>

        {/* Barra de pestañas horizontales de acceso rápido (Quick Tabs) */}
        <div className="border-t border-slate-100 px-4 py-1.5 overflow-x-auto scrollbar-none flex items-center gap-1 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-sky-700'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard Principal</span>
          </button>

          <button
            onClick={() => setActiveTab('guia_flujo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
              activeTab === 'guia_flujo'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-amber-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Guía Jurado (5 Pasos)</span>
          </button>

          <button
            onClick={() => setActiveTab('beneficiarios')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
              activeTab === 'beneficiarios'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-sky-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>1. Beneficiarios</span>
          </button>

          <button
            onClick={() => setActiveTab('programas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
              activeTab === 'programas'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-sky-700'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>2. Programas</span>
          </button>

          <button
            onClick={() => setActiveTab('atenciones')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
              activeTab === 'atenciones'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-sky-700'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>3. Atenciones</span>
          </button>

          <button
            onClick={() => setActiveTab('ficha360')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
              activeTab === 'ficha360'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-sky-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ficha 360°</span>
          </button>

          <button
            onClick={() => setActiveTab('reportes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
              activeTab === 'reportes'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-sky-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>4. Reportes</span>
          </button>

          <button
            onClick={() => setActiveTab('ia')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
              activeTab === 'ia'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-purple-700'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Asistente IA</span>
          </button>
        </div>
      </header>

      {/* 2. MENÚ PRINCIPAL LATERAL (SIDEBAR / DRAWER DESPLEGABLE) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop con desenfoque */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Panel Lateral del Menú */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Cabecera del Sidebar */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-sky-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center font-black text-lg text-sky-200">
                  UP
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-tight text-white leading-tight">
                    PROYECTO URABÁ-PAÍS
                  </h2>
                  <p className="text-[11px] text-sky-200">Menú Principal de Navegación</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Navegación por Secciones */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {menuSections.map((section, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h3 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all ${
                            isActive
                              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 font-bold'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${
                            isActive ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold truncate">{item.label}</span>
                              {item.badge && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                                  isActive ? 'bg-white/20 text-white' : item.badgeColor
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] mt-0.5 line-clamp-1 ${
                              isActive ? 'text-sky-100 font-normal' : 'text-slate-400'
                            }`}>
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Pie del Sidebar: Información de Entidades y Estado */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-600">Rol Conectado:</span>
                  <span className="font-bold text-sky-700">{currentRole}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-600">Base de Datos:</span>
                  <span className="text-emerald-600 font-bold">Activa y Segura</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center leading-relaxed">
                Consorcio: COOPI · HIAS · FADV · HI
                <br />
                Apoyo financiero: AICS (Cooperazione Italiana)
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
