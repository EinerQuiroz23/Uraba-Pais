import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  UserPlus, 
  Link2, 
  HeartHandshake, 
  Clock, 
  FileText, 
  BarChart3, 
  ShieldAlert,
  Play,
  RotateCcw
} from 'lucide-react';

export default function FlujoDemostracion({ onNavigateTab, onSelectBeneficiario }) {
  const pasos = [
    {
      paso: 1,
      titulo: '1. Buscar y Verificar si ya existe (Regla Anti-Duplicados)',
      descripcion: 'Antes de registrar a ciegas, el sistema busca por documento o nombre. Si coincide tipo y documento, bloquea o advierte la duplicación.',
      accion: 'Probar Búsqueda y Registro',
      tab: 'beneficiarios'
    },
    {
      paso: 2,
      titulo: '2. Vincular a Programa o Proyecto',
      descripcion: 'Asigna al beneficiario a una de las 3 líneas de intervención con fecha y estado: inscrito, en proceso, finalizado o retirado.',
      accion: 'Ir a Vinculaciones',
      tab: 'programas'
    },
    {
      paso: 3,
      titulo: '3. Registrar Atención o Ayuda Entregada',
      descripcion: 'Registra lo que se entregó (bienes o servicios humanitarios) con fecha, responsable institucional y resultado.',
      accion: 'Registrar Atención',
      tab: 'atenciones'
    },
    {
      paso: 4,
      titulo: '4. Añadir Seguimiento (Avance & Acción Pendiente)',
      descripcion: 'Registra la evolución del caso (lo que cambió), compromisos pendientes y fecha del próximo contacto.',
      accion: 'Registrar Seguimiento',
      tab: 'atenciones'
    },
    {
      paso: 5,
      titulo: '5. Consultar Ficha Consolidada 360° y Reportes Dinámicos',
      descripcion: 'Visualiza la ficha unificada del beneficiario y comprueba que las métricas de conteo se calcularon en tiempo real sin inflar beneficiarios únicos.',
      accion: 'Ver Reportes y Métricas',
      tab: 'reportes'
    }
  ];

  const casosPruebaJurado = [
    {
      id: 1,
      titulo: 'Caso 1: Registro de Persona Nueva y Familiar',
      descripcion: 'Ingreso de nuevo beneficiario en Apartadó con autorización Habeas Data y 1 familiar a cargo. Se verifica la generación del código inmutable.',
      accion: () => onNavigateTab('beneficiarios')
    },
    {
      id: 2,
      titulo: 'Caso 2: Prueba de Duplicado de Documento (Bloqueo)',
      descripcion: 'Intento de registro con CC 1038472910 (María Elena Gómez). El sistema detecta coincidencia exacta e impide la creación duplicada.',
      accion: () => onNavigateTab('beneficiarios')
    },
    {
      id: 3,
      titulo: 'Caso 3: Demostración Ficha 360° de Extremo a Extremo',
      descripcion: 'Abrir la ficha de URB-2026-0001 y verificar programas cursados, atenciones recibidas y seguimientos con semáforo de pendientes.',
      accion: () => {
        onSelectBeneficiario('BEN-001');
      }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Portada del Flujo para Jurados */}
      <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-sky-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-blue-400/20">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-sky-200 border border-sky-400/30">
            Guía de Demostración Oficial Hackathon
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight">
            Recorrido Completo del Sistema URABÁ-PAÍS
          </h1>
          <p className="text-sm text-sky-100/90 mt-2 leading-relaxed">
            Demostración en vivo de los 5 pasos obligatorios descritos en la sección 7 y 8 de la Guía de Participantes. Datos 100% ficticios y contextualizados en el territorio de Urabá.
          </p>
        </div>
      </div>

      {/* Los 3 Casos Mínimos de Demostración Obligatorios */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
          Casos Mínimos de Demostración (Sección 8 de la Guía)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {casosPruebaJurado.map((caso) => (
            <div key={caso.id} className="bg-white border border-blue-100 p-5 rounded-3xl shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Prueba Obligatoria #{caso.id}
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-2">{caso.titulo}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {caso.descripcion}
                </p>
              </div>

              <button
                onClick={caso.accion}
                className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5" /> Ejecutar Caso
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Los 5 Pasos del Flujo Mínimo */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
          Flujo Mínimo de Principio a Fin (Sección 7)
        </h3>
        <div className="space-y-3">
          {pasos.map((p) => (
            <div
              key={p.paso}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <span className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center text-sm shrink-0 mt-0.5 border border-blue-200">
                  {p.paso}
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{p.titulo}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                    {p.descripcion}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab(p.tab)}
                className="shrink-0 text-xs font-semibold px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 transition-colors flex items-center gap-1.5 border border-blue-200 hover:border-blue-600"
              >
                <span>{p.accion}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
