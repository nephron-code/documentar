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
    include: {
      evolutions: {
        orderBy: { consultationDate: 'desc' },
      },
      labResults: {
        orderBy: { examDate: 'desc' },
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
      diagnosis: string; ckdStage: string | null; albuminuria: string | null
    }[]>`
      SELECT id, name, "birthDate", sex, diagnosis, "ckdStage", albuminuria
      FROM "Patient"
      WHERE unaccent(name) ILIKE unaccent(${term})
      ORDER BY name ASC
    `
    return rows
  }

  return prisma.patient.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true, name: true, birthDate: true, sex: true,
      diagnosis: true, ckdStage: true, albuminuria: true,
    },
  })
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
  medications: string[]
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
      medications: data.medications,
    },
  })
}

/**
 * Atualiza a lista de medicamentos em uso do paciente.
 * Chamada ao salvar consulta quando o médico edita a lista de medicamentos.
 */
export async function updatePatientMedications(patientId: string, medications: string[]) {
  await prisma.patient.update({
    where: { id: patientId },
    data: { medications },
  })
  revalidatePath(`/patients/${patientId}`)
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
  medications: string[]
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
      medications: data.medications,
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