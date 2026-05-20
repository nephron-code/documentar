/**
 * POST /api/v1/kdigo/classify
 *
 * Classifica o risco KDIGO e retorna recomendações clínicas completas.
 * Efêmero — nenhum dado é persistido.
 *
 * Request body:
 *   { tfg: number, acr: number }
 *   tfg em mL/min/1.73m², acr em mg/g (ACR — relação albumina/creatinina)
 *
 * Response 200:
 *   {
 *     stagLabel: string,       // ex: "G3aA2"
 *     gStage: string,          // "G1"–"G5"
 *     aCategory: string,       // "A1"–"A3"
 *     risk: string,            // "verde"|"amarelo"|"laranja"|"vermelho"
 *     riskLabel: string,       // "Risco baixo" etc.
 *     followUpFrequency: string,
 *     followUpDetail: string,
 *     referralIndicated: boolean,
 *     conductPoints: string[],
 *     examPanel: string[],
 *     source: string
 *   }
 *
 * Errors: 400 (payload inválido), 401 (não autenticado)
 */

import { NextRequest } from 'next/server'
import { verifyApiRequest, badRequest, ok } from '@/lib/api/auth'
import { getKdigoRecommendations, RISK_LABEL } from '@/lib/clinical/kdigo'

export async function POST(request: NextRequest) {
  const auth = await verifyApiRequest(request)
  if (!auth.ok) return auth.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Body JSON inválido.')
  }

  const { tfg, acr } = body as Record<string, unknown>

  if (typeof tfg !== 'number' || tfg < 0 || tfg > 200) {
    return badRequest('Campo obrigatório inválido: tfg (number, 0–200 mL/min/1.73m²).')
  }
  if (typeof acr !== 'number' || acr < 0 || acr > 20000) {
    return badRequest('Campo obrigatório inválido: acr (number, 0–20000 mg/g).')
  }

  const rec = getKdigoRecommendations(tfg, acr)

  return ok({
    stagLabel: rec.stagLabel,
    gStage: rec.gStage,
    aCategory: rec.aCategory,
    risk: rec.risk,
    riskLabel: RISK_LABEL[rec.risk],
    followUpFrequency: rec.followUpFrequency,
    followUpDetail: rec.followUpDetail,
    referralIndicated: rec.referralIndicated,
    conductPoints: rec.conductPoints,
    examPanel: rec.examPanel,
    source: 'KDIGO 2024 CKD Guideline — kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf',
  })
}
