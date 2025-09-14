// @ts-check

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';

// Type definitions
/**
 * @typedef {Object} ListadoItem
 * @property {string} description - The description of the item
 * @property {number} amount - The amount of the item
 */

/**
 * @typedef {Object} ListadoData
 * @property {'LISTADO_APORTE'} type - The type of document
 * @property {string | null} date - The date of the document
 * @property {ListadoItem[]} items - The list of items
 * @property {number | null} total - The total amount
 * @property {string} rawText - The raw text of the document
 */

/**
 * @typedef {Object} ComprobanteData
 * @property {'COMPROBANTE_BANCO'} type - The type of document
 * @property {string | null} date - The date of the transaction
 * @property {number | null} amount - The transaction amount
 * @property {string | null} reference - The reference number
 * @property {string | null} from - The sender of the transaction
 * @property {string | null} to - The recipient of the transaction
 * @property {Record<string, string>} details - Additional transaction details
 * @property {string} rawText - The raw text of the document
 */

/**
 * @typedef {ListadoData | ComprobanteData | {type: 'DESCONOCIDO', rawText: string}} ExtractedData
 */

// Helper function to parse numbers with thousands separators
function parseNumber(str) {
  if (!str) return 0;
  // Remove all non-digit, non-decimal characters except for the last decimal point
  const cleanStr = str
    .replace(/[^\d.,]/g, '') // Remove all non-digit, non-decimal characters
    .replace(/(\.\d+)\./g, '$1') // Handle multiple decimal points by keeping only the last one
    .replace(/(\d)\.(\d{3})(?=\D|$)/g, '$1$2') // Fix cases like 1.000,50 to 1000,50
    .replace(/(\d),(\d{3})(?=\D|$)/g, '$1$2') // Fix cases like 1,000.50 to 1000.50
    .replace(/,/g, '.'); // Convert remaining commas to dots for proper float parsing
  
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Extract data from LISTADO_APORTE document
/**
 * Extracts data from a LISTADO_APORTE document
 * @param {string[]} lines - The lines of text from the document
 * @returns {ListadoData} The extracted data
 */
function extractListadoData(lines) {
  /** @type {ListadoData} */
  const data = {
    type: 'LISTADO_APORTE',
    date: null,
    items: [],
    total: null,
    rawText: lines.join('\n')
  };

  // Extract date - look for various date formats
  const datePatterns = [
    // Format: "15 de Octubre de 2023" or "15 Octubre 2023" (with "de" separators)
    {
      regex: /(?:Fecha|FECHA|Date|emisi[oó]n)[^\d]*(\d{1,2})\s+(?:de\s+)?([A-Za-z]+)(?:\s+de\s+|\s+)(\d{4})/i,
      extract: (match) => {
        const months = {
          'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
          'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12',
          'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04', 'mayo': '05', 'junio': '06',
          'julio': '07', 'agosto': '08', 'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
        };
        const day = match[1].padStart(2, '0');
        const monthKey = match[2].toLowerCase();
        const month = months[monthKey] || months[monthKey.substring(0, 3)] || '01';
        const year = match[3];
        return `${day}/${month}/${year}`;
      }
    },
    // Format: "15/Oct/2023" or "15/Octubre/2023" (with slashes and text month)
    {
      regex: /(?:Fecha|FECHA|Date|emisi[oó]n)[^\d]*(\d{1,2})\s*[\/\-\.]\s*([A-Za-z]+)\s*[\/\-\.]\s*(\d{4})/i,
      extract: (match) => {
        const months = {
          'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
          'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12',
          'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04', 'mayo': '05', 'junio': '06',
          'julio': '07', 'agosto': '08', 'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
        };
        const day = match[1].padStart(2, '0');
        const monthKey = match[2].toLowerCase();
        const month = months[monthKey] || months[monthKey.substring(0, 3)] || '01';
        const year = match[3];
        return `${day}/${month}/${year}`;
      }
    },
    // Format: "Fecha: 15/10/2023" or "FECHA: 15-10-2023" or "Date: 15.10.2023"
    {
      regex: /(?:Fecha|FECHA|Date)[^\d]*[:\-]?\s*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i,
      extract: (match) => match[1]
    },
    // Format: "Fecha: 15 Oct 2023" or "FECHA: 15 de Octubre 2023"
    {
      regex: /(?:Fecha|FECHA|Date)[^\d]*(\d{1,2})\s+(?:de\s+)?([A-Za-z]+)\s+(\d{4})/i,
      extract: (match) => {
        const months = {
          'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
          'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12',
          'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04', 'mayo': '05', 'junio': '06',
          'julio': '07', 'agosto': '08', 'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
        };
        const day = match[1].padStart(2, '0');
        const monthKey = match[2].toLowerCase();
        const month = months[monthKey] || months[monthKey.substring(0, 3)] || '01';
        const year = match[3];
        return `${day}/${month}/${year}`;
      }
    },
    // Format: "15/10/2023" (standalone date)
    {
      regex: /^\s*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})\s*$/,
      extract: (match) => match[1]
    },
    // Format: "15 Oct 2023" (standalone date with text month)
    {
      regex: /^\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s*$/i,
      extract: (match) => {
        const months = {
          'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
          'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12',
          'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04', 'mayo': '05', 'junio': '06',
          'julio': '07', 'agosto': '08', 'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
        };
        const day = match[1].padStart(2, '0');
        const monthKey = match[2].toLowerCase();
        const month = months[monthKey] || months[monthKey.substring(0, 3)] || '01';
        const year = match[3];
        return `${day}/${month}/${year}`;
      }
    }
  ];

  // Try each pattern until we find a match
  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const extractedDate = pattern.extract(match);
        if (extractedDate) {
          data.date = extractedDate;
          break; // Exit the inner loop if we found a date
        }
      }
    }
    if (data.date) break; // Exit the outer loop if we found a date
  }

  // Extract items and total
  let inItemsSection = false;
  let itemCount = 0;
  
  // Look for different possible section headers
  const sectionHeaders = [
    /^DETALLES(?:\s+DE\s+LOS\s+APORTES)?\s*:/i,  // "DETALLES:" or "DETALLES DE LOS APORTES:"
    /^ITEMS?\s*:/i,                              // "ITEM:" or "ITEMS:"
    /^CONCEPTOS?\s*:/i,                         // "CONCEPTO:" or "CONCEPTOS:"
    /^DESCRIPCI[OÓ]N\s*:/i                     // "DESCRIPCION:" or "DESCRIPCIÓN:"
  ];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check for start of items section using any of the possible headers
    if (sectionHeaders.some(header => trimmedLine.match(header))) {
      inItemsSection = true;
      itemCount = 0;
      continue;
    }
    
    // Skip empty lines or lines that are too short to be meaningful
    if (!trimmedLine || trimmedLine.length < 3) continue;
    
    // Check for total line (can be with or without bullet, at start or after a colon)
    const totalMatch = trimmedLine.match(/(?:^|[\-•*]\s*)(?:TOTAL(?:\s+GENERAL)?|IMPORTE|MONTO)\s*[\-:]?\s*[$€]?\s*([\d.,]+)/i);
    if (totalMatch) {
      data.total = parseNumber(totalMatch[1]);
      continue;
    }
    
    // Only process in the items section and lines that start with a bullet
    if (inItemsSection && trimmedLine.match(/^[\-•*]/)) {
      // Handle item lines with format: "- Description: 123.45" or "- 123.45 Description"
      let itemMatch = trimmedLine.match(/^[\-•*]\s*([^:]+?)\s*[\-:]\s*[$€]?\s*([\d.,]+)\s*$/i);
      
      if (!itemMatch) {
        // Try alternative format: "- 123.45 Description"
        itemMatch = trimmedLine.match(/^[\-•*]\s*[$€]?\s*([\d.,]+)\s*(.+?)\s*$/i);
      }
      
      if (itemMatch) {
        itemCount++;
        // Determine which group is the description and which is the amount
        let description, amountStr;
        
        if (itemMatch[2].match(/^[\d.,]+$/)) {
          // Format: "- Description: 123.45"
          description = itemMatch[1].trim();
          amountStr = itemMatch[2];
        } else {
          // Format: "- 123.45 Description"
          description = itemMatch[2].trim();
          amountStr = itemMatch[1];
        }
        
        const amount = parseNumber(amountStr);
        
        // Skip if this looks like a total line that wasn't caught earlier
        if (description.match(/^(TOTAL|SUBTOTAL|TOTAL\s+GENERAL|IMPORTE|MONTO)/i)) {
          data.total = amount;
          continue;
        }
        
        data.items.push({ 
          description: description || `Item ${itemCount}`, 
          amount 
        });
      } else {
        // Try to match just a description without an amount
        const descMatch = trimmedLine.match(/^[\-•*]\s*(.+?)\s*$/);
        if (descMatch) {
          itemCount++;
          data.items.push({
            description: descMatch[1].trim(),
            amount: 0
          });
        }
      }
    }
  }

  return data;
}

// Extract data from COMPROBANTE_BANCO document
/**
 * Extracts data from a COMPROBANTE_BANCO document
 * @param {string[]} lines - The lines of text from the document
 * @returns {ComprobanteData} The extracted data
 */
function extractComprobanteData(lines) {
  /** @type {ComprobanteData} */
  const data = {
    type: 'COMPROBANTE_BANCO',
    date: null,
    amount: null,
    reference: null,
    from: null,
    to: null,
    details: {},
    rawText: lines.join('\n')
  };

  // Extract date with various formats
  const dateLine = lines.find(line => line.match(/(?:Fecha|FECHA|Date|emisi[oó]n)[^\d]*(\d{1,2}\s*[\/\-\.]\s*\d{1,2}\s*[\/\-\.]\s*\d{4})/i));
  if (dateLine) {
    const dateMatch = dateLine.match(/(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{4})/);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const month = dateMatch[2].padStart(2, '0');
      const year = dateMatch[3];
      data.date = `${day}/${month}/${year}`;
    }
  }

  // Extract transaction details
  let inDetailsSection = false;
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;
    
    // Check for details section
    if (trimmedLine.match(/DETALLES\s+DE\s+LA\s+OPERACI[OÓ]N/i)) {
      inDetailsSection = true;
      continue;
    }
    
    // Extract amount (look for IMPORTE, MONTO, or TOTAL)
    const amountMatch = trimmedLine.match(/^(?:IMPORTE|MONTO|TOTAL|Monto|Importe|Total)\s*[:\-]?\s*\$?\s*([\d.,]+)/i);
    if (amountMatch) {
      data.amount = parseNumber(amountMatch[1]);
      continue;
    }
    
    // Extract reference
    const refMatch = trimmedLine.match(/^(?:REFERENCIA|N[ÚU]MERO|NRO|Referencia|Número|Nro)\.?\s*[:\-]?\s*(.+)/i);
    if (refMatch) {
      data.reference = refMatch[1].trim();
      continue;
    }
    
    // Extract from account
    const fromMatch = trimmedLine.match(/^(?:CUENTA\s+ORIGEN|ORIGEN|DE|Cuenta Origen|Origen|De)\s*[:\-]?\s*(.+)/i);
    if (fromMatch) {
      data.from = fromMatch[1].trim();
      continue;
    }
    
    // Extract to account/beneficiary
    const toMatch = trimmedLine.match(/^(?:CUENTA\s+DESTINO|DESTINO|PARA|BENEFICIARIO|Cuenta Destino|Destino|Para|Beneficiario)\s*[:\-]?\s*(.+)/i);
    if (toMatch) {
      data.to = toMatch[1].trim();
      continue;
    }
    
    // If in details section, extract key-value pairs
    if (inDetailsSection) {
      const detailMatch = trimmedLine.match(/^([A-Za-zÁÉÍÓÚáéíóúñÑ\s]+)\s*[:\-]\s*(.+)$/);
      if (detailMatch) {
        const key = detailMatch[1].trim();
        const value = detailMatch[2].trim();
        data.details[key] = value;
      }
    }
  }

  return data;
}

// Simple text extraction function for testing
async function extractTextFromFile(filePath) {
  try {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Read the file as text
    const content = readFileSync(filePath, 'utf-8');
    const text = content.trim();
    
    if (!text) {
      throw new Error('File is empty');
    }
    
    // Split into lines and clean up
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    // Simple classification based on content
    const docType = classifyDocument(text);
    console.log(`Document type: ${docType}`);
    
    // Process based on document type
    let extractedData = { type: docType };
    if (docType === 'LISTADO_APORTE') {
      console.log('Processing as LISTADO_APORTE');
      extractedData = extractListadoData(lines);
    } else if (docType === 'COMPROBANTE_BANCO') {
      console.log('Processing as COMPROBANTE_BANCO');
      extractedData = extractComprobanteData(lines);
    } else {
      extractedData.rawText = text;
    }
    
    return { lines, extractedData };
  } catch (error) {
    console.error('Error processing file:', error.message);
    throw error;
  }
}

// Simple document classification
function classifyDocument(text) {
  const upperText = text.toUpperCase();
  
  if (upperText.includes('LISTADO_APORTE') || 
      upperText.includes('APORTE') || 
      upperText.includes('CONTRIBUCIÓN')) {
    return 'LISTADO_APORTE';
  } 
  
  if (upperText.includes('COMPROBANTE') || 
      upperText.includes('TRANSFERENCIA') || 
      upperText.includes('BANCO')) {
    return 'COMPROBANTE_BANCO';
  }
  
  return 'DESCONOCIDO';
}

async function main() {
  // Ensure the output directory exists
  const outputDir = join(__dirname, '../test/output');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    const filePath = process.argv[2] || join(__dirname, '../test/files/sample.txt');
    console.log(`Processing file: ${filePath}`);
    
    const { lines, extractedData } = await extractTextFromFile(filePath);
    
    // Format the extracted data for display
        });
    } catch (e) {
      return dateStr; // Return as is if parsing fails
    }
  };

  // Format the data based on document type
  if ('date' in extractedData) {
    output += `date           : ${formatDate(extractedData.date)}\n`;
  }

  if ('items' in extractedData && extractedData.items && extractedData.items.length > 0) {
    output += 'items          : ' + extractedData.items
      .map(item => `- ${item.description}: ${formatCurrency(item.amount)}`)
      .join('\n              ') + '\n';
  }

  if ('total' in extractedData && extractedData.total !== null) {
    output += `total          : ${formatCurrency(extractedData.total)}\n`;
  }

  if ('amount' in extractedData && extractedData.amount !== null) {
    output += `amount         : ${formatCurrency(extractedData.amount)}\n`;
  }

  if ('reference' in extractedData) {
    output += `reference      : ${extractedData.reference || 'N/A'}\n`;
  }

  if ('from' in extractedData) {
    output += `from           : ${extractedData.from || 'N/A'}\n`;
  }

  if ('to' in extractedData) {
    output += `to             : ${extractedData.to || 'N/A'}\n`;
  }

  if ('details' in extractedData && extractedData.details && Object.keys(extractedData.details).length > 0) {
    output += 'details        : \n';
    for (const [key, value] of Object.entries(extractedData.details)) {
      output += `  ${key.padEnd(20)}: ${value}\n`;
    }
  }

  output += '\n=== FULL TEXT ===\n';
  output += lines.join('\n');
  output += '\n=== END OF DOCUMENT ===';

  // Also save the extracted data as JSON
  const jsonOutputFile = join(outputDir, 'extracted-data.json');
  writeFileSync(jsonOutputFile, JSON.stringify(extractedData, null, 2));
  
  const outputFile = join(outputDir, 'extraction-results.txt');
  writeFileSync(outputFile, output);
  console.log(`\nResults saved to: ${outputFile}`);
  
      '\n=== END OF DOCUMENT ==='
    ];
    
    // Also save the extracted data as JSON
    const jsonOutputFile = join(outputDir, 'extracted-data.json');
    writeFileSync(jsonOutputFile, JSON.stringify(extractedData, null, 2));
    
    writeFileSync(outputFile, output.join('\n'));
    console.log(`\nResults saved to: ${outputFile}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
