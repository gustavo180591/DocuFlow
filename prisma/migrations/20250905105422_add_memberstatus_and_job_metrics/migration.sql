/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `members` table. All the data in the column will be lost.
  - The `status` column on the `members` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `apellido` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `members` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- DropIndex
DROP INDEX "public"."members_dni_idx";

-- AlterTable
ALTER TABLE "public"."Job" DROP COLUMN "updatedAt",
ALTER COLUMN "payload" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."members" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "apellido" TEXT NOT NULL,
ADD COLUMN     "nombre" TEXT NOT NULL,
ALTER COLUMN "dni" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "nationality" SET DATA TYPE TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."MemberStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "members_apellido_nombre_idx" ON "public"."members"("apellido", "nombre");

-- CreateIndex
CREATE INDEX "members_status_idx" ON "public"."members"("status");
