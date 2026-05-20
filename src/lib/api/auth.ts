/**
 * Autenticação para a API v1 — NefroDoc
 *
 * Suporta dois mecanismos, em ordem de preferência:
 *
 * 1. Bearer token Supabase (Authorization: Bearer <jwt>)
 *    Usado pela extensão Chrome ou pelo próprio app quando o usuário está logado.
 *    O JWT é validado via supabase.auth.getUser() — chamada real ao Supabase Auth,
 *    não apenas leitura de cookie, garantindo que o token não foi revogado.
 *
 * 2. API Key estática (X-API-Key: <chave>)
 *    Usado por integrações server-to-server futuras.
 *    Chave configurada na variável de ambiente NEFRODOC_API_KEY.
 *    Se a variável não estiver definida, este mecanismo fica desativado.
 *
 * Uso nas route handlers:
 *   const auth = await verifyApiRequest(request)
 *   if (!auth.ok) return auth.response   // retorna 401 automaticamente
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export type ApiAuthResult =
  | { ok: true;  userId: string; mechanism: 'bearer' | 'api-key' }
  | { ok: false; response: NextResponse }

/**
 * Verifica a autenticação de uma requisição à API v1.
 * Retorna { ok: true, userId, mechanism } ou { ok: false, response: 401 }.
 */
export async function verifyApiRequest(request: NextRequest): Promise<ApiAuthResult> {
  const authHeader = request.headers.get('Authorization') ?? ''
  const apiKeyHeader = request.headers.get('X-API-Key') ?? ''

  // ── 1. Bearer token Supabase ──────────────────────────────────────────────
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return unauthorized('Supabase não configurado no servidor.')
    }

    // createClient com o JWT do caller — getUser() valida o token no Supabase Auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    })

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return unauthorized('Token inválido ou expirado.')
    }

    return { ok: true, userId: user.id, mechanism: 'bearer' }
  }

  // ── 2. API Key estática ───────────────────────────────────────────────────
  if (apiKeyHeader) {
    const validKey = process.env.NEFRODOC_API_KEY
    if (!validKey) {
      return unauthorized('API Key não configurada no servidor.')
    }
    if (apiKeyHeader !== validKey) {
      return unauthorized('API Key inválida.')
    }
    return { ok: true, userId: 'api-key', mechanism: 'api-key' }
  }

  // ── Sem credenciais ───────────────────────────────────────────────────────
  return unauthorized('Autenticação obrigatória. Use Authorization: Bearer <token> ou X-API-Key.')
}

// ── Helpers ───────────────────────────────────────────────────────────────

function unauthorized(message: string): { ok: false; response: NextResponse } {
  return {
    ok: false,
    response: NextResponse.json(
      { error: 'Unauthorized', message },
      {
        status: 401,
        headers: { 'WWW-Authenticate': 'Bearer realm="NefroDoc API v1"' },
      }
    ),
  }
}

/**
 * Retorna resposta 400 Bad Request padronizada para erros de validação.
 */
export function badRequest(message: string, details?: Record<string, string>): NextResponse {
  return NextResponse.json(
    { error: 'Bad Request', message, ...(details ? { details } : {}) },
    { status: 400 }
  )
}

/**
 * Retorna resposta 200 OK com payload JSON padronizado.
 */
export function ok<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 200 })
}
