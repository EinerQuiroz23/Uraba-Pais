import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { NativeExcelReader } from './excelReader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const excelPath = path.resolve(__dirname, '../../../Base_Beneficiarios_Hackathon.xlsx');

try {
  console.log('Leyendo archivo Excel desde:', excelPath);
  const data = NativeExcelReader.readExcelFile(excelPath);
  const output = {
    sheets: Object.keys(data),
    sheetCounts: {},
    sampleRecords: {}
  };

  for (const sheet of Object.keys(data)) {
    output.sheetCounts[sheet] = data[sheet].length;
    output.sampleRecords[sheet] = data[sheet].slice(0, 3);
  }

  const outPath = path.resolve(__dirname, '../../data/excel_preview.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log('Procesado exitosamente. Resumen guardado en:', outPath);
} catch (err) {
  console.error('Error procesando Excel:', err);
  const outPath = path.resolve(__dirname, '../../data/excel_preview.json');
  fs.writeFileSync(outPath, JSON.stringify({ error: err.message, stack: err.stack }, null, 2), 'utf-8');
}
