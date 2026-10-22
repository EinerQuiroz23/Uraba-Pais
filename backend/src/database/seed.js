import { query, getClient } from './db.js';

/**
 * Datos semilla del proyecto URABÁ-PAÍS
 * Inserta municipios, líneas de trabajo y programas iniciales.
 */

const MUNICIPIOS = [
  'Apartadó', 'Turbo', 'Necoclí', 'Carepa', 'Chigorodó',
  'Mutatá', 'San Pedro de Urabá', 'San Juan de Urabá',
  'Arboletes', 'Vigía del Fuerte', 'Murindó'
];

const LINEAS_TRABAJO = [
  'Asistencia humanitaria y protección',
  'Salud y bienestar',
  'Integración socioeconómica y cohesión social'
];

// Mapeo: nombre del programa → nombre de la línea de trabajo
const PROGRAMAS = [
  {
    nombre: 'Asistencia Humanitaria de Emergencia y Protección',
    linea: 'Asistencia humanitaria y protección'
  },
  {
    nombre: 'Ruta de Protección y Orientación Legal',
    linea: 'Asistencia humanitaria y protección'
  },
  {
    nombre: 'Salud Mental, Bienestar y Apoyo Psicosocial',
    linea: 'Salud y bienestar'
  },
  {
    nombre: 'Rehabilitación Basada en Comunidad e Inclusión',
    linea: 'Salud y bienestar'
  },
  {
    nombre: 'Integración Socioeconómica y Medios de Vida',
    linea: 'Integración socioeconómica y cohesión social'
  }
];

/**
 * Ejecuta la inserción de datos semilla dentro de una transacción.
 * Usa ON CONFLICT DO NOTHING para ser idempotente.
 */
export async function seedDatabase() {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Insertar municipios
    for (const nombre of MUNICIPIOS) {
      await client.query(
        'INSERT INTO municipio (nombre) VALUES ($1) ON CONFLICT (nombre) DO NOTHING',
        [nombre]
      );
    }
    console.log(`[Seed] ✅ ${MUNICIPIOS.length} municipios verificados.`);

    // 2. Insertar líneas de trabajo
    for (const nombre of LINEAS_TRABAJO) {
      await client.query(
        'INSERT INTO linea_trabajo (nombre) VALUES ($1) ON CONFLICT (nombre) DO NOTHING',
        [nombre]
      );
    }
    console.log(`[Seed] ✅ ${LINEAS_TRABAJO.length} líneas de trabajo verificadas.`);

    // 3. Insertar programas (requiere buscar el id_linea correspondiente)
    for (const prog of PROGRAMAS) {
      const lineaRes = await client.query(
        'SELECT id_linea FROM linea_trabajo WHERE nombre = $1',
        [prog.linea]
      );

      if (lineaRes.rows.length > 0) {
        const id_linea = lineaRes.rows[0].id_linea;
        await client.query(
          'INSERT INTO programa (nombre, id_linea) VALUES ($1, $2) ON CONFLICT (nombre) DO NOTHING',
          [prog.nombre, id_linea]
        );
      }
    }
    console.log(`[Seed] ✅ ${PROGRAMAS.length} programas verificados.`);

    await client.query('COMMIT');
    console.log('[Seed] ✅ Datos semilla insertados correctamente.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seed] ❌ Error al insertar datos semilla:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Ejecutar si se llama directamente: node src/database/seed.js
const isDirectRun = process.argv[1] && process.argv[1].includes('seed');
if (isDirectRun) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Proceso finalizado.');
      process.exit(0);
    })
    .catch(() => process.exit(1));
}
