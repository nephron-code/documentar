import LoginForm from './LoginForm'

export const metadata = { title: 'Entrar — NefroDoc' }

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / título */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">NefroDoc</h1>
          <p className="text-sm text-gray-500 mt-1">Prontuário de Nefrologia</p>
        </div>

        <LoginForm />

        <p className="text-center text-xs text-gray-400 mt-6">
          Acesso restrito a profissionais autorizados.
        </p>
      </div>
    </main>
  )
}
