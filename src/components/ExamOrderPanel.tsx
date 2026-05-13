'use client'

import { useState } from 'react'
import { EXAM_PACKAGES } from '@/lib/examPanels'

type Props = {
  diagnosisKey: string
}

const DEFAULT_PACKAGE: Record<string, string> = {
  DRC:                  'rotina',
  HAS_NEFROSCLEROSE:    'rotina',
  NEFROPATIA_DIABETICA: 'trimestral_dm',
  GLOMERULOPATIA:       'glomerulopatia',
  NEFROLITIASE:         'nefrolitiase',
  CONSULTA_GERAL:       'rotina',
}

export default function ExamOrderPanel({ diagnosisKey }: Props) {
  const defaultKey = DEFAULT_PACKAGE[diagnosisKey] ?? 'rotina'
  const [selectedKey, setSelectedKey] = useState(defaultKey)
  const [copied, setCopied] = useState(false)

  const pkg = EXAM_PACKAGES.find(p => p.key === selectedKey)

  async function handleCopy() {
    if (!pkg) return
    try {
      await navigator.clipboard.writeText(pkg.exams.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* fallback silencioso */ }
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Pedido de Exames Laboratoriais
          </h2>
          {pkg && (
            <p className="text-xs text-gray-400 mt-0.5">{pkg.description}</p>
          )}
        </div>
        <select
          value={selectedKey}
          onChange={e => setSelectedKey(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
        >
          {EXAM_PACKAGES.map(p => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>

      {pkg && (
        <ul className="space-y-1">
          {pkg.exams.map(exam => (
            <li key={exam} className="text-sm text-gray-700">{exam}</li>
          ))}
        </ul>
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
