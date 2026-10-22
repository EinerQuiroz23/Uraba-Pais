import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NativeExcelReader } from './src/utils/excelReader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Intentar rutas del Excel
const possiblePaths = [
  path.join(__dirname, '../Base_Beneficiarios_Hackathon.xlsx'),
  path.join(__dirname, 'Base_Beneficiarios_Hackathon.xlsx'),
  'c:\\Users\\pc\\OneDrive\\Desktop\\Reto_hackaton\\Uraba\\Base_Beneficiarios_Hackathon.xlsx'
];

let excelPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    excelPath = p;
    break;
  }
}

if (!excelPath) {
  console.error('NO SE ENCONTRÓ EL EXCEL en ninguna de estas rutas:');
  possiblePaths.forEach(p => console.log('  -', p));
  process.exit(1);
}

console.log('=== DIAGNÓSTICO DEL EXCEL ===');
console.log('Ruta encontrada:', excelPath);
console.log('Tamaño:', fs.statSync(excelPath).size, 'bytes');
console.log('');

try {
  const data = NativeExcelReader.readExcelFile(excelPath);
  const sheets = Object.keys(data);
  
  console.log('Hojas encontradas:', sheets.length);
  sheets.forEach(sheetName => {
    const rows = data[sheetName];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`HOJA: "${sheetName}"`);
    console.log(`Registros: ${rows.length}`);
    
    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      console.log(`\nCOLUMNAS (${headers.length}):`);
      headers.forEach((h, i) => console.log(`  [${i}] "${h}"`));
      
      console.log(`\nPRIMEROS 5 REGISTROS COMPLETOS:`);
      rows.slice(0, 5).forEach((row, i) => {
        console.log(`\n--- Registro ${i + 1} ---`);
        for (const [key, val] of Object.entries(row)) {
          console.log(`  ${key}: ${JSON.stringify(val)}`);
        }
      });
      
      // Estadísticas de columnas con datos
      console.log(`\nESTADÍSTICAS DE DATOS POR COLUMNA:`);
      headers.forEach(h => {
        const nonNull = rows.filter(r => r[h] !== null && r[h] !== undefined && String(r[h]).trim() !== '').length;
        const sample = rows.find(r => r[h] !== null && r[h] !== undefined && String(r[h]).trim() !== '');
        console.log(`  "${h}": ${nonNull}/${rows.length} con datos | Ejemplo: ${sample ? JSON.stringify(sample[h]) : 'N/A'}`);
      });
    }
  });

  // Guardar resultado a JSON para inspección
  const outputPath = path.join(__dirname, 'data', 'excel_raw_inspection.json');
  const inspectionData = {};
  sheets.forEach(s => {
    inspectionData[s] = {
      total_rows: data[s].length,
      columns: data[s].length > 0 ? Object.keys(data[s][0]) : [],
      first_10_rows: data[s].slice(0, 10)
    };
  });
  fs.writeFileSync(outputPath, JSON.stringify(inspectionData, null, 2), 'utf-8');
  console.log(`\nResultado guardado en: ${outputPath}`);

} catch (err) {
  console.error('ERROR al leer Excel:', err.message);
  console.error(err.stack);
}
