import { z } from 'zod';

// Define the MemberStatus enum to match Prisma's schema
export const MemberStatus = {
  ACTIVE: 'ACTIVE',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  SUSPENDED: 'SUSPENDED',
  INACTIVE: 'INACTIVE',
  DECEASED: 'DECEASED'
} as const;

export type MemberStatus = keyof typeof MemberStatus;

export const memberSchema = z.object({
  dni: z.string().min(6, 'El DNI debe tener al menos 6 caracteres').max(12, 'El DNI no puede tener más de 12 caracteres'),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  nationality: z.string().optional(),
  status: z.nativeEnum(MemberStatus).optional(),
  joinedAt: z.string().optional(),
  institutionId: z.string().cuid('ID de institución inválido')
});

export type MemberInput = z.infer<typeof memberSchema>;

export const memberUpdateSchema = memberSchema.partial();
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;
