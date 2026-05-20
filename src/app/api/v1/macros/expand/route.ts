/**
 * POST /api/v1/macros/expand
 *
 * Expande todas as macros taquigráficas presentes em um texto.
 * Processa o texto completo de uma vez, substituindo todas as ocorrências.
 * Efêmero — nenhum dado é persistido.
 *
 * Request body:
 *   { text: string }
 *
 * Response 200:
 *   { expanded: string, macrosFound: string[] }
 *   macrosFound: lista das macros que foram substituídas (pode ser vazia)
 *
 * Errors: 400 (payload inválido), 401 (não autenticado)
 */

import { NextRequest } from 'next/server'
import { verifyApiRequest, badRequest, ok } from '@/lib/api/auth'
import { MACROS } from '@/lib/clinical/macros'

export async function POST(request: NextRequest) {
  const auth = await verifyApiRequest(request)
  if (!auth.ok) return auth.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Body JSON inválido.')
  }

  const { text } = body as Record<string, unknown>

  if (typeof text !== 'string') {
    return badRequest('Campo obrigatório inválido: text (string).')
  }

  if (text.length > 50_000) {
    return badRequest('Texto muito longo (máximo 50.000 caracteres).')
  }

  // Expandir todas as macros que aparecem no texto
  // Formato das macros: .chave seguido de espaço ou fim de string
  let expanded = text
  const macrosFound: string[] = []

  for (const macro of MACROS) {
    // Regex: .chave seguido de espaço (preserva o espaço após) ou fim da string
    const regex = new RegExp(`\\.${escapeRegex(macro.key)}(?= |$)`, 'g')
    if (regex.test(expanded)) {
      macrosFound.push(macro.key)
      // Reset lastIndex após test()
      const replaceRegex = new RegExp(`\\.${escapeRegex(macro.key)}(?= |$)`, 'g')
      expanded = expanded.replace(replaceRegex, macro.value)
    }
  }

  return ok({ expanded, macrosFound })
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
