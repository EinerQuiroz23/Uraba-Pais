import { useEffect, useState } from 'react';
import {
  contactos,
  escenas,
  lineas,
  municipios,
  socios,
  perfiles,
  pasos,
} from '../contenido/sitio';

const AZUL = '#1e4bb8';
const AZUL_OSCURO = '#12306e';

export default function PaginaInicio({ onIrAlPortal }) {
  const [escena, setEscena] = useState(0);
  const [fija, setFija] = useState(false);
  const fondo = escenas[escena];

  useEffect(() => {
    const id = window.setInterval(
      () => setEscena((n) => (n + 1) % escenas.length),
      7000
    );
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const alBajar = () => setFija(window.scrollY > 24);
    alBajar();
    window.addEventListener('scroll', alBajar, { passive: true });
    return () => window.removeEventListener('scroll', alBajar);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#1c2430]" style={{ fontFamily: '"Source Sans 3", Inter, sans-serif' }}>
      <header
        className={`fixed inset-x-0 top-0 z-30 flex items-center gap-4 px-4 py-2 transition-colors duration-200 sm:px-8 ${fija
            ? 'border-b border-[#d5dbe6] bg-white text-[#12306e]'
            : 'border-b border-transparent bg-transparent text-white'
          }`}
      >
        <a href="#inicio" className="shrink-0">
          <img
            src="/logos/uraba-pais-logo.svg"
            alt="Urabá País. Niñez, familias, juventud"
            className={`h-20 w-auto ${fija ? '' : 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]'}`}
          />
        </a>

        <nav className={`ml-auto hidden items-center gap-6 font-semibold sm:flex ${fija ? '' : '[text-shadow:0_1px_8px_rgba(0,0,0,0.45)]'}`}>
          <a href="#inicio">Inicio</a>
          <a href="#contacto">Contacto</a>
          <a href="#nosotros">Nosotros</a>
        </nav>

        <button
          type="button"
          onClick={onIrAlPortal}
          className="ml-auto rounded-full px-4 py-2 font-semibold text-white sm:ml-2"
          style={{ backgroundColor: AZUL }}
        >
          Portal
        </button>
      </header>

      <section
        id="inicio"
        className="relative flex min-h-screen items-start bg-cover bg-center px-6 pb-24 pt-40 sm:px-[7vw] sm:pt-44"
        style={{ backgroundImage: `url("${fondo.url}")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(8,14,28,0.78)] via-[rgba(8,14,28,0.42)] to-[rgba(8,14,28,0.18)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent to-white" />

        <div className="relative max-w-xl text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/80">Urabá antioqueño</p>
          <h1
            className="mt-2 text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl"
            style={{ fontFamily: 'Manrope, Inter, sans-serif' }}
          >
            Protección, salud e integración para quien llega y para quien recibe.
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-snug text-white/90">
            <strong>Urabá País</strong> acompaña a personas migrantes, refugiadas, desplazadas, retornadas y a las comunidades de acogida en Apartadó, Turbo y Necoclí.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onIrAlPortal}
              className="rounded-full px-5 py-3 font-semibold text-white"
              style={{ backgroundColor: AZUL }}
            >
              Ingresar al portal
            </button>
            <a href="#nosotros" className="rounded-full border-2 border-white px-5 py-3 font-semibold text-white">
              Leer más
            </a>
          </div>

          <p className="mt-6 max-w-sm border-t border-white/40 pt-4">
            La prioridad son las mujeres, la niñez y las personas con discapacidad.
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-10 flex justify-center gap-2" role="tablist" aria-label="Imágenes del territorio">
          {escenas.map((item, i) => (
            <button
              key={item.titulo}
              type="button"
              aria-label={item.titulo}
              onClick={() => setEscena(i)}
              className={`h-2.5 w-2.5 rounded-full ${i === escena ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      <section id="nosotros" className="px-6 py-16 sm:px-[7vw]">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: AZUL }}>Qué es</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ fontFamily: 'Manrope, Inter, sans-serif' }}>
              Un consorcio, tres resultados, una sola persona.
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed">
              Lo lidera COOPI, junto con Fondazione L'Albero della Vita, HIAS y Humanity & Inclusion. Lo financia la Agencia Italiana de Cooperación para el Desarrollo, con apoyo de la Embajada de Italia en Bogotá. La atención no se publica como historia individual: cada persona tiene una ficha y los reportes solo muestran cifras.
            </p>
          </div>

          <ul className="mx-auto grid max-w-sm grid-cols-2 gap-3" aria-label="Organizaciones del consorcio">
            {socios.map((socio) => (
              <li key={socio.nombre} className="grid h-24 place-items-center rounded-2xl border border-[#d5dbe6] bg-white p-3">
                <img src={socio.logo} alt={socio.nombre} className="max-h-12 w-auto object-contain" />
              </li>
            ))}
          </ul>
        </div>

        <ul className="mt-12 grid gap-4 lg:grid-cols-3">
          {lineas.map((linea) => (
            <li key={linea.nombre} className="rounded-2xl border border-[#d5dbe6] p-5">
              <h3 className="text-lg font-bold" style={{ fontFamily: 'Manrope, Inter, sans-serif' }}>{linea.nombre}</h3>
              <p className="mt-2 leading-relaxed">{linea.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="territorio" className="bg-[#eef1f6] px-6 py-16 sm:px-[7vw]">
        <p className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: AZUL }}>Dónde</p>
        <h2 className="mt-2 max-w-xl text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope, Inter, sans-serif' }}>
          Tres municipios del Urabá antioqueño.
        </h2>
        <ul className="mt-8 grid gap-4 lg:grid-cols-3">
          {municipios.map((lugar) => (
            <li key={lugar.nombre} className="rounded-2xl border border-[#d5dbe6] bg-white p-5">
              <h3 className="text-lg font-bold" style={{ fontFamily: 'Manrope, Inter, sans-serif' }}>{lugar.nombre}</h3>
              <p className="mt-2 leading-relaxed">{lugar.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-6 py-16 sm:px-[7vw]">
        <p className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: AZUL }}>Para quién</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope, Inter, sans-serif' }}>
          Quien llega y quien recibe.
        </h2>
        <ul className="mt-8 grid gap-4 lg:grid-cols-3">
          {perfiles.map((perfil) => (
            <li key={perfil.nombre} className="rounded-2xl border border-[#d5dbe6] p-5">
              <h3 className="text-lg font-bold" style={{ fontFamily: 'Manrope, Inter, sans-serif' }}>{perfil.nombre}</h3>
              <p className="mt-2 leading-relaxed">{perfil.texto}</p>
            </li>
          ))}
        </ul>

        <p className="mt-14 text-sm font-bold uppercase tracking-[0.14em]" style={{ color: AZUL }}>Cómo se acompaña</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope, Inter, sans-serif' }}>
          De la orientación al seguimiento.
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pasos.map((paso, i) => (
            <li key={paso.nombre} className="border-t-2 pt-4" style={{ borderColor: AZUL }}>
              <span className="text-xs font-bold tracking-widest" style={{ color: AZUL }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-1 font-bold" style={{ fontFamily: 'Manrope, Inter, sans-serif' }}>{paso.nombre}</h3>
              <p className="mt-1 leading-relaxed">{paso.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer id="contacto" className="grid gap-8 px-6 py-10 text-white sm:px-[7vw] lg:grid-cols-[1fr_1.4fr]" style={{ backgroundColor: AZUL_OSCURO }}>
        <div>
          <strong className="text-lg tracking-wide">URABÁ PAÍS</strong>
          <p className="mt-2 max-w-md leading-snug">
            Protección, asistencia humanitaria e integración socioeconómica en Antioquia.
          </p>
          <p className="mt-6 text-sm">Patrocina:</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <img src="/socios/agencia-italiana.png" alt="Agencia Italiana de Cooperación para el Desarrollo" className="h-24 rounded-lg bg-white p-2" />
            <img src="/socios/embajadas.png" alt="Embajada de Italia en Bogotá" className="h-24 rounded-lg bg-white p-2" />
          </div>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {contactos.map((item) => (
            <li key={item.nombre}>
              <strong>{item.nombre}</strong>
              <p className="mt-1 text-sm leading-snug text-white/90">{item.detalle}</p>
              {item.correo && (
                <a className="text-sm underline" href={`mailto:${item.correo}`}>{item.correo}</a>
              )}
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}