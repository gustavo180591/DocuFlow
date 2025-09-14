import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

import { UPLOAD_DIR } from '$lib/config';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { analyzePdfContent, type DocumentCategory } from '$lib/utils/pdfAnalyzer';
import { prisma } from '$lib/server/prisma';
import { Prisma } from '@prisma/client';

// Get the full upload path
const UPLOAD_PATH = join(process.cwd(), UPLOAD_DIR);

// Create upload directory if it doesn't exist
if (process.env.NODE_ENV !== 'test' && !existsSync(UPLOAD_PATH)) {
  await mkdir(UPLOAD_PATH, { recursive: true });
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file || !(file instanceof File)) {
      return json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return json(
        { error: 'Invalid file type. Only PDF, JPEG, and PNG files are allowed' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || '';
    const fileName = `${randomUUID()}.${fileExt}`;
    const filePath = join(UPLOAD_PATH, fileName);

    try {
      // Convert file to buffer and save to disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      let category: DocumentCategory = 'OTRO';
      let extractedText = '';
      
      // Only analyze PDF files for now
      if (file.type === 'application/pdf') {
        const analysis = await analyzePdfContent(filePath);
        category = analysis.category;
        extractedText = analysis.content;
      }
      
      // Save to database
      const processedDoc = await prisma.processedDocument.create({
        data: {
          originalName: file.name,
          storagePath: filePath,
          mimeType: file.type,
          size: file.size,
          type: category,
          extractions: {
            create: {
              pageIndex: 0,
              textRaw: extractedText.substring(0, 10000) // Store first 10k chars
            }
          }
        },
        include: {
          extractions: true
        }
      });

      // Determine redirect path based on category
      let redirectPath = '/recibos';
      if (category === 'COMPROBANTE_BANCARIO') {
        redirectPath = '/recibos/comprobantes';
      } else if (category === 'LISTADO_SOCIOS') {
        redirectPath = '/socios/importar';
      }

      return json({
        success: true,
        fileName,
        originalName: file.name,
        filePath: `/uploads/${fileName}`,
        size: file.size,
        type: file.type,
        category,
        documentId: processedDoc.id,
        redirectPath
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Clean up the uploaded file if there was a database error
      if (existsSync(filePath)) {
        await unlink(filePath).catch(console.error);
      }
      throw dbError;
    }
  } catch (err) {
    console.error('Error uploading file:', err);
    return new Response(
      JSON.stringify({ error: 'Error processing file upload' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
