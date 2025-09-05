/*
  Warnings:

  - The values [ID,RECEIPT,CONTRACT,STATEMENT,OTHER] on the enum `DocumentType` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING,COMPLETED,FAILED,CANCELLED] on the enum `JobStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `originalName` on the `Document` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `storagePath` on the `Document` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(512)`.
  - You are about to alter the column `mimeType` on the `Document` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `fieldName` on the `Extraction` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `confidence` on the `Extraction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `source` on the `Extraction` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to drop the column `completedAt` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `error` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Job` table. All the data in the column will be lost.
  - You are about to alter the column `phone` on the `institutions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `website` on the `institutions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `dni` on the `members` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `firstName` on the `members` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `lastName` on the `members` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `email` on the `members` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `phone` on the `members` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `nationality` on the `members` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - The `status` column on the `members` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[sha256]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `institutions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sha256` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."DocumentType_new" AS ENUM ('BANK_RECEIPT', 'CONCEPT_SUMMARY', 'MEMBER_CARD');
ALTER TABLE "public"."Document" ALTER COLUMN "type" TYPE "public"."DocumentType_new" USING ("type"::text::"public"."DocumentType_new");
ALTER TYPE "public"."DocumentType" RENAME TO "DocumentType_old";
ALTER TYPE "public"."DocumentType_new" RENAME TO "DocumentType";
DROP TYPE "public"."DocumentType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."JobStatus_new" AS ENUM ('QUEUED', 'PROCESSING', 'DONE', 'ERROR');
ALTER TABLE "public"."Job" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Job" ALTER COLUMN "status" TYPE "public"."JobStatus_new" USING ("status"::text::"public"."JobStatus_new");
ALTER TYPE "public"."JobStatus" RENAME TO "JobStatus_old";
ALTER TYPE "public"."JobStatus_new" RENAME TO "JobStatus";
DROP TYPE "public"."JobStatus_old";
ALTER TABLE "public"."Job" ALTER COLUMN "status" SET DEFAULT 'QUEUED';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Extraction" DROP CONSTRAINT "Extraction_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Job" DROP CONSTRAINT "Job_documentId_fkey";

-- DropIndex
DROP INDEX "public"."Document_type_idx";

-- DropIndex
DROP INDEX "public"."Job_status_idx";

-- DropIndex
DROP INDEX "public"."members_status_idx";

-- AlterTable
ALTER TABLE "public"."Document" ADD COLUMN     "pages" INTEGER,
ADD COLUMN     "sha256" TEXT,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "originalName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "storagePath" SET DATA TYPE VARCHAR(512),
ALTER COLUMN "mimeType" SET DATA TYPE VARCHAR(100);

-- Update existing rows with a default value for sha256
UPDATE "public"."Document" SET "sha256" = encode(gen_random_bytes(32), 'hex') WHERE "sha256" IS NULL;

-- Now make the column required
ALTER TABLE "public"."Document" ALTER COLUMN "sha256" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Extraction" ALTER COLUMN "fieldName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "confidence" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "source" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "public"."Job" DROP COLUMN "completedAt",
DROP COLUMN "error",
DROP COLUMN "metadata",
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "lastError" TEXT,
ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "maxAttempts" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "metrics" JSONB,
ADD COLUMN     "payload" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'QUEUED',
ALTER COLUMN "documentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."institutions" ALTER COLUMN "phone" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "website" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "public"."members" ALTER COLUMN "dni" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "nationality" SET DATA TYPE VARCHAR(50),
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- DropEnum
DROP TYPE "public"."MemberStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Document_sha256_key" ON "public"."Document"("sha256");

-- CreateIndex
CREATE INDEX "Document_institutionId_idx" ON "public"."Document"("institutionId");

-- CreateIndex
CREATE INDEX "Document_sha256_idx" ON "public"."Document"("sha256");

-- CreateIndex
CREATE INDEX "Extraction_fieldName_idx" ON "public"."Extraction"("fieldName");

-- CreateIndex
CREATE INDEX "Job_status_priority_createdAt_idx" ON "public"."Job"("status", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "Job_scheduledAt_idx" ON "public"."Job"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_email_key" ON "public"."institutions"("email");

-- CreateIndex
CREATE INDEX "institutions_cuit_idx" ON "public"."institutions"("cuit");

-- CreateIndex
CREATE INDEX "institutions_isActive_idx" ON "public"."institutions"("isActive");

-- CreateIndex
CREATE INDEX "members_institutionId_idx" ON "public"."members"("institutionId");

-- CreateIndex
CREATE INDEX "members_createdAt_idx" ON "public"."members"("createdAt");

-- CreateIndex
CREATE INDEX "members_email_idx" ON "public"."members"("email");

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Extraction" ADD CONSTRAINT "Extraction_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
