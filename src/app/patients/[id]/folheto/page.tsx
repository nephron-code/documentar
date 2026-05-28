import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { composePatientLeaflet } from '@/lib/clinical/patientLeaflet'
import CopyButton from '@/components/CopyButton'
import PrintButton from '@/components/PrintButton'

export default async function FolhetoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const patient = await prisma.patient.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      diagnosis: true,
      ckdStage: true,
      albuminuria: true,
      comorbidities: true,
      height: true,
    },
  })

  if (!patient) notFound()

  const latestTfgResult = await prisma.labResult.findFirst({
    where: { patientId: id, examType: 'tfg' },
    orderBy: { examDate: 'desc' },
    select: { value: true },
  })

  const leafletText = composePatientLeaflet({
    name: patient.name,
    diagnosis: patient.diagnosis,
    ckdStage: patient.ckdStage,
    albuminuria: patient.albuminuria,
    comorbidities: patient.comorbidities,
    height: patient.height,
    latestTfg: latestTfgResult?.value ?? null,
  })

  return (
    <main className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header — oculto na impressão */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 print:hidden">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href={`/patients/${id}`} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{patient.name}</h1>
            <p className="text-xs sm:text-sm text-gray-500">Folheto Educativo — NefroDoc</p>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={leafletText} />
            <PrintButton />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 print:px-0 print:py-0">
        <section className="bg-white border border-gray-200 rounded-lg p-6 print:border-0 print:shadow-none print:rounded-none">
          <p className="text-xs text-gray-400 mb-4 print:hidden">
            Folheto gerado automaticamente com base no diagnóstico e estágio do paciente.
            Revise antes de entregar. Não substitui a orientação médica individualizada.
          </p>
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed print:text-base">
            {leafletText}
          </pre>
        </section>
      </div>
    </main>
  )
}
