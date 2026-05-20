'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { saveEvolution } from '@/lib/actions/patients'
import KdigoAlert from '@/components/KdigoAlert'
import ExamOrderPanel from '@/components/ExamOrderPanel'
import { calcTFGe, calcIdade } from '@/lib/clinical/ckd-epi-2021'
import { useMacroExpander } from '@/hooks/useMacroExpander'
import { getConductTemplate, templateHASResistente } from '@/lib/clinical/conductTemplates'
import MacroPanel from '@/components/MacroPanel'
import type { MacroRecord } from '@/lib/actions/macros'
import MedicationAutocomplete from '@/components/MedicationAutocomplete'
import MedicationList from '@/components/MedicationList'
import type { ActiveMedication, NewMedicationInput } from '@/components/MedicationList'
import DiagnosisEditor from '@/components/DiagnosisEditor'
import HASResistenteChecklist from '@/components/HASResistenteChecklist'
import { updatePatientDiagnosis } from '@/lib/actions/patients'

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
}

type LabResultRef = {
  examType: string
  value: number
  unit: string | null
  examDate: Date | string
}

type Props = {
  patient: Patient
  /** Medicamentos ativos vindos do banco — base para o Smart Prescription Flow */
  activeMedications: ActiveMedication[]
  /** Último valor de TFG registrado (pode ser null se não há exames anteriores) */
  lastTfg: number | null
  /** Último valor de ACR registrado (ou estimado pelo cadastro) */
  lastAcr: number | null
  /** Origem do ACR: 'lab' = valor laboratorial; 'cadastro' = categoria A do perfil do paciente */
  acrSource: 'lab' | 'cadastro' | null
  /** Resultado de imagem da última consulta — pré-preenchido */
  lastImagingResults: string | null
  /** Conduta da última consulta — pré-preenchida para facilitar retornos */
  lastConductText: string | null
  /** Exames da coleta mais recente — exibidos como referência acima dos campos */
  lastLabResults: LabResultRef[]
  /** Macros carregados do banco para o MacroPanel */
  macros: MacroRecord[]
}

export default function NewEvolutionForm({
  patient,
  activeMedications,
  lastTfg,
  lastAcr,
  acrSource,
  lastImagingResults,
  lastConductText,
  lastLabResults,
  macros,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Rastreia se o formulário foi modificado (para aviso de saída)
  const [isDirty, setIsDirty] = useState(false)
  // Controla o modal de confirmação de saída
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  // Aviso nativo ao fechar/recarregar a aba com dados não salvos
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  function markDirty() { setIsDirty(true) }

  function handleBack() {
    if (isDirty) {
      setShowLeaveModal(true)
    } else {
      router.back()
    }
  }
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

  // Campo de texto com foco ativo — usado para sincronizar o MacroPanel
  const [activeField, setActiveField] = useState<'complaint' | 'clinicalNote' | 'conductText' | null>(null)

  // TFGe calculada em tempo real a partir da creatinina
  const [tfgeCalculada, setTfgeCalculada] = useState<number | null>(null)

  // Alterações de diagnóstico/estadiamento a aplicar junto com a consulta
  const [diagnosisUpdate, setDiagnosisUpdate] = useState<{
    diagnosis?: string
    etiology?: string | null
    ckdStage?: string | null
    albuminuria?: string | null
  } | null>(null)

  // Smart Prescription Flow — medicamentos ativos do banco + novos + suspensos nesta consulta
  const [suspendedIds, setSuspendedIds] = useState<string[]>([])
  const [newMedications, setNewMedications] = useState<NewMedicationInput[]>([])
  const [showPrescription, setShowPrescription] = useState(false)

  // Lista unificada para o modal de receituário
  const prescriptionList = [
    ...activeMedications
      .filter(m => !suspendedIds.includes(m.id))
      .map(m => ({ name: m.name, dose: m.dose ?? undefined, frequency: m.frequency ?? undefined })),
    ...newMedications,
  ]

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
    markDirty()
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
      // Salva evolução + novos medicamentos + suspensões em uma única transação
      const evolution = await saveEvolution({
        evolutionData: {
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
        },
        newMedications,
        suspendedMedicationIds: suspendedIds,
      })

      // Aplica atualização de diagnóstico/estadiamento se o médico confirmou alguma mudança
      if (diagnosisUpdate && Object.keys(diagnosisUpdate).length > 0) {
        await updatePatientDiagnosis({ patientId: patient.id, ...diagnosisUpdate })
      }

      // Desativa o aviso de saída antes de navegar
      setIsDirty(false)
      toast.success('Consulta salva com sucesso!')
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
          <button onClick={handleBack} className="text-gray-400 hover:text-gray-600">
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

          {/* Smart Prescription Flow */}
          <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Medicamentos</h2>
              <p className="text-xs text-gray-400 mt-0.5">Suspenda o que foi descontinuado e adicione novas prescrições.</p>
            </div>
            <MedicationList
              activeMedications={activeMedications}
              suspendedIds={suspendedIds}
              onSuspend={id => setSuspendedIds(prev => [...prev, id])}
              onUnsuspend={id => setSuspendedIds(prev => prev.filter(x => x !== id))}
              newMedications={newMedications}
              onAddNew={med => setNewMedications(prev => [...prev, med])}
              onRemoveNew={idx => setNewMedications(prev => prev.filter((_, i) => i !== idx))}
              onViewPrescription={() => setShowPrescription(true)}
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
                <span className="ml-2 text-xs font-normal text-gray-400">clique no painel → ou .ret .sem .inc + espaço</span>
              </label>
              <div className="flex gap-3 items-start">
                <textarea
                  name="chiefComplaint"
                  rows={4}
                  placeholder="Queixas do paciente, história da doença atual..."
                  value={chiefComplaint}
                  onChange={e => { setChiefComplaint(e.target.value); markDirty() }}
                  onFocus={() => setActiveField('complaint')}
                  onKeyDown={macroComplaint.onKeyDown}
                  className={inputClass + " resize-none flex-1"} />
                <div className="w-52 shrink-0" style={{ minHeight: '120px' }}>
                  <MacroPanel
                    macros={macros}
                    activeField={activeField}
                    onInsert={text => setChiefComplaint(prev => prev + text)}
                  />
                </div>
              </div>
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
            {/* Caixinha de referência — exames da última coleta */}
            {lastLabResults.length > 0 && (() => {
              // Monta um mapa rápido: examType → valor formatado
              const refMap = Object.fromEntries(
                lastLabResults.map(r => [r.examType, r.value])
              )
              const refDate = new Date(lastLabResults[0].examDate)
                .toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
              // Filtra grupos e exames que têm valor na última coleta
              const groupsWithData = LAB_GROUPS
                .map(g => ({ ...g, exams: g.exams.filter(e => refMap[e.key] !== undefined) }))
                .filter(g => g.exams.length > 0)

              return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <p className="text-xs font-semibold text-blue-700 mb-2">
                    Última coleta: {refDate}
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    {groupsWithData.map(group => (
                      <div key={group.group} className="min-w-0">
                        <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide mb-0.5">{group.group}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                          {group.exams.map(exam => (
                            <span key={exam.key} className="text-xs text-blue-900">
                              <span className="font-medium">{exam.label}</span>{' '}
                              <span>{refMap[exam.key]}</span>{' '}
                              <span className="text-blue-500">{exam.unit}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

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
              onChange={e => { setImagingResults(e.target.value); markDirty() }}
              className={inputClass + " resize-none"} />
          </section>

          {/* Checklist HAS Resistente — aparece para diagnósticos de HAS */}
          {(patient.diagnosis === 'HAS_NEFROSCLEROSE' ||
            diagnosisUpdate?.diagnosis === 'HAS_NEFROSCLEROSE') && (
            <HASResistenteChecklist
              onInsertSummary={text => {
                setClinicalNote(prev => prev ? prev + '\n\n' + text : text)
                markDirty()
              }}
            />
          )}

          <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Evolução Clínica</h2>

            {/* Motor KDIGO — exibido quando há TFG disponível (ACR laboratorial ou por categoria do cadastro) */}
            {lastTfg !== null && lastAcr !== null && (
              <>
                <KdigoAlert
                  tfg={lastTfg}
                  acr={lastAcr}
                  acrSource={acrSource ?? 'lab'}
                />
                {acrSource === 'cadastro' && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    ⚠ Classificação A baseada na categoria registrada no cadastro ({patient.albuminuria}) — sem ACR laboratorial disponível. Solicite microalbuminúria para classificação precisa.
                  </p>
                )}
              </>
            )}
            {/* Aviso quando falta TFG para o motor KDIGO */}
            {lastTfg === null && (
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                Motor KDIGO disponível após registrar TFG nas consultas.
              </p>
            )}
            {/* Aviso quando há TFG mas nem ACR laboratorial nem categoria A no cadastro */}
            {lastTfg !== null && lastAcr === null && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                TFG disponível, mas sem ACR laboratorial nem categoria A no cadastro. Registre a microalbuminúria ou edite o cadastro do paciente para ativar o motor KDIGO.
              </p>
            )}

            {/* Layout de duas colunas: campos à esquerda, MacroPanel à direita */}
            <div className="flex gap-4 items-start">
              {/* Coluna dos campos */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Impressão clínica
                    <span className="ml-2 text-xs font-normal text-gray-400">clique no painel → ou .drc .estab + espaço</span>
                  </label>
                  <textarea
                    name="clinicalNote"
                    rows={4}
                    placeholder="Avaliação clínica, interpretação dos exames, estadiamento..."
                    value={clinicalNote}
                    onChange={e => { setClinicalNote(e.target.value); markDirty() }}
                    onFocus={() => setActiveField('clinicalNote')}
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
                      <span className="ml-2 text-xs font-normal text-gray-400">clique no painel → ou .ret3 .mant + espaço</span>
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const diagKey = diagnosisUpdate?.diagnosis ?? patient.diagnosis
                          const stageKey = diagnosisUpdate?.ckdStage ?? patient.ckdStage
                          const template = getConductTemplate(diagKey, stageKey)
                          if (template) setConductText(template)
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        ✦ Conduta KDIGO
                      </button>
                      {(patient.diagnosis === 'HAS_NEFROSCLEROSE' ||
                        diagnosisUpdate?.diagnosis === 'HAS_NEFROSCLEROSE') && (
                        <button
                          type="button"
                          onClick={() => setConductText(templateHASResistente)}
                          className="text-xs text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          ⚠ HAS Resistente
                        </button>
                      )}
                    </div>
                  </div>
                  <MedicationAutocomplete
                    name="conductText"
                    rows={6}
                    placeholder="Orientações, medicamentos, retorno... (autocomplete de meds ao digitar 3+ letras)"
                    value={conductText}
                    onChange={setConductText}
                    onFocus={() => setActiveField('conductText')}
                    onKeyDown={macroConduct.onKeyDown}
                    className={inputClass + " resize-none"}
                  />
                </div>
              </div>

              {/* MacroPanel — fixo à direita, acompanha os dois campos */}
              <div className="w-56 shrink-0 sticky top-4" style={{ alignSelf: 'flex-start', maxHeight: '420px' }}>
                <MacroPanel
                  macros={macros}
                  activeField={activeField}
                  onInsert={text => {
                    if (activeField === 'clinicalNote') setClinicalNote(prev => prev + text)
                    else if (activeField === 'conductText') setConductText(prev => prev + text)
                    else setClinicalNote(prev => prev + text)
                  }}
                />
              </div>
            </div>
          </section>

          {/* Pedido de exames — integrado ao motor KDIGO quando disponível */}
          <ExamOrderPanel
            diagnosisKey={patient.diagnosis}
            tfg={lastTfg}
            acr={lastAcr}
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

      {/* Modal de receituário */}
      {showPrescription && (() => {
        const prescriptionText = prescriptionList.length === 0
          ? ''
          : prescriptionList
              .map((m, i) => {
                const detail = [m.dose, m.frequency].filter(Boolean).join(' — ')
                return `${i + 1}. ${m.name}${detail ? `\n   ${detail}` : ''}`
              })
              .join('\n')

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowPrescription(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Receituário</h2>
                <button onClick={() => setShowPrescription(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
              </div>

              {prescriptionList.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Nenhum medicamento em uso.</p>
              ) : (
                <>
                  <p className="text-xs text-gray-400">Selecione e copie, ou use o botão abaixo.</p>
                  <textarea
                    readOnly
                    value={prescriptionText}
                    rows={Math.min(prescriptionList.length * 2 + 1, 14)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={e => (e.target as HTMLTextAreaElement).select()}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(prescriptionText).then(() => {
                        const btn = document.getElementById('copy-prescription-btn')
                        if (btn) { btn.textContent = '✓ Copiado!'; setTimeout(() => { btn.textContent = 'Copiar receituário' }, 2000) }
                      })
                    }}
                    id="copy-prescription-btn"
                    className="w-full text-sm font-medium text-blue-700 border border-blue-300 hover:bg-blue-50 rounded-lg py-2 transition-colors"
                  >
                    Copiar receituário
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })()}

      {/* Modal de confirmação de saída com dados não salvos */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLeaveModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Dados não salvos</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Você tem dados preenchidos que não foram salvos. Deseja sair mesmo assim?
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowLeaveModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Ficar
              </button>
              <button onClick={() => { setIsDirty(false); router.back() }}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors">
                Sair sem salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
