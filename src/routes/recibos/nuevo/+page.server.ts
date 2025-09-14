import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { UPLOAD_DIR } from '$lib/config';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Get the full upload path
const UPLOAD_PATH = join(process.cwd(), UPLOAD_DIR);

// Create upload directory if it doesn't exist
if (!existsSync(UPLOAD_PATH)) {
  await mkdir(UPLOAD_PATH, { recursive: true });
}

export const load: PageServerLoad = async ({ locals }) => {
  // In a real app, you might want to check if the user is authenticated
  // and has permission to upload receipts
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      // Validate file
      if (!(file instanceof File) || file.size === 0) {
        return fail(400, { error: 'No se ha seleccionado ningún archivo' });
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return fail(400, { error: 'El archivo es demasiado grande. El tamaño máximo permitido es de 10MB' });
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        return fail(400, { 
          error: 'Tipo de archivo no soportado. Por favor, suba un archivo PDF o imagen (JPEG, PNG)' 
        });
      }
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${randomUUID()}.${fileExt}`;
      const filePath = join(UPLOAD_PATH, fileName);

      // Convert file to buffer and save to disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      
      // In a real app, you would now:
      // 1. Save file metadata to the database
      // 2. Queue a background job for processing
      
      const documentId = randomUUID();
      
      return { 
        success: true, 
        documentId,
        fileName: file.name,
        filePath: `/uploads/${fileName}`,
        size: file.size,
        type: file.type,
        message: 'Recibo subido correctamente. Redirigiendo...' 
      };
      
    } catch (error) {
      console.error('Error uploading file:', error);
      return fail(500, { 
        error: 'Error al procesar el archivo. Por favor, intente nuevamente.' 
      });
    }
  }
};
