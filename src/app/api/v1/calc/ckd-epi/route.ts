/**
 * POST /api/v1/calc/ckd-epi
 *
 * Calcula a TFGe pela equação CKD-EPI 2021 (sem fator raça).
 * Retorna o valor numérico e o estágio G correspondente.
 * Efêmero — nenhum dado é persistido.
 *
 * Request body:
 *   { creatinina: number, idade: number, sexo: "MALE" | "FEMALE" }
 *
 * Response 200:
 *   { tfge: number, gStage: "G1"|"G2"|"G3a"|"G3b"|"G4"|"G5", unit: "mL/min/1.73m²" }
 *
 * Errors: 400 (payload inválido), 401 (não autenticado)
 */

import { NextRequest } from 'next/server'
import { verifyApiRequest, badRequest, ok } from '@/lib/api/auth'
import { calcTFGe } from '@/lib/clinical/ckd-epi-2021'
import { classifyGStage } from '@/lib/clinical/kdigo'

export async function POST(request: NextRequest) {
  const auth = await verifyApiRequest(request)
  if (!auth.ok) return auth.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Body JSON inválido.')
  }

  const { creatinina, idade, sexo } = body as Record<string, unknown>

  // Validação de tipos e intervalos clínicos razoáveis
  if (typeof creatinina !== 'number' || creatinina <= 0 || creatinina > 50) {
    return badRequest('Campo obrigatório inválido: creatinina (number, 0–50 mg/dL).')
  }
  if (typeof idade !== 'number' || idade <= 0 || idade > 120) {
    return badRequest('Campo obrigatório inválido: idade (number, 1–120 anos).')
  }
  if (sexo !== 'MALE' && sexo !== 'FEMALE') {
    return badRequest('Campo obrigatório inválido: sexo ("MALE" | "FEMALE").')
  }

  const tfge = calcTFGe(creatinina, idade, sexo)

  if (tfge === null) {
    return badRequest('Não foi possível calcular a TFGe com os valores fornecidos.')
  }

  return ok({
    tfge,
    gStage: classifyGStage(tfge),
    unit: 'mL/min/1.73m²',
    formula: 'CKD-EPI 2021 (sem fator raça) — Inker et al. NEJM 2021;385:1737-1749',
  })
}
