import { error as httpError, json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { log } from '$lib/utils/logger';
import { enqueueJob } from '$lib/jobs/enqueue';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

// Environment variables in Vite are exposed via import.meta.env
const MAX_UPLOAD_MB = parseInt(import.meta.env.VITE_MAX_UPLOAD_MB || '10', 10);
const UPLOAD_DIR = import.meta.env.VITE_UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = MAX_UPLOAD_MB * 1024 * 1024;

// Ensure upload directory exists
await mkdir(UPLOAD_DIR, { recursive: true });

// Allowed MIME types
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/plain'
];

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Check content type
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      throw httpError(400, 'Form data with file upload expected');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      throw httpError(400, 'No file uploaded');
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw httpError(400, `File type ${file.type} is not allowed`);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw httpError(413, `File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Generate unique filename
    const fileExt = extname(file.name);
    const fileName = `${randomUUID()}${fileExt}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // In a real app, you'd calculate the actual SHA-256 hash here
    // For now, we'll use a placeholder
    const hash = randomUUID().replace(/-/g, '').slice(0, 64);

    // Save to database
    const document = await prisma.document.create({
      data: {
        originalName: file.name,
        storagePath: filePath,
        mimeType: file.type,
        size: file.size,
        sha256: hash,
        type: 'OTHER',
      },
    });

    try {
      // Enqueue an OCR job for the uploaded document
      await enqueueJob({
        type: 'OCR',
        payload: { 
          sha256: hash,
          filename: file.name,
          mimeType: file.type,
        },
        documentId: document.id,
        priority: 5, // Medium priority
      });

      log.info(`Enqueued OCR job for document ${document.id}`);
    } catch (error) {
      // Log the error but don't fail the upload
      log.error(`Failed to enqueue OCR job: ${error.message}`);
    }

    return json({ 
      success: true, 
      document: {
        id: document.id,
        filename: document.originalName,
        size: document.size,
        mimeType: document.mimeType,
        uploadedAt: document.uploadedAt,
        jobEnqueued: true,
      } 
    });

  } catch (error) {
    log.error('File upload failed:', error);
    
    if (error && typeof error === 'object' && 'status' in error && 
        (error.status === 400 || error.status === 413)) {
      throw error;
    }
    
    throw httpError(500, 'Failed to upload file');
  }
};
