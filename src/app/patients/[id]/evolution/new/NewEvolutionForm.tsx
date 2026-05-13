'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createEvolution } from '@/lib/actions/patients'
import KdigoAlert from '@/components/KdigoAlert'
import ExamOrderPanel from '@/components/ExamOrderPanel'
import { calcTFGe, calcIdade } from '@/lib/ckd-epi-2021'
import { useMacroExpander } from '@/hooks/useMacroExpander'
import { getConductTemplate } from '@/lib/conductTemplates'
import MedicationAutocomplete from '@/components/MedicationAutocomplete'
import MedicationList from '@/components/MedicationList'
import DiagnosisEditor from '@/components/DiagnosisEditor'
import { updatePatientDiagnosis, updatePatientMedications } from '@/lib/actions/patients'

const DIAGNOSIS_LABEL: Record<string, string> = {
  DRC: 'Doença Renal Crônica',
  HAS_NEFROSCLEROSE: 'HAS / Nefrosclerose',
  NEFROPATIA_DIABETICA: 'Nefropatia Diabética',
  GLOMERULOPATIA: 'Glomerulopatia',
  NEFROLITIASE: 'Nefrolitíase',
  CONSULTA_GERAL: 'Consulta Geral de Nefrologia',
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

// Grupos de exames para exibição compacta no formulário
const LAB_GROUPS = [
  {
    group: 'Função Renal',
    exams: [
      { key: 'creatinina', label: 'Creat.', unit: 'mg/dL' },
      { key: 'ureia', label: 'Ureia', unit: 'mg/dL' },
      { key: 'tfg', label: 'TFG', unit: 'mL/min' },
      { key: 'acido_urico', label: 'Ác. úrico', unit: 'mg/dL' },
    ],
  },
  {
    group: 'Eletrólitos',
    exams: [
      { key: 'sodio', label: 'Na⁺', unit: 'mEq/L' },
      { key: 'potassio', label: 'K⁺', unit: 'mEq/L' },
      { key: 'calcio', label: 'Ca²⁺', unit: 'mg/dL' },
      { key: 'fosforo', label: 'P', unit: 'mg/dL' },
    ],
  },
  {
    group: 'Proteinúria',
    exams: [
      { key: 'microalbuminuria', label: 'ACR', unit: 'mg/g' },
    ],
  },
  {
    group: 'Hemograma / Anemia',
    exams: [
      { key: 'hemoglobina', label: 'Hb', unit: 'g/dL' },
      { key: 'hematocrito', label: 'Ht', unit: '%' },
      { key: 'reticulocitos', label: 'Reticulóc.', unit: '%' },
    ],
  },
  {
    group: 'Ferro',
    exams: [
      { key: 'ferro', label: 'Ferro', unit: 'µg/dL' },
      { key: 'ferritina', label: 'Ferritina', unit: 'ng/mL' },
      { key: 'tsat', label: 'TSAT', unit: '%' },
    ],
  },
  {
    group: 'Metabolismo Ósseo',
    exams: [
      { key: 'pth', label: 'PTH', unit: 'pg/mL' },
      { key: 'vitamina_d', label: '25-OH Vit D', unit: 'ng/mL' },
    ],
  },
  {
    group: 'Metabólico',
    exams: [
      { key: 'glicose', label: 'Glicose', unit: 'mg/dL' },
      { key: 'hba1c', label: 'HbA1c', unit: '%' },
      { key: 'colesterol', label: 'Col. total', unit: 'mg/dL' },
      { key: 'ldl', label: 'LDL', unit: 'mg/dL' },
      { key: 'hdl', label: 'HDL', unit: 'mg/dL' },
      { key: 'triglicerides', label: 'TG', unit: 'mg/dL' },
    ],
  },
  {
    group: 'Tireoide',
    exams: [
      { key: 'tsh', label: 'TSH', unit: 'µUI/mL' },
      { key: 'ft4', label: 'T4L', unit: 'ng/dL' },
    ],
  },
]

// Lista plana para uso no submit
const LAB_EXAMS = LAB_GROUPS.flatMap(g => g.exams)

const inputClass = "w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"

type Patient = {
  id: string
  name: string
  birthDate: Date | string
  sex: 'MALE' | 'FEMALE'
  diagnosis: string
  etiology?: string | null
  ckdStage?: string | null
  albuminuria?: string | null
  medications?: string[]
}

type Props = {
  patient: Patient
  /** Último valor de TFG registrado (pode ser null se não há exames anteriores) */
  lastTfg: number | null
  /** Último valor de ACR registrado */
  lastAcr: number | null
  /** Resultado de imagem da última consulta — pré-preenchido */
  lastImagingResults: string | null
  /** Conduta da última consulta — pré-preenchida para facilitar retornos */
  lastConductText: string | null
}

export default function NewEvolutionForm({
  patient,
  lastTfg,
  lastAcr,
  lastImagingResults,
  lastConductText,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const today = new Date().toISOString().split('T')[0]
  const [labDate, setLabDate] = useState(today)
  const [labValues, setLabValues] = useState<Record<string, string>>(
    Object.fromEntries(LAB_EXAMS.map(e => [e.key, '']))
  )
  // Campos de texto clínico — todos controlados para suportar macros e pré-preenchimento
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [clinicalNote, setClinicalNote] = useState('')
  // Conduta: pré-preenchida da última consulta + suporta append do painel KDIGO
  const [conductText, setConductText] = useState(lastConductText ?? '')
  // Exames de imagem — pré-preenchido com resultado anterior
  const [imagingResults, setImagingResults] = useState(lastImagingResults ?? '')

  // Macros taquigráficas para os campos de texto clínico
  const macroComplaint  = useMacroExpander(chiefComplaint, setChiefComplaint)
  const macroClinical   = useMacroExpander(clinicalNote, setClinicalNote)
  const macroConduct    = useMacroExpander(conductText, setConductText)

  // TFGe calculada em tempo real a partir da creatinina
  const [tfgeCalculada, setTfgeCalculada] = useState<number | null>(null)

  // Alterações de diagnóstico/estadiamento a aplicar junto com a consulta
  const [diagnosisUpdate, setDiagnosisUpdate] = useState<{
    diagnosis?: string
    etiology?: string | null
    ckdStage?: string | null
    albuminuria?: string | null
  } | null>(null)

  // Medicamentos em uso — editável a cada consulta
  const [medications, setMedications] = useState<string[]>(patient.medications ?? [])

  // Recalcula TFGe sempre que a creatinina mudar
  useEffect(() => {
    const cr = parseFloat(labValues['creatinina'])
    if (!cr || cr <= 0) {
      setTfgeCalculada(null)
      return
    }
    const idade = calcIdade(patient.birthDate)
    const tfge = calcTFGe(cr, idade, patient.sex)
    setTfgeCalculada(tfge)
    // Auto-preenche o campo TFG se ainda estiver vazio ou se o usuário não editou manualmente
    if (tfge !== null) {
      setLabValues(prev => {
        // Só auto-preenche se o campo TFG estiver vazio ou corresponde ao cálculo anterior
        return { ...prev, tfg: String(tfge) }
      })
    }
  }, [labValues['creatinina'], patient.birthDate, patient.sex])

  function updateLab(key: string, val: string) {
    setLabValues(prev => ({ ...prev, [key]: val }))
  }

  // Quando o usuário edita TFG manualmente, não recalcular por cima
  function handleTfgChange(val: string) {
    setLabValues(prev => ({ ...prev, tfg: val }))
    // Se o campo for limpo, recomputar a partir da creatinina
    if (!val) {
      const cr = parseFloat(labValues['creatinina'])
      if (cr > 0) {
        const idade = calcIdade(patient.birthDate)
        const tfge = calcTFGe(cr, idade, patient.sex)
        if (tfge !== null) setLabValues(prev => ({ ...prev, tfg: String(tfge) }))
      }
    }
  }

  const hasAnyLab = Object.values(labValues).some(v => v !== '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const labResults = LAB_EXAMS
      .filter(exam => labValues[exam.key] !== '')
      .map(exam => ({
        examType: exam.key,
        value: parseFloat(labValues[exam.key]),
        unit: exam.unit,
        examDate: labDate,
      }))
    try {
      const evolution = await createEvolution({
        patientId: patient.id,
        consultationDate: form.get('consultationDate') as string,
        chiefComplaint: chiefComplaint || undefined,
        bloodPressure: form.get('bloodPressure') as string,
        weight: form.get('weight') as string,
        edema: form.get('edema') as string || undefined,
        clinicalNote: clinicalNote || undefined,
        conductText: conductText || undefined,
        imagingResults: imagingResults || undefined,
        labResults,
      })

      // Aplica atualização de diagnóstico/estadiamento se o médico confirmou alguma mudança
      if (diagnosisUpdate && Object.keys(diagnosisUpdate).length > 0) {
        await updatePatientDiagnosis({ patientId: patient.id, ...diagnosisUpdate })
      }

      // Salva a lista de medicamentos atualizada
      await updatePatientMedications(patient.id, medications)

      router.push(`/patients/${patient.id}/evolution/${evolution.id}`)
    } catch {
      setError('Erro ao salvar consulta. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">{patient.name}</h1>
            <p className="text-sm text-gray-500">Nova Consulta — NefroDoc</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{DIAGNOSIS_LABEL[patient.diagnosis] ?? patient.diagnosis}</span>
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
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Diagnóstico / Estadiamento — atualização inline sem sair da consulta */}
          <DiagnosisEditor
            currentDiagnosis={patient.diagnosis}
            currentEtiology={patient.etiology}
            currentCkdStage={patient.ckdStage}
            currentAlbuminuria={patient.albuminuria}
            onChange={update => setDiagnosisUpdate(update)}
          />

          {/* Medicamentos em uso — editável a cada consulta */}
          <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Medicamentos em uso</h2>
              <p className="text-xs text-gray-400 mt-0.5">Lista atualizada a cada consulta — será salva no perfil do paciente.</p>
            </div>
            <MedicationList
              value={medications}
              onChange={setMedications}
            />
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Dados da Consulta</h2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input name="consultationDate" type="date" required defaultValue={today} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PA (mmHg)</label>
                <input name="bloodPressure" placeholder="ex: 140/90" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                <input name="weight" type="number" step="0.1" placeholder="ex: 78.5" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edema</label>
                <select name="edema" className={inputClass}>
                  <option value="">—</option>
                  <option value="Ausente">Ausente</option>
                  <option value="+/4+">+/4+</option>
                  <option value="++/4+">++/4+</option>
                  <option value="+++/4+">+++/4+</option>
                  <option value="++++/4+">++++/4+</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Queixa principal / Anamnese
                <span className="ml-2 text-xs font-normal text-gray-400">macros: .ret .sem .inc…</span>
              </label>
              <textarea
                name="chiefComplaint"
                rows={3}
                placeholder="Queixas do paciente, história da doença atual... (tente .ret + espaço)"
                value={chiefComplaint}
                onChange={e => setChiefComplaint(e.target.value)}
                onKeyDown={macroComplaint.onKeyDown}
                className={inputClass + " resize-none"} />
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Exames Laboratoriais</h2>
                <p className="text-xs text-gray-400 mt-0.5">Preencha apenas os disponíveis. A data pode ser retroativa.</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">Data da coleta:</label>
                <input type="date" value={labDate} onChange={e => setLabDate(e.target.value)}
                  className="border border-gray-400 rounded-lg px-2 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="space-y-4">
              {LAB_GROUPS.map(group => (
                <div key={group.group}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{group.group}</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {group.exams.map(exam => (
                      <div key={exam.key} className="flex items-center gap-2">
                        <label className="w-24 shrink-0 text-sm text-gray-700">{exam.label}</label>
                        {exam.key === 'tfg' ? (
                          /* Campo TFG: auto-preenchido pela calculadora CKD-EPI 2021 */
                          <div className="relative w-24">
                            <input
                              type="number"
                              step="any"
                              placeholder="—"
                              value={labValues['tfg']}
                              onChange={e => handleTfgChange(e.target.value)}
                              className={`w-full border rounded-lg px-2 py-1 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                tfgeCalculada !== null
                                  ? 'border-blue-400 bg-blue-50'
                                  : 'border-gray-400'
                              }`}
                            />
                            {tfgeCalculada !== null && !labValues['tfg'] && (
                              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-400 text-xs">⟳</span>
                            )}
                          </div>
                        ) : (
                          <input
                            type="number"
                            step="any"
                            placeholder="—"
                            value={labValues[exam.key]}
                            onChange={e => updateLab(exam.key, e.target.value)}
                            className="w-24 border border-gray-400 rounded-lg px-2 py-1 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                        <span className="text-xs text-gray-400 w-16 shrink-0">{exam.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Aviso da calculadora CKD-EPI 2021 */}
            {tfgeCalculada !== null && (
              <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                TFGe calculada pela equação CKD-EPI 2021: <strong>{tfgeCalculada} mL/min/1,73m²</strong>
                {' '}— preenchida automaticamente no campo TFG. Você pode ajustar manualmente.
              </p>
            )}

            {hasAnyLab && (
              <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                Exames serão registrados com data: {new Date(labDate + 'T12:00:00').toLocaleDateString('pt-BR')}
              </p>
            )}
          </section>

          {/* Exames de imagem — logo após laboratoriais */}
          <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Exames de Imagem</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {lastImagingResults
                  ? 'Pré-preenchido com o resultado da consulta anterior — edite ou adicione novos.'
                  : 'Resultado de exames de imagem — será mantido na próxima consulta.'}
              </p>
            </div>
            <textarea
              rows={4}
              placeholder="Ex: Ultrassonografia renal — rins de tamanho normal, sem dilatação pielocalicial..."
              value={imagingResults}
              onChange={e => setImagingResults(e.target.value)}
              className={inputClass + " resize-none"} />
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Evolução Clínica</h2>

            {/* Motor KDIGO — exibido quando há TFG e ACR disponíveis */}
            {lastTfg !== null && lastAcr !== null && (
              <KdigoAlert
                tfg={lastTfg}
                acr={lastAcr}
                onAppendExams={(text) => setConductText(prev => prev + text)}
              />
            )}
            {/* Aviso quando faltam dados para o motor KDIGO */}
            {(lastTfg === null || lastAcr === null) && (
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                Motor KDIGO disponível após registrar TFG e ACR nas consultas.
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impressão clínica
                <span className="ml-2 text-xs font-normal text-gray-400">macros: .drc .estab .prot…</span>
              </label>
              <textarea
                name="clinicalNote"
                rows={4}
                placeholder="Avaliação clínica, interpretação dos exames, estadiamento..."
                value={clinicalNote}
                onChange={e => setClinicalNote(e.target.value)}
                onKeyDown={macroClinical.onKeyDown}
                className={inputClass + " resize-none"} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">
                  Conduta
                  {lastConductText && (
                    <span className="ml-2 text-xs font-normal text-blue-500">pré-preenchida da última consulta</span>
                  )}
                  <span className="ml-2 text-xs font-normal text-gray-400">macros: .ret3 .mant .diet…</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const template = getConductTemplate(patient.diagnosis, patient.ckdStage)
                    if (template) setConductText(template)
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  ✦ Conduta KDIGO
                </button>
              </div>
              <MedicationAutocomplete
                name="conductText"
                rows={5}
                placeholder="Orientações, medicamentos, retorno... (autocomplete de meds ao digitar 3+ letras)"
                value={conductText}
                onChange={setConductText}
                onKeyDown={macroConduct.onKeyDown}
                className={inputClass + " resize-none"}
              />
            </div>
          </section>

          {/* Pedido de exames — seção independente da conduta */}
          <ExamOrderPanel
            diagnosisKey={patient.diagnosis}
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition-colors">
            {loading ? 'Salvando...' : 'Salvar consulta'}
          </button>
        </form>
      </div>
    </main>
  )
}
