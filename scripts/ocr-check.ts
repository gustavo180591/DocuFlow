import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Use require for CommonJS modules
const { extractTextPerPage } = require('../dist/lib/extractors/pdf-utils.js');
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node scripts/ocr-check.js <path-to-pdf>');
    process.exit(1);
  }

  try {
    console.log(`Processing: ${filePath}`);
    const pages = await extractTextPerPage(path.resolve(filePath));
    
    console.log(`\nExtracted ${pages.length} pages\n`);
    console.log('First 1000 characters of first page:');
    console.log('-----------------------------------');
    console.log(pages[0]?.substring(0, 1000) || 'No text extracted');
    console.log('-----------------------------------\n');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();