import { listMacros } from '@/lib/actions/macros'
import MacrosEditor from './MacrosEditor'
import Link from 'next/link'

export const metadata = { title: 'Macros taquigráficos — NefroDoc' }

export default async function MacrosPage() {
  const macros = await listMacros()

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/patients" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Macros taquigráficos</h1>
            <p className="text-sm text-gray-500">Atalhos de texto para agilizar a evolução clínica</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <MacrosEditor initialMacros={macros} />
      </div>
    </main>
  )
}
