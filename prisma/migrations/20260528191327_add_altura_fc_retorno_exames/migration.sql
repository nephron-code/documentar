/*
  Warnings:

  - You are about to drop the column `generatedConduta` on the `Evolution` table. All the data in the column will be lost.
  - You are about to drop the column `generatedEvolucao` on the `Evolution` table. All the data in the column will be lost.
  - You are about to drop the column `generatedExames` on the `Evolution` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Evolution" DROP COLUMN "generatedConduta",
DROP COLUMN "generatedEvolucao",
DROP COLUMN "generatedExames",
ADD COLUMN     "heartRate" INTEGER,
ADD COLUMN     "nextConsultationDate" TIMESTAMP(3),
ADD COLUMN     "orderedExams" TEXT;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "height" DOUBLE PRECISION;
