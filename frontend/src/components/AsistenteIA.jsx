import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  ShieldAlert,
  Send,
  Clock,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function AsistenteIA() {
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [selectedBenId, setSelectedBenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState(null);
  const [consultaLibre, setConsultaLibre] = useState('');

  useEffect(() => {
    const fetchB = async () => {
      try {
        const res = await api.getBeneficiarios();
        if (res.data) setBeneficiarios(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchB();
  }, []);

  const handleAnalizarHistorial = async () => {
    if (!selectedBenId) return;
    setLoading(true);
    try {
      const res = await api.getFichaConsolidada(selectedBenId);
      if (res.success) {
        const b = res.data;
        const summary = {
          codigo: b.codigo_interno,
          titular: `${b.nombres} ${b.apellidos}`,
          municipio: b.municipio,
          resumenGeneral: `El beneficiario cuenta con código inmutable ${b.codigo_interno}, domiciliado en ${b.municipio}. Registra ${b.vinculaciones.length} vinculaciones a programas, ${b.atenciones.length} atenciones y ${b.seguimientos.length} seguimientos en el sistema.`,
          alertasPendientes: b.seguimientos
            .filter(s => s.estado_pendiente === 'pendiente')
            .map(s => `Acción pendiente programada: "${s.accion_pendiente}" (Fecha próximo contacto: ${s.proximo_contacto || 'Por definir'}).`),
          rutasSugeridas: [
            b.vinculaciones.some(v => v.estado === 'finalizado')
              ? 'Verificar egreso formal y constancia de finalización de fase humanitaria.'
              : 'Dar continuidad al plan de trabajo en las líneas de salud o medios de vida.',
            b.familiares.length === 0
              ? 'Indagar en el próximo contacto si existen integrantes del núcleo familiar dependientes para contextualizar el caso.'
              : `Núcleo familiar compuesto por ${b.familiares.length} integrantes debidamente relacionados.`
          ]
        };
        setAiOutput(summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConsultaLibre = (e) => {
    e.preventDefault();
    if (!consultaLibre.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setAiOutput({
        tipoConsulta: 'Pregunta sobre rutas y lineamientos',
        pregunta: consultaLibre,
        resumenGeneral: `Respuesta de orientación basada en la Guía del Proyecto URABÁ-PAÍS: Para atender la consulta sobre "${consultaLibre}", el equipo de campo debe verificar primero la existencia del beneficiario mediante el código inmutable, remitir al programa correspondiente según las 3 líneas de intervención (COOPI, HIAS, FADV o HI), y registrar siempre la atención entregada distinguiéndola de los seguimientos futuros.`,
        alertasPendientes: [
          'Recordatorio ético: Esta sugerencia de IA no constituye una decisión institucional ni un diagnóstico clínico o legal.'
        ],
        rutasSugeridas: [
          'Consultar la Ficha Consolidada 360° para validar autorizaciones vigentes de Habeas Data.',
          'Coordinar con la organización líder del consorcio según el área de atención.'
        ]
      });
      setLoading(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-xs text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <span>Declaración de Cumplimiento Ético de IA (Sección 10.1 de la Guía)</span>
        </div>
        <p className="leading-relaxed">
          Este módulo complementario opera bajo límites estrictos:
          <strong> (1)</strong> No revela información personal ni sensible a terceros;
          <strong> (2)</strong> No emite diagnósticos médicos, psicológicos o jurídicos;
          <strong> (3)</strong> No decide quién recibe ayudas o servicios humanitarios;
          <strong> (4)</strong> Presenta todas sus sugerencias como apoyo técnico para el funcionario y nunca como decisiones institucionales.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" /> Resumen Asistido de Caso
            </h3>
            <p className="text-xs text-slate-500">
              Seleccione una persona para sintetizar su historial y detectar alertas de compromisos pendientes.
            </p>

            <select
              value={selectedBenId}
              onChange={(e) => setSelectedBenId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
            >
              <option value="">-- Seleccionar Beneficiario --</option>
              {beneficiarios.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.codigo_interno} - {b.nombres} {b.apellidos}
                </option>
              ))}
            </select>

            <button
              onClick={handleAnalizarHistorial}
              disabled={!selectedBenId || loading}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              {loading ? 'Analizando caso...' : 'Generar Síntesis Asistida'}
            </button>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" /> Búsqueda y Orientación
            </h3>
            <form onSubmit={handleConsultaLibre} className="space-y-2">
              <textarea
                rows="3"
                placeholder="Ej: ¿Qué ruta corresponde para una persona víctima del conflicto con movilidad reducida?"
                value={consultaLibre}
                onChange={(e) => setConsultaLibre(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !consultaLibre.trim()}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> Consultar Guía
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[350px]">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
              <Bot className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-slate-800 text-sm">Respuesta del Asistente Técnico</h3>
            </div>

            {!aiOutput ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <Bot className="w-10 h-10 text-slate-300" />
                <p className="text-sm">Selecciona un beneficiario o realiza una consulta para generar una síntesis.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {aiOutput.titular && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Caso Analizado</span>
                      <span className="font-bold text-slate-900 text-sm">{aiOutput.titular}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-sky-700 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      {aiOutput.codigo}
                    </span>
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Síntesis Integrada del Historial:</h4>
                  <p className="text-slate-700 leading-relaxed bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                    {aiOutput.resumenGeneral}
                  </p>
                </div>

                {aiOutput.alertasPendientes && aiOutput.alertasPendientes.length > 0 && (
                  <div>
                    <h4 className="font-bold text-amber-900 mb-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Compromisos y Acciones Pendientes Detectadas:
                    </h4>
                    <ul className="space-y-1.5">
                      {aiOutput.alertasPendientes.map((alerta, i) => (
                        <li key={i} className="bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200">
                          {alerta}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiOutput.rutasSugeridas && aiOutput.rutasSugeridas.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Orientaciones Técnicas de Continuidad:
                    </h4>
                    <ul className="space-y-1">
                      {aiOutput.rutasSugeridas.map((ruta, i) => (
                        <li key={i} className="text-slate-600 bg-slate-50 p-2 rounded-lg">
                          • {ruta}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}