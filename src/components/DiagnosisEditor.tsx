'use client'

import { useState } from 'react'

const DIAGNOSIS_OPTIONS = [
  { value: 'DRC',                label: 'Doença Renal Crônica' },
  { value: 'HAS_NEFROSCLEROSE',  label: 'HAS / Nefrosclerose' },
  { value: 'NEFROPATIA_DIABETICA', label: 'Nefropatia Diabética' },
  { value: 'GLOMERULOPATIA',     label: 'Glomerulopatia' },
  { value: 'NEFROLITIASE',       label: 'Nefrolitíase' },
  { value: 'CONSULTA_GERAL',     label: 'Consulta Geral de Nefrologia' },
]

const CKD_STAGES = ['G1', 'G2', 'G3a', 'G3b', 'G4', 'G5', 'G5D']
const ALBUMINURIA_CATEGORIES = ['A1', 'A2', 'A3']

const CKD_STAGE_COLOR: Record<string, string> = {
  G1:  'bg-green-100 text-green-800 border-green-200',
  G2:  'bg-yellow-100 text-yellow-800 border-yellow-200',
  G3a: 'bg-orange-100 text-orange-800 border-orange-200',
  G3b: 'bg-orange-200 text-orange-900 border-orange-300',
  G4:  'bg-red-100 text-red-800 border-red-200',
  G5:  'bg-red-200 text-red-900 border-red-300',
  G5D: 'bg-purple-100 text-purple-800 border-purple-200',
}

type Props = {
  /** Valores atuais do paciente */
  currentDiagnosis: string
  currentEtiology: string | null | undefined
  currentCkdStage: string | null | undefined
  currentAlbuminuria: string | null | undefined
  /**
   * Chamado quando o médico confirma uma alteração.
   * Recebe os novos valores (undefined = sem alteração, null = limpar).
   */
  onChange: (update: {
    diagnosis?: string
    etiology?: string | null
    ckdStage?: string | null
    albuminuria?: string | null
  }) => void
}

/**
 * Seção colapsável no formulário de nova consulta para atualizar
 * o diagnóstico principal e o estadiamento CKD do paciente.
 *
 * Só propaga alterações quando o médico clicar em "Confirmar atualização"
 * para evitar mudanças acidentais.
 */
export default function DiagnosisEditor({
  currentDiagnosis,
  currentEtiology,
  currentCkdStage,
  currentAlbuminuria,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const [diagnosis, setDiagnosis] = useState(currentDiagnosis)
  const [etiology, setEtiology] = useState(currentEtiology ?? '')
  const [ckdStage, setCkdStage] = useState<string>(currentCkdStage ?? '')
  const [albuminuria, setAlbuminuria] = useState<string>(currentAlbuminuria ?? '')
  const [confirmed, setConfirmed] = useState(false)

  const showEtiology = diagnosis === 'DRC'

  const hasChanges =
    diagnosis !== currentDiagnosis ||
    etiology !== (currentEtiology ?? '') ||
    ckdStage !== (currentCkdStage ?? '') ||
    albuminuria !== (currentAlbuminuria ?? '')

  function handleConfirm() {
    onChange({
      diagnosis: diagnosis !== currentDiagnosis ? diagnosis : undefined,
      etiology: etiology !== (currentEtiology ?? '')
        ? (etiology || null)
        : undefined,
      ckdStage: ckdStage !== (currentCkdStage ?? '')
        ? (ckdStage || null)
        : undefined,
      albuminuria: albuminuria !== (currentAlbuminuria ?? '')
        ? (albuminuria || null)
        : undefined,
    })
    setConfirmed(true)
    setOpen(false)
  }

  function handleReset() {
    setDiagnosis(currentDiagnosis)
    setEtiology(currentEtiology ?? '')
    setCkdStage(currentCkdStage ?? '')
    setAlbuminuria(currentAlbuminuria ?? '')
    setConfirmed(false)
  }

  const selectClass = "border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Cabeçalho — sempre visível */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Diagnóstico / Estadiamento
          </span>
          <div className="flex items-center gap-1.5">
            {confirmed ? (
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                ✓ atualizado nesta consulta
              </span>
            ) : (
              <>
                {currentCkdStage && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${CKD_STAGE_COLOR[currentCkdStage] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {currentCkdStage}
                  </span>
                )}
                {currentAlbuminuria && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    {currentAlbuminuria}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-600">
            {open ? 'fechar' : 'atualizar'}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Painel de edição — colapsável */}
      {open && (
        <div className="border-t border-gray-100 px-6 py-5 space-y-5">

          {/* Diagnóstico principal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico principal</label>
            <select
              value={diagnosis}
              onChange={e => { setDiagnosis(e.target.value); setConfirmed(false) }}
              className={selectClass + " w-full"}
            >
              {DIAGNOSIS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Etiologia — texto livre */}
          {showEtiology && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etiologia
                <span className="ml-1 text-xs font-normal text-gray-400">opcional</span>
              </label>
              <input
                type="text"
                value={etiology}
                onChange={e => { setEtiology(e.target.value); setConfirmed(false) }}
                placeholder="ex: HAS, DM, nefropatia IgA, rim policístico..."
                className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Estadiamento CKD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estágio CKD (TFG)</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setCkdStage(''); setConfirmed(false) }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  ckdStage === ''
                    ? 'bg-gray-700 text-white border-gray-700'
                    : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                }`}
              >
                Não aplicável
              </button>
              {CKD_STAGES.map(stage => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => { setCkdStage(stage); setConfirmed(false) }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    ckdStage === stage
                      ? CKD_STAGE_COLOR[stage] + ' border-current'
                      : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          {/* Categoria de albuminúria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Albuminúria</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setAlbuminuria(''); setConfirmed(false) }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  albuminuria === ''
                    ? 'bg-gray-700 text-white border-gray-700'
                    : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                }`}
              >
                Não aplicável
              </button>
              {ALBUMINURIA_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setAlbuminuria(cat); setConfirmed(false) }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    albuminuria === cat
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">A1 &lt; 30 mg/g · A2 30–300 mg/g · A3 &gt; 300 mg/g</p>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!hasChanges}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Confirmar atualização
            </button>
            {hasChanges && (
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
              >
                Cancelar
              </button>
            )}
          </div>

          {!hasChanges && !confirmed && (
            <p className="text-xs text-gray-400">Nenhuma alteração em relação ao cadastro atual.</p>
          )}
        </div>
      )}
    </div>
  )
}
