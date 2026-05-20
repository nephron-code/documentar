/**
 * POST /api/v1/exam-packages/recommend
 *
 * Recomenda pacotes de exames com base no diagnóstico e estágio CKD.
 * Efêmero — nenhum dado é persistido.
 *
 * Request body:
 *   { diagnosisKey: string, ckdStage?: string | null }
 *
 *   diagnosisKey: "DRC" | "HAS_NEFROSCLEROSE" | "NEFROPATIA_DIABETICA" |
 *                 "GLOMERULOPATIA" | "NEFROLITIASE" | "CONSULTA_GERAL"
 *   ckdStage:     "G1" | "G2" | "G3a" | "G3b" | "G4" | "G5" | null
 *
 * Response 200:
 *   { recommended: ExamPackage[] }
 *
 * Errors: 400 (payload inválido), 401 (não autenticado)
 */

import { NextRequest } from 'next/server'
import { verifyApiRequest, badRequest, ok } from '@/lib/api/auth'
import { getRecommendedPackages } from '@/lib/clinical/examPanels'

const VALID_DIAGNOSES = [
  'DRC', 'HAS_NEFROSCLEROSE', 'NEFROPATIA_DIABETICA',
  'GLOMERULOPATIA', 'NEFROLITIASE', 'CONSULTA_GERAL', 'HAS_RESISTENTE',
]
const VALID_STAGES = ['G1', 'G2', 'G3a', 'G3b', 'G4', 'G5', null, undefined]

export async function POST(request: NextRequest) {
  const auth = await verifyApiRequest(request)
  if (!auth.ok) return auth.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Body JSON inválido.')
  }

  const { diagnosisKey, ckdStage } = body as Record<string, unknown>

  if (typeof diagnosisKey !== 'string' || !VALID_DIAGNOSES.includes(diagnosisKey)) {
    return badRequest(
      `Campo obrigatório inválido: diagnosisKey. Valores aceitos: ${VALID_DIAGNOSES.join(', ')}.`
    )
  }

  if (ckdStage !== undefined && ckdStage !== null && !VALID_STAGES.includes(ckdStage as string)) {
    return badRequest(`Campo inválido: ckdStage. Valores aceitos: G1, G2, G3a, G3b, G4, G5 ou null.`)
  }

  const recommended = getRecommendedPackages(diagnosisKey, ckdStage as string | null)

  return ok({ recommended })
}
