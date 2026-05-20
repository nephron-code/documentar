/**
 * GET /api/v1/exam-packages
 *
 * Lista todos os pacotes de exames disponíveis.
 *
 * Response 200:
 *   { packages: ExamPackage[] }
 *
 * Errors: 401 (não autenticado)
 */

import { NextRequest } from 'next/server'
import { verifyApiRequest, ok } from '@/lib/api/auth'
import { EXAM_PACKAGES } from '@/lib/clinical/examPanels'

export async function GET(request: NextRequest) {
  const auth = await verifyApiRequest(request)
  if (!auth.ok) return auth.response

  return ok({ packages: EXAM_PACKAGES })
}
