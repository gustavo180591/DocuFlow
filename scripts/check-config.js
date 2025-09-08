import { PrismaClient } from '@prisma/client';

async function checkConfig() {
  const prisma = new PrismaClient();
  try {
    const config = await prisma.systemConfig.findFirst();
    console.log('SystemConfig:', JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error checking SystemConfig:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConfig();
