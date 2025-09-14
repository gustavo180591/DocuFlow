import { createWriteStream } from 'node:fs';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a document
const doc = new PDFDocument();

// Pipe its output to a file
const outputPath = join(__dirname, '../test/files/sample.pdf');
const stream = createWriteStream(outputPath);
doc.pipe(stream);

// Add content to the PDF
doc.fontSize(20).text('DOCUMENTO DE PRUEBA', {
  align: 'center'
});

doc.moveDown();
doc.fontSize(12).text('Este es un documento de prueba para verificar la extracción de texto.');

doc.moveDown();
doc.text(`FECHA: ${new Date().toISOString().split('T')[0]}`);
doc.text('TIPO: LISTADO_APORTE');

doc.moveDown();
doc.text('DETALLES:');
doc.text('- Item 1: Aporte regular');
doc.text('- Item 2: Aporte extraordinario');
doc.text('- Total: $1,000.00');

doc.moveDown();
doc.text('--- FIN DEL DOCUMENTO ---', {
  align: 'center'
});

// Finalize the PDF and end the stream
doc.end();

stream.on('finish', () => {
  console.log(`Test PDF created at: ${outputPath}`);
  process.exit(0);
});

stream.on('error', (error) => {
  console.error('Error creating PDF:', error);
  process.exit(1);
});
