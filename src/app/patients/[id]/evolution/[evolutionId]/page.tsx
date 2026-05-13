import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { generateEHRText } from '@/lib/generateEHRText'
import CopyButton from '@/components/CopyButton'

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
    include: { patient: true },
  })

  if (!evolution || evolution.patientId !== id) notFound()

  // Busca todos os exames do paciente para o histórico longitudinal
  const labResults = await prisma.labResult.findMany({
    where: { patientId: id },
    orderBy: { examDate: 'desc' },
  })

  const ehrText = generateEHRText(evolution.patient, evolution, labResults)

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href={`/patients/${id}`} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{evolution.patient.name}</h1>
            <p className="text-sm text-gray-500">Consulta de {formatDate(evolution.consultationDate)}</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">

        {/* Sinais vitais */}
        {(evolution.bloodPressure || evolution.weight) && (
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Sinais Vitais</h2>
            <div className="flex gap-6 text-sm">
              {evolution.bloodPressure && (
                <div><span className="text-gray-500">PA:</span> <span className="font-medium">{evolution.bloodPressure} mmHg</span></div>
              )}
              {evolution.weight && (
                <div><span className="text-gray-500">Peso:</span> <span className="font-medium">{evolution.weight} kg</span></div>
              )}
            </div>
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

        {/* Texto gerado para cópia */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Texto para Prontuário
            </h2>
            <CopyButton text={ehrText} />
          </div>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-4 leading-relaxed">
            {ehrText}
          </pre>
        </section>

      </div>
    </main>
  )
}