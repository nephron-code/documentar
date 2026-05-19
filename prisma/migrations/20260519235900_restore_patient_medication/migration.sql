-- Remove medications String[] from Patient (replaced by PatientMedication relation)
ALTER TABLE "Patient" DROP COLUMN IF EXISTS "medications";

-- CreateTable PatientMedication
CREATE TABLE "PatientMedication" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dose" TEXT,
    "frequency" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "prescribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suspendedAt" TIMESTAMP(3),
    "prescribedInId" TEXT,
    "suspendedInId" TEXT,

    CONSTRAINT "PatientMedication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatientMedication_patientId_status_idx" ON "PatientMedication"("patientId", "status");

-- AddForeignKey
ALTER TABLE "PatientMedication" ADD CONSTRAINT "PatientMedication_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientMedication" ADD CONSTRAINT "PatientMedication_prescribedInId_fkey" FOREIGN KEY ("prescribedInId") REFERENCES "Evolution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientMedication" ADD CONSTRAINT "PatientMedication_suspendedInId_fkey" FOREIGN KEY ("suspendedInId") REFERENCES "Evolution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
