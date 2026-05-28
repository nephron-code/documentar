'use client'

import { useState, useMemo, useEffect } from 'react'
import { EXAM_PACKAGES } from '@/lib/clinical/examPanels'
import { getKdigoExamPanel } from '@/components/KdigoAlert'

type Props = {
  diagnosisKey: string
  /** TFG atual para montar o pacote KDIGO dinâmico */
  tfg?: number | null
  /** ACR atual para montar o pacote KDIGO dinâmico */
  acr?: number | null
  /** Chamado sempre que a lista de exames selecionados muda — usado para salvar no banco */
  onExamsChange?: (exams: string[]) => void
}

const DEFAULT_PACKAGE: Record<string, string> = {
  DRC:                  'rotina',
  HAS_NEFROSCLEROSE:    'rotina',
  NEFROPATIA_DIABETICA: 'trimestral_dm',
  GLOMERULOPATIA:       'glomerulopatia',
  NEFROLITIASE:         'nefrolitiase',
  CONSULTA_GERAL:       'rotina',
}

export default function ExamOrderPanel({ diagnosisKey, tfg, acr, onExamsChange }: Props) {
  // Monta pacote KDIGO dinâmico se houver TFG e ACR
  const kdigoPackage = useMemo(() => {
    if (tfg == null || acr == null) return null
    return getKdigoExamPanel(tfg, acr)
  }, [tfg, acr])

  // Pacote padrão: se há KDIGO disponível, começa por ele; caso contrário, usa padrão por diagnóstico
  const defaultKey = kdigoPackage ? 'kdigo' : (DEFAULT_PACKAGE[diagnosisKey] ?? 'rotina')
  const [selectedKey, setSelectedKey] = useState(defaultKey)
  const [copied, setCopied] = useState(false)

  // Monta lista completa de opções: KDIGO (se disponível) + pacotes fixos
  const allOptions = useMemo(() => {
    const base = EXAM_PACKAGES.map(p => ({
      key: p.key,
      label: p.label,
      description: p.description,
      exams: p.exams,
    }))
    if (!kdigoPackage) return base
    return [
      {
        key: 'kdigo',
        label: `KDIGO ${kdigoPackage.stagLabel}`,
        description: `Painel baseado no estadiamento ${kdigoPackage.stagLabel} — retorno ${kdigoPackage.followUpFrequency}`,
        exams: kdigoPackage.exams,
      },
      ...base,
    ]
  }, [kdigoPackage])

  const selectedPkg = allOptions.find(p => p.key === selectedKey)

  useEffect(() => {
    if (onExamsChange && selectedPkg) onExamsChange(selectedPkg.exams)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, onExamsChange])

  async function handleCopy() {
    if (!selectedPkg) return
    try {
      const text = selectedPkg.exams.join('\n')
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* fallback silencioso */ }
  }

  const isKdigo = selectedKey === 'kdigo'

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Pedido de Exames Laboratoriais
          </h2>
          {selectedPkg && (
            <p className="text-xs text-gray-400 mt-0.5">{selectedPkg.description}</p>
          )}
        </div>
        <select
          value={selectedKey}
          onChange={e => setSelectedKey(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
        >
          {allOptions.map(p => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>

      {selectedPkg && (
        <ul className="space-y-1">
          {selectedPkg.exams.map(exam => (
            <li key={exam} className="flex items-center gap-2 text-sm text-gray-700">
              {isKdigo && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              )}
              {exam}
            </li>
          ))}
        </ul>
      )}

      {isKdigo && kdigoPackage && (
        <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
          Painel gerado automaticamente pelo motor KDIGO para estadiamento{' '}
          <strong>{kdigoPackage.stagLabel}</strong>.
          Retorno sugerido: <strong>{kdigoPackage.followUpFrequency}</strong>.
        </p>
      )}

      <button
        type="button"
        onClick={handleCopy}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
          copied
            ? 'bg-green-50 border-green-300 text-green-700'
            : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-700'
        }`}
      >
        {copied ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copiado!
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copiar pedido de exames
          </>
        )}
      </button>
    </section>
  )
}
