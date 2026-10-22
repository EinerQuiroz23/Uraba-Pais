import React, { useState } from "react";

const ZONAS = [
  {
    nombre: "Arboletes",
    d: "M330.9 42.2 L378.2 60.2 L376.6 63.3 L349.4 72.4 L345.8 90.4 L314.4 87.2 L301.5 89.7 L243.9 65.6 L246.0 60.2 L294.3 45.9 L279.4 22.2 L310.3 12.0 L330.9 42.2 Z",
    labelX: 320,
    labelY: 55,
  },
  {
    nombre: "Turbo",
    d: "M87.7 151.5 L112.8 164.2 L95.3 167.6 L96.3 187.4 L135.9 190.1 L169.4 186.5 L175.5 159.2 L173.5 140.4 L158.6 123.3 L222.3 111.7 L246.0 98.8 L296.9 104.0 L301.5 89.7 L314.4 87.2 L318.5 102.7 L311.3 137.2 L314.9 153.6 L305.1 158.8 L259.9 179.0 L167.3 194.4 L145.7 196.3 L143.7 214.2 L143.7 233.1 L184.3 246.7 L213.1 269.7 L197.1 269.9 L147.3 250.8 L90.7 248.5 L80.4 238.3 L12.0 210.8 L32.1 200.1 L52.6 192.4 L65.0 168.8 L89.7 159.7 L87.7 151.5 Z",
    labelX: 150,
    labelY: 175,
  },
  {
    nombre: "Chigorodó",
    d: "M277.4 223.5 L272.7 253.8 L241.9 266.5 L213.1 269.7 L184.3 246.7 L143.7 233.1 L143.7 214.2 L188.9 223.8 L223.4 221.0 L277.4 223.5 Z",
    labelX: 220,
    labelY: 245,
  },
  {
    nombre: "Carepa",
    d: "M167.3 194.4 L188.9 206.7 L253.2 214.2 L266.6 202.4 L288.7 196.0 L277.4 223.5 L223.4 221.0 L188.9 223.8 L143.7 214.2 L145.7 196.3 L167.3 194.4 Z",
    labelX: 210,
    labelY: 210,
  },
  {
    nombre: "San Pedro de Urabá",
    d: "M376.6 63.3 L395.7 76.3 L392.1 90.8 L408.0 99.0 L362.7 112.0 L336.0 134.9 L337.5 143.8 L314.9 153.6 L311.3 137.2 L318.5 102.7 L314.4 87.2 L345.8 90.4 L349.4 72.4 L376.6 63.3 Z",
    labelX: 355,
    labelY: 105,
  },
  {
    nombre: "San Juan de Urabá",
    d: "M246.0 60.2 L219.8 40.2 L255.3 32.4 L279.4 22.2 L294.3 45.9 L246.0 60.2 Z",
    labelX: 250,
    labelY: 42,
  },
  {
    nombre: "Necoclí",
    d: "M246.0 60.2 L243.9 65.6 L301.5 89.7 L296.9 104.0 L246.0 98.8 L222.3 111.7 L158.6 123.3 L165.3 100.4 L137.5 81.3 L94.3 72.9 L111.8 58.1 L148.3 56.5 L211.0 49.3 L219.8 40.2 L246.0 60.2 Z",
    labelX: 180,
    labelY: 80,
  },
  {
    nombre: "Mutatá",
    d: "M323.7 283.7 L392.1 328.0 L350.4 327.6 L317.5 321.2 L279.9 330.8 L260.9 308.7 L225.4 298.3 L197.1 269.9 L213.1 269.7 L241.9 266.5 L272.7 253.8 L323.7 283.7 Z",
    labelX: 290,
    labelY: 300,
  },
  {
    nombre: "Murindó",
    d: "M253.7 355.1 L268.6 369.2 L243.4 383.7 L231.1 407.8 L241.4 411.4 L242.9 422.8 L186.3 417.3 L168.9 421.7 L127.2 418.0 L117.9 404.6 L98.4 395.1 L105.6 386.9 L150.3 380.3 L137.5 354.6 L199.7 350.1 L253.7 355.1 Z",
    labelX: 175,
    labelY: 390,
  },
  {
    nombre: "Vigía del Fuerte",
    d: "M105.6 386.9 L98.4 395.1 L117.9 404.6 L127.2 418.0 L168.9 421.7 L186.3 417.3 L242.9 422.8 L247.0 435.1 L263.5 468.7 L264.0 498.7 L296.9 508.0 L231.1 503.7 L183.3 507.5 L182.2 499.4 L157.5 486.4 L151.4 476.2 L157.0 449.2 L106.1 432.6 L83.0 415.1 L75.3 392.6 L99.9 383.7 L105.6 386.9 Z",
    labelX: 160,
    labelY: 460,
  },
  {
    nombre: "Apartadó",
    d: "M305.1 158.8 L310.8 171.0 L306.7 188.3 L288.7 196.0 L266.6 202.4 L253.2 214.2 L188.9 206.7 L167.3 194.4 L259.9 179.0 L305.1 158.8 Z",
    labelX: 245,
    labelY: 185,
  },
];

function tono(valor, maximo) {
  if (!valor || !maximo) return "#e2e8f0";
  const t = valor / maximo;
  if (t >= 0.75) return "#0c4a6e";
  if (t >= 0.5) return "#0369a1";
  if (t >= 0.25) return "#0ea5e9";
  return "#7dd3fc";
}

export default function MapaUraba({
  filas,
  total,
  seleccionado = null,
  onSelect,
}) {
  const [hover, setHover] = useState(null);

  const maximo = Math.max(...filas.map((f) => f.total || 0), 1);
  const dato = (nombre) => filas.find((f) => f.municipio === nombre);

  const activoNombre = seleccionado || hover;
  const activoDato = activoNombre ? dato(activoNombre) : null;
  const porcentaje =
    activoDato && total > 0 ? Math.round((activoDato.total / total) * 100) : 0;

  const handleClick = (nombre) => {
    const nuevo = seleccionado === nombre ? null : nombre;
    if (onSelect) onSelect(nuevo);
  };

  return (
    <div className="w-full h-full min-h-[480px] flex flex-col rounded-2xl border border-slate-200 bg-slate-50 shadow-sm overflow-hidden">
      {/* ===== PANEL STICKY (siempre visible al hacer scroll) ===== */}
      <div className="sticky top-0 z-30 px-3 pt-3 pb-2 bg-slate-50/95 backdrop-blur-sm">
        <div
          className={`rounded-xl border px-4 py-2.5 text-sm shadow-lg transition-all duration-200 ${
            activoDato
              ? "bg-white border-sky-300 ring-1 ring-sky-100"
              : "bg-white border-slate-200"
          }`}
        >
          {activoDato ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-[15px] leading-tight truncate">
                  {activoNombre}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  <span className="font-semibold text-sky-700">
                    {activoDato.total}
                  </span>{" "}
                  personas
                  <span className="mx-1.5 text-slate-300">·</span>
                  <span className="font-medium">{porcentaje}%</span> del total
                </p>
              </div>
              {seleccionado && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelect) onSelect(null);
                  }}
                  className="shrink-0 text-[11px] font-semibold text-sky-600 hover:text-sky-800 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 transition-colors"
                >
                  Quitar
                </button>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-sm py-0.5">
              Pasa el cursor o haz clic en un municipio
            </p>
          )}
        </div>
      </div>

      {/* ===== MAPA (ocupa el resto del espacio) ===== */}
      <div className="flex-1 relative px-2 pb-2 min-h-0">
        <svg
          viewBox="0 0 420 520"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {ZONAS.map((zona) => {
            const fila = dato(zona.nombre);
            const cant = fila?.total || 0;
            const isHover = hover === zona.nombre;
            const isFijado = seleccionado === zona.nombre;
            const isActivo = isHover || isFijado;

            return (
              <g key={zona.nombre}>
                <path
                  d={zona.d}
                  fill={isActivo ? "#0c4a6e" : tono(cant, maximo)}
                  stroke={isFijado ? "#0284c7" : "#ffffff"}
                  strokeWidth={isFijado ? 2.8 : 1.5}
                  className="cursor-pointer transition-all duration-200"
                  style={{ filter: isActivo ? "brightness(1.08)" : undefined }}
                  onMouseEnter={() => setHover(zona.nombre)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => handleClick(zona.nombre)}
                />
                {(cant > 0 ||
                  [
                    "Apartadó",
                    "Turbo",
                    "Necoclí",
                    "Carepa",
                    "Chigorodó",
                  ].includes(zona.nombre)) && (
                  <text
                    x={zona.labelX}
                    y={zona.labelY}
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                    style={{
                      fontSize: isActivo ? 11 : 9,
                      fontWeight: isActivo ? 700 : 500,
                      fill: isActivo ? "#ffffff" : "#334155",
                    }}
                  >
                    {zona.nombre.length > 14
                      ? zona.nombre.split(" ")[0]
                      : zona.nombre}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ===== LEYENDA ===== */}
      <div className="px-3 pb-2 flex justify-center">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-100 shadow-sm">
          <span>Menos</span>
          <div className="flex h-2 rounded-full overflow-hidden">
            <span className="w-5 bg-slate-200" />
            <span className="w-5 bg-sky-300" />
            <span className="w-5 bg-sky-500" />
            <span className="w-5 bg-sky-700" />
            <span className="w-5 bg-sky-900" />
          </div>
          <span>Más</span>
        </div>
      </div>
    </div>
  );
}
