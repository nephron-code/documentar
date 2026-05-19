/*
  Warnings:

  - You are about to drop the `PatientMedication` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PatientMedication" DROP CONSTRAINT "PatientMedication_patientId_fkey";

-- DropForeignKey
ALTER TABLE "PatientMedication" DROP CONSTRAINT "PatientMedication_prescribedInId_fkey";

-- DropForeignKey
ALTER TABLE "PatientMedication" DROP CONSTRAINT "PatientMedication_suspendedInId_fkey";

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "medications" TEXT[];

-- DropTable
DROP TABLE "PatientMedication";

-- DropEnum
DROP TYPE "MedicationStatus";
