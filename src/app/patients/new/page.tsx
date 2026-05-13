'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createPatient } from '@/lib/actions/patients'
import MedicationList from '@/components/MedicationList'

const DIAGNOSES = [
  { value: 'DRC', label: 'DRC' },
  { value: 'HAS_NEFROSCLEROSE', label: 'HAS / Nefrosclerose' },
  { value: 'NEFROPATIA_DIABETICA', label: 'Nefropatia Diabética' },
  { value: 'GLOMERULOPATIA', label: 'Glomerulopatia' },
  { value: 'NEFROLITIASE', label: 'Nefrolitíase' },
  { value: 'CONSULTA_GERAL', label: 'Consulta Geral' },
]

const CKD_STAGES = ['G1', 'G2', 'G3a', 'G3b', 'G4', 'G5', 'G5D']
const ALBUMINURIA = [
  { value: 'A1', label: 'A1 — < 30 mg/g' },
  { value: 'A2', label: 'A2 — 30–300 mg/g' },
  { value: 'A3', label: 'A3 — > 300 mg/g' },
]
const COMORBIDITIES_OPTIONS = [
  'HAS', 'DM2', 'Dislipidemia', 'Obesidade',
  'Hiperuricemia', 'Tabagismo', 'ICC', 'FA',
]

export default function NewPatientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedComorbidities, setSelectedComorbidities] = useState<string[]>([])
  const [customComorbidity, setCustomComorbidity] = useState('')
  const [selectedMedications, setSelectedMedications] = useState<string[]>([])
  const [diagnosis, setDiagnosis] = useState('')

  function toggleComorbidity(c: string) {
    setSelectedComorbidities(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
  }

  /** Retorna todas as comorbidades: selecionadas nos botões + texto livre (se preenchido) */
  function getAllComorbidities(): string[] {
    const extras = customComorbidity
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    return [...selectedComorbidities, ...extras]
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const data = {
      name: form.get('name') as string,
      birthDate: form.get('birthDate') as string,
      sex: form.get('sex') as string,
      diagnosis: form.get('diagnosis') as string,
      etiology: form.get('etiology') as string || undefined,
      ckdStage: form.get('ckdStage') as string || undefined,
      albuminuria: form.get('albuminuria') as string || undefined,
      comorbidities: getAllComorbidities(),
      medications: selectedMedications,
    }

    try {
      const patient = await createPatient(data)
      router.push(`/patients/${patient.id}`)
    } catch (err) {
      if (err instanceof Error && err.message === 'DUPLICATE_PATIENT') {
        setError('Já existe um paciente cadastrado com este nome e data de nascimento.')
      } else {
        setError('Erro ao cadastrar paciente. Tente novamente.')
      }
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Novo Paciente</h1>
            <p className="text-sm text-gray-500">NefroDoc</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Dados pessoais */}
          <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Dados Pessoais</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input
                name="name"
                required
                placeholder="Nome do paciente"
                className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento</label>
                <input
                  name="birthDate"
                  type="date"
                  required
                  className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                <select
                  name="sex"
                  required
                  className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione</option>
                  <option value="MALE">Masculino</option>
                  <option value="FEMALE">Feminino</option>
                </select>
              </div>
            </div>
          </section>

          {/* Diagnóstico */}
          <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Diagnóstico</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico principal</label>
              <select
                name="diagnosis"
                required
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione</option>
                {DIAGNOSES.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Etiologia — apenas para DRC, onde o diagnóstico não especifica a causa */}
            {diagnosis === 'DRC' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiologia
                  <span className="ml-1 text-xs font-normal text-gray-400">opcional</span>
                </label>
                <input
                  name="etiology"
                  placeholder="ex: HAS, DM, GESF, rim policístico, nefropatia IgA..."
                  className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Estadiamento — só aparece para DRC */}
            {(diagnosis === 'DRC' || diagnosis === 'NEFROPATIA_DIABETICA' || diagnosis === 'HAS_NEFROSCLEROSE') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estágio TFG (KDIGO)</label>
                  <select
                    name="ckdStage"
                    className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Não classificado</option>
                    {CKD_STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Albuminúria (KDIGO)</label>
                  <select
                    name="albuminuria"
                    className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Não classificada</option>
                    {ALBUMINURIA.map(a => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </section>

          {/* Comorbidades */}
          <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Comorbidades</h2>
            <div className="flex flex-wrap gap-2">
              {COMORBIDITIES_OPTIONS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleComorbidity(c)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selectedComorbidities.includes(c)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {/* Campo livre para comorbidades não listadas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outra comorbidade
                <span className="ml-1 text-xs font-normal text-gray-400">separe por vírgula se mais de uma</span>
              </label>
              <input
                type="text"
                value={customComorbidity}
                onChange={e => setCustomComorbidity(e.target.value)}
                placeholder="Ex: Neoplasia, Hepatopatia, Artrite reumatoide..."
                className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </section>

          {/* Medicamentos em uso */}
          <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Medicamentos em uso</h2>
              <p className="text-xs text-gray-400 mt-0.5">Lista atual de medicamentos do paciente.</p>
            </div>
            <MedicationList
              value={selectedMedications}
              onChange={setSelectedMedications}
            />
          </section>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar paciente'}
          </button>
        </form>
      </div>
    </main>
  )
}