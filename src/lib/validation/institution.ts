import { z } from 'zod';

export const institutionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  cuit: z.string().regex(/^\d{2}-\d{8}-\d$/, 'Formato de CUIT inválido (ej: 30-12345678-9)'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  isActive: z.boolean().optional().default(true)
});

export type InstitutionInput = z.infer<typeof institutionSchema>;

export const institutionUpdateSchema = institutionSchema.partial();
export type InstitutionUpdateInput = z.infer<typeof institutionUpdateSchema>;
