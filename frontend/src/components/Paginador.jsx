export default function Paginador({ pagina, total, porPagina, onChange }) {
    const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
    if (totalPaginas <= 1) return null;

    const desde = (pagina - 1) * porPagina + 1;
    const hasta = Math.min(pagina * porPagina, total);

    const numeros = [];
    for (let n = 1; n <= totalPaginas; n += 1) {
        if (n === 1 || n === totalPaginas || Math.abs(n - pagina) <= 1) numeros.push(n);
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-400">
                {desde}–{hasta} de {total}
            </span>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onChange(pagina - 1)}
                    disabled={pagina === 1}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                    Anterior
                </button>
                {numeros.map((n, i) => (
                    <span key={n} className="flex items-center">
                        {i > 0 && numeros[i - 1] !== n - 1 && (
                            <span className="px-1 text-xs text-slate-300">…</span>
                        )}
                        <button
                            type="button"
                            onClick={() => onChange(n)}
                            className={`h-8 w-8 rounded-xl text-xs font-semibold ${n === pagina
                                ? 'bg-blue-600 text-white'
                                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {n}
                        </button>
                    </span>
                ))}
                <button
                    type="button"
                    onClick={() => onChange(pagina + 1)}
                    disabled={pagina === totalPaginas}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}