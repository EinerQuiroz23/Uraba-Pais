/**
 * Mapeador inteligente de registros crudos de Excel a la estructura oficial de Beneficiario
 */
export function mapExcelRowToBeneficiario(row, index = 1) {
  // Normalizar nombres de claves en minúsculas y sin acentos
  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    const cleanKey = key
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    normalized[cleanKey] = value;
  }

  // Extraer valores con soporte para múltiples variantes de encabezados
  const getField = (...candidates) => {
    for (const cand of candidates) {
      if (normalized[cand] !== undefined && normalized[cand] !== null && String(normalized[cand]).trim() !== '') {
        return normalized[cand];
      }
    }
    // Búsqueda por substring
    for (const cand of candidates) {
      for (const [key, val] of Object.entries(normalized)) {
        if (key.includes(cand) && val !== undefined && val !== null && String(val).trim() !== '') {
          return val;
        }
      }
    }
    return null;
  };

  const padNum = String(index).padStart(4, '0');
  const internalCode = getField('codigo_interno', 'codigo', 'cod', 'id_beneficiario', 'id') || `URB-2026-${padNum}`;
  const id = `BEN-${padNum}`;

  // Nombre y Apellido
  let nombres = getField('nombres', 'nombre', 'primer_nombre', 'nombre_completo') || 'Sin Nombre';
  let apellidos = getField('apellidos', 'apellido', 'primer_apellido') || '';

  // Si solo viene un campo de nombre completo y no apellidos
  if (nombres && !apellidos && nombres.includes(' ')) {
    const parts = nombres.trim().split(/\s+/);
    if (parts.length >= 2) {
      nombres = parts.slice(0, Math.ceil(parts.length / 2)).join(' ');
      apellidos = parts.slice(Math.ceil(parts.length / 2)).join(' ');
    }
  }

  // Documento
  let tipoDoc = getField('tipo_documento', 'tipo_doc', 'tipo', 'documento_tipo') || 'CC';
  tipoDoc = String(tipoDoc).toUpperCase().trim();
  const validTipos = ['CC', 'TI', 'PPT', 'PEP', 'CE', 'SIN_DOCUMENTO', 'OTRO', 'PASAPORTE', 'RC'];
  if (!validTipos.includes(tipoDoc)) {
    if (tipoDoc.includes('CEDULA') || tipoDoc.includes('CIUDADANIA')) tipoDoc = 'CC';
    else if (tipoDoc.includes('PERMISO') || tipoDoc.includes('PPT')) tipoDoc = 'PPT';
    else if (tipoDoc.includes('TARJETA') || tipoDoc.includes('IDENTIDAD')) tipoDoc = 'TI';
    else if (tipoDoc.includes('EXTRANJER')) tipoDoc = 'CE';
    else if (tipoDoc.includes('SIN')) tipoDoc = 'SIN_DOCUMENTO';
    else tipoDoc = 'OTRO';
  }

  const numDoc = getField('numero_documento', 'no_documento', 'documento', 'numero_de_documento', 'identificacion', 'cedula');
  const numeroDocumento = numDoc ? String(numDoc).trim() : null;

  // Fechas y edad
  const fechaNac = getField('fecha_nacimiento', 'fecha_de_nacimiento', 'nacimiento', 'fecha_nac');
  let fechaNacimiento = fechaNac ? String(fechaNac).trim() : null;

  let edadVal = getField('edad');
  let edad = edadVal ? parseInt(edadVal, 10) : null;
  if (!edad && fechaNacimiento && fechaNacimiento.includes('-')) {
    const birthYear = parseInt(fechaNacimiento.split('-')[0], 10);
    if (!isNaN(birthYear) && birthYear > 1900) {
      edad = 2026 - birthYear;
    }
  }
  if (!edad || isNaN(edad)) {
    edad = 30; // Valor por defecto sensato si no se especifica
  }

  // Género
  let gen = getField('genero', 'sexo') || 'Otro / No binario';
  gen = String(gen).trim();
  let genero = 'Femenino';
  if (/^m/i.test(gen) || /masc/i.test(gen) || /hombre/i.test(gen)) {
    genero = 'Masculino';
  } else if (/^f/i.test(gen) || /fem/i.test(gen) || /mujer/i.test(gen)) {
    genero = 'Femenino';
  } else {
    genero = 'Otro / No binario';
  }

  // Teléfono
  const tel = getField('telefono', 'celular', 'contacto', 'movil');
  const telefono = tel ? String(tel).trim() : '3000000000';

  // Municipio (Apartadó, Turbo, Necoclí, Otro Urabá)
  let mun = getField('municipio', 'ciudad', 'territorio') || 'Apartadó';
  mun = String(mun).trim();
  let municipio = 'Apartadó';
  if (/turbo/i.test(mun)) municipio = 'Turbo';
  else if (/necocli|necoclí/i.test(mun)) municipio = 'Necoclí';
  else if (/apartado|apartadó/i.test(mun)) municipio = 'Apartadó';
  else municipio = 'Otro Urabá';

  // Dirección o comunidad
  const direccion = getField('direccion', 'direccion_comunidad', 'comunidad', 'barrio', 'vereda', 'sector');
  const direccion_comunidad = direccion ? String(direccion).trim() : `${municipio}, Urabá Antioqueño`;

  // Condición poblacional
  let cond = getField('condicion_poblacional', 'condicion', 'poblacion') || 'Comunidad de acogida';
  cond = String(cond).trim();
  let condicion_poblacional = 'Comunidad de acogida';
  if (/victima|desplaz/i.test(cond)) condicion_poblacional = 'Víctima del conflicto armado';
  else if (/migran|refugia|venez/i.test(cond)) condicion_poblacional = 'Migrante / Refugiada';
  else if (/acogida|local/i.test(cond)) condicion_poblacional = 'Comunidad de acogida';
  else condicion_poblacional = cond || 'Comunidad de acogida';

  // Discapacidad
  const disc = getField('discapacidad', 'condicion_discapacidad');
  const discapacidad = disc ? String(disc).trim() : 'Ninguna';

  // Autorización de datos (Habeas Data)
  const aut = getField('autorizacion_datos', 'autorizacion', 'habeas_data', 'consentimiento');
  const autorizacion_datos = aut === false || String(aut).toLowerCase() === 'no' || String(aut) === '0' ? false : true;

  // Fecha de registro
  const fechaReg = getField('fecha_registro', 'fecha');
  const fecha_registro = fechaReg ? String(fechaReg).trim() : '2026-02-15T08:00:00.000Z';

  return {
    id,
    codigo_interno: String(internalCode).startsWith('URB-') ? String(internalCode) : `URB-2026-${padNum}`,
    nombres: String(nombres).trim(),
    apellidos: String(apellidos).trim(),
    tipo_documento: tipoDoc,
    numero_documento: numeroDocumento,
    fecha_nacimiento: fechaNacimiento,
    edad,
    genero,
    telefono,
    municipio,
    direccion_comunidad,
    condicion_poblacional,
    discapacidad,
    autorizacion_datos,
    fecha_registro,
    familiares: []
  };
}
