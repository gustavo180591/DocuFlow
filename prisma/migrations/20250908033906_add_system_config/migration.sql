/*
  Warnings:

  - You are about to drop the `system_config` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."system_config";

-- CreateTable
CREATE TABLE "public"."SystemConfig" (
    "id" TEXT NOT NULL,
    "appName" TEXT NOT NULL DEFAULT 'DocuFlow',
    "logoUrl" TEXT NOT NULL DEFAULT '/logo.svg',
    "brand" JSONB NOT NULL DEFAULT '{"primaryRgb":"79 70 229","secondaryRgb":"99 102 241","mutedRgb":"99 102 120"}',
    "locale" TEXT NOT NULL DEFAULT 'es',
    "features" JSONB NOT NULL DEFAULT '{"reports":true,"documents":true}',
    "borderRadius" TEXT DEFAULT '0.5rem',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);
