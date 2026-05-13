import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import NewEvolutionForm from './NewEvolutionForm'
import { getLastImagingResults } from '@/lib/actions/patients'
import { listMacros } from '@/lib/actions/macros'

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

  // Busca os exames laboratoriais da coleta mais recente para exibir na caixinha de referência
  const lastLabEntry = await prisma.labResult.findFirst({
    where: { patientId: id },
    orderBy: { examDate: 'desc' },
    select: { examDate: true },
  })
  const lastLabResults = lastLabEntry
    ? await prisma.labResult.findMany({
        where: { patientId: id, examDate: lastLabEntry.examDate },
        select: { examType: true, value: true, unit: true, examDate: true },
      })
    : []

  // Macros do banco (fallback nos built-ins se banco vazio)
  const macros = await listMacros()

  return (
    <NewEvolutionForm
      patient={patient}
      lastTfg={lastTfg?.value ?? null}
      lastAcr={lastAcr?.value ?? null}
      lastImagingResults={lastImagingResults}
      lastConductText={lastEvolution?.conductText ?? null}
      lastLabResults={lastLabResults}
      macros={macros}
    />
  )
}
