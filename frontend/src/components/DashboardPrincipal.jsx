import React, { useState, useEffect } from 'react';
import {
  Users, FolderGit2, HeartHandshake, TrendingUp, Clock,
  AlertCircle, CheckCircle2, ArrowRight, UserPlus,
  Search, MapPin, ChevronRight, Flame, BarChart3, Calendar
} from 'lucide-react';
import { api } from '../services/api';

export function DashboardAdministrador({ onNavigateTab, onSelectBeneficiario }) {
  const [metricas, setMetricas] = useState(null);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [mR, bR, sR] = await Promise.all([
          api.getMetricas(), api.getBeneficiarios(), api.getSeguimientos()
        ]);
        if (mR.success) setMetricas(mR);
        if (bR.data) setBeneficiarios(bR.data);
        if (sR.data) setSeguimientos(sR.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingCard role="Administrador" />;

  const kpis = metricas?.indicadores_clave || {};
  const distMuni = metricas?.distribucion?.por_municipio || {};
  const totalFam = beneficiarios.reduce((a, b) => a + (b.familiares?.length || 0), 0);
  const pendientes = seguimientos.filter(s => s.estado_pendiente === 'pendiente');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <SectionTitle
          title="INDICADORES OPERATIVOS GLOBALES"
          subtitle="Métricas calculadas en tiempo real — conteo único garantizado"
          action={{
            label: 'Ver reportes completos',
            badge: 'CSV & KPIs',
            icon: <BarChart3 className="w-3.5 h-3.5" />,
            onClick: () => onNavigateTab('reportes')
          }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <KpiCard icon={<Users className="w-6 h-6" />} color="blue"
            label="Beneficiarios Únicos" value={kpis.beneficiarios_unicos ?? '-'}
            sub="Personas reales (1=1)" badge="Regla de Oro" />
          <KpiCard icon={<HeartHandshake className="w-6 h-6" />} color="blue-light"
            label="Núcleos Familiares" value={beneficiarios.filter(b => b.familiares?.length > 0).length || beneficiarios.length}
            sub={`+${totalFam} familiares a cargo`} badge="Protección integral" />
          <KpiCard icon={<FolderGit2 className="w-6 h-6" />} color="blue-light"
            label="Participaciones" value={kpis.participaciones_totales ?? '-'}
            sub="3 Líneas de intervención" badge="Multi-programa" />
          <KpiCard icon={<TrendingUp className="w-6 h-6" />} color="blue-light"
            label="Ayudas Entregadas" value={kpis.atenciones_totales ?? '-'}
            sub="Kits, legal y psicosocial" badge="Con actas" />
        </div>
      </div>

      <QuickActions onNavigateTab={onNavigateTab} onSelectBeneficiario={onSelectBeneficiario} beneficiarios={beneficiarios}
        actions={[
          { id: 'beneficiarios', label: 'Registrar Beneficiario', sub: 'Creación con anti-duplicados en tiempo real', icon: <UserPlus className="w-5 h-5" /> },
          { id: 'programas', label: 'Vincular a Programa', sub: 'Asignar a las 3 líneas misionales del consorcio', icon: <FolderGit2 className="w-5 h-5" /> },
          { id: 'atenciones', label: 'Registrar Atención', sub: 'Documenta ayuda entregada, resultado y acta', icon: <HeartHandshake className="w-5 h-5" /> },
          { id: 'reportes', label: 'Ver Reportes & KPIs', sub: 'Métricas agregadas y exportación CSV', icon: <BarChart3 className="w-5 h-5" /> },
        ]} />

      <DistribucionYLineas distMuni={distMuni} kpis={kpis} totalFam={totalFam} onNavigateTab={onNavigateTab} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AlertasSeguimiento pendientes={pendientes} onNavigateTab={onNavigateTab} />
      </div>
    </div>
  );
}

export function DashboardFuncionario({ onNavigateTab, onSelectBeneficiario }) {
  const [metricas, setMetricas] = useState(null);
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [mR, sR] = await Promise.all([
          api.getMetricas(), api.getSeguimientos()
        ]);
        if (mR.success) setMetricas(mR);
        if (sR.data) setSeguimientos(sR.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingCard role="Funcionario de Campo" />;

  const kpis = metricas?.indicadores_clave || {};
  const pendientes = seguimientos.filter(s => s.estado_pendiente === 'pendiente');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <SectionTitle
          title="RESUMEN OPERATIVO DE HOY"
          subtitle="Casos activos, compromisos pendientes y atenciones registradas este período"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <KpiCard icon={<Users className="w-6 h-6" />} color="blue"
            label="Personas en Sistema" value={kpis.beneficiarios_unicos ?? '-'}
            sub="Disponibles para atención directa" badge="Tu cobertura" />
          <KpiCard icon={<AlertCircle className="w-6 h-6" />} color="blue-light"
            label="Seguimientos Pendientes" value={pendientes.length}
            sub="Compromisos que requieren acción" badge={pendientes.length > 0 ? 'Pendientes' : 'Al día'} />
          <KpiCard icon={<CheckCircle2 className="w-6 h-6" />} color="blue-light"
            label="Atenciones Registradas" value={kpis.atenciones_totales ?? '-'}
            sub="Total de ayudas documentadas" badge="Con actas" />
        </div>
      </div>

      <QuickActions onNavigateTab={onNavigateTab} onSelectBeneficiario={onSelectBeneficiario} beneficiarios={[]}
        actions={[
          { id: 'beneficiarios', label: 'Buscar Beneficiario', sub: 'Búsqueda previa antes de cualquier atención', icon: <Search className="w-5 h-5" /> },
          { id: 'beneficiarios', label: 'Registrar Nueva Persona', sub: 'Con validación anti-duplicados automática', icon: <UserPlus className="w-5 h-5" /> },
          { id: 'atenciones', label: 'Registrar Atención', sub: 'Documentar entrega de ayuda humanitaria', icon: <HeartHandshake className="w-5 h-5" /> },
          { id: 'programas', label: 'Vincular a Programa', sub: 'Inscribir a las líneas del consorcio', icon: <FolderGit2 className="w-5 h-5" /> },
        ]} />

      {pendientes.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-blue-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100">
                <AlertCircle className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Compromisos Pendientes de Tu Cartera</h3>
                <p className="text-xs text-slate-500 font-medium">Acciones que debes completar antes de las fechas de contacto programadas</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black text-white bg-blue-700 shadow-sm">
              {pendientes.length} pendientes
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendientes.slice(0, 4).map(seg => (
              <div key={seg.id} className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 hover:bg-blue-50 transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-blue-900">{seg.codigo_interno}</span>
                  <span className="text-[11px] text-blue-700 font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {seg.proximo_contacto || 'Pronto'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 leading-snug">{seg.accion_pendiente}</p>
                <p className="text-[11px] text-slate-500 font-medium leading-snug">{seg.avance_novedad}</p>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigateTab('atenciones')}
            className="w-full py-2.5 rounded-xl text-white font-bold text-xs transition-colors text-center shadow-sm bg-blue-700 hover:bg-blue-800">
            Ver y Gestionar Todos los Seguimientos →
          </button>
        </div>
      )}
    </div>
  );
}

function LoadingCard({ role }) {
  return (
    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-blue-100">
      <div className="inline-flex p-4 rounded-2xl mb-4 animate-bounce bg-blue-50 text-blue-600 border border-blue-200">
        <Flame className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-black text-slate-800">Cargando Panel de {role}...</h3>
      <p className="text-sm text-slate-500 mt-1 font-medium">Sincronizando datos en tiempo real con el territorio de Urabá.</p>
    </div>
  );
}

function SectionTitle({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shrink-0 cursor-pointer shadow-sm hover:shadow-md text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600"
        >
          <div className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 bg-blue-100 text-blue-700 group-hover:bg-white/20 group-hover:text-white">
            {action.icon || <BarChart3 className="w-3.5 h-3.5" />}
          </div>
          <span className="font-extrabold tracking-tight">{action.label}</span>
          {action.badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border transition-colors bg-blue-100 text-blue-700 group-hover:bg-white/20 group-hover:text-white border-blue-200/60 group-hover:border-white/30">
              {action.badge}
            </span>
          )}
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 shrink-0 text-blue-500 group-hover:text-white" />
        </button>
      )}
    </div>
  );
}

function KpiCard({ icon, color, label, value, sub, badge }) {
  const isPrimary = color === 'blue';
  return (
    <div className={`bg-white rounded-3xl p-5 border-2 ${isPrimary ? 'border-blue-300 hover:border-blue-500' : 'border-blue-100 hover:border-blue-300'} shadow-sm hover:shadow-xl transition-all relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-all bg-blue-500/10" />
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600/70">{badge}</span>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">{value}</div>
        </div>
        <div className="p-3 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110 bg-blue-600">
          {icon}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-blue-50 flex items-center justify-between text-xs">
        <span className="font-bold text-blue-900">{label}</span>
        <span className="text-slate-400 font-medium text-[11px]">{sub}</span>
      </div>
    </div>
  );
}

function QuickActions({ onNavigateTab, onSelectBeneficiario, beneficiarios, actions }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-4">
      <div>
        <h2 className="text-base font-black text-slate-900 tracking-tight">Acceso Rápido a Operaciones</h2>
        <p className="text-xs text-slate-500 font-medium">Ejecuta las operaciones autorizadas con 1 clic</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((a, i) => (
          <button key={i} onClick={() => {
            if (a.selectFirst && beneficiarios.length > 0) {
              onSelectBeneficiario(beneficiarios[0].id);
            } else {
              onNavigateTab(a.id);
            }
          }}
            className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group shadow-sm hover:shadow-md cursor-pointer">
            <div className="p-3 rounded-xl text-white group-hover:scale-105 transition-all shrink-0 shadow-sm bg-blue-600">{a.icon}</div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{a.label}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">{a.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function DistribucionYLineas({ distMuni, kpis, totalFam, onNavigateTab }) {
  const metaGlobal = 11447;
  const alcanzado = (kpis.beneficiarios_unicos || 0) + totalFam;
  const pctMeta = Math.min(100, Math.round((alcanzado / metaGlobal) * 100 * 10) / 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-blue-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">Cobertura Territorial</h3>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700">5 Municipios</span>
        </div>
        <div className="space-y-3 pt-2">
          {[
            { muni: 'Apartadó', val: distMuni['Apartadó'] || 0, color: 'from-blue-600 to-blue-800' },
            { muni: 'Turbo', val: distMuni['Turbo'] || 0, color: 'from-sky-500 to-blue-600' },
            { muni: 'Necoclí', val: distMuni['Necoclí'] || 0, color: 'from-blue-700 to-indigo-800' },
            { muni: 'Carepa / Chigorodó', val: distMuni['Otro Urabá'] || 0, color: 'from-slate-600 to-blue-900' },
          ].map((item, i) => {
            const pct = kpis.beneficiarios_unicos > 0 ? Math.round((item.val / kpis.beneficiarios_unicos) * 100) : 0;
            return (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{item.muni}</span>
                  <span className="text-slate-500">{item.val} ({pct}%)</span>
                </div>
                <div className="h-2 w-full bg-blue-50 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(6, pct)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-blue-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">Líneas de Intervención Misionales</h3>
          <button onClick={() => onNavigateTab('programas')}
            className="text-xs font-bold hover:underline flex items-center gap-1 text-blue-600">
            Ver programas <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { num: 1, title: 'Asistencia Humanitaria & Protección', org: 'COOPI & HIAS', desc: 'Alimentos, kits de emergencia, orientación legal y regularización migratoria.', accent: 'bg-blue-50/70 border-blue-200' },
            { num: 2, title: 'Salud, Bienestar & Discapacidad', org: 'FADV & Humanity & Inclusion', desc: 'Apoyo psicosocial, terapias de rehabilitación física y apoyos funcionales.', accent: 'bg-sky-50/70 border-sky-200' },
            { num: 3, title: 'Integración Socioeconómica', org: 'COOPI & FADV', desc: 'Formación para el empleo, emprendimientos locales y cohesión comunitaria.', accent: 'bg-blue-50/50 border-blue-100' },
          ].map(l => (
            <div key={l.num} className={`p-4 rounded-2xl ${l.accent} border space-y-2`}>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-blue-800 bg-blue-100">
                Línea {l.num}
              </span>
              <h4 className="text-xs font-black text-slate-900 line-clamp-2">{l.title}</h4>
              <p className="text-[11px] font-medium text-slate-600">{l.org}</p>
              <p className="text-[10px] text-slate-500 leading-snug">{l.desc}</p>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-blue-50 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>Meta Global de Impacto:</span>
            <span className="font-black text-blue-700">{alcanzado} / {metaGlobal.toLocaleString()} personas ({pctMeta}%)</span>
          </div>
          <div className="h-2.5 w-full bg-blue-50 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-blue-600 to-sky-500" style={{ width: `${Math.max(5, Math.min(100, pctMeta))}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertasSeguimiento({ pendientes, onNavigateTab }) {
  return (
    <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-blue-100 shadow-sm flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-700" />
            <h3 className="text-sm font-black text-slate-900">Alertas de Seguimiento</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-700 text-white shadow-sm">
            {pendientes.length} pendientes
          </span>
        </div>
        <div className="space-y-3">
          {pendientes.slice(0, 4).map(seg => (
            <div key={seg.id} className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2 hover:bg-blue-50 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-blue-900">{seg.codigo_interno}</span>
                <span className="text-[11px] text-blue-700 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" />{seg.proximo_contacto || 'Pronto'}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 leading-snug">
                {seg.accion_pendiente || 'Seguimiento programado'}
              </p>
            </div>
          ))}
          {pendientes.length === 0 && (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto" />
              <p className="text-xs font-medium">No hay compromisos pendientes.</p>
            </div>
          )}
        </div>
      </div>
      <button onClick={() => onNavigateTab('atenciones')}
        className="w-full py-2.5 rounded-xl text-white font-bold text-xs transition-colors text-center shadow-sm bg-blue-700 hover:bg-blue-800">
        Gestionar todos los seguimientos
      </button>
    </div>
  );
}