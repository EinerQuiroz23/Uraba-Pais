import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db.js';

const LINEA = {
  R1: 'Asistencia humanitaria y protección',
  R2: 'Salud y bienestar',
  R3: 'Integración socioeconómica y cohesión social',
};

const aqui = path.dirname(fileURLToPath(import.meta.url));
const ruta = process.argv[2] || path.join(aqui, 'beneficiarios.json');
const lista = JSON.parse(fs.readFileSync(ruta, 'utf8'));

async function idMunicipio(nombre) {
  const lugar = nombre || 'Apartadó';
  let res = await query('SELECT id_municipio FROM municipio WHERE nombre = $1', [lugar]);
  if (res.rows[0]) return res.rows[0].id_municipio;
  await query('INSERT INTO municipio (nombre) VALUES ($1) ON CONFLICT (nombre) DO NOTHING', [lugar]);
  res = await query('SELECT id_municipio FROM municipio WHERE nombre = $1', [lugar]);
  return res.rows[0].id_municipio;
}

async function idPrograma(nombre, workLine) {
  const lineaNombre = LINEA[workLine] || LINEA.R1;
  const linea = await query('SELECT id_linea FROM linea_trabajo WHERE nombre = $1', [lineaNombre]);
  if (!linea.rows[0]) {
    throw new Error('Faltan las líneas de trabajo. Arranca el backend una vez y vuelve a correr este script.');
  }
  let res = await query('SELECT id_programa FROM programa WHERE nombre = $1', [nombre]);
  if (res.rows[0]) return res.rows[0].id_programa;
  await query(
    'INSERT INTO programa (nombre, id_linea) VALUES ($1, $2) ON CONFLICT (nombre) DO NOTHING',
    [nombre, linea.rows[0].id_linea]
  );
  res = await query('SELECT id_programa FROM programa WHERE nombre = $1', [nombre]);
  return res.rows[0].id_programa;
}

let nuevos = 0;
let yaEstaban = 0;

for (const persona of lista) {
  const documento = String(persona.documentNumber || '').trim() || null;
  const codigo = String(persona.internalCode || '').trim();
  if (!codigo) continue;

  const insertado = await query(
    `INSERT INTO beneficiario (
       nombre, documento, telefono, id_municipio,
       codigo_interno, tipo_documento, sexo, edad, zona,
       nacionalidad, tipo_poblacion, organizacion, fecha_registro
     )
     VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     ON CONFLICT (codigo_interno) DO NOTHING
     RETURNING id_beneficiario`,
    [
      persona.fullName,
      documento,
      await idMunicipio(persona.municipality),
      codigo,
      persona.documentType || null,
      persona.sex || null,
      persona.age ?? null,
      persona.zone || null,
      persona.nationality || null,
      persona.populationType || null,
      persona.organization || null,
      persona.registeredOn || null,
    ]
  );

  let idBeneficiario = insertado.rows[0]?.id_beneficiario;
  if (!idBeneficiario) {
    yaEstaban += 1;
    const existente = await query(
      'SELECT id_beneficiario FROM beneficiario WHERE codigo_interno = $1',
      [codigo]
    );
    idBeneficiario = existente.rows[0]?.id_beneficiario;
  } else {
    nuevos += 1;
  }
  if (!idBeneficiario) continue;

  if (persona.family?.fullName) {
    const yaFamiliar = await query(
      'SELECT 1 FROM familiar WHERE id_beneficiario = $1 AND nombre = $2 AND parentesco = $3',
      [idBeneficiario, persona.family.fullName, persona.family.relationship]
    );
    if (yaFamiliar.rowCount === 0) {
      await query(
        'INSERT INTO familiar (id_beneficiario, nombre, parentesco, edad) VALUES ($1, $2, $3, $4)',
        [idBeneficiario, persona.family.fullName, persona.family.relationship, persona.family.age ?? null]
      );
    }
  }

  if (!persona.program?.name) continue;
  const programaId = await idPrograma(persona.program.name, persona.program.workLine);
  const fecha = persona.registeredOn || new Date().toISOString().slice(0, 10);

  await query(
    `INSERT INTO participacion (id_beneficiario, id_programa, fecha_vinculacion)
     VALUES ($1, $2, $3)
     ON CONFLICT (id_beneficiario, id_programa) DO NOTHING`,
    [idBeneficiario, programaId, fecha]
  );

  if (persona.attention) {
    const fechaAtencion = persona.attention.attendedOn || fecha;
    const yaAtencion = await query(
      `SELECT 1 FROM atencion
       WHERE id_beneficiario = $1 AND id_programa = $2 AND fecha_atencion = $3`,
      [idBeneficiario, programaId, fechaAtencion]
    );
    if (yaAtencion.rowCount === 0) {
      await query(
        `INSERT INTO atencion
           (id_beneficiario, id_programa, descripcion, fecha_atencion, tipo, responsable, resultado)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          idBeneficiario,
          programaId,
          persona.attention.description || '',
          fechaAtencion,
          persona.attention.kind || null,
          persona.attention.responsible || null,
          persona.attention.outcome || null,
        ]
      );
    }
  }

  const seg = persona.followUp;
  if (seg && typeof seg === 'object') {
    const fechaSeg = seg.followedOn || fecha;
    const yaSeg = await query(
      'SELECT 1 FROM seguimiento WHERE id_beneficiario = $1 AND fecha_seguimiento = $2',
      [idBeneficiario, fechaSeg]
    );
    if (yaSeg.rowCount === 0) {
      await query(
        `INSERT INTO seguimiento
           (id_beneficiario, fecha_seguimiento, observacion, accion_pendiente, accion_pendiente_detalle)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          idBeneficiario,
          fechaSeg,
          seg.progress || '',
          Boolean(seg.pendingAction),
          seg.pendingAction || null,
        ]
      );
    }
  }
}

console.log(`Nuevos: ${nuevos}. Ya existían: ${yaEstaban}.`);
process.exit(0);