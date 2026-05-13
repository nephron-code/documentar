import { auth } from '@/auth'
import { NextResponse } from 'next/server'

/**
 * Middleware de autenticação — protege todas as rotas sob /patients.
 * Rotas públicas: /login, /api/auth/**, arquivos estáticos.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Redireciona usuário autenticado que acessa a raiz direto para /patients
  if (pathname === '/' && isLoggedIn) {
    return NextResponse.redirect(new URL('/patients', req.url))
  }

  // Redireciona usuário já autenticado que tenta acessar /login → /patients
  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/patients', req.url))
  }

  // Bloqueia acesso não-autenticado a /patients
  if (!isLoggedIn && pathname.startsWith('/patients')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  // Exclui arquivos estáticos e imagens do Next.js do middleware
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
