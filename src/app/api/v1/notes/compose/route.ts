/**
 * POST /api/v1/notes/compose
 *
 * Gera uma nota de consulta pronta para colar no prontuário externo.
 * Usa o motor determinístico composeConsultationNote — zero LLM.
 * Efêmero — nenhum dado é persistido.
 *
 * Request body:
 * {
 *   patient: {
 *     name: string,
 *     birthDate: string,          // ISO 8601 (ex: "1965-04-20")
 *     sex: "MALE" | "FEMALE",
 *     diagnosis: string,
 *     ckdStage?: string | null,
 *     albuminuria?: string | null,
 *     comorbidities?: string[],
 *     medications?: { name: string, dose?: string, frequency?: string }[],
 *     etiology?: string | null
 *   },
 *   evolution: {
 *     consultationDate: string,   // ISO 8601
 *     bloodPressure?: string,
 *     weight?: number,
 *     chiefComplaint?: string,
 *     clinicalNote?: string,
 *     conductText?: string
 *   },
 *   labResults?: {
 *     examType: string,
 *     value: number,
 *     unit?: string,
 *     examDate: string            // ISO 8601
 *   }[]
 * }
 *
 * Response 200:
 *   { note: string, compact: string }
 *   note:    nota completa para colar no prontuário
 *   compact: linha resumida com exames recentes (para cabeçalho de nota)
 *
 * Errors: 400 (payload inválido), 401 (não autenticado)
 */

import { NextRequest } from 'next/server'
import { verifyApiRequest, badRequest, ok } from '@/lib/api/auth'
import {
  composeConsultationNote,
  composeCompactSummary,
  type PatientData,
  type EvolutionData,
  type LabResultData,
} from '@/lib/clinical/composeConsultationNote'

export async function POST(request: NextRequest) {
  const auth = await verifyApiRequest(request)
  if (!auth.ok) return auth.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Body JSON inválido.')
  }

  const { patient, evolution, labResults } = body as Record<string, unknown>

  // ── Validação do patient ──────────────────────────────────────────────────
  if (!patient || typeof patient !== 'object') {
    return badRequest('Campo obrigatório ausente: patient.')
  }
  const p = patient as Record<string, unknown>

  if (typeof p.name !== 'string' || !p.name.trim()) {
    return badRequest('patient.name é obrigatório (string).')
  }
  if (typeof p.birthDate !== 'string' || isNaN(Date.parse(p.birthDate))) {
    return badRequest('patient.birthDate deve ser uma data ISO válida (ex: "1965-04-20").')
  }
  if (p.sex !== 'MALE' && p.sex !== 'FEMALE') {
    return badRequest('patient.sex deve ser "MALE" ou "FEMALE".')
  }
  if (typeof p.diagnosis !== 'string' || !p.diagnosis.trim()) {
    return badRequest('patient.diagnosis é obrigatório (string).')
  }

  // ── Validação do evolution ────────────────────────────────────────────────
  if (!evolution || typeof evolution !== 'object') {
    return badRequest('Campo obrigatório ausente: evolution.')
  }
  const e = evolution as Record<string, unknown>

  if (typeof e.consultationDate !== 'string' || isNaN(Date.parse(e.consultationDate))) {
    return badRequest('evolution.consultationDate deve ser uma data ISO válida.')
  }

  // ── Montar tipos internos ─────────────────────────────────────────────────
  const patientData: PatientData = {
    name: p.name as string,
    birthDate: new Date(p.birthDate as string),
    sex: p.sex as 'MALE' | 'FEMALE',
    diagnosis: p.diagnosis as string,
    ckdStage: (p.ckdStage as string | null) ?? null,
    albuminuria: (p.albuminuria as string | null) ?? null,
    comorbidities: Array.isArray(p.comorbidities) ? (p.comorbidities as string[]) : [],
    medications: Array.isArray(p.medications)
      ? (p.medications as { name: string; dose?: string; frequency?: string }[])
      : [],
    etiology: (p.etiology as string | null) ?? null,
  }

  const evolutionData: EvolutionData = {
    consultationDate: new Date(e.consultationDate as string),
    bloodPressure: (e.bloodPressure as string | null) ?? null,
    weight: typeof e.weight === 'number' ? e.weight : null,
    chiefComplaint: (e.chiefComplaint as string | null) ?? null,
    clinicalNote: (e.clinicalNote as string | null) ?? null,
    conductText: (e.conductText as string | null) ?? null,
  }

  const labData: LabResultData[] = Array.isArray(labResults)
    ? (labResults as Record<string, unknown>[])
        .filter(r => typeof r.examType === 'string' && typeof r.value === 'number')
        .map(r => ({
          examType: r.examType as string,
          value: r.value as number,
          unit: (r.unit as string | null) ?? null,
          examDate: new Date(
            typeof r.examDate === 'string' ? r.examDate : (e.consultationDate as string)
          ),
        }))
    : []

  const note = composeConsultationNote(patientData, evolutionData, labData)
  const compact = composeCompactSummary(patientData, evolutionData, labData)

  return ok({ note, compact })
}
