'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

/**
 * Campo de busca reativo para a lista de pacientes.
 * Atualiza a URL com ?q=... a cada keystroke (sem necessidade de Enter),
 * usando useTransition para não bloquear a UI durante a navegação server-side.
 */
export default function PatientSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const currentQ = searchParams.get('q') ?? ''

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      const params = new URLSearchParams(searchParams.toString())
      if (val) {
        params.set('q', val)
      } else {
        params.delete('q')
      }
      startTransition(() => {
        router.replace(`/patients?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  return (
    <input
      name="q"
      defaultValue={currentQ}
      onChange={handleChange}
      placeholder="Buscar paciente pelo nome..."
      className="w-full border border-gray-400 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      autoComplete="off"
    />
  )
}
