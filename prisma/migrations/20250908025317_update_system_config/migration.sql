/*
  Warnings:

  - You are about to drop the `SystemConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."SystemConfig";

-- CreateTable
CREATE TABLE "public"."system_config" (
    "id" TEXT NOT NULL,
    "appName" TEXT NOT NULL DEFAULT 'DocuFlow',
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#4f46e5',
    "secondaryColor" TEXT NOT NULL DEFAULT '#7c3aed',
    "primaryTextColor" TEXT NOT NULL DEFAULT '#111827',
    "secondaryTextColor" TEXT NOT NULL DEFAULT '#4b5563',
    "borderRadius" TEXT NOT NULL DEFAULT '0.75rem',
    "defaultLocale" TEXT NOT NULL DEFAULT 'es',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);
