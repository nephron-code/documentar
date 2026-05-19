/*
  Warnings:

  - You are about to drop the column `medications` on the `Patient` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MedicationStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DISCONTINUED');

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "medications";

-- CreateTable
CREATE TABLE "PatientMedication" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dose" TEXT,
    "frequency" TEXT,
    "status" "MedicationStatus" NOT NULL DEFAULT 'ACTIVE',
    "prescribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prescribedInId" TEXT,
    "discontinuedAt" TEXT,
    "suspendedAt" TIMESTAMP(3),
    "suspendedInId" TEXT,
    "notes" TEXT,

    CONSTRAINT "PatientMedication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatientMedication_patientId_status_idx" ON "PatientMedication"("patientId", "status");

-- CreateIndex
CREATE INDEX "PatientMedication_patientId_prescribedAt_idx" ON "PatientMedication"("patientId", "prescribedAt");

-- AddForeignKey
ALTER TABLE "PatientMedication" ADD CONSTRAINT "PatientMedication_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientMedication" ADD CONSTRAINT "PatientMedication_prescribedInId_fkey" FOREIGN KEY ("prescribedInId") REFERENCES "Evolution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientMedication" ADD CONSTRAINT "PatientMedication_suspendedInId_fkey" FOREIGN KEY ("suspendedInId") REFERENCES "Evolution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
