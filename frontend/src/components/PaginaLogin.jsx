import { useState } from 'react';
import { socios } from '../contenido/sitio';

export default function PaginaLogin({ onVolver, onEntrar }) {
  const [error, setError] = useState('');

  async function entrar(e) {
  e.preventDefault();
  const datos = new FormData(e.currentTarget);
  setError('');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: datos.get('email'),
        password: datos.get('password'),
      }),
    });
    const body = await res.json();
    if (!res.ok || !body.success) {
      setError(body.message || 'No se pudo entrar');
      return;
    }
    onEntrar(body.data);
  } catch {
    setError('No se pudo entrar');
  }
}

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <aside className="hidden flex-col gap-3 p-5 lg:flex">
        <div
          className="min-h-64 flex-1 rounded-[20px] bg-[#0e1a2b] bg-cover bg-center"
          style={{ backgroundImage: 'url(/socios/personal.png)' }}
          role="img"
          aria-label=""
        />
        <ul className="flex items-center justify-between gap-3">
          {socios.map((socio) => (
            <li key={socio.nombre}>
              <img src={socio.logo} alt={socio.nombre} className="h-10 w-auto max-w-28 object-contain" />
            </li>
          ))}
          <li>
            <img
              src="/socios/agencia-italiana.png"
              alt="Agencia Italiana de Cooperación para el Desarrollo"
              className="h-16 w-auto object-contain"
            />
          </li>
        </ul>
      </aside>

      <div className="mx-auto flex w-[min(32rem,90%)] flex-col justify-center py-10">
        <img src="/logos/uraba-pais-mark.svg" alt="Urabá País" className="mx-auto mb-4 h-16 w-auto" />

        <form onSubmit={entrar} className="rounded-2xl border border-[#d5dbe6] bg-white px-6 py-7">
          <h2 className="mb-8 text-center text-xl font-bold tracking-wide">INGRESO PORTAL WEB</h2>

          <label className="mb-3 block text-sm text-[#4b5568]">
            Correo
            <input
              name="email"
              type="email"
              defaultValue="funcionario@uraba-pais.local"
              autoComplete="username"
              className="mt-1 w-full rounded-lg border border-[#d5dbe6] px-4 py-3"
            />
          </label>

          <label className="mb-3 block text-sm text-[#4b5568]">
            Clave
            <input
              name="password"
              type="password"
              defaultValue="demo1234"
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-[#d5dbe6] px-4 py-3"
            />
          </label>

          <button
            type="submit"
            className="mt-8 w-full rounded-full bg-[#1e4bb8] py-3 font-semibold text-white"
          >
            Entrar
          </button>
          {error && <p className="mt-3 text-sm text-[#9a3412]">{error}</p>}
        </form>

        <button
          type="button"
          onClick={onVolver}
          className="mx-auto mt-4 rounded-full bg-[#3d6b4f] px-5 py-3 font-semibold text-white"
        >
          Volver al inicio
        </button>
      </div>
    </main>
  );
}