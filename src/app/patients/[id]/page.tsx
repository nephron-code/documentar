import { getPatientWithHistory } from '@/lib/actions/patients'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LabTable from '@/components/LabTable'

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

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const patient = await getPatientWithHistory(id)
  if (!patient) notFound()

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/patients" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{patient.name}</h1>
              <p className="text-sm text-gray-500">NefroDoc</p>
            </div>
          </div>
          <Link
            href={`/patients/${id}/evolution/new`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Nova consulta
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Card do paciente */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">
                  {calcAge(patient.birthDate)} anos &middot; {patient.sex === 'MALE' ? 'Masculino' : 'Feminino'}
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-600">
                  {DIAGNOSIS_LABEL[patient.diagnosis] ?? patient.diagnosis}
                </span>
                {patient.etiology && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-500 italic">{patient.etiology}</span>
                  </>
                )}
              </div>
              {patient.comorbidities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {patient.comorbidities.map(c => (
                    <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {c}
                    </span>
                  ))}
                </div>
              )}
              {patient.medications && patient.medications.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Medicamentos em uso</p>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.medications.map(m => (
                      <span key={m} className="text-xs bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {patient.ckdStage && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CKD_STAGE_COLOR[patient.ckdStage] ?? 'bg-gray-100 text-gray-700'}`}>
                  {patient.ckdStage}
                </span>
              )}
              {patient.albuminuria && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  {patient.albuminuria}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Evoluções */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Consultas ({patient.evolutions.length})
          </h2>
          {patient.evolutions.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
              <p className="text-sm">Nenhuma consulta registrada.</p>
              <Link
                href={`/patients/${id}/evolution/new`}
                className="text-blue-600 hover:underline text-sm mt-1 inline-block"
              >
                Registrar primeira consulta
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {patient.evolutions.map(ev => (
                <li key={ev.id}>
                  <Link
                    href={`/patients/${id}/evolution/${ev.id}`}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-5 py-4 hover:border-blue-400 hover:shadow-sm transition-all"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(ev.consultationDate)}
                      </p>
                      {ev.chiefComplaint && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{ev.chiefComplaint}</p>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Exames — tabela pivô: linhas = tipo de exame, colunas = datas */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Exames laboratoriais
          </h2>
          <LabTable labResults={patient.labResults} />
        </section>

      </div>
    </main>
  )
}