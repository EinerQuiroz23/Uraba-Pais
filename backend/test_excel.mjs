import { NativeExcelReader } from './src/utils/excelReader.js';

const excelPath = '../Base_Beneficiarios_Hackathon.xlsx';
console.log('Leyendo Excel desde:', excelPath);

try {
  const data = NativeExcelReader.readExcelFile(excelPath);
  const sheets = Object.keys(data);
  console.log('Hojas encontradas:', sheets);

  sheets.forEach(s => {
    console.log(`\nHoja: "${s}" - Registros: ${data[s].length}`);
    if (data[s].length > 0) {
      console.log('Columnas:', Object.keys(data[s][0]));
      console.log('Primeros 3 registros:');
      data[s].slice(0, 3).forEach((r, i) => console.log(`  [${i}]`, JSON.stringify(r)));
    }
  });
} catch (err) {
  console.error('ERROR:', err.message);
}
