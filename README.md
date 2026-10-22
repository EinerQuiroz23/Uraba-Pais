# Sistema Web URABÁ-PAÍS 🌐
### Prototipo Funcional de Gestión y Seguimiento de Beneficiarios y Familias
**Hackathon Proyecto URABÁ-PAÍS**  
*Iniciativa liderada por COOPI Cooperación Internacional, en alianza con Fundación HIAS Colombia, Fondazione L'Albero della Vita (FADV) y Humanity and Inclusion (HI), con el apoyo de la Agenzia Italiana per la Cooperazione allo Sviluppo (AICS).*

---

## 📌 1. Visión General del Proyecto
En el Urabá antioqueño (Apartadó, Turbo y Necoclí), la población vulnerable (migrantes, refugiados, víctimas del conflicto armado y comunidades de acogida) a menudo participa en múltiples iniciativas humanitarias y de desarrollo.

Este sistema implementa una arquitectura **Modelo-Vista-Controlador (MVC)** desarrollada con **Node.js, Express y React**, garantizando:
1. **Regla de Beneficiario Único:** Código inmutable generado por el sistema (`URB-2026-XXXX`).
2. **Control Anti-Duplicados:** Verificación previa por documento y advertencia ante coincidencias.
3. **Diferenciación conceptual estricta:** Registro de **Atenciones/Ayudas** (lo entregado) vs. **Seguimientos** (avances y tareas pendientes).
4. **Regla de Conteo e Indicadores Dinámicos:** Cálculo independiente de personas únicas vs. eventos.
5. **Ficha Consolidada 360°:** Visión unificada del ciclo de vida del beneficiario.
6. **Protección de Datos (Habeas Data):** Consentimiento informado y anonimización de métricas.

---

## Arquitectura

Express + React + PostgreSQL, por capas:

- `schemas/` valida lo que entra.
- `repositories/` hablan con PostgreSQL.
- `services/` aplican las reglas de negocio.
- `controllers/` responden HTTP.
- `routes/` agrupan los endpoints.

El frontend vive en `frontend/` y consume `/api`.
│
├── frontend/                 # VISTA: Interfaz de usuario interactiva (React)
│   ├── src/
│   │   ├── components/       # Componentes de los 4 módulos reglamentarios
│   │   │   ├── Header.jsx                (Barra institucional, roles y accesibilidad)
│   │   │   ├── FlujoDemostracion.jsx     (Wizard para evaluación del jurado)
│   │   │   ├── Modulo1Beneficiarios.jsx  (Búsqueda, registro, familias, anti-duplicados)
│   │   │   ├── Modulo2Programas.jsx      (Catálogo de 3 líneas y vinculaciones)
│   │   │   ├── Modulo3Atenciones.jsx     (Atenciones entregadas vs. seguimientos pendientes)
│   │   │   ├── Modulo4Ficha360.jsx       (Ficha consolidada 360° con opción de impresión)
│   │   │   ├── Modulo4Reportes.jsx       (KPIs dinámicos y exportación CSV)
│   │   │   └── AsistenteIA.jsx           (Asistente técnico con límites éticos)
│   │   ├── services/api.js   # Comunicación transparente Frontend <-> Backend
│   │   ├── App.jsx           # Orquestador principal
│   │   └── index.css         # Estilos Tailwind y reglas de impresión
│   └── package.json
│
├── iniciar_proyecto.bat      # Script de 1 clic para Windows
├── DESCRIPCION_SOLUCION.md   # Entregable 3: Ficha técnica y arquitectura
├── EVIDENCIA_PRUEBAS.md      # Entregable 4: Matriz de pruebas funcionales
└── PRESENTACION_PITCH.md     # Entregable 5: Guion de sustentación ante jurados
```

---

## 🚀 3. Instrucciones de Instalación y Ejecución

### Opción Rápida (Recomendada en Windows)
Haga doble clic en el archivo:
```bat
iniciar_proyecto.bat
```
El script instalará las dependencias necesarias y levantará automáticamente tanto el servidor Backend como el Frontend.

---

### Opción Manual (Paso a Paso)

#### 1. Iniciar el Backend (Express + Node)
```bash
cd backend
npm install
npm start
```
*El backend quedará escuchando en `http://localhost:5000` con la ruta de salud en `http://localhost:5000/api/health`.*

#### 2. Iniciar el Frontend (React + Vite)
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```