import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample members
  const member1 = await prisma.member.upsert({
    where: { dni: '12345678' },
    update: {},
    create: {
      dni: '12345678',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@email.com',
      phone: '+54 11 1234-5678',
      address: 'Av. Corrientes 1234, CABA',
      status: 'ACTIVE',
      birthDate: new Date('1990-05-15'),
      nationality: 'Argentina'
    }
  });

  const member2 = await prisma.member.upsert({
    where: { dni: '23456789' },
    update: {},
    create: {
      dni: '23456789',
      firstName: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@email.com',
      phone: '+54 11 2345-6789',
      address: 'Belgrano 567, CABA',
      status: 'ACTIVE',
      birthDate: new Date('1985-08-22'),
      nationality: 'Argentina'
    }
  });

  const member3 = await prisma.member.upsert({
    where: { dni: '34567890' },
    update: {},
    create: {
      dni: '34567890',
      firstName: 'Carlos',
      lastName: 'López',
      email: 'carlos.lopez@email.com',
      phone: '+54 11 3456-7890',
      address: 'San Martín 890, CABA',
      status: 'PENDING_VERIFICATION',
      birthDate: new Date('1992-03-10'),
      nationality: 'Argentina'
    }
  });

  const member4 = await prisma.member.upsert({
    where: { dni: '45678901' },
    update: {},
    create: {
      dni: '45678901',
      firstName: 'Ana',
      lastName: 'Martínez',
      email: 'ana.martinez@email.com',
      phone: '+54 11 4567-8901',
      address: 'Rivadavia 123, CABA',
      status: 'ACTIVE',
      birthDate: new Date('1988-12-05'),
      nationality: 'Argentina'
    }
  });

  const member5 = await prisma.member.upsert({
    where: { dni: '56789012' },
    update: {},
    create: {
      dni: '56789012',
      firstName: 'Roberto',
      lastName: 'Silva',
      email: 'roberto.silva@email.com',
      phone: '+54 11 5678-9012',
      address: 'Florida 456, CABA',
      status: 'INACTIVE',
      birthDate: new Date('1975-06-20'),
      nationality: 'Argentina'
    }
  });

  console.log('✅ Members created');

  // Create sample documents
  const doc1 = await prisma.document.create({
    data: {
      type: 'RECEIPT',
      originalName: 'Recibo de sueldo - Agosto 2025.pdf',
      storagePath: '/uploads/recibo_agosto_2025.pdf',
      mimeType: 'application/pdf',
      size: 2516582, // 2.4 MB
      memberId: member1.id
    }
  });

  const doc2 = await prisma.document.create({
    data: {
      type: 'ID',
      originalName: 'DNI - Escaneo frontal.jpg',
      storagePath: '/uploads/dni_frontal.jpg',
      mimeType: 'image/jpeg',
      size: 1153434, // 1.1 MB
      memberId: member2.id
    }
  });

  const doc3 = await prisma.document.create({
    data: {
      type: 'CONTRACT',
      originalName: 'Contrato laboral.pdf',
      storagePath: '/uploads/contrato_laboral.pdf',
      mimeType: 'application/pdf',
      size: 3355443, // 3.2 MB
      memberId: member3.id
    }
  });

  const doc4 = await prisma.document.create({
    data: {
      type: 'RECEIPT',
      originalName: 'Recibo de sueldo - Julio 2025.pdf',
      storagePath: '/uploads/recibo_julio_2025.pdf',
      mimeType: 'application/pdf',
      size: 2202009, // 2.1 MB
      memberId: member4.id
    }
  });

  const doc5 = await prisma.document.create({
    data: {
      type: 'ID',
      originalName: 'DNI - Reverso.jpg',
      storagePath: '/uploads/dni_reverso.jpg',
      mimeType: 'image/jpeg',
      size: 1048576, // 1.0 MB
      memberId: member2.id
    }
  });

  console.log('✅ Documents created');

  // Create sample jobs for documents
  await prisma.job.createMany({
    data: [
      {
        type: 'OCR',
        status: 'COMPLETED',
        documentId: doc1.id,
        startedAt: new Date('2025-08-27T10:00:00Z'),
        completedAt: new Date('2025-08-27T10:05:00Z')
      },
      {
        type: 'PARSING',
        status: 'COMPLETED',
        documentId: doc1.id,
        startedAt: new Date('2025-08-27T10:05:00Z'),
        completedAt: new Date('2025-08-27T10:07:00Z')
      },
      {
        type: 'OCR',
        status: 'COMPLETED',
        documentId: doc2.id,
        startedAt: new Date('2025-08-27T11:00:00Z'),
        completedAt: new Date('2025-08-27T11:02:00Z')
      },
      {
        type: 'OCR',
        status: 'PROCESSING',
        documentId: doc3.id,
        startedAt: new Date('2025-08-27T12:00:00Z')
      },
      {
        type: 'OCR',
        status: 'COMPLETED',
        documentId: doc4.id,
        startedAt: new Date('2025-08-25T09:00:00Z'),
        completedAt: new Date('2025-08-25T09:03:00Z')
      },
      {
        type: 'OCR',
        status: 'FAILED',
        documentId: doc5.id,
        startedAt: new Date('2025-08-27T14:00:00Z'),
        completedAt: new Date('2025-08-27T14:01:00Z'),
        error: 'Image quality too low for OCR processing'
      }
    ]
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