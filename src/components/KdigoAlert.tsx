'use client'

import { useState } from 'react'
import {
  getKdigoRecommendations,
  RISK_COLORS,
  RISK_LABEL,
  type RiskLevel,
} from '@/lib/kdigo'

type Props = {
  tfg: number
  acr: number
  /** Callback para anexar painel de exames ao campo de conduta */
  onAppendExams: (text: string) => void
}

export default function KdigoAlert({ tfg, acr, onAppendExams }: Props) {
  const rec = getKdigoRecommendations(tfg, acr)
  const colors = RISK_COLORS[rec.risk]

  // Toggle de gasometria venosa — exibido apenas se G3a ou superior
  const showGasometryToggle = ['G3a', 'G3b', 'G4', 'G5'].includes(rec.gStage)
  const [withGasometry, setWithGasometry] = useState(false)

  function handleAppendExams() {
    const panel = withGasometry ? rec.examPanelWithGasometry : rec.examPanel
    const text =
      `\n— Solicitação de exames (KDIGO ${rec.stagLabel}) —\n` +
      panel.map(e => `• ${e}`).join('\n') +
      `\nRetorno: ${rec.followUpFrequency}` +
      (rec.referralIndicated ? '\n⚠ Referenciamento a nefrologia indicado.' : '')
    onAppendExams(text)
  }

  return (
    <div className={`rounded-lg border p-4 space-y-3 ${colors.bg} ${colors.border}`}>

      {/* Cabeçalho: estágio + badge de risco */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-bold tracking-tight ${colors.text}`}>
            {rec.stagLabel}
          </span>
          <RiskBadge risk={rec.risk} />
        </div>
        <span className={`text-sm font-medium ${colors.text}`}>
          Retorno: {rec.followUpFrequency}
        </span>
      </div>

      {/* Alerta de referenciamento */}
      {rec.referralIndicated && (
        <p className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
          <span>⚠</span> Referenciamento a nefrologia indicado
        </p>
      )}

      {/* Painel de exames */}
      <details className="group">
        <summary className={`cursor-pointer text-sm font-medium select-none ${colors.text} list-none flex items-center gap-1`}>
          <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Ver painel de exames sugerido
        </summary>
        <ul className="mt-2 space-y-1 pl-5">
          {rec.examPanel.map(e => (
            <li key={e} className={`text-sm ${colors.text} list-disc`}>{e}</li>
          ))}
          {showGasometryToggle && withGasometry && (
            <li className={`text-sm ${colors.text} list-disc`}>
              Gasometria venosa (acidose metabólica)
            </li>
          )}
        </ul>
      </details>

      {/* Rodapé: toggle gasometria + botão anexar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
        {showGasometryToggle ? (
          <label className={`flex items-center gap-2 cursor-pointer text-sm ${colors.text}`}>
            <input
              type="checkbox"
              checked={withGasometry}
              onChange={e => setWithGasometry(e.target.checked)}
              className="rounded border-gray-400 accent-current"
            />
            Incluir gasometria venosa
          </label>
        ) : (
          <span /> /* spacer */
        )}

        <button
          type="button"
          onClick={handleAppendExams}
          className={`
            flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border
            transition-colors
            ${colors.border} ${colors.text} bg-white hover:opacity-80
          `}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Anexar pedido de exames na conduta
        </button>
      </div>
    </div>
  )
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
