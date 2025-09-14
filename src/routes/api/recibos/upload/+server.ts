import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

import { UPLOAD_DIR } from '$lib/config';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

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

    // Convert file to buffer and save to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // In a real app, you would:
    // 1. Save file metadata to the database
    // 2. Queue a background job for processing
    // 3. Return the document ID

    const documentId = randomUUID();

    return json({
      success: true,
      documentId,
      fileName: file.name,
      filePath: `/uploads/${fileName}`,
      size: file.size,
      type: file.type
    });
  } catch (err) {
    console.error('Error uploading file:', err);
    return new Response(
      JSON.stringify({ error: 'Error processing file upload' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
