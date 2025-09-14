// @ts-check

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';

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

// Helper function to parse numbers with thousands separators and decimal points
function parseNumber(str) {
  if (!str) return 0;
  
  // Convert to string and clean up
  let numStr = String(str).trim();
  
  // Handle negative numbers
  const isNegative = numStr.startsWith('-');
  if (isNegative) {
    numStr = numStr.substring(1);
  }
  
  // Remove all non-numeric characters except decimal separators
  numStr = numStr.replace(/[^0-9,.]/g, '');
  
  // Determine the decimal separator (last comma or dot in the string)
  const lastComma = numStr.lastIndexOf(',');
  const lastDot = numStr.lastIndexOf('.');
  
  let normalized;
  
  if (lastComma > lastDot) {
    // Comma is the decimal separator, dot is thousands
    normalized = numStr.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma) {
    // Dot is the decimal separator, comma is thousands (or not present)
    normalized = numStr.replace(/,/g, '');
  } else {
    // No decimal separator found, treat as integer
    normalized = numStr.replace(/[^0-9]/g, '');
  }
  
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : (isNegative ? -num : num);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Extracts data from a LISTADO_APORTE document
/**
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

  // Try each date pattern until we find a match
  for (const { regex, extract } of datePatterns) {
    for (const line of lines) {
      const match = line.match(regex);
      if (match) {
        data.date = extract(match);
        break;
      }
    }
    if (data.date) break;
  }

  // Extract items and total
  let inItemsSection = false;
  const itemPatterns = [
    // Format: "- Description: 100.00" or "- 100.00 Description"
    /^\s*[\-\*•]\s*([^:]+?)\s*[:\-]\s*([\d.,]+)\s*$/,
    /^\s*[\-\*•]\s*([\d.,]+)\s+([^\d][^\n]*?)\s*$/,
    /^\s*[\-\*•]\s*([^\n]+?)\s+([\d.,]+)\s*$/
  ];

  const sectionHeaders = [
    'DETALLES:', 'DETALLES DE LOS APORTES:', 'ITEM:', 'ITEMS:', 'CONCEPTO:', 'CONCEPTOS:', 'DESCRIPCIÓN:'
  ];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if we're entering the items section
    if (sectionHeaders.some(header => trimmedLine.toUpperCase().includes(header))) {
      inItemsSection = true;
      continue;
    }

    // Skip empty lines or section end markers
    if (!trimmedLine || trimmedLine.match(/^-+\s*FIN/)) {
      inItemsSection = false;
      continue;
    }

    // Extract items if we're in the items section
    if (inItemsSection) {
      let itemMatch = null;
      
      // Try each item pattern
      for (const pattern of itemPatterns) {
        const match = trimmedLine.match(pattern);
        if (match) {
          let description, amountStr;
          
          if (match[1].includes(',')) {
            // If first group has a comma, it's likely the amount
            amountStr = match[1];
            description = match[2];
          } else if (match[2].match(/\d/)) {
            // If second group has a digit, it's likely the amount
            description = match[1];
            amountStr = match[2];
          } else {
            // Default to first group as description, second as amount
            description = match[1];
            amountStr = match[2];
          }
          
          const amount = parseNumber(amountStr);
          
          // Only add if amount is valid and not zero (unless it's explicitly zero)
          if (amount !== 0 || amountStr.includes('0')) {
            data.items.push({
              description: description.trim(),
              amount: amount
            });
          }
          
          itemMatch = true;
          break;
        }
      }
      
      // If we found an item, continue to next line
      if (itemMatch) continue;
    }

    // Extract total amount (look for TOTAL, IMPORTE, MONTO, etc.)
    const totalMatch = trimmedLine.match(/^(?:TOTAL|IMPORTE|MONTO|TOTAL GENERAL|MONTO TOTAL)\s*[:\-]?\s*\$?\s*([\d.,]+)/i);
    if (totalMatch) {
      data.total = parseNumber(totalMatch[1]);
      continue;
    }
  }

  // If we have items but no total, calculate it
  if (data.items.length > 0 && data.total === null) {
    data.total = data.items.reduce((sum, item) => sum + item.amount, 0);
  }

  return data;
}

// Extracts data from a COMPROBANTE_BANCO document
/**
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
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim());
    
    // Classify the document type
    const docType = classifyDocument(content);
    console.log(`Document type: ${docType}`);
    
    // Extract data based on document type
    let extractedData;
    if (docType === 'LISTADO_APORTE') {
      console.log('Processing as LISTADO_APORTE');
      extractedData = extractListadoData(lines);
    } else if (docType === 'COMPROBANTE_BANCO') {
      console.log('Processing as COMPROBANTE_BANCO');
      extractedData = extractComprobanteData(lines);
    } else {
      console.log('Unknown document type, returning raw text');
      extractedData = {
        type: 'DESCONOCIDO',
        rawText: content
      };
    }
    
    return { lines, extractedData };
  } catch (error) {
    console.error('Error reading file:', error.message);
    throw error;
  }
}

// Simple document classification
function classifyDocument(text) {
  const upperText = text.toUpperCase();
  
  if (upperText.includes('LISTADO') && upperText.includes('APORTE')) {
    return 'LISTADO_APORTE';
  }
  
  if (upperText.includes('COMPROBANTE') && upperText.includes('BANCO')) {
    return 'COMPROBANTE_BANCO';
  }
  
  if (upperText.includes('TRANSFERENCIA') || upperText.includes('PAGO') || upperText.includes('DEPOSITO')) {
    return 'COMPROBANTE_BANCO';
  }
  
  if (upperText.includes('DETALLES') && upperText.includes('APORTE')) {
    return 'LISTADO_APORTE';
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
    
    // Helper function to format currency values
    const formatCurrency = (value) => {
      if (value === null || value === undefined) return 'N/A';
      return new Intl.NumberFormat('es-AR', { 
        style: 'currency', 
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      }).format(value);
    };

    // Helper function to format date
    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A';
      try {
        const [day, month, year] = dateStr.split(/[\/\-.]/);
        return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
          .toLocaleDateString('es-AR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          });
      } catch (e) {
        return dateStr; // Return as is if parsing fails
      }
    };

    // Format the extracted data for display
    let output = `=== DOCUMENT EXTRACTION RESULTS ===
File: ${filePath}
Type: ${extractedData.type}
Processing time: ${new Date().toISOString()}

=== EXTRACTED DATA ===
type           : ${extractedData.type}
`;

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
