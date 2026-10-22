import React, { useState, useEffect } from "react";
import {
  Users,
  FolderGit2,
  HeartHandshake,
  Clock,
  Download,
  MapPin,
  Target,
  Layers,
} from "lucide-react";
import MapaUraba from "./MapaUraba";
import ExcelJS from "exceljs/dist/exceljs.min.js";
import { Buffer } from "buffer";
import { addChart } from "chartsheet";

import { api } from "../services/api";

export default function Modulo4Reportes() {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState(null);

  const fetchMetricas = async () => {
    setLoading(true);
    try {
      const res = await api.getMetricas();
      if (res.success) {
        setMetricas(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricas();
  }, []);

  const handleExportCSV = async () => {
    if (!metricas) return;
    const { indicadores_clave: kpis, distribucion: dist } = metricas;

    const municipios = (dist.por_municipio || []).filter((f) => f.total > 0);
    const programas = (dist.por_programa || []).filter(
      (p) => (p.total_beneficiarios ?? 0) > 0,
    );
    const lineas = (dist.por_linea_trabajo || [])
      .map((linea) => {
        const lista = linea.programas || [];
        return {
          nombre: linea.linea_trabajo,
          vinculaciones: lista.reduce(
            (s, p) => s + (p.total_participaciones || 0),
            0,
          ),
          atenciones: lista.reduce((s, p) => s + (p.total_atenciones || 0), 0),
        };
      })
      .filter((l) => l.vinculaciones > 0 || l.atenciones > 0);

    const wb = new ExcelJS.Workbook();

    const resumen = wb.addWorksheet("Resumen");
    resumen.addRow(["Reporte Agregado del Proyecto URABÁ-PAÍS"]);
    resumen.addRow(["Fecha", new Date().toLocaleString()]);
    resumen.addRow([]);
    resumen.addRow(["Indicador", "Cantidad"]);
    resumen.addRow(["Beneficiarios únicos", kpis.beneficiarios_unicos]);
    resumen.addRow(["Participaciones", kpis.participaciones_totales]);
    resumen.addRow(["Atenciones", kpis.atenciones_totales]);
    resumen.addRow(["Seguimientos pendientes", kpis.seguimientos_pendientes]);
    resumen.getColumn(1).width = 42;
    resumen.getColumn(2).width = 16;

    const hojaLineas = wb.addWorksheet("Lineas");
    hojaLineas.addRow(["Línea de trabajo", "Vinculaciones", "Atenciones"]);
    lineas.forEach((l) =>
      hojaLineas.addRow([l.nombre, l.vinculaciones, l.atenciones]),
    );
    hojaLineas.getColumn(1).width = 48;

    const hojaMuni = wb.addWorksheet("Municipios");
    hojaMuni.addRow(["Municipio", "Personas"]);
    municipios.forEach((f) => hojaMuni.addRow([f.municipio, f.total]));
    hojaMuni.getColumn(1).width = 28;

    const hojaProg = wb.addWorksheet("Programas");
    hojaProg.addRow([
      "Programa",
      "Línea",
      "Inscritos",
      "En proceso",
      "Finalizados",
      "Total",
    ]);
    programas.forEach((p) =>
      hojaProg.addRow([
        p.programa,
        p.linea_trabajo,
        p.inscritos ?? 0,
        p.en_proceso ?? 0,
        p.finalizados ?? 0,
        p.total_beneficiarios ?? 0,
      ]),
    );
    hojaProg.getColumn(1).width = 52;
    hojaProg.getColumn(2).width = 42;

    const ultima = lineas.length + 1;
    try {
      let buffer = await wb.xlsx.writeBuffer();
      try {
        window.Buffer = Buffer;
        buffer = await addChart(buffer, {
          type: "column",
          title: "Actividad por línea de trabajo",
          sheet: "Lineas",
          categories: `'Lineas'!$A$2:$A$${ultima}`,
          series: [
            { nameRef: "'Lineas'!$B$1", ref: `'Lineas'!$B$2:$B$${ultima}` },
            { nameRef: "'Lineas'!$C$1", ref: `'Lineas'!$C$2:$C$${ultima}` },
          ],
          anchor: { col: 4, row: 1 },
          dataLabels: true,
          legend: "b",
        });
      } catch (graficaError) {
        console.error("Gráfica no añadida:", graficaError);
      }

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte_indicadores_uraba_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("No se pudo exportar: " + (err.message || err));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-slate-500 shadow-sm border border-slate-200">
        <p className="animate-pulse">
          Calculando indicadores dinámicos en tiempo real...
        </p>
      </div>
    );
  }

  if (!metricas) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-slate-500 shadow-sm border border-slate-200">
        <p>No se pudieron cargar los reportes.</p>
      </div>
    );
  }

  const { indicadores_clave, distribucion } = metricas;

  return (
    <div className="space-y-6">
      {/* Banner explicativo de la Regla de Conteo */}
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-600 text-white">
              Módulo 4
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              Consultas, Métricas e Indicadores Dinámicos
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Cumple estrictamente la <strong>Regla de Conteo Obligatoria</strong>
            : diferencia con total exactitud <strong>personas únicas</strong> de{" "}
            <strong>eventos</strong> (participaciones, atenciones y
            seguimientos).
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all text-sm shrink-0"
        >
          <Download className="w-4 h-4" />
          Exportar Reporte (Excel)
        </button>
      </div>

      {/* 4 INDICADORES CLAVE REGLAMENTARIOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Indicador 1: Beneficiarios Únicos */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              Regla de Conteo
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {indicadores_clave.beneficiarios_unicos}
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Beneficiarios Únicos
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Contados 1 sola vez por persona
            </p>
          </div>
        </div>

        {/* Indicador 2: Participaciones por Programa */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Multi-programa
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {indicadores_clave.participaciones_totales}
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Participaciones Totales
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Vinculaciones a las 3 líneas
            </p>
          </div>
        </div>

        {/* Indicador 3: Atenciones o Ayudas Entregadas */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Servicios y Ayudas
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {indicadores_clave.atenciones_totales}
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Atenciones Entregadas
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Bienes, kits y asistencias
            </p>
          </div>
        </div>

        {/* Indicador 4: Seguimientos Pendientes */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Acción Futura
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {indicadores_clave.seguimientos_pendientes}
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Seguimientos Pendientes
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Casos con tareas activas
            </p>
          </div>
        </div>
      </div>

      {/* DESGLOSE TERRITORIAL Y LÍNEAS DE TRABAJO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución Territorial en Urabá */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-slate-800 text-sm">
                Cobertura territorial
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {municipioSeleccionado && (
                <button
                  onClick={() => setMunicipioSeleccionado(null)}
                  className="text-xs text-sky-600 hover:text-sky-800 font-medium px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 transition-colors"
                >
                  Limpiar filtro: {municipioSeleccionado}
                </button>
              )}
              <span className="text-[11px] font-semibold text-slate-400">
                Personas únicas, sin datos personales
              </span>
            </div>
          </div>

          {(() => {
            const filas = [...(distribucion.por_municipio || [])].sort(
              (a, b) => b.total - a.total,
            );
            const total = indicadores_clave.beneficiarios_unicos || 0;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-2.5">
                  {filas.map((fila) => {
                    const porcentaje =
                      total > 0 ? Math.round((fila.total / total) * 100) : 0;
                    const maximo = filas[0]?.total || 1;
                    const ancho =
                      fila.total > 0
                        ? Math.max(6, Math.round((fila.total / maximo) * 100))
                        : 0;
                    const isSelected = municipioSeleccionado === fila.municipio;

                    return (
                      <div
                        key={fila.municipio}
                        onClick={() =>
                          setMunicipioSeleccionado(
                            isSelected ? null : fila.municipio,
                          )
                        }
                        className={`space-y-1 p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "bg-sky-50 ring-2 ring-sky-400 shadow-sm"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex justify-between text-xs font-medium text-slate-700">
                          <span
                            className={
                              isSelected ? "font-bold text-sky-800" : ""
                            }
                          >
                            {fila.municipio}
                          </span>
                          <span
                            className={`font-bold ${isSelected ? "text-sky-700" : ""}`}
                          >
                            {fila.total}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ease-out ${
                              isSelected ? "bg-sky-600" : "bg-sky-500"
                            }`}
                            style={{ width: `${ancho}%` }}
                          />
                        </div>
                        <div
                          className={`text-[11px] ${isSelected ? "text-sky-600 font-medium" : "text-slate-400"}`}
                        >
                          {porcentaje}% de las personas
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="lg:col-span-2 mt-2 flex"
                  style={{ minHeight: "480px" }}
                >
                  <MapaUraba
                    filas={filas}
                    total={total}
                    seleccionado={municipioSeleccionado}
                    onSelect={setMunicipioSeleccionado}
                  />
                </div>
              </div>
            );
          })()}
        </div>

        {/* Distribución por Líneas de Intervención */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">
                Actividad por línea de trabajo
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-600" />{" "}
                Vinculaciones
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-sky-300" /> Atenciones
              </span>
            </div>
          </div>

          {(() => {
            const grupos = (distribucion.por_linea_trabajo || []).map(
              (linea) => {
                const programas = linea.programas || [];
                return {
                  nombre: linea.linea_trabajo,
                  vinculaciones: programas.reduce(
                    (s, p) => s + (p.total_participaciones || 0),
                    0,
                  ),
                  atenciones: programas.reduce(
                    (s, p) => s + (p.total_atenciones || 0),
                    0,
                  ),
                };
              },
            );
            const maximo = Math.max(
              ...grupos.flatMap((g) => [g.vinculaciones, g.atenciones]),
              1,
            );

            return (
              <div className="flex items-end justify-around gap-4 h-56 pt-4">
                {grupos.map((g) => (
                  <div
                    key={g.nombre}
                    className="flex flex-1 flex-col items-center gap-2 h-full group"
                  >
                    <div className="flex items-end justify-center gap-2 flex-1 w-full">
                      {[
                        {
                          valor: g.vinculaciones,
                          color: "bg-blue-600",
                          hover: "group-hover:bg-blue-700",
                        },
                        {
                          valor: g.atenciones,
                          color: "bg-sky-300",
                          hover: "group-hover:bg-sky-400",
                        },
                      ].map((barra) => (
                        <div
                          key={barra.color}
                          className="flex flex-col items-center justify-end h-full w-9"
                        >
                          <span className="text-[11px] font-bold text-slate-700 mb-1 transition-transform group-hover:scale-110">
                            {barra.valor}
                          </span>
                          <div
                            className={`${barra.color} ${barra.hover} w-full rounded-t-lg transition-all duration-300`}
                            style={{
                              height: `${Math.max(4, Math.round((barra.valor / maximo) * 100))}%`,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] text-center text-slate-500 leading-tight px-1">
                      {g.nombre}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* TABLA AGREGADA POR PROGRAMAS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              Participación Agregada por Programa y Estados
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Totalmente dinámico: se recalcula al registrar en vivo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Programa</th>
                <th className="px-5 py-3">Línea de Intervención</th>
                <th className="px-5 py-3 text-center">Inscritos</th>
                <th className="px-5 py-3 text-center">En Proceso</th>
                <th className="px-5 py-3 text-center">Finalizados</th>
                <th className="px-5 py-3 text-right">Total Vinculados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(distribucion.por_programa || []).map((p) => {
                const estados = {
                  inscrito: p.inscritos ?? p.estados?.inscrito ?? 0,
                  en_proceso: p.en_proceso ?? p.estados?.en_proceso ?? 0,
                  finalizado: p.finalizados ?? p.estados?.finalizado ?? 0,
                };
                return (
                  <tr
                    key={p.id_programa || p.programa}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900 text-xs">
                      {p.programa}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {p.linea_trabajo}
                    </td>
                    <td className="px-5 py-3.5 text-center text-xs font-mono">
                      {estados.inscrito}
                    </td>
                    <td className="px-5 py-3.5 text-center text-xs font-mono text-amber-600 font-semibold">
                      {estados.en_proceso}
                    </td>
                    <td className="px-5 py-3.5 text-center text-xs font-mono text-emerald-600 font-semibold">
                      {estados.finalizado}
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-slate-900 text-sm">
                      {p.total_beneficiarios}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
