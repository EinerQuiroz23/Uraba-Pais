import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Lector nativo de archivos Excel (.xlsx) OpenXML sin dependencias externas.
 * Extrae directamente los buffers del zip y procesa workbook, sharedStrings y hojas.
 */
export class NativeExcelReader {
  /**
   * Extrae los archivos de un contenedor ZIP (.xlsx)
   * @param {string} filePath 
   * @returns {Map<string, Buffer>}
   */
  static extractZip(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo no existe en la ruta: ${filePath}`);
    }

    const buffer = fs.readFileSync(filePath);
    const files = new Map();

    // Buscar End of Central Directory Record (0x06054b50)
    let eocdOffset = -1;
    for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65557); i--) {
      if (buffer.readUInt32LE(i) === 0x06054b50) {
        eocdOffset = i;
        break;
      }
    }

    if (eocdOffset === -1) {
      throw new Error('Archivo Excel no válido o corrupto (EOCD no encontrado).');
    }

    const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
    const cdOffset = buffer.readUInt32LE(eocdOffset + 16);

    // Recorrer Central Directory Headers (0x02014b50)
    let currentOffset = cdOffset;
    for (let i = 0; i < totalEntries; i++) {
      if (buffer.readUInt32LE(currentOffset) !== 0x02014b50) {
        break;
      }

      const method = buffer.readUInt16LE(currentOffset + 10);
      const compressedSize = buffer.readUInt32LE(currentOffset + 20);
      const fileNameLen = buffer.readUInt16LE(currentOffset + 28);
      const extraLen = buffer.readUInt16LE(currentOffset + 30);
      const commentLen = buffer.readUInt16LE(currentOffset + 32);
      const localHeaderOffset = buffer.readUInt32LE(currentOffset + 42);

      const fileName = buffer.toString('utf-8', currentOffset + 46, currentOffset + 46 + fileNameLen);
      currentOffset += 46 + fileNameLen + extraLen + commentLen;

      // Leer local header
      const localFileNameLen = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLen = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataOffset = localHeaderOffset + 30 + localFileNameLen + localExtraLen;

      const compressedData = buffer.subarray(dataOffset, dataOffset + compressedSize);

      let uncompressedData;
      if (method === 0) {
        uncompressedData = compressedData;
      } else if (method === 8) {
        try {
          uncompressedData = zlib.inflateRawSync(compressedData);
        } catch (e) {
          // Intento fallback si tiene cabecera zlib
          try {
            uncompressedData = zlib.inflateSync(compressedData);
          } catch (e2) {
            continue;
          }
        }
      } else {
        continue;
      }

      files.set(fileName.replace(/\\/g, '/'), uncompressedData);
    }

    return files;
  }

  /**
   * Parsea Shared Strings de Excel (xl/sharedStrings.xml)
   * @param {Buffer} buffer 
   * @returns {string[]}
   */
  static parseSharedStrings(buffer) {
    if (!buffer) return [];
    const xml = buffer.toString('utf-8');
    const strings = [];
    
    const siRegex = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
    let siMatch;
    while ((siMatch = siRegex.exec(xml)) !== null) {
      const siContent = siMatch[1];
      const tRegex = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
      let text = '';
      let tMatch;
      while ((tMatch = tRegex.exec(siContent)) !== null) {
        text += tMatch[1];
      }
      text = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
      strings.push(text.trim());
    }
    return strings;
  }

  /**
   * Parsea el mapeo de relaciones de hojas (xl/_rels/workbook.xml.rels)
   * @param {Buffer} buffer 
   * @returns {Map<string, string>}
   */
  static parseWorkbookRels(buffer) {
    const rels = new Map();
    if (!buffer) return rels;
    const xml = buffer.toString('utf-8');
    const relRegex = /<Relationship\b([^>]*)\/>/g;
    let match;
    while ((match = relRegex.exec(xml)) !== null) {
      const attrs = match[1];
      const idMatch = attrs.match(/Id="([^"]+)"/);
      const targetMatch = attrs.match(/Target="([^"]+)"/);
      if (idMatch && targetMatch) {
        rels.set(idMatch[1], targetMatch[1]);
      }
    }
    return rels;
  }

  /**
   * Parsea el mapeo de hojas del libro (xl/workbook.xml)
   * @param {Buffer} buffer 
   * @returns {Array<{name: string, sheetId: string, rId: string}>}
   */
  static parseWorkbookSheets(buffer) {
    if (!buffer) return [];
    const xml = buffer.toString('utf-8');
    const sheets = [];
    const sheetRegex = /<sheet\b([^>]*)\/>/g;
    let match;
    while ((match = sheetRegex.exec(xml)) !== null) {
      const attrs = match[1];
      const nameMatch = attrs.match(/name="([^"]+)"/);
      const sheetIdMatch = attrs.match(/sheetId="([^"]+)"/);
      const rIdMatch = attrs.match(/r:id="([^"]+)"/);
      sheets.push({
        name: nameMatch ? nameMatch[1] : `Hoja${sheets.length + 1}`,
        sheetId: sheetIdMatch ? sheetIdMatch[1] : String(sheets.length + 1),
        rId: rIdMatch ? rIdMatch[1] : `rId${sheets.length + 1}`
      });
    }
    return sheets;
  }

  /**
   * Convierte un número de serie de fecha Excel a YYYY-MM-DD
   * @param {number} serial 
   * @returns {string}
   */
  static excelDateToISO(serial) {
    if (typeof serial !== 'number' || serial < 1000 || serial > 100000) {
      return String(serial);
    }
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString().split('T')[0];
  }

  /**
   * Parsea las filas y celdas de una hoja (xl/worksheets/sheetX.xml)
   * @param {Buffer} buffer 
   * @param {string[]} sharedStrings 
   * @returns {Array<Array<any>>}
   */
  static parseSheet(buffer, sharedStrings) {
    if (!buffer) return [];
    const xml = buffer.toString('utf-8');
    const rows = [];

    const rowRegex = /<row\b[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
    let rowMatch;

    while ((rowMatch = rowRegex.exec(xml)) !== null) {
      const rowIndex = parseInt(rowMatch[1], 10);
      const rowContent = rowMatch[2];
      const rowData = {};

      const cellRegex = /<c\b([^>]*)>([\s\S]*?)<\/c>/g;
      let cellMatch;

      while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
        const cellAttrs = cellMatch[1];
        const cellBody = cellMatch[2];

        const refMatch = cellAttrs.match(/r="([A-Z]+)(\d+)"/);
        if (!refMatch) continue;
        const colRef = refMatch[1];

        const typeMatch = cellAttrs.match(/t="([^"]+)"/);
        const cellType = typeMatch ? typeMatch[1] : null;

        const valMatch = cellBody.match(/<v>([\s\S]*?)<\/v>/);
        let val = valMatch ? valMatch[1] : null;

        if (cellType === 's' && val !== null) {
          const sIdx = parseInt(val, 10);
          val = sharedStrings[sIdx] !== undefined ? sharedStrings[sIdx] : '';
        } else if (cellType === 'inlineStr') {
          const isMatch = cellBody.match(/<t\b[^>]*>([\s\S]*?)<\/t>/);
          val = isMatch ? isMatch[1] : '';
        } else if (cellType === 'b' && val !== null) {
          val = val === '1' || val === 'true';
        } else if (val !== null && !cellType) {
          const num = Number(val);
          if (!isNaN(num)) {
            val = num;
          }
        }

        if (typeof val === 'string') {
          val = val
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .trim();
        }

        // Columna a índice base 0
        let colIndex = 0;
        for (let c = 0; c < colRef.length; c++) {
          colIndex = colIndex * 26 + (colRef.charCodeAt(c) - 64);
        }
        colIndex -= 1;

        rowData[colIndex] = val;
      }

      const maxCol = Math.max(...Object.keys(rowData).map(Number), -1);
      const rowArr = [];
      for (let c = 0; c <= maxCol; c++) {
        rowArr.push(rowData[c] !== undefined ? rowData[c] : null);
      }
      rows.push({ rowIndex, cells: rowArr });
    }

    return rows.map(r => r.cells);
  }

  /**
   * Lee el archivo Excel completo y devuelve todas las hojas con objetos clave-valor
   * @param {string} filePath 
   * @returns {Object.<string, Array<Object>>}
   */
  static readExcelFile(filePath) {
    const zipEntries = this.extractZip(filePath);
    const sharedStrings = this.parseSharedStrings(zipEntries.get('xl/sharedStrings.xml'));
    const rels = this.parseWorkbookRels(zipEntries.get('xl/_rels/workbook.xml.rels'));
    const sheetsMeta = this.parseWorkbookSheets(zipEntries.get('xl/workbook.xml'));

    const result = {};

    let indexFallback = 1;
    for (const sheetMeta of sheetsMeta) {
      let targetPath = rels.get(sheetMeta.rId);
      let sheetEntry = null;

      if (targetPath) {
        // Normalizar ruta interna
        const fullInternalPath = targetPath.startsWith('/')
          ? targetPath.substring(1)
          : (targetPath.startsWith('worksheets/') ? `xl/${targetPath}` : `xl/worksheets/${path.basename(targetPath)}`);
        sheetEntry = zipEntries.get(fullInternalPath);
      }

      if (!sheetEntry) {
        sheetEntry = zipEntries.get(`xl/worksheets/sheet${indexFallback}.xml`);
      }

      if (!sheetEntry) {
        for (const [name, buf] of zipEntries.entries()) {
          if (name.startsWith('xl/worksheets/sheet')) {
            sheetEntry = buf;
            break;
          }
        }
      }

      if (sheetEntry) {
        const rawGrid = this.parseSheet(sheetEntry, sharedStrings);
        if (rawGrid.length > 0) {
          // Detectar la fila de encabezados (la primera fila no vacía)
          let headerRowIndex = 0;
          while (headerRowIndex < rawGrid.length && (!rawGrid[headerRowIndex] || rawGrid[headerRowIndex].every(c => c === null || c === ''))) {
            headerRowIndex++;
          }

          const rawHeaders = rawGrid[headerRowIndex] || [];
          const headers = rawHeaders.map((h, i) => (h ? String(h).trim() : `Columna_${i + 1}`));

          const records = [];
          for (let r = headerRowIndex + 1; r < rawGrid.length; r++) {
            const row = rawGrid[r];
            if (!row || row.every(c => c === null || c === '')) continue;
            const obj = {};
            headers.forEach((header, idx) => {
              let cellVal = row[idx] !== undefined ? row[idx] : null;
              // Si la columna parece fecha y es número serial, formatear
              const headerLower = header.toLowerCase();
              if (typeof cellVal === 'number' && (headerLower.includes('fecha') || headerLower.includes('nacimiento'))) {
                cellVal = this.excelDateToISO(cellVal);
              }
              obj[header] = cellVal;
            });
            records.push(obj);
          }
          result[sheetMeta.name] = records;
        } else {
          result[sheetMeta.name] = [];
        }
      }
      indexFallback++;
    }

    return result;
  }
}
