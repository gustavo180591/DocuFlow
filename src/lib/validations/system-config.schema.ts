import { z } from 'zod';

export const systemConfigSchema = z.object({
  appName: z.string().min(1, 'El nombre de la aplicación es requerido').max(100),
  logoUrl: z.string().url('URL de logo inválida').optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color primario inválido'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color secundario inválido'),
  primaryTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color de texto primario inválido'),
  secondaryTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color de texto secundario inválido'),
  borderRadius: z.string().regex(/^\d+(\.\d+)?(rem|px|%)$/, 'Radio de borde inválido'),
  defaultLocale: z.enum(['es', 'en', 'pt'])
});

export type SystemConfigInput = z.infer<typeof systemConfigSchema>;
