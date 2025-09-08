import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { systemConfigSchema, type SystemConfigInput } from '$lib/validations/system-config.schema';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './types';

// GET /api/system-config
export const GET: RequestHandler = async () => {
  try {
    // Get or create the default system config
    let config = await prisma.systemConfig.findFirst();
    
    if (!config) {
      config = await prisma.systemConfig.create({
        data: {
          appName: 'DocuFlow',
          primaryColor: '#4f46e5',
          secondaryColor: '#7c3aed',
          primaryTextColor: '#111827',
          secondaryTextColor: '#4b5563',
          borderRadius: '0.75rem',
          defaultLocale: 'es'
        }
      });
    }
    
    return json({
      data: config,
      success: true
    });
  } catch (err) {
    console.error('Error getting system config:', err);
    throw error(500, 'Error al obtener la configuración del sistema');
  }
}

// PUT /api/system-config
export const PUT: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const validation = systemConfigSchema.safeParse(body);
    
    if (!validation.success) {
      throw error(400, JSON.stringify({
        message: 'Datos de configuración inválidos',
        issues: validation.error.format()
      }));
    }
    
    const configData: SystemConfigInput = validation.data;
    
    // Get existing config or create a new one
    let config = await prisma.systemConfig.findFirst();
    
    if (config) {
      // Update existing config
      config = await prisma.systemConfig.update({
        where: { id: config.id },
        data: configData
      });
    } else {
      // Create new config
      config = await prisma.systemConfig.create({
        data: configData
      });
    }
    
    return json({
      data: config,
      success: true,
      message: 'Configuración actualizada correctamente'
    });
  } catch (err: any) {
    console.error('Error updating system config:', err);
    
    if (err.status === 400) {
      throw err;
    }
    
    throw error(500, 'Error al actualizar la configuración del sistema');
  }
}
