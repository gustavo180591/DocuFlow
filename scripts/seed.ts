import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultSystemConfig = {
  appName: 'DocuFlow',
  logoUrl: '/logo.svg',
  brand: {
    primaryRgb: '79 70 229',
    secondaryRgb: '99 102 241',
    mutedRgb: '99 102 120'
  },
  locale: 'es',
  features: {
    reports: true,
    documents: true
  },
  borderRadius: '0.5rem'
};

async function main() {
  console.log('🌱 Starting database seeding...');

  // Initialize SystemConfig if it doesn't exist
  const existingConfig = await prisma.systemConfig.findFirst();
  if (!existingConfig) {
    console.log('🔧 Initializing SystemConfig...');
    await prisma.systemConfig.create({
      data: {
        ...defaultSystemConfig,
        brand: defaultSystemConfig.brand as any, // Type assertion for Prisma
        features: defaultSystemConfig.features as any // Type assertion for Prisma
      }
    });
    console.log('✅ SystemConfig initialized');
  } else {
    console.log('ℹ️  SystemConfig already exists, skipping initialization');
  }

  // Create sample institutions
  const institution1 = await prisma.institution.upsert({
    where: { cuit: '30-12345678-9' },
    update: {},
    create: {
      name: 'Asociación Civil Ejemplo',
      cuit: '30-12345678-9',
      address: 'Av. Corrientes 1234, CABA',
      phone: '+54 11 4123-4567',
      email: 'contacto@acejemplo.org.ar',
      website: 'https://www.acejemplo.org.ar',
      isActive: true
    }
  });

  const institution2 = await prisma.institution.upsert({
    where: { cuit: '30-87654321-0' },
    update: {},
    create: {
      name: 'Fundación Solidaridad',
      cuit: '30-87654321-0',
      address: 'Av. Santa Fe 4567, CABA',
      phone: '+54 11 4987-6543',
      email: 'info@fundacionsolidaridad.org.ar',
      website: 'https://www.fundacionsolidaridad.org.ar',
      isActive: true
    }
  });

  // Create sample members for institution 1
  const member1 = await prisma.member.upsert({
    where: { dni: '12345678' },
    update: {},
    create: {
      dni: '12345678',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@email.com',
      phone: '+54 11 1234-5678',
      address: 'Av. Corrientes 1234, CABA',
      birthDate: new Date('1990-05-15'),
      nationality: 'Argentina',
      status: 'ACTIVE',
      joinedAt: new Date('2020-01-15'),
      institutionId: institution1.id
    }
  });

  const member2 = await prisma.member.upsert({
    where: { dni: '23456789' },
    update: {},
    create: {
      dni: '23456789',
      nombre: 'María',
      apellido: 'González',
      email: 'maria.gonzalez@email.com',
      phone: '+54 11 2345-6789',
      address: 'Belgrano 567, CABA',
      birthDate: new Date('1985-08-22'),
      nationality: 'Argentina',
      status: 'ACTIVE',
      joinedAt: new Date('2019-06-10'),
      institutionId: institution1.id
    }
  });

  // Create sample members for institution 2
  const member3 = await prisma.member.upsert({
    where: { dni: '34567890' },
    update: {},
    create: {
      dni: '34567890',
      nombre: 'Carlos',
      apellido: 'López',
      email: 'carlos.lopez@email.com',
      phone: '+54 11 3456-7890',
      address: 'San Martín 890, CABA',
      birthDate: new Date('1982-11-30'),
      nationality: 'Argentina',
      status: 'ACTIVE',
      joinedAt: new Date('2021-03-22'),
      institutionId: institution2.id
    }
  });

  const member4 = await prisma.member.upsert({
    where: { dni: '45678901' },
    update: {},
    create: {
      dni: '45678901',
      nombre: 'Ana',
      apellido: 'Martínez',
      email: 'ana.martinez@email.com',
      phone: '+54 11 4567-8901',
      address: 'Av. Cabildo 1234, CABA',
      status: 'INACTIVE',
      birthDate: new Date('1992-03-10'),
      nationality: 'Argentina',
      joinedAt: new Date('2022-01-10'),
      institutionId: institution2.id
    }
  });

  // Member 5 - Inactive member in institution 1
  await prisma.member.upsert({
    where: { dni: '56789012' },
    update: {},
    create: {
      dni: '56789012',
      nombre: 'Roberto',
      apellido: 'Silva',
      email: 'roberto.silva@email.com',
      phone: '+54 11 5678-9012',
      address: 'Florida 456, CABA',
      status: 'INACTIVE',
      birthDate: new Date('1975-06-20'),
      nationality: 'Argentina',
      joinedAt: new Date('2021-11-15'),
      institutionId: institution1.id
    }
  });

  console.log('✅ Members created');

  // Create sample documents with unique SHA256 hashes
  const doc1 = await prisma.document.create({
    data: {
      type: 'BANK_RECEIPT',
      originalName: 'Recibo de sueldo - Agosto 2025.pdf',
      storagePath: '/uploads/recibo_agosto_2025.pdf',
      mimeType: 'application/pdf',
      size: 2516582, // 2.4 MB
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // Empty file hash
      memberId: member1.id
    }
  });

  const doc2 = await prisma.document.create({
    data: {
      type: 'MEMBER_CARD',
      originalName: 'DNI - Escaneo frontal.jpg',
      storagePath: '/uploads/dni_frontal.jpg',
      mimeType: 'image/jpeg',
      size: 1153434, // 1.1 MB
      sha256: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e', // 'Hello World' hash
      memberId: member2.id
    }
  });

  const doc3 = await prisma.document.create({
    data: {
      type: 'CONCEPT_SUMMARY',
      originalName: 'Contrato laboral.pdf',
      storagePath: '/uploads/contrato_laboral.pdf',
      mimeType: 'application/pdf',
      size: 3355443, // 3.2 MB
      sha256: '3a6eb0790f39ac87c94f3856b2dd2c5d110e6811602261a9a923d3bb23d8e2a9', // Unique hash for doc3
      memberId: member3.id
    }
  });

  const doc4 = await prisma.document.create({
    data: {
      type: 'BANK_RECEIPT',
      originalName: 'Recibo de sueldo - Julio 2025.pdf',
      storagePath: '/uploads/recibo_julio_2025.pdf',
      mimeType: 'application/pdf',
      size: 2202009, // 2.1 MB
      sha256: '4b227777d4dd1fc61c6f884f48645d515a0b1b1d9b1b8e5f8e5a5b5e5a5b5e5', // Unique hash for doc4
      memberId: member4.id
    }
  });

  const doc5 = await prisma.document.create({
    data: {
      type: 'MEMBER_CARD',
      originalName: 'DNI - Reverso.jpg',
      storagePath: '/uploads/dni_reverso.jpg',
      mimeType: 'image/jpeg',
      size: 1048576, // 1.0 MB
      sha256: '5c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7af', // Unique hash for doc5
      memberId: member2.id
    }
  });

  console.log('✅ Documents created');

  // Create sample jobs for documents
  await prisma.job.create({
    data: {
      type: 'OCR',
      status: 'DONE',
      documentId: doc1.id,
      startedAt: new Date('2025-08-27T10:00:00Z'),
      finishedAt: new Date('2025-08-27T10:05:00Z'),
      payload: { pages: 1, resolution: '300dpi' },
      result: { success: true, pagesProcessed: 1 }
    }
  });

  await prisma.job.create({
    data: {
      type: 'PARSING',
      status: 'DONE',
      documentId: doc1.id,
      startedAt: new Date('2025-08-27T10:05:00Z'),
      finishedAt: new Date('2025-08-27T10:07:00Z'),
      payload: { documentType: 'BANK_RECEIPT' },
      result: { fieldsExtracted: 5, success: true }
    }
  });

  await prisma.job.create({
    data: {
      type: 'OCR',
      status: 'DONE',
      documentId: doc2.id,
      startedAt: new Date('2025-08-27T11:00:00Z'),
      finishedAt: new Date('2025-08-27T11:02:00Z'),
      payload: { pages: 1, resolution: '300dpi' },
      result: { success: true, pagesProcessed: 1 }
    }
  });

  await prisma.job.create({
    data: {
      type: 'OCR',
      status: 'PROCESSING',
      documentId: doc3.id,
      startedAt: new Date('2025-08-27T12:00:00Z'),
      payload: { pages: 2, resolution: '300dpi' },
      metrics: { progress: 50 }
    }
  });

  await prisma.job.create({
    data: {
      type: 'OCR',
      status: 'DONE',
      documentId: doc4.id,
      startedAt: new Date('2025-08-25T09:00:00Z'),
      finishedAt: new Date('2025-08-25T09:03:00Z'),
      payload: { pages: 1, resolution: '300dpi' },
      result: { success: true, pagesProcessed: 1 }
    }
  });

  await prisma.job.create({
    data: {
      type: 'OCR',
      status: 'DONE',
      documentId: doc5.id,
      startedAt: new Date('2025-08-27T14:00:00Z'),
      finishedAt: new Date('2025-08-27T14:01:00Z'),
      payload: { pages: 1, resolution: '150dpi' },
      result: { success: false, error: 'Image quality too low for OCR processing' },
      lastError: 'Image quality too low for OCR processing',
      metrics: { error: 'low_quality', resolution: '150dpi' }
    }
  });

  console.log('✅ Jobs created');

  // Create sample extractions
  await prisma.extraction.createMany({
    data: [
      {
        documentId: doc1.id,
        fieldName: 'employee_name',
        fieldValue: 'Juan Pérez',
        confidence: 0.98,
        source: 'OCR'
      },
      {
        documentId: doc1.id,
        fieldName: 'salary_amount',
        fieldValue: '150000',
        confidence: 0.95,
        source: 'PARSING'
      },
      {
        documentId: doc1.id,
        fieldName: 'period',
        fieldValue: 'Agosto 2025',
        confidence: 0.99,
        source: 'OCR'
      },
      {
        documentId: doc2.id,
        fieldName: 'document_number',
        fieldValue: '23456789',
        confidence: 0.97,
        source: 'OCR'
      },
      {
        documentId: doc2.id,
        fieldName: 'full_name',
        fieldValue: 'María González',
        confidence: 0.96,
        source: 'OCR'
      }
    ]
  });

  console.log('✅ Extractions created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 