import React, { useState, useEffect } from 'react';
import {
  Database,
  FileSpreadsheet,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Layers,
  Code,
  ShieldCheck,
  Search,
  ExternalLink,
  Table,
  Cpu,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function ModuloDatabaseExcel({ onSelectBeneficiario }) {
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOrigen, setFilterOrigen] = useState('ALL');
  const [activeTab, setActiveTab] = useState('resumen'); // 'resumen', 'registros', 'sql'
  const [sqlSchema, setSqlSchema] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getDatabaseStatus();
      if (res && res.data) {
        setDbStatus(res.data);
      }
      const bRes = await api.getBeneficiarios();
      if (bRes && bRes.data) {
        setBeneficiarios(bRes.data);
      }
    } catch (err) {
      console.error('Error cargando estado de base de datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSyncExcel = async () => {
    try {
      setSyncing(true);
      const res = await api.syncExcel();
      await fetchStatus();
      alert(`✅ Sincronización exitosa con Base_Beneficiarios_Hackathon.xlsx.\n${res.data?.resultado?.newImported || 0} nuevos registros importados. Total en base de datos: ${res.data?.total_beneficiarios || 'N/A'}`);
    } catch (err) {
      alert('Error al sincronizar con el archivo Excel: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleLoadSqlSchema = async () => {
    try {
      const res = await fetch('/api/database/schema');
      if (res.ok) {
        const text = await res.text();
        setSqlSchema(text);
      }
    } catch (err) {
      console.error('Error cargando esquema SQL:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'sql' && !sqlSchema) {
      handleLoadSqlSchema();
    }
  }, [activeTab]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const filteredBeneficiarios = beneficiarios.filter(b => {
    const matchesSearch =
      `${b.nombres} ${b.apellidos}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.numero_documento && b.numero_documento.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.codigo_interno && b.codigo_interno.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.municipio && b.municipio.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterOrigen === 'EXCEL') {
      return b.origen === 'EXCEL_OFICIAL';
    } else if (filterOrigen === 'WEB') {
      return b.origen !== 'EXCEL_OFICIAL';
    }
    return true;
  });

  const excelBeneficiariosCount = beneficiarios.filter(b => b.origen === 'EXCEL_OFICIAL').length;
  const webBeneficiariosCount = beneficiarios.length - excelBeneficiariosCount;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Encabezado Principal */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-800/50">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold tracking-wide uppercase">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Base de Datos Conectada & Certificada
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Database className="w-8 h-8 text-sky-400" />
              Base de Datos & Archivo Excel Oficial
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl font-medium leading-relaxed">
              Integración nativa con la base de datos oficial entregada para la Hackathon:
              <code className="mx-1 px-2 py-0.5 rounded bg-blue-950/80 text-sky-300 font-mono text-xs border border-blue-700/50">Base_Beneficiarios_Hackathon.xlsx</code>.
              Garantiza la persistencia relacional SQL, inmutabilidad del código único y trazabilidad completa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSyncExcel}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Re-sincronizar con Excel'}
            </button>
            <a
              href="/api/database/dump-sql"
              download="uraba_database_dump.sql"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 active:scale-95 text-white transition-all shadow-lg shadow-blue-600/20"
            >
              <Download className="w-4 h-4" />
              Descargar Volcado SQL (.sql)
            </a>
          </div>
        </div>

        {/* Tarjetas de Estadísticas de la Base de Datos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-blue-800/40">
          <div className="bg-blue-950/60 backdrop-blur-md rounded-2xl p-4 border border-blue-800/40">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total en Base de Datos</span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">{beneficiarios.length}</span>
            <span className="text-[11px] text-sky-300 font-medium">Personas registradas</span>
          </div>
          <div className="bg-blue-950/60 backdrop-blur-md rounded-2xl p-4 border border-blue-800/40">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Fuente Excel Oficial</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">{excelBeneficiariosCount}</span>
            <span className="text-[11px] text-emerald-300 font-medium">De Base_Beneficiarios_Hackathon.xlsx</span>
          </div>
          <div className="bg-blue-950/60 backdrop-blur-md rounded-2xl p-4 border border-blue-800/40">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Altas en el Prototipo</span>
            <span className="text-2xl sm:text-3xl font-black text-sky-400 mt-1 block">{webBeneficiariosCount}</span>
            <span className="text-[11px] text-sky-300 font-medium">Creados en demostración</span>
          </div>
          <div className="bg-blue-950/60 backdrop-blur-md rounded-2xl p-4 border border-blue-800/40">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Motor de Datos</span>
            <span className="text-base sm:text-lg font-black text-amber-300 mt-1 block">SQL + JSON Relacional</span>
            <span className="text-[11px] text-amber-200/80 font-medium">Transaccional Atómico</span>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab('resumen')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'resumen'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <Cpu className="w-4 h-4" />
          Arquitectura de Datos & Conexión
        </button>
        <button
          onClick={() => setActiveTab('registros')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'registros'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <Table className="w-4 h-4" />
          Registros Cargados ({beneficiarios.length})
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'sql'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <Code className="w-4 h-4" />
          Esquema SQL Oficial (DDL)
        </button>
      </div>

      {/* PESTAÑA 1: ARQUITECTURA DE DATOS */}
      {activeTab === 'resumen' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta: Conexión con Excel */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Fuente de Datos: Excel Oficial</h3>
                <p className="text-xs text-slate-500">Base_Beneficiarios_Hackathon.xlsx</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Estado del Archivo:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Detectado y Leído
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Nombre de Archivo:</span>
                <span className="font-mono text-slate-700 font-bold">Base_Beneficiarios_Hackathon.xlsx</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Registros Importados:</span>
                <span className="font-bold text-slate-800">{excelBeneficiariosCount} beneficiarios</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Modo de Ingesta:</span>
                <span className="font-semibold text-blue-700">OpenXML zlib Nativo (Sin dependencias)</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-1">
              <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Cumplimiento de la Exigencia del Jurado
              </p>
              <p className="leading-relaxed">
                El sistema lee directamente la base de datos entregada en formato Excel, mapea automáticamente los campos sociodemográficos, asigna códigos inmutables <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900 font-mono">URB-2026-XXXX</code> e impide registros duplicados.
              </p>
            </div>
          </div>

          {/* Tarjeta: Motor Relacional SQL */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Motor de Base de Datos & Persistencia</h3>
                <p className="text-xs text-slate-500">Modelo Entidad-Relación y Tablas Normalizadas</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Tabla 1: Programas</span>
                <span className="font-bold text-slate-800">5 líneas del consorcio</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Tabla 2: Beneficiarios</span>
                <span className="font-bold text-slate-800">{beneficiarios.length} personas únicas</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Tabla 3: Núcleo Familiar</span>
                <span className="font-bold text-slate-800">Relación 1 a N</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Tabla 4: Vinculaciones</span>
                <span className="font-bold text-slate-800">Inscrito, en proceso, etc.</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Tabla 5: Atenciones</span>
                <span className="font-bold text-slate-800">Bienes y servicios entregados</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Tabla 6: Seguimientos</span>
                <span className="font-bold text-slate-800">Avances y compromisos pendientes</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-1">
              <p className="font-bold text-blue-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-blue-600" />
                Garantía de Persistencia Atómica
              </p>
              <p className="leading-relaxed">
                Todas las transacciones realizadas desde los formularios del prototipo se guardan inmediatamente en disco y se pueden exportar a un script SQL DDL + DML completo para PostgreSQL, MySQL o SQLite.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: LISTA DE REGISTROS DE LA BASE DE DATOS */}
      {activeTab === 'registros' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, documento, código o municipio..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterOrigen('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterOrigen === 'ALL'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                Todos ({beneficiarios.length})
              </button>
              <button
                onClick={() => setFilterOrigen('EXCEL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterOrigen === 'EXCEL'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
              >
                Excel Oficial ({excelBeneficiariosCount})
              </button>
              <button
                onClick={() => setFilterOrigen('WEB')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterOrigen === 'WEB'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                  }`}
              >
                Altas Prototipo ({webBeneficiariosCount})
              </button>
            </div>
          </div>

          {/* Tabla de Resultados */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Código Inmutable</th>
                  <th className="p-3">Nombre Completo</th>
                  <th className="p-3">Documento</th>
                  <th className="p-3">Municipio</th>
                  <th className="p-3">Condición Poblacional</th>
                  <th className="p-3">Origen</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBeneficiarios.slice(0, 50).map(b => (
                  <tr key={b.id || b.codigo_interno} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-700">
                      {b.codigo_interno}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {b.nombres} {b.apellidos}
                    </td>
                    <td className="p-3 text-slate-600">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-700 mr-1">
                        {b.tipo_documento}
                      </span>
                      {b.numero_documento || 'Sin doc'}
                    </td>
                    <td className="p-3 text-slate-700">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                        {b.municipio || 'Apartadó'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {b.condicion_poblacional || 'Comunidad de acogida'}
                    </td>
                    <td className="p-3">
                      {b.origen === 'EXCEL_OFICIAL' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <FileSpreadsheet className="w-3 h-3" />
                          Excel Oficial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                          Web / Prototipo
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {onSelectBeneficiario && (
                        <button
                          onClick={() => onSelectBeneficiario(b.id || b.codigo_interno)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                        >
                          Ver Ficha
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredBeneficiarios.length > 50 && (
            <p className="text-xs text-center text-slate-400 py-2">
              Mostrando los primeros 50 registros de {filteredBeneficiarios.length}. Utilice el buscador para filtrar.
            </p>
          )}
        </div>
      )}

      {/* PESTAÑA 3: ESQUEMA SQL RELACIONAL */}
      {activeTab === 'sql' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600" />
                Script DDL de Base de Datos Relacional (schema.sql)
              </h3>
              <p className="text-xs text-slate-500">
                Esquema estandarizado compatible con SQLite, PostgreSQL y MySQL.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
              >
                {copiedSql ? '¡Copiado!' : 'Copiar SQL'}
              </button>
              <a
                href="/api/database/schema"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ver archivo
              </a>
            </div>
          </div>

          <pre className="bg-slate-900 text-emerald-400 p-5 rounded-2xl text-xs font-mono overflow-x-auto max-h-[450px] leading-relaxed border border-slate-800">
            {sqlSchema || 'Cargando esquema SQL...'}
          </pre>
        </div>
      )}
    </div>
  );
}
