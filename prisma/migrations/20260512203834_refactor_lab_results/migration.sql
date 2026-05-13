/*
  Warnings:

  - You are about to drop the column `calcium` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `cholesterol` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `consultationId` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `creatinine` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `egfr` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `ferritin` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `ft4` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `glucose` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `hba1c` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `hdl` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `hematocrit` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `hemoglobin` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `iron` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `ldl` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `mcv` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `microalbumin` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `phosphorus` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `platelets` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `potassium` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `pth` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `reticulocytes` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `sodium` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `transferrin` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `triglycerides` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `tsat` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `tsh` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `ua` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `urea` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `uricAcid` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `urineCreat` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `vitaminD` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `wbc` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the `Consultation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `examType` to the `LabResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `LabResult` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Consultation" DROP CONSTRAINT "Consultation_patientId_fkey";

-- DropForeignKey
ALTER TABLE "LabResult" DROP CONSTRAINT "LabResult_consultationId_fkey";

-- DropIndex
DROP INDEX "LabResult_consultationId_idx";

-- DropIndex
DROP INDEX "LabResult_patientId_examDate_idx";

-- AlterTable
ALTER TABLE "LabResult" DROP COLUMN "calcium",
DROP COLUMN "cholesterol",
DROP COLUMN "consultationId",
DROP COLUMN "creatinine",
DROP COLUMN "egfr",
DROP COLUMN "ferritin",
DROP COLUMN "ft4",
DROP COLUMN "glucose",
DROP COLUMN "hba1c",
DROP COLUMN "hdl",
DROP COLUMN "hematocrit",
DROP COLUMN "hemoglobin",
DROP COLUMN "iron",
DROP COLUMN "ldl",
DROP COLUMN "mcv",
DROP COLUMN "microalbumin",
DROP COLUMN "phosphorus",
DROP COLUMN "platelets",
DROP COLUMN "potassium",
DROP COLUMN "pth",
DROP COLUMN "reticulocytes",
DROP COLUMN "sodium",
DROP COLUMN "transferrin",
DROP COLUMN "triglycerides",
DROP COLUMN "tsat",
DROP COLUMN "tsh",
DROP COLUMN "ua",
DROP COLUMN "urea",
DROP COLUMN "uricAcid",
DROP COLUMN "urineCreat",
DROP COLUMN "vitaminD",
DROP COLUMN "wbc",
ADD COLUMN     "examType" TEXT NOT NULL,
ADD COLUMN     "unit" TEXT,
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "comorbidities" TEXT[];

-- DropTable
DROP TABLE "Consultation";

-- CreateTable
CREATE TABLE "Evolution" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "consultationDate" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "chiefComplaint" TEXT,
    "bloodPressure" TEXT,
    "weight" DOUBLE PRECISION,
    "clinicalNote" TEXT,
    "conductText" TEXT,
    "generatedExames" TEXT,
    "generatedEvolucao" TEXT,
    "generatedConduta" TEXT,

    CONSTRAINT "Evolution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Evolution_patientId_consultationDate_idx" ON "Evolution"("patientId", "consultationDate");

-- CreateIndex
CREATE INDEX "LabResult_patientId_examType_examDate_idx" ON "LabResult"("patientId", "examType", "examDate");

-- AddForeignKey
ALTER TABLE "Evolution" ADD CONSTRAINT "Evolution_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
