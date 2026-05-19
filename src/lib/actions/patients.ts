'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

/**
 * Busca um paciente com todas as suas evoluções e resultados de exames,
 * ordenados por data decrescente.
 */
export async function getPatientWithHistory(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
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
      evolutions: {
        orderBy: { consultationDate: 'desc' },
      },
      labResults: {
        orderBy: { examDate: 'desc' },
      },
      medications: {
        where: { status: 'ACTIVE' },
        orderBy: { prescribedAt: 'asc' as const },
        select: { id: true, name: true, dose: true, frequency: true },
      },
    },
  })

  if (!patient) return null

  return patient
}

/**
 * Busca os resultados de um tipo específico de exame para montar
 * o gráfico de evolução longitudinal (ex: creatinina ao longo do tempo).
 */
export async function getLabTrend(patientId: string, examType: string) {
  return prisma.labResult.findMany({
    where: { patientId, examType },
    orderBy: { examDate: 'asc' },
    select: {
      examDate: true,
      value: true,
      unit: true,
    },
  })
}

/**
 * Lista todos os pacientes para a página principal.
 * A busca usa unaccent() do PostgreSQL para ignorar acentos (ex: "jose" encontra "José").
 * Requer a extensão unaccent habilitada no banco (CREATE EXTENSION IF NOT EXISTS unaccent).
 */
export async function listPatients(search?: string) {
  if (search && search.trim()) {
    // Query raw para busca sem acentos — unaccent normaliza tanto o nome quanto o termo
    const term = `%${search.trim()}%`
    const rows = await prisma.$queryRaw<{
      id: string; name: string; birthDate: Date; sex: string;
      diagnosis: string; ckdStage: string | null; albuminuria: string | null;
      lastConsultation: Date | null
    }[]>`
      SELECT p.id, p.name, p."birthDate", p.sex, p.diagnosis, p."ckdStage", p.albuminuria,
             MAX(e."consultationDate") AS "lastConsultation"
      FROM "Patient" p
      LEFT JOIN "Evolution" e ON e."patientId" = p.id
      WHERE unaccent(p.name) ILIKE unaccent(${term})
      GROUP BY p.id
      ORDER BY p.name ASC
    `
    return rows
  }

  const patients = await prisma.patient.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true, name: true, birthDate: true, sex: true,
      diagnosis: true, ckdStage: true, albuminuria: true,
      evolutions: {
        orderBy: { consultationDate: 'desc' },
        take: 1,
        select: { consultationDate: true },
      },
    },
  })

  // Normaliza para shape consistente com a query raw
  return patients.map((p: typeof patients[number]) => ({
    ...p,
    lastConsultation: p.evolutions[0]?.consultationDate ?? null,
  }))
}
export async function createPatient(data: {
  name: string
  birthDate: string
  sex: string
  diagnosis: string
  etiology?: string
  ckdStage?: string
  albuminuria?: string
  comorbidities: string[]
}) {
  // Verifica duplicata: mesmo nome (case-insensitive) + mesma data de nascimento
  const existing = await prisma.patient.findFirst({
    where: {
      birthDate: new Date(data.birthDate),
      name: { equals: data.name.trim(), mode: 'insensitive' },
    },
    select: { id: true },
  })
  if (existing) {
    throw new Error('DUPLICATE_PATIENT')
  }

  return prisma.patient.create({
    data: {
      name: data.name,
      birthDate: new Date(data.birthDate),
      sex: data.sex as 'MALE' | 'FEMALE',
      diagnosis: data.diagnosis as any,
      etiology: data.etiology || null,
      ckdStage: data.ckdStage as any ?? null,
      albuminuria: data.albuminuria as any ?? null,
      comorbidities: data.comorbidities,
    },
  })
}
/**
 * Busca o texto de exames de imagem da última consulta do paciente.
 * Usado para pré-preencher o campo na nova consulta.
 */
export async function getLastImagingResults(patientId: string): Promise<string | null> {
  const last = await prisma.evolution.findFirst({
    where: { patientId, imagingResults: { not: null } },
    orderBy: { consultationDate: 'desc' },
    select: { imagingResults: true },
  })
  return last?.imagingResults ?? null
}

/**
 * Atualiza diagnóstico principal, estadiamento CKD e categoria de albuminúria do paciente.
 * Chamada ao salvar uma nova consulta quando houve mudança de estadiamento.
 */
export async function updatePatientDiagnosis(data: {
  patientId: string
  diagnosis?: string
  etiology?: string | null
  ckdStage?: string | null
  albuminuria?: string | null
}) {
  await prisma.patient.update({
    where: { id: data.patientId },
    data: {
      ...(data.diagnosis ? { diagnosis: data.diagnosis as any } : {}),
      // undefined = não alterar; null = limpar o campo
      etiology: data.etiology !== undefined ? (data.etiology || null) : undefined,
      ckdStage: data.ckdStage !== undefined ? (data.ckdStage as any) : undefined,
      albuminuria: data.albuminuria !== undefined ? (data.albuminuria as any) : undefined,
    },
  })
  // Invalida o cache do perfil do paciente para refletir a mudança imediatamente
  revalidatePath(`/patients/${data.patientId}`)
}

export async function createEvolution(data: {
  patientId: string
  consultationDate: string
  chiefComplaint?: string
  bloodPressure?: string
  weight?: string
  edema?: string
  clinicalNote?: string
  conductText?: string
  imagingResults?: string
  labResults?: {
    examType: string
    value: number
    unit: string
    examDate: string
  }[]
}) {
  const evolution = await prisma.evolution.create({
    data: {
      patientId: data.patientId,
      consultationDate: new Date(data.consultationDate),
      chiefComplaint: data.chiefComplaint || null,
      bloodPressure: data.bloodPressure || null,
      weight: data.weight ? parseFloat(data.weight) : null,
      edema: data.edema || null,
      clinicalNote: data.clinicalNote || null,
      conductText: data.conductText || null,
      imagingResults: data.imagingResults || null,
    },
  })

  // Salva os exames vinculados ao paciente com suas datas próprias
  if (data.labResults && data.labResults.length > 0) {
    await prisma.labResult.createMany({
      data: data.labResults.map(lr => ({
        patientId: data.patientId,
        examType: lr.examType,
        value: lr.value,
        unit: lr.unit,
        examDate: new Date(lr.examDate),
      })),
    })
  }

  return evolution
}

type EvolutionInput = {
  patientId: string
  consultationDate: string
  chiefComplaint?: string
  bloodPressure?: string
  weight?: string
  edema?: string
  clinicalNote?: string
  conductText?: string
  imagingResults?: string
  labResults?: { examType: string; value: number; unit: string; examDate: string }[]
}

type NewMedicationInput = {
  name: string
  dose?: string
  frequency?: string
  notes?: string
}

/**
 * Salva evolução + novos medicamentos prescritos + medicamentos suspensos
 * em uma única transação atômica (Smart Prescription Flow).
 */
export async function saveEvolution(payload: {
  evolutionData: EvolutionInput
  newMedications?: NewMedicationInput[]
  suspendedMedicationIds?: string[]
}) {
  const { evolutionData, newMedications = [], suspendedMedicationIds = [] } = payload

  const result = await prisma.$transaction(async tx => {
    // 1. Cria a evolução
    const evolution = await tx.evolution.create({
      data: {
        patientId: evolutionData.patientId,
        consultationDate: new Date(evolutionData.consultationDate),
        chiefComplaint: evolutionData.chiefComplaint || null,
        bloodPressure: evolutionData.bloodPressure || null,
        weight: evolutionData.weight ? parseFloat(evolutionData.weight) : null,
        edema: evolutionData.edema || null,
        clinicalNote: evolutionData.clinicalNote || null,
        conductText: evolutionData.conductText || null,
        imagingResults: evolutionData.imagingResults || null,
      },
    })

    // 2. Salva exames laboratoriais
    if (evolutionData.labResults && evolutionData.labResults.length > 0) {
      await tx.labResult.createMany({
        data: evolutionData.labResults.map(lr => ({
          patientId: evolutionData.patientId,
          examType: lr.examType,
          value: lr.value,
          unit: lr.unit,
          examDate: new Date(lr.examDate),
        })),
      })
    }

    // 3. Cria novos medicamentos prescritos nesta consulta
    if (newMedications.length > 0) {
      await tx.patientMedication.createMany({
        data: newMedications.map(med => ({
          patientId: evolutionData.patientId,
          name: med.name,
          dose: med.dose || null,
          frequency: med.frequency || null,
          notes: med.notes || null,
          status: 'ACTIVE' as const,
          prescribedAt: new Date(evolutionData.consultationDate),
          prescribedInId: evolution.id,
        })),
      })
    }

    // 4. Descontinua medicamentos suspensos pelo médico nesta consulta
    if (suspendedMedicationIds.length > 0) {
      await tx.patientMedication.updateMany({
        where: {
          id: { in: suspendedMedicationIds },
          patientId: evolutionData.patientId,
          status: 'ACTIVE',
        },
        data: {
          status: 'DISCONTINUED',
          suspendedAt: new Date(evolutionData.consultationDate),
          suspendedInId: evolution.id,
        },
      })
    }

    return evolution
  })

  revalidatePath(`/patients/${evolutionData.patientId}`)
  return result
}

/**
 * Atualiza os dados demográficos de um paciente.
 * Valida duplicata excluindo o próprio paciente da verificação.
 */
export async function updatePatient(patientId: string, data: {
  name: string
  birthDate: string
  sex: string
  diagnosis: string
  etiology?: string
  ckdStage?: string
  albuminuria?: string
  comorbidities: string[]
}) {
  // Verifica duplicata excluindo o próprio paciente
  const existing = await prisma.patient.findFirst({
    where: {
      birthDate: new Date(data.birthDate),
      name: { equals: data.name.trim(), mode: 'insensitive' },
      NOT: { id: patientId },
    },
    select: { id: true },
  })
  if (existing) {
    throw new Error('DUPLICATE_PATIENT')
  }

  await prisma.patient.update({
    where: { id: patientId },
    data: {
      name: data.name.trim(),
      birthDate: new Date(data.birthDate),
      sex: data.sex as 'MALE' | 'FEMALE',
      diagnosis: data.diagnosis as any,
      etiology: data.etiology || null,
      ckdStage: (data.ckdStage as any) || null,
      albuminuria: (data.albuminuria as any) || null,
      comorbidities: data.comorbidities,
    },
  })
  revalidatePath(`/patients/${patientId}`)
}

/**
 * Remove um paciente e todas as suas consultas e exames (onDelete: Cascade no schema).
 */
export async function deletePatient(patientId: string) {
  await prisma.patient.delete({ where: { id: patientId } })
  revalidatePath('/patients')
}