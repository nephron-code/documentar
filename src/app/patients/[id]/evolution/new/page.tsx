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
  const lastAcrLab = await prisma.labResult.findFirst({
    where: { patientId: id, examType: 'microalbuminuria' },
    orderBy: { examDate: 'desc' },
    select: { value: true },
  })

  // Fallback: converte categoria A do cadastro do paciente em valor numérico representativo
  // para permitir classificação KDIGO mesmo sem ACR laboratorial disponível.
  // A1 → 15 mg/g (normal), A2 → 100 mg/g (moderada), A3 → 600 mg/g (alta)
  function albuminuriaCategoryToValue(category: string | null | undefined): number | null {
    if (!category) return null
    if (category === 'A1') return 15
    if (category === 'A2') return 100
    if (category === 'A3') return 600
    return null
  }

  const lastAcr = lastAcrLab?.value ?? null
  const acrFromCadastro = lastAcr === null
    ? albuminuriaCategoryToValue(patient.albuminuria)
    : null
  // Valor final para o motor KDIGO: laboratório tem prioridade; cadastro é fallback
  const acrForKdigo = lastAcr ?? acrFromCadastro
  // Fonte do ACR: 'lab' se veio do banco de exames, 'cadastro' se veio do perfil do paciente
  const acrSource: 'lab' | 'cadastro' | null = lastAcr !== null ? 'lab' : acrFromCadastro !== null ? 'cadastro' : null

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

  // Busca medicamentos ativos do paciente para o Smart Prescription Flow
  const activeMedications = await prisma.patientMedication.findMany({
    where: { patientId: id, status: 'ACTIVE' },
    orderBy: { prescribedAt: 'asc' },
    select: { id: true, name: true, dose: true, frequency: true },
  })

  // Macros do banco (fallback nos built-ins se banco vazio)
  const macros = await listMacros()

  return (
    <NewEvolutionForm
      patient={patient}
      activeMedications={activeMedications}
      lastTfg={lastTfg?.value ?? null}
      lastAcr={acrForKdigo}
      acrSource={acrSource}
      lastImagingResults={lastImagingResults}
      lastConductText={lastEvolution?.conductText ?? null}
      lastLabResults={lastLabResults}
      macros={macros}
    />
  )
}
