import { listPatients } from '@/lib/actions/patients'
import Link from 'next/link'

export const metadata = { title: 'Pacientes — NefroDoc' }

const DIAGNOSIS_LABEL: Record<string, string> = {
  DRC: 'DRC',
  HAS_NEFROSCLEROSE: 'HAS / Nefrosclerose',
  NEFROPATIA_DIABETICA: 'Nefropatia Diabética',
  GLOMERULOPATIA: 'Glomerulopatia',
  NEFROLITIASE: 'Nefrolitíase',
  CONSULTA_GERAL: 'Consulta Geral',
}

const CKD_STAGE_COLOR: Record<string, string> = {
  G1: 'bg-green-100 text-green-800',
  G2: 'bg-yellow-100 text-yellow-800',
  G3a: 'bg-orange-100 text-orange-800',
  G3b: 'bg-orange-200 text-orange-900',
  G4: 'bg-red-100 text-red-800',
  G5: 'bg-red-200 text-red-900',
  G5D: 'bg-purple-100 text-purple-800',
}

function calcAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const patients = await listPatients(q)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">NefroDoc</h1>
            <p className="text-sm text-gray-500">Prontuário de Nefrologia</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/configuracoes/macros"
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Macros
            </Link>
            <Link
              href="/patients/new"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Novo paciente
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Busca */}
        <form method="GET" className="mb-6">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar paciente pelo nome..."
            className="w-full border border-gray-400 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        {/* Lista */}
        {patients.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">Nenhum paciente encontrado</p>
            <p className="text-sm mt-1">Cadastre o primeiro paciente para começar.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {patients.map((p: typeof patients[number]) => (
              <li key={p.id}>
                <Link
                  href={`/patients/${p.id}`}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-5 py-4 hover:border-blue-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-semibold text-sm">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-sm text-gray-500">
                        {calcAge(p.birthDate)} anos &middot;{' '}
                        {p.sex === 'MALE' ? 'M' : 'F'} &middot;{' '}
                        {DIAGNOSIS_LABEL[p.diagnosis] ?? p.diagnosis}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.ckdStage && (
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${CKD_STAGE_COLOR[p.ckdStage] ?? 'bg-gray-100 text-gray-700'}`}
                      >
                        {p.ckdStage}
                      </span>
                    )}
                    {p.albuminuria && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                        {p.albuminuria}
                      </span>
                    )}
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {patients.length > 0 && (
          <p className="text-xs text-gray-400 mt-4 text-right">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </main>
  )
}