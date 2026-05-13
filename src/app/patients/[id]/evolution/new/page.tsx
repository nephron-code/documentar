import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import NewEvolutionForm from './NewEvolutionForm'
import { getLastImagingResults } from '@/lib/actions/patients'

export default async function NewEvolutionPage({
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
      birthDate: true,
      sex: true,
      diagnosis: true,
      etiology: true,
      ckdStage: true,
      albuminuria: true,
      medications: true,
    },
  })

  if (!patient) notFound()

  // Busca o exame de TFG mais recente (para o motor KDIGO)
  const lastTfg = await prisma.labResult.findFirst({
    where: { patientId: id, examType: 'tfg' },
    orderBy: { examDate: 'desc' },
    select: { value: true },
  })

  // Busca o exame de ACR mais recente (microalbuminúria)
  const lastAcr = await prisma.labResult.findFirst({
    where: { patientId: id, examType: 'microalbuminuria' },
    orderBy: { examDate: 'desc' },
    select: { value: true },
  })

  // Busca resultado de imagem da última consulta para pré-preencher
  const lastImagingResults = await getLastImagingResults(id)

  // Pré-preenchimento de retorno: conduta da última consulta
  const lastEvolution = await prisma.evolution.findFirst({
    where: { patientId: id },
    orderBy: { consultationDate: 'desc' },
    select: { conductText: true },
  })

  return (
    <NewEvolutionForm
      patient={patient}
      lastTfg={lastTfg?.value ?? null}
      lastAcr={lastAcr?.value ?? null}
      lastImagingResults={lastImagingResults}
      lastConductText={lastEvolution?.conductText ?? null}
    />
  )
}
