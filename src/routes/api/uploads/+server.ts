import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { extractTextPerPage, saveUploadedFile } from '$lib/extractors/pdf-utils';
import { classify } from '$lib/extractors/classifier';
import { parseListado } from '$lib/extractors/listado';
import { parseComprobante } from '$lib/extractors/comprobante';
import path from 'node:path';

export const POST: RequestHandler = async ({ request }) => {
  try {
    // 1. Get file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file || !file.size) {
      return json({ error: 'No file provided' }, { status: 400 });
    }

    // 2. Save file to uploads directory
    const uploadsDir = path.resolve('static', 'uploads');
    const { path: filePath, filename } = await saveUploadedFile(file, uploadsDir);

    try {
      // 3. Extract text from PDF
      const pages = await extractTextPerPage(filePath);
      const fullText = pages.join('\n\n');

      // 4. Classify document type
      const docType = classify(fullText);

      // 5. Create document record
      const document = await prisma.document.create({
        data: {
          originalName: file.name,
          storagePath: `/uploads/${filename}`,
          mimeType: file.type || 'application/pdf',
          size: file.size,
          type: docType,
          extractions: {
            create: pages.map((text, index) => ({
              pageIndex: index,
              textRaw: text
            }))
          }
        }
      });

      // 6. Parse based on document type
      let result = null;
      if (docType === 'LISTADO_APORTE') {
        result = await parseListado(prisma, document.id, fullText);
      } else if (docType === 'COMPROBANTE_BANCO') {
        result = await parseComprobante(prisma, document.id, fullText);
      }

      return json({
        success: true,
        documentId: document.id,
        type: docType,
        result
      });

    } catch (error) {
      // Clean up file if processing fails
      await fs.unlink(filePath).catch(console.error);
      throw error;
    }

  } catch (error) {
    console.error('Upload error:', error);
    return json(
      { error: 'Error processing file', details: error.message },
      { status: 500 }
    );
  }
};