import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { composeConsultationNote } from '@/lib/clinical/composeConsultationNote'
import { composePatientSheet } from '@/lib/clinical/composePatientSheet'
import CopyButton from '@/components/CopyButton'
import PrintButton from '@/components/PrintButton'

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('pt-BR')
}

export default async function EvolutionPage({
  params,
}: {
  params: Promise<{ id: string; evolutionId: string }>
}) {
  const { id, evolutionId } = await params

  const evolution = await prisma.evolution.findUnique({
    where: { id: evolutionId },
    select: {
      id: true,
      patientId: true,
      consultationDate: true,
      chiefComplaint: true,
      bloodPressure: true,
      weight: true,
      edema: true,
      heartRate: true,
      nextConsultationDate: true,
      orderedExams: true,
      clinicalNote: true,
      conductText: true,
      imagingResults: true,
      suspendedMedications: {
        select: { name: true, dose: true },
      },
      patient: {
        select: {
          id: true,
          name: true,
          birthDate: true,
          sex: true,
          diagnosis: true,
          etiology: true,
          ckdStage: true,
          albuminuria: true,
          comorbidities: true,
          height: true,
          medications: {
            where: { status: 'ACTIVE' },
            select: { name: true, dose: true, frequency: true },
          },
        },
      },
    },
  })

  if (!evolution || evolution.patientId !== id) notFound()

  // Busca todos os exames do paciente para o histórico longitudinal
  const labResults = await prisma.labResult.findMany({
    where: { patientId: id },
    orderBy: { examDate: 'desc' },
  })

  const ehrText = composeConsultationNote(evolution.patient, evolution, labResults)

  const patientSheetText = composePatientSheet({
    patient: {
      name: evolution.patient.name,
      diagnosis: evolution.patient.diagnosis,
      height: evolution.patient.height,
      medications: evolution.patient.medications,
    },
    evolution,
    suspendedThisVisit: evolution.suspendedMedications,
  })

  // IMC para exibir na seção de sinais vitais
  const bmi =
    evolution.weight && evolution.patient.height && evolution.patient.height > 0
      ? +(evolution.weight / (evolution.patient.height / 100) ** 2).toFixed(1)
      : null
  const bmiLabel =
    bmi === null ? null :
    bmi < 18.5 ? 'Baixo peso' :
    bmi < 25 ? 'Normal' :
    bmi < 30 ? 'Sobrepeso' :
    bmi < 35 ? 'Obesidade I' :
    bmi < 40 ? 'Obesidade II' : 'Obesidade III'

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2 sm:gap-3">
          <Link href={`/patients/${id}`} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{evolution.patient.name}</h1>
            <p className="text-xs sm:text-sm text-gray-500">Consulta de {formatDate(evolution.consultationDate)}</p>
          </div>
          <Link
            href={`/patients/${id}/folheto`}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            Folheto do Paciente
          </Link>
          <PrintButton />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">

        {/* Sinais vitais */}
        {(evolution.bloodPressure || evolution.weight || evolution.heartRate || evolution.nextConsultationDate) && (
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Sinais Vitais</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {evolution.bloodPressure && (
                <div><span className="text-gray-500">PA:</span> <span className="font-medium">{evolution.bloodPressure} mmHg</span></div>
              )}
              {evolution.heartRate && (
                <div><span className="text-gray-500">FC:</span> <span className="font-medium">{evolution.heartRate} bpm</span></div>
              )}
              {evolution.weight && (
                <div><span className="text-gray-500">Peso:</span> <span className="font-medium">{evolution.weight} kg</span></div>
              )}
              {bmi !== null && (
                <div>
                  <span className="text-gray-500">IMC:</span>{' '}
                  <span className="font-medium">{bmi}</span>{' '}
                  <span className="text-xs text-gray-400">({bmiLabel})</span>
                </div>
              )}
            </div>
            {evolution.nextConsultationDate && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                <span className="text-gray-500">Retorno:</span>{' '}
                <span className="font-medium text-blue-700">{formatDate(evolution.nextConsultationDate)}</span>
              </div>
            )}
          </section>
        )}

        {evolution.chiefComplaint && (
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Queixa / Anamnese</h2>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{evolution.chiefComplaint}</p>
          </section>
        )}

        {evolution.clinicalNote && (
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Impressão Clínica</h2>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{evolution.clinicalNote}</p>
          </section>
        )}

        {evolution.conductText && (
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Conduta</h2>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{evolution.conductText}</p>
          </section>
        )}

        {/* Nota para o prontuário externo */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Nota de Consulta — pronta para colar
            </h2>
            <CopyButton text={ehrText} />
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Ferramenta de apoio. Revise antes de copiar. Não substitui o prontuário nem a decisão médica.
          </p>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-4 leading-relaxed">
            {ehrText}
          </pre>
        </section>

        {/* Folha de saída do paciente */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                Folha de Saída do Paciente
              </h2>
              <p className="text-xs text-blue-500 mt-0.5">
                Linguagem simples — imprima ou copie para entregar ao paciente.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/patients/${id}/folheto`}
                className="text-xs text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-500 bg-white px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Ver Folheto Educativo
              </Link>
              <CopyButton text={patientSheetText} />
            </div>
          </div>
          <pre className="text-xs text-blue-900 whitespace-pre-wrap font-mono bg-white rounded-lg p-4 leading-relaxed border border-blue-100">
            {patientSheetText}
          </pre>
        </section>

      </div>
    </main>
  )
}
