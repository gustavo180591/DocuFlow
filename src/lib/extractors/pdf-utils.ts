import { spawn } from 'node:child_process';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import pdf from 'pdf-parse';

// Simple text extraction using pdf-parse
export async function extractTextPerPage(pdfPath: string): Promise<string[]> {
  try {
    console.log(`Attempting to extract text from: ${pdfPath}`);
    
    // Read the PDF file
    const data = await readFile(pdfPath);
    
    try {
      // Try pdf-parse first
      const pdfData = await pdf(data);
      const text = pdfData.text.trim();
      
      if (!text) {
        console.log('No text extracted with pdf-parse, falling back to Tesseract OCR');
        return [await ocrWithTesseract(pdfPath)];
      }
      
      // Split text into pages (simple approach - may need adjustment based on PDF structure)
      const pages = text.split(/\f/).map(p => p.trim()).filter(p => p.length > 0);
      
      if (pages.length === 0 || pages.join(' ').trim().length < 10) {
        console.log('No meaningful text extracted with pdf-parse, falling back to Tesseract OCR');
        return [await ocrWithTesseract(pdfPath)];
      }
      
      console.log(`Successfully extracted ${pages.length} pages with pdf-parse`);
      return pages;
    } catch (pdfError) {
      console.log('Error with pdf-parse, trying Tesseract OCR:', pdfError instanceof Error ? pdfError.message : String(pdfError));
      return [await ocrWithTesseract(pdfPath)];
    }
  } catch (error) {
    console.error('Error extracting text with pdf.js, falling back to Tesseract OCR:', error instanceof Error ? error.message : String(error));
    // Fallback to OCR if PDF parsing fails
    return [await ocrWithTesseract(pdfPath)];
  }
}

export async function ocrWithTesseract(pdfPath: string, lang = 'spa'): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const args = [
        pdfPath,
        'stdout',
        '-l', lang,
        '--psm', '6',
        '--oem', '1'
      ];

      const tesseract = spawn('tesseract', args);
      let result = '';
      let error = '';

      tesseract.stdout.on('data', (data) => {
        result += data.toString();
      });

      tesseract.stderr.on('data', (data) => {
        error += data.toString();
      });

      tesseract.on('close', (code) => {
        if (code === 0) {
          resolve(result);
        } else {
          reject(new Error(`Tesseract error (${code}): ${error || 'Unknown error'}`));
        }
      });
      
      tesseract.on('error', (err) => {
        reject(new Error(`Failed to start Tesseract: ${err.message}`));
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      reject(new Error(`Error in Tesseract process: ${errorMessage}`));
    }
  });
}

export async function saveUploadedFile(file: File, uploadsDir: string): Promise<{ path: string; filename: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const extension = path.extname(file.name) || '.pdf';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${extension}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);
    return { path: filePath, filename };
  } catch (error) {
    console.error('Error saving uploaded file:', error);
    throw new Error('Failed to save uploaded file');
  }
}