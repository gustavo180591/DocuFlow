// @ts-check

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

// Import with dynamic import to handle TypeScript files
const { extractTextPerPage } = await import('../src/lib/extractors/pdf-utils.ts');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  // Ensure the output directory exists
  const outputDir = join(__dirname, '../test/output');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    const pdfPath = process.argv[2] || join(__dirname, '../test/files/sample.pdf');
    console.log(`Extracting text from: ${pdfPath}`);
    
    if (!existsSync(pdfPath)) {
      console.error(`Error: File not found: ${pdfPath}`);
      console.log('Please make sure the file exists or provide a valid path as an argument.');
      process.exit(1);
    }
    
    console.log('Starting text extraction...');
    
    let pages;
    try {
      pages = await extractTextPerPage(pdfPath);
      
      if (!pages || pages.length === 0) {
        console.log('No text could be extracted from the PDF.');
        process.exit(0);
      }
      
      console.log(`\nExtracted ${pages.length} page(s):`);
    } catch (error) {
      console.error('Error during text extraction:', error);
      process.exit(1);
    }
    console.log('-----------------------------------');
    
    // Save full output to a file
    const outputFile = join(outputDir, 'extraction-results.txt');
    const output = [];
    
    pages.forEach((text, index) => {
      const pageOutput = `\nPage ${index + 1} (${text.length} chars):\n-----------------------------------\n${text}`;
      
      // Show first 500 chars of each page
      const preview = pageOutput.length > 500 
        ? pageOutput.substring(0, 497) + '...' 
        : pageOutput;
      
      console.log(preview);
      output.push(pageOutput);
    });
    
    // Write full output to file
    writeFileSync(outputFile, output.join('\n\n'));
    console.log(`\nFull extraction results saved to: ${outputFile}`);
    
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the main function
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
