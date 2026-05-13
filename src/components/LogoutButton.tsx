import { signOut } from '@/auth'

/**
 * Botão de logout — Server Component com Server Action.
 * Não precisa de 'use client' nem de SessionProvider.
 */
export default function LogoutButton() {
  return (
    <form
      action={async () => {
        'use server'
        await signOut({ redirectTo: '/login' })
      }}
    >
      <button
        type="submit"
        className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        title="Sair"
      >
        Sair
      </button>
    </form>
  )
}
