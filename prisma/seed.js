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
        brand: defaultSystemConfig.brand,
        features: defaultSystemConfig.features
      }
    });
    console.log('✅ SystemConfig initialized');
  } else {
    console.log('ℹ️  SystemConfig already exists, skipping initialization');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
