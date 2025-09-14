import { analyzePdfContent } from '../src/lib/utils/pdfAnalyzer';
import { join } from 'path';

async function testPdfAnalyzer() {
  // Test with different PDF files
  const testFiles = [
    'comprobante-bancario.pdf',
    'listado-socios.pdf',
    'otro-documento.pdf'
  ];

  for (const file of testFiles) {
    try {
      const filePath = join(__dirname, '..', 'test', 'files', file);
      console.log(`\nAnalyzing ${file}...`);
      
      const result = await analyzePdfContent(filePath);
      
      console.log('Analysis result:', {
        file,
        category: result.category,
        preview: result.content.substring(0, 100) + '...'
      });
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
}

testPdfAnalyzer().catch(console.error);
