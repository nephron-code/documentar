-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "CkdStage" AS ENUM ('G1', 'G2', 'G3a', 'G3b', 'G4', 'G5', 'G5D');

-- CreateEnum
CREATE TYPE "AlbuminuriaCategory" AS ENUM ('A1', 'A2', 'A3');

-- CreateEnum
CREATE TYPE "Diagnosis" AS ENUM ('DRC', 'HAS_NEFROSCLEROSE', 'NEFROPATIA_DIABETICA', 'GLOMERULOPATIA', 'NEFROLITIASE', 'CONSULTA_GERAL');

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "sex" "Sex" NOT NULL,
    "diagnosis" "Diagnosis" NOT NULL,
    "ckdStage" "CkdStage",
    "albuminuria" "AlbuminuriaCategory",

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "generatedExames" TEXT,
    "generatedEvolucao" TEXT,
    "generatedConduta" TEXT,
    "bloodPressureSystolic" INTEGER,
    "bloodPressureDiastolic" INTEGER,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "examDate" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "consultationId" TEXT,
    "creatinine" DOUBLE PRECISION,
    "urea" DOUBLE PRECISION,
    "egfr" DOUBLE PRECISION,
    "uricAcid" DOUBLE PRECISION,
    "sodium" DOUBLE PRECISION,
    "potassium" DOUBLE PRECISION,
    "calcium" DOUBLE PRECISION,
    "phosphorus" DOUBLE PRECISION,
    "microalbumin" DOUBLE PRECISION,
    "urineCreat" DOUBLE PRECISION,
    "ua" TEXT,
    "hemoglobin" DOUBLE PRECISION,
    "hematocrit" DOUBLE PRECISION,
    "mcv" DOUBLE PRECISION,
    "wbc" DOUBLE PRECISION,
    "platelets" DOUBLE PRECISION,
    "reticulocytes" DOUBLE PRECISION,
    "iron" DOUBLE PRECISION,
    "ferritin" DOUBLE PRECISION,
    "transferrin" DOUBLE PRECISION,
    "tsat" DOUBLE PRECISION,
    "pth" DOUBLE PRECISION,
    "vitaminD" DOUBLE PRECISION,
    "glucose" DOUBLE PRECISION,
    "hba1c" DOUBLE PRECISION,
    "cholesterol" DOUBLE PRECISION,
    "ldl" DOUBLE PRECISION,
    "hdl" DOUBLE PRECISION,
    "triglycerides" DOUBLE PRECISION,
    "tsh" DOUBLE PRECISION,
    "ft4" DOUBLE PRECISION,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Patient_name_idx" ON "Patient"("name");

-- CreateIndex
CREATE INDEX "Consultation_patientId_date_idx" ON "Consultation"("patientId", "date");

-- CreateIndex
CREATE INDEX "LabResult_patientId_examDate_idx" ON "LabResult"("patientId", "examDate");

-- CreateIndex
CREATE INDEX "LabResult_consultationId_idx" ON "LabResult"("consultationId");

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
