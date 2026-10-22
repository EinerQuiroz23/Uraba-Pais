import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Users, 
  Eye, 
  FileText, 
  BarChart3, 
  FolderGit2, 
  HeartHandshake, 
  Bot, 
  X, 
  Info, 
  Scale, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const ROLES_CONFIG = {
  'Administrador': {
    id: 'Administrador',
    nombre: 'Administrador',
    tagline: 'Coordinación General del Consorcio URABÁ-PAÍS',
    badgeColor: 'bg-blue-700 text-white border-blue-600',
    headerBg: 'from-blue-900 via-blue-800 to-slate-900',
    icon: '👑',
    ambito: 'Mando institucional (COOPI, HIAS, FADV, HI, AICS)',
    modulosPermitidos: [
      'Dashboard General',
      'Flujo Demostración (Jurado)',
      '1. Beneficiarios & Familias',
      '2. Programas & Vinculación',
      '3. Atención & Seguimiento',
      '4. Ficha Consolidada 360°',
      '4. Consultas & Reportes',
      'Asistente IA Humanitario'
    ],
    accionesPermitidas: [
      'Acceso total a todos los módulos y operaciones del sistema.',
      'Creación, edición y actualización de beneficiarios y sus núcleos familiares.',
      'Vinculación a cualquiera de las 3 líneas de trabajo y programas del consorcio.',
      'Registro de ayudas y asistencias con generación de actas de entrega.',
      'Registro de seguimientos, semáforo de compromisos y reprogramación de fechas.',
      'Visualización de Fichas 360° completas con trazabilidad del caso.',
      'Generación de métricas globales agregadas y exportación de datos en CSV.',
      'Restauración de datos semilla de prueba y calibración para evaluación.'
    ],
    restricciones: [
      {
        titulo: 'Inmutabilidad del Código Único',
        desc: 'El código asignado (URB-2026-XXXX) es inalterable. Ni siquiera el administrador puede modificar la llave primaria generada.',
        severidad: 'critica'
      },
      {
        titulo: 'Consentimiento Habeas Data Obligatorio',
        desc: 'Prohibido completar el alta de un titular sin el registro explícito de autorización para el tratamiento de datos personales (Ley 1581 de 2012).',
        severidad: 'alta'
      },
      {
        titulo: 'Límites Éticos de Inteligencia Artificial (Sección 10.1)',
        desc: 'No puede utilizar la IA para emitir diagnósticos médicos o jurídicos, ni para delegar la decisión de quién recibe una ayuda humanitaria.',
        severidad: 'alta'
      },
      {
        titulo: 'Trazabilidad y No Repudio',
        desc: 'Toda modificación sobre estados de vinculación o reasignación queda registrada con sello temporal.',
        severidad: 'media'
      }
    ]
  },

  'Funcionario de Campo': {
    id: 'Funcionario de Campo',
    nombre: 'Funcionario de Campo',
    tagline: 'Operación Humanitaria Directa en Territorio',
    badgeColor: 'bg-blue-600 text-white border-blue-500',
    headerBg: 'from-blue-800 via-sky-800 to-slate-900',
    icon: '🤝',
    ambito: 'Trabajadores sociales, psicólogos, abogados y técnicos en Apartadó, Turbo y Necoclí',
    modulosPermitidos: [
      'Mi Panel de Trabajo de Campo',
      '1. Beneficiarios & Familias',
      '2. Programas & Vinculación',
      '3. Atención & Seguimiento',
      '4. Ficha Consolidada 360°',
      'Asistente IA Humanitario'
    ],
    accionesPermitidas: [
      'Búsqueda previa obligatoria de personas por documento o nombre.',
      'Registro inicial de titulares vulnerables y sus familiares a cargo.',
      'Vinculación de personas a las líneas de Asistencia, Salud o Integración.',
      'Registro de entregas materiales de ayudas y servicios humanitarios.',
      'Añadir seguimientos de caso, avances psicosociales y tareas pendientes.',
      'Consulta de la Ficha 360° para planificar la intervención integral del caso.',
      'Orientación y apoyo técnico asistido por el Asistente IA dentro de límites éticos.'
    ],
    restricciones: [
      {
        titulo: 'Restricción de Eliminación de Registros',
        desc: 'NO puede eliminar beneficiarios ni borrar atenciones ya registradas. Para evitar pérdidas de trazabilidad, las bajas requieren validación directiva.',
        severidad: 'critica'
      },
      {
        titulo: 'Restricción de Parámetros Globales',
        desc: 'NO puede crear nuevos programas, ni alterar los cupos oficiales del consorcio ni modificar catálogos maestros.',
        severidad: 'alta'
      },
      {
        titulo: 'Restricción de Reportes Estratégicos & Auditoría',
        desc: 'Acceso bloqueado a reportes consolidados del consorcio ni a auditoría global reservada para la coordinación y cooperantes.',
        severidad: 'alta'
      },
      {
        titulo: 'Control Estricto Anti-Duplicados',
        desc: 'El sistema bloquea la creación de registros cuando el documento de identidad ya exista en la base unificada.',
        severidad: 'alta'
      },
      {
        titulo: 'Confidencialidad Territorial (Habeas Data)',
        desc: 'Prohibido extraer o divulgar datos de contacto sensibles fuera de los fines humanitarios directos.',
        severidad: 'media'
      }
    ]
  },

  'Auditor / Cooperante (AICS)': {
    id: 'Auditor / Cooperante (AICS)',
    nombre: 'Auditor / Cooperante (AICS)',
    tagline: 'Monitoreo, Evaluación y Rendición de Cuentas',
    badgeColor: 'bg-sky-600 text-white border-sky-500',
    headerBg: 'from-sky-900 via-blue-900 to-slate-900',
    icon: '🔍',
    ambito: 'Agenzia Italiana per la Cooperazione allo Sviluppo (AICS) y Evaluadores Externos',
    modulosPermitidos: [
      'Tablero de Impacto & Rendición de Cuentas',
      '4. Consultas & Reportes Dinámicos'
    ],
    accionesPermitidas: [
      'Monitoreo en tiempo real de los indicadores clave del consorcio.',
      'Verificación del cumplimiento de la Regla de Conteo (Personas únicas vs. Eventos).',
      'Consulta de la distribución territorial por municipio (Apartadó, Turbo, Necoclí, etc.).',
      'Seguimiento del porcentaje de ejecución sobre la meta global de 11.447 personas.',
      'Análisis de avance por las 3 líneas de trabajo y por organización ejecutora.',
      'Exportación oficial de tablas de datos agregados en formato CSV para informes externos.'
    ],
    restricciones: [
      {
        titulo: 'Estricta Anonimización de Datos (Ley 1581 de 2012)',
        desc: 'Restricción ABSOLUTA a Información de Identificación Personal (PII): no puede ver nombres, cédulas/PPT, teléfonos ni direcciones.',
        severidad: 'critica'
      },
      {
        titulo: 'Restricción Transaccional / Operativa',
        desc: 'NO puede crear, editar, reasignar ni eliminar ningún registro en el sistema (rol de solo lectura analítica agregada).',
        severidad: 'alta'
      },
      {
        titulo: 'Bloqueo de Fichas 360° Individuales',
        desc: 'No puede acceder a la hoja de vida unificada individual de ninguna persona para salvaguardar su privacidad.',
        severidad: 'alta'
      },
      {
        titulo: 'Prohibición de Desanonimización',
        desc: 'Todos los indicadores deben presentarse agregados por territorio y programa sin cruces que permitan identificar individuos.',
        severidad: 'media'
      }
    ]
  },

  'Consulta Pública / Comunidad': {
    id: 'Consulta Pública / Comunidad',
    nombre: 'Consulta Pública / Comunidad',
    tagline: 'Portal Ciudadano, Rutas de Atención y Transparencia',
    badgeColor: 'bg-cyan-700 text-white border-cyan-600',
    headerBg: 'from-cyan-950 via-blue-950 to-slate-900',
    icon: '🌐',
    ambito: 'Comunidades de acogida, población refugiada, víctimas y ciudadanía general de Urabá',
    modulosPermitidos: [
      'Portal Ciudadano de Oferta y Rutas Humanitarias'
    ],
    accionesPermitidas: [
      'Conocer los objetivos, líneas de trabajo y aliados del consorcio URABÁ-PAÍS.',
      'Consultar el catálogo público de programas disponibles en Apartadó, Turbo y Necoclí.',
      'Identificar los requisitos y puntos de contacto físico y telefónico para solicitar atención.',
      'Conocer la política de protección de datos personales y canales para ejercer Habeas Data.',
      'Visualizar cifras generales de alcance social sin vulnerar la privacidad comunitaria.'
    ],
    restricciones: [
      {
        titulo: 'Cero Acceso a Datos de Beneficiarios',
        desc: 'Bloqueo total al motor transaccional de beneficiarios, núcleos familiares, atenciones y expedientes de caso.',
        severidad: 'critica'
      },
      {
        titulo: 'Sin Capacidad Transaccional',
        desc: 'No puede registrar ni modificar ningún dato del sistema; solo visualiza información de orientación abierta.',
        severidad: 'alta'
      },
      {
        titulo: 'Protección Preventiva de Vulnerabilidad',
        desc: 'No se publican listados ni información que permita estigmatizar o individualizar a la población atendida.',
        severidad: 'alta'
      }
    ]
  }
};

export default function ModalRestriccionesRoles({ isOpen, onClose, currentRole, onSelectRole }) {
  const [selectedTab, setSelectedTab] = useState(currentRole || 'Administrador');

  if (!isOpen) return null;

  const roleData = ROLES_CONFIG[selectedTab] || ROLES_CONFIG['Administrador'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-blue-200 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header con gradiente azul */}
        <div className={`p-6 bg-gradient-to-r ${roleData.headerBg} text-white flex items-start justify-between relative overflow-hidden`}>
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-200 border border-blue-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                Matriz Oficial de Roles y Restricciones
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                Guía de Participantes (Secc. 9, 10, 11)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>{roleData.icon}</span> {roleData.nombre}
              <span className="text-xs font-semibold text-blue-200/80 hidden sm:inline">— {roleData.tagline}</span>
            </h2>
            <p className="text-xs text-blue-100/90 font-medium max-w-2xl leading-relaxed">
              <strong>Ámbito:</strong> {roleData.ambito}
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 shrink-0"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de pestañas para cambiar entre los 4 roles */}
        <div className="p-3 bg-blue-50/70 border-b border-blue-100 flex items-center gap-2 overflow-x-auto">
          {Object.keys(ROLES_CONFIG).map((rKey) => {
            const r = ROLES_CONFIG[rKey];
            const isCurrent = rKey === currentRole;
            const isTabActive = rKey === selectedTab;

            return (
              <button
                key={rKey}
                onClick={() => setSelectedTab(rKey)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
                  isTabActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-[1.02]'
                    : 'bg-white text-slate-700 hover:bg-blue-50 border-blue-200/80'
                }`}
              >
                <span>{r.icon}</span>
                <span>{r.nombre}</span>
                {isCurrent && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase ${
                    isTabActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                  }`}>
                    Activo
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Contenido scrolleable con permisos y restricciones */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800">
          
          {/* Banner de cambio de rol */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-950">
                  {selectedTab === currentRole 
                    ? `Estás visualizando el sistema como ${selectedTab}.`
                    : `¿Deseas probar la interfaz con las restricciones de este rol?`
                  }
                </p>
                <p className="text-[11px] text-blue-800/80">
                  El sistema actualizará menús, dashboards y bloqueará módulos no autorizados al instante.
                </p>
              </div>
            </div>

            {selectedTab !== currentRole ? (
              <button
                onClick={() => {
                  onSelectRole(selectedTab);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Activar Rol: {selectedTab}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs font-black text-blue-700 bg-white px-3 py-1.5 rounded-xl border border-blue-200">
                ✓ Rol Actualmente Seleccionado
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Columna Izquierda: Lo que puede hacer (Acciones Permitidas) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-blue-100">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  Acciones y Módulos Permitidos
                </h3>
              </div>

              {/* Módulos accesibles */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Módulos Habilitados en Menú:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {roleData.modulosPermitidos.map((m, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-100/70 text-blue-800 border border-blue-200/80"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Lista de acciones */}
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Operaciones Autorizadas:
                </p>
                <ul className="space-y-2">
                  {roleData.accionesPermitidas.map((acc, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <span>{acc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Columna Derecha: Restricciones Específicas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-blue-100">
                <Lock className="w-5 h-5 text-blue-700" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  Restricciones & Controles Asignados
                </h3>
              </div>

              <div className="space-y-3">
                {roleData.restricciones.map((rest, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-1 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                        {rest.titulo}
                      </h4>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        rest.severidad === 'critica'
                          ? 'bg-blue-700 text-white'
                          : rest.severidad === 'alta'
                          ? 'bg-blue-200 text-blue-900'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {rest.severidad}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug font-medium">
                      {rest.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Marco Legal & Ético */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-black text-blue-300">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Fundamento en los Criterios de la Hackathon y Normativa Humanitaria</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              El prototipo cumple la <strong>Ley Estatutaria 1581 de 2012</strong> (Régimen de Protección de Datos Personales en Colombia), el principio humanitario de <strong>"No Hacer Daño" (Do No Harm)</strong>, la <strong>Regla de Conteo Desduplicada (1 persona = 1 registro)</strong> y los <strong>Límites Éticos de la IA</strong> (Sección 10.1 de la Guía oficial de URABÁ-PAÍS).
            </p>
          </div>

        </div>

        {/* Footer del Modal */}
        <div className="p-4 bg-slate-50 border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium text-center sm:text-left">
            Proyecto Humanitario <strong>URABÁ-PAÍS</strong> · Apartadó, Turbo y Necoclí
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm"
          >
            Cerrar Matriz
          </button>
        </div>
      </div>
    </div>
  );
}
