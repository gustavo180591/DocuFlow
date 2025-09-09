import { json, type RequestHandler } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Prisma singleton to prevent too many connections in dev/hot-reload
const prisma = global.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.__prisma = prisma;

// Zod schema for member creation validation
const CreateMemberSchema = z.object({
  numeroOrden: z.string().min(1, 'El número de orden es obligatorio'),
  numeroMatricula: z.string().min(1, 'El número de matrícula es obligatorio'),
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  institucion: z.string().optional(),
  documentoIdentidad: z.string().min(1, 'El documento de identidad es obligatorio'),
  nacionalidad: z.string().default('Argentina'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('México'),
  membershipStartDate: z.string().default(() => new Date().toISOString().split('T')[0])
});

type MemberInput = z.infer<typeof CreateMemberSchema>;

// Utility to extract error message
function getErrorMessage(e: unknown): string {
  if (typeof e === 'string') return e;
  if (e && typeof e === 'object' && 'message' in e) return String((e as Error).message);
  return 'Error desconocido';
}

// GET /api/socios?page=1&pageSize=10&search=...
export const GET: RequestHandler = async ({ url }) => {
  try {
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') ?? 10)));
    const search = (url.searchParams.get('search') ?? '').trim();

    // Type the where clause explicitly and use Prisma.QueryMode
    const where: Prisma.MemberWhereInput | undefined = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            { lastName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            { email: { contains: search, mode: 'insensitive' as Prisma.QueryMode } }
          ]
        }
      : undefined;

    const [total, data] = await Promise.all([
      prisma.member.count({ where }),
      prisma.member.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          address: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return json({
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize))
      }
    });
  } catch (e) {
    console.error('Error fetching members:', e);
    return json(
      { error: 'Error al obtener los socios', details: getErrorMessage(e) },
      { status: 500 }
    );
  }
}

// POST /api/socios
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = CreateMemberSchema.safeParse(body);

    if (!parsed.success) {
      return json(
        { error: 'Validación inválida', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const member = await prisma.member.create({
      data: {
        numeroOrden: parsed.data.numeroOrden,
        numeroMatricula: parsed.data.numeroMatricula,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        institucion: parsed.data.institucion,
        documentoIdentidad: parsed.data.documentoIdentidad,
        nacionalidad: parsed.data.nacionalidad,
        status: parsed.data.status,
        email: parsed.data.email,
        phone: parsed.data.phone,
        address: parsed.data.address,
        city: parsed.data.city,
        state: parsed.data.state,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country,
        membershipStartDate: new Date(parsed.data.membershipStartDate)
      },
      select: {
        id: true,
        numeroOrden: true,
        numeroMatricula: true,
        firstName: true,
        lastName: true,
        institucion: true,
        documentoIdentidad: true,
        nacionalidad: true,
        status: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        membershipStartDate: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return json(member, { status: 201 });
  } catch (e: unknown) {
    // Handle unique constraint (e.g., email)
    if (e && typeof e === 'object' && 'code' in e && (e as any).code === 'P2002') {
      return json(
        { error: 'Ya existe un socio con ese valor único (por ejemplo email)' },
        { status: 400 }
      );
    }
    console.error('Error creating member:', e);
    return json(
      { error: 'Error al crear el socio', details: getErrorMessage(e) },
      { status: 500 }
    );
  }
}
