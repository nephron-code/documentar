import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware de autenticação — Supabase Auth.
 * Protege todas as rotas sob /patients.
 * Rotas públicas: /, /login, arquivos estáticos.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Cria cliente Supabase que atualiza cookies de sessão automaticamente
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

  // IMPORTANTE: não chamar getUser() em vez de getSession() para evitar spoofing
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Usuário autenticado na raiz → /patients
  if (pathname === '/' && user) {
    return NextResponse.redirect(new URL('/patients', request.url))
  }

  // Usuário autenticado tentando acessar /login → /patients
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/patients', request.url))
  }

  // Usuário não autenticado tentando acessar /patients → /login
  if (pathname.startsWith('/patients') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)'],
}
