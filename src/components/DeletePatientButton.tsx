'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deletePatient } from '@/lib/actions/patients'

export default function DeletePatientButton({
  patientId,
  patientName,
}: {
  patientId: string
  patientName: string
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleConfirm() {
    startTransition(async () => {
      await deletePatient(patientId)
      router.push('/patients')
    })
  }

  return (
    <>
      {/* Botão disparador */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 bg-white px-2 sm:px-3 py-1.5 rounded-lg transition-colors"
        title="Excluir paciente"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span className="hidden sm:inline">Excluir</span>
      </button>

      {/* Modal de confirmação */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          {/* Card */}
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Excluir paciente</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Tem certeza que deseja excluir{' '}
                  <span className="font-medium text-gray-900">{patientName}</span>?
                  Esta ação também removerá todas as consultas e exames associados e{' '}
                  <span className="font-medium text-red-600">não pode ser desfeita</span>.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:bg-red-400"
              >
                {isPending ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
