import { readFile } from 'fs/promises';
import pdf from 'pdf-parse';

export type DocumentCategory = 'COMPROBANTE_BANCARIO' | 'LISTADO_SOCIOS' | 'OTRO';

export async function analyzePdfContent(filePath: string): Promise<{ category: DocumentCategory; content: string }> {
  try {
    const dataBuffer = await readFile(filePath);
    const data = await pdf(dataBuffer);
    const textContent = data.text;
    
    if (!textContent) {
      return { category: 'OTRO', content: '' };
    }

    // Simple keyword-based classification
    const upperContent = textContent.toUpperCase();
    
    if (upperContent.includes('COMPROBANTE') && 
        (upperContent.includes('BANCO') || upperContent.includes('TRANSFERENCIA'))) {
      return { category: 'COMPROBANTE_BANCARIO', content: textContent };
    }
    
    if (upperContent.includes('LISTADO') && 
        (upperContent.includes('SOCIOS') || upperContent.includes('ASOCIADOS'))) {
      return { category: 'LISTADO_SOCIOS', content: textContent };
    }
    
    return { category: 'OTRO', content: textContent };
  } catch (error) {
    console.error('Error analyzing PDF:', error);
    return { category: 'OTRO', content: '' };
  }
}
