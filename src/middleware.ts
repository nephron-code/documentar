import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware de autenticação — Supabase Auth.
 * Protege todas as rotas sob /patients.
 * Rotas públicas: /, /login, arquivos estáticos.
 *
 * Usa getSession() (leitura de cookie, sem network call) para compatibilidade
 * com o Edge Runtime do Vercel. A validação segura do token ocorre nas
 * Server Actions via getUser().
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getSession() — lê o JWT do cookie sem fazer network request
  // Adequado para o middleware Edge; validação real ocorre nas Server Actions
  const { data: { session } } = await supabase.auth.getSession()
  const isLoggedIn = !!session

  const { pathname } = request.nextUrl

  // Usuário autenticado na raiz → /patients
  if (pathname === '/' && isLoggedIn) {
    return NextResponse.redirect(new URL('/patients', request.url))
  }

  // Usuário autenticado tentando acessar /login → /patients
  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/patients', request.url))
  }

  // Usuário não autenticado tentando acessar /patients → /login
  if (pathname.startsWith('/patients') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)'],
}
