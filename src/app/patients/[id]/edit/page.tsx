'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { updatePatient } from '@/lib/actions/patients'
import MedicationList from '@/components/MedicationList'
import { use } from 'react'

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

const inputClass = 'w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'

type Patient = {
  id: string
  name: string
  birthDate: Date | string
  sex: string
  diagnosis: string
  etiology?: string | null
  ckdStage?: string | null
  albuminuria?: string | null
  comorbidities: string[]
  medications: string[]
}

// Fetches patient data client-side — simpler than async RSC for an edit form
async function fetchPatient(id: string): Promise<Patient | null> {
  const res = await fetch(`/api/patients/${id}`)
  if (!res.ok) return null
  return res.json()
}

export default function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sex, setSex] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [etiology, setEtiology] = useState('')
  const [ckdStage, setCkdStage] = useState('')
  const [albuminuria, setAlbuminuria] = useState('')
  const [selectedComorbidities, setSelectedComorbidities] = useState<string[]>([])
  const [customComorbidity, setCustomComorbidity] = useState('')
  const [medications, setMedications] = useState<string[]>([])

  useEffect(() => {
    fetchPatient(id).then(p => {
      if (!p) { router.push('/patients'); return }
      setName(p.name)
      setBirthDate(new Date(p.birthDate).toISOString().split('T')[0])
      setSex(p.sex)
      setDiagnosis(p.diagnosis)
      setEtiology(p.etiology ?? '')
      setCkdStage(p.ckdStage ?? '')
      setAlbuminuria(p.albuminuria ?? '')
      // Separa comorbidades: as que existem nos botões pré-definidos vs livres
      const known = p.comorbidities.filter(c => COMORBIDITIES_OPTIONS.includes(c))
      const custom = p.comorbidities.filter(c => !COMORBIDITIES_OPTIONS.includes(c))
      setSelectedComorbidities(known)
      setCustomComorbidity(custom.join(', '))
      setMedications(p.medications)
      setFetching(false)
    })
  }, [id, router])

  function toggleComorbidity(c: string) {
    setSelectedComorbidities(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
  }

  function getAllComorbidities(): string[] {
    const extras = customComorbidity.split(',').map(s => s.trim()).filter(Boolean)
    return [...selectedComorbidities, ...extras]
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await updatePatient(id, {
        name, birthDate, sex, diagnosis,
        etiology: etiology || undefined,
        ckdStage: ckdStage || undefined,
        albuminuria: albuminuria || undefined,
        comorbidities: getAllComorbidities(),
        medications,
      })
      router.push(`/patients/${id}`)
    } catch (err) {
      if (err instanceof Error && err.message === 'DUPLICATE_PATIENT') {
        setError('Já existe outro paciente com este nome e data de nascimento.')
      } else {
        setError('Erro ao salvar. Tente novamente.')
      }
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Carregando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Editar Paciente</h1>
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
              <input name="name" required value={name} onChange={e => setName(e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento</label>
                <input name="birthDate" type="date" required value={birthDate} onChange={e => setBirthDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                <select name="sex" required value={sex} onChange={e => setSex(e.target.value)} className={inputClass}>
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
              <select name="diagnosis" required value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className={inputClass}>
                <option value="">Selecione</option>
                {DIAGNOSES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            {diagnosis === 'DRC' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiologia <span className="text-xs font-normal text-gray-400">opcional</span>
                </label>
                <input value={etiology} onChange={e => setEtiology(e.target.value)}
                  placeholder="ex: HAS, DM, GESF, rim policístico..." className={inputClass} />
              </div>
            )}
            {(diagnosis === 'DRC' || diagnosis === 'NEFROPATIA_DIABETICA' || diagnosis === 'HAS_NEFROSCLEROSE') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estágio TFG (KDIGO)</label>
                  <select value={ckdStage} onChange={e => setCkdStage(e.target.value)} className={inputClass}>
                    <option value="">Não classificado</option>
                    {CKD_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Albuminúria (KDIGO)</label>
                  <select value={albuminuria} onChange={e => setAlbuminuria(e.target.value)} className={inputClass}>
                    <option value="">Não classificada</option>
                    {ALBUMINURIA.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
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
                <button key={c} type="button" onClick={() => toggleComorbidity(c)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selectedComorbidities.includes(c)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outra comorbidade <span className="text-xs font-normal text-gray-400">separe por vírgula</span>
              </label>
              <input value={customComorbidity} onChange={e => setCustomComorbidity(e.target.value)}
                placeholder="Ex: Neoplasia, Hepatopatia..." className={inputClass} />
            </div>
          </section>

          {/* Medicamentos */}
          <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Medicamentos em uso</h2>
            <MedicationList value={medications} onChange={setMedications} />
          </section>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition-colors">
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </main>
  )
}
