'use client'

import { useState } from 'react'
import {
  getKdigoRecommendations,
  RISK_COLORS,
  RISK_LABEL,
  type RiskLevel,
  type KdigoRecommendations,
} from '@/lib/kdigo'

type Props = {
  tfg: number
  acr: number
  /** Callback para passar o painel de exames KDIGO ao ExamOrderPanel */
  onKdigoExams?: (exams: string[], stagLabel: string) => void
}

export default function KdigoAlert({ tfg, acr, onKdigoExams }: Props) {
  const rec = getKdigoRecommendations(tfg, acr)
  const colors = RISK_COLORS[rec.risk]

  const showGasometryToggle = ['G3a', 'G3b', 'G4', 'G5'].includes(rec.gStage)
  const [withGasometry, setWithGasometry] = useState(false)
  const [showConduct, setShowConduct] = useState(false)

  // Passa o painel de exames para o ExamOrderPanel logo que o componente é montado
  // e sempre que a gasometria for toggled
  function handleGasometryChange(checked: boolean) {
    setWithGasometry(checked)
    const panel = checked ? rec.examPanelWithGasometry : rec.examPanel
    onKdigoExams?.(panel, rec.stagLabel)
  }

  // Propaga o painel inicial ao montar (via useEffect seria ideal, mas callback direto evita dependência)
  // O ExamOrderPanel chama getKdigoExams() por conta própria quando recebe as props tfg/acr

  return (
    <div className={`rounded-lg border p-4 space-y-3 ${colors.bg} ${colors.border}`}>

      {/* Cabeçalho: estágio + badge de risco + retorno */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-bold tracking-tight ${colors.text}`}>
            {rec.stagLabel}
          </span>
          <RiskBadge risk={rec.risk} />
        </div>
        <div className={`text-right text-sm ${colors.text}`}>
          <span className="font-semibold">{rec.followUpFrequency}</span>
        </div>
      </div>

      {/* Detalhe do retorno */}
      <p className={`text-xs ${colors.text} opacity-80`}>{rec.followUpDetail}</p>

      {/* Alerta de referenciamento */}
      {rec.referralIndicated && (
        <div className="flex items-center gap-2 bg-red-100 border border-red-300 rounded-lg px-3 py-2">
          <span className="text-red-600 text-base">⚠</span>
          <p className="text-sm font-semibold text-red-700">
            Referenciamento a nefrologia indicado — risco muito alto de progressão
          </p>
        </div>
      )}

      {/* Conduta sugerida — colapsável */}
      <details
        className="group"
        onToggle={e => setShowConduct((e.target as HTMLDetailsElement).open)}
      >
        <summary className={`cursor-pointer text-sm font-medium select-none ${colors.text} list-none flex items-center gap-1.5`}>
          <svg className="w-4 h-4 transition-transform group-open:rotate-90 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Pontos de conduta KDIGO ({rec.stagLabel})
        </summary>
        <ul className="mt-2 space-y-1.5 pl-5">
          {rec.conductPoints.map((point, i) => (
            <li key={i} className={`text-xs ${colors.text} list-disc leading-relaxed`}>
              {point}
            </li>
          ))}
        </ul>
      </details>

      {/* Gasometria toggle — só para G3a+ */}
      {showGasometryToggle && (
        <label className={`flex items-center gap-2 cursor-pointer text-sm ${colors.text} pt-1 border-t ${colors.border}`}>
          <input
            type="checkbox"
            checked={withGasometry}
            onChange={e => handleGasometryChange(e.target.checked)}
            className="rounded border-gray-400 accent-current"
          />
          Incluir gasometria venosa no pedido de exames
        </label>
      )}
    </div>
  )
}

// ── Exporta recomendações para uso externo (ExamOrderPanel) ───────────────

export function getKdigoExamPanel(tfg: number, acr: number, withGasometry = false): {
  exams: string[]
  stagLabel: string
  followUpFrequency: string
} {
  const rec = getKdigoRecommendations(tfg, acr)
  return {
    exams: withGasometry ? rec.examPanelWithGasometry : rec.examPanel,
    stagLabel: rec.stagLabel,
    followUpFrequency: rec.followUpFrequency,
  }
}

// ── Sub-componente: badge colorido por nível de risco ─────────────────────

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const MAP: Record<RiskLevel, string> = {
    verde:    'bg-green-100 text-green-800',
    amarelo:  'bg-yellow-100 text-yellow-800',
    laranja:  'bg-orange-100 text-orange-800',
    vermelho: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${MAP[risk]}`}>
      {RISK_LABEL[risk]}
    </span>
  )
}
