'use client'

/**
 * Checklist de investigação de HAS Resistente.
 *
 * HAS resistente = PA não controlada em uso de ≥ 3 anti-hipertensivos
 * (incluindo diurético), em doses plenas, ou controlada com ≥ 4 fármacos.
 *
 * Baseado em: ACC/AHA 2019, KDIGO CKD Blood Pressure 2021, ESC/ESH 2023.
 *
 * O componente é puramente visual — não persiste dados, apenas auxilia
 * o médico a rastrear itens durante a consulta e, se quiser, inserir
 * um sumário no campo de nota clínica.
 */

import { useState } from 'react'

type CheckItem = {
  id: string
  label: string
  detail?: string
  status: 'unchecked' | 'ok' | 'altered' | 'pending'
}

const STATUS_STYLE: Record<CheckItem['status'], string> = {
  unchecked: 'bg-white border-gray-300 text-gray-500',
  ok:        'bg-green-50 border-green-400 text-green-800',
  altered:   'bg-red-50 border-red-400 text-red-800',
  pending:   'bg-yellow-50 border-yellow-400 text-yellow-800',
}

const STATUS_ICON: Record<CheckItem['status'], string> = {
  unchecked: '○',
  ok:        '✓',
  altered:   '!',
  pending:   '?',
}

const INITIAL_ITEMS: CheckItem[] = [
  // Pseudo-resistência
  { id: 'adesao',      label: 'Adesão medicamentosa confirmada',         detail: 'Interrogar diretamente; considerar piluleiro ou contagem de comprimidos', status: 'unchecked' },
  { id: 'tecnica',     label: 'Técnica de medida adequada',               detail: 'Repouso ≥ 5 min, manguito correto, braço no nível do coração, 2 medidas', status: 'unchecked' },
  { id: 'avental',     label: 'Efeito do avental branco excluído',        detail: 'MAPA ou MRPA: médias fora do consultório < 130/80 mmHg', status: 'unchecked' },
  { id: 'aine',        label: 'Uso de AINEs afastado',                    detail: 'Ibuprofeno, diclofenaco, naproxeno — elevam PA e reduzem efeito de diuréticos', status: 'unchecked' },
  { id: 'outros_farm', label: 'Outros fármacos elevadores de PA afastados', detail: 'ACO, corticoides, descongestionantes, estimulantes, lítio, ciclosporina, tacrolimus', status: 'unchecked' },
  { id: 'sodio',       label: 'Ingestão excessiva de sódio afastada',     detail: 'Meta < 2 g/dia; interrogar alimentos processados, embutidos, sal de adição', status: 'unchecked' },
  { id: 'alcool',      label: 'Abuso de álcool afastado',                 detail: '> 2 doses/dia eleva PA sistólica ~1 mmHg por dose extra', status: 'unchecked' },

  // Causas secundárias
  { id: 'saos',        label: 'SAOS investigada',                         detail: 'Ronco, apneias, sonolência — solicitar polissonografia se suspeita', status: 'unchecked' },
  { id: 'haldost',     label: 'Hiperaldosteronismo primário investigado',  detail: 'Aldosterona + renina em ortostatismo; suspender espironolactona 4 sem antes', status: 'unchecked' },
  { id: 'estenose',    label: 'Estenose de artéria renal avaliada',        detail: 'Suspeitar: jovem, DRC súbita, sopro abdominal — Doppler renal ou angioTC', status: 'unchecked' },
  { id: 'renal',       label: 'Doença renal parenquimatosa avaliada',      detail: 'Creatinina, TFGe, ACR, sedimento urinário', status: 'unchecked' },
  { id: 'feocro',      label: 'Feocromocitoma investigado',                detail: 'Crises, sudorese, cefaleia, palpitações — metanefrinas urinárias 24h ou plasmáticas', status: 'unchecked' },
  { id: 'tireoid',     label: 'Tireoideopatia avaliada',                   detail: 'TSH; hipo e hiper elevam PA por mecanismos distintos', status: 'unchecked' },
  { id: 'cushing',     label: 'Síndrome de Cushing considerada',           detail: 'Obeso, estrias violáceas, fraqueza proximal, DM — cortisol urinário 24h', status: 'unchecked' },

  // Esquema
  { id: 'diuretico',   label: 'Diurético adequado no esquema',             detail: 'Preferir clortalidona ou indapamida a hidroclorotiazida (maior duração de ação)', status: 'unchecked' },
  { id: 'espiro',      label: 'Espironolactona avaliada',                   detail: 'Adicionar 25–50 mg/dia se K⁺ < 4,5 e TFGe > 30 — 4ª droga mais eficaz', status: 'unchecked' },
]

type Props = {
  /** Insere sumário do checklist no campo de nota clínica */
  onInsertSummary?: (text: string) => void
}

export default function HASResistenteChecklist({ onInsertSummary }: Props) {
  const [items, setItems] = useState<CheckItem[]>(INITIAL_ITEMS)
  const [open, setOpen] = useState(false)

  function cycle(id: string) {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const next: CheckItem['status'][] = ['unchecked', 'ok', 'altered', 'pending']
      const idx = next.indexOf(item.status)
      return { ...item, status: next[(idx + 1) % next.length] }
    }))
  }

  function buildSummary(): string {
    const altered  = items.filter(i => i.status === 'altered').map(i => i.label)
    const pending  = items.filter(i => i.status === 'pending').map(i => i.label)
    const ok       = items.filter(i => i.status === 'ok').map(i => i.label)

    const lines: string[] = ['Checklist HAS Resistente:']
    if (ok.length)      lines.push(`✓ Descartados/OK: ${ok.join(', ')}.`)
    if (altered.length) lines.push(`! Alterados: ${altered.join(', ')}.`)
    if (pending.length) lines.push(`? Pendentes: ${pending.join(', ')}.`)
    return lines.join('\n')
  }

  const alteredCount = items.filter(i => i.status === 'altered').length
  const pendingCount = items.filter(i => i.status === 'pending').length
  const okCount      = items.filter(i => i.status === 'ok').length
  const doneCount    = okCount + alteredCount

  return (
    <div className="border border-orange-200 rounded-lg bg-orange-50">
      {/* Header colapsável */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-orange-900">
            Checklist — HAS Resistente
          </span>
          {doneCount > 0 && (
            <span className="text-xs text-orange-600">
              {doneCount}/{items.length} avaliados
              {alteredCount > 0 && <span className="text-red-600 font-medium"> · {alteredCount} alterado{alteredCount > 1 ? 's' : ''}</span>}
              {pendingCount > 0 && <span className="text-yellow-700"> · {pendingCount} pendente{pendingCount > 1 ? 's' : ''}</span>}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-orange-600 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-orange-700">
            Clique para alternar: <span className="font-medium">○ não avaliado → ✓ ok → ! alterado → ? pendente</span>
          </p>

          {/* Pseudo-resistência */}
          <div>
            <p className="text-[11px] font-semibold text-orange-500 uppercase tracking-wide mb-1.5">Excluir pseudo-resistência</p>
            <div className="space-y-1">
              {items.slice(0, 7).map(item => (
                <CheckRow key={item.id} item={item} onCycle={cycle} />
              ))}
            </div>
          </div>

          {/* Causas secundárias */}
          <div>
            <p className="text-[11px] font-semibold text-orange-500 uppercase tracking-wide mb-1.5">Causas secundárias</p>
            <div className="space-y-1">
              {items.slice(7, 14).map(item => (
                <CheckRow key={item.id} item={item} onCycle={cycle} />
              ))}
            </div>
          </div>

          {/* Esquema */}
          <div>
            <p className="text-[11px] font-semibold text-orange-500 uppercase tracking-wide mb-1.5">Otimização do esquema</p>
            <div className="space-y-1">
              {items.slice(14).map(item => (
                <CheckRow key={item.id} item={item} onCycle={cycle} />
              ))}
            </div>
          </div>

          {/* Botão de inserir sumário */}
          {onInsertSummary && doneCount > 0 && (
            <button
              type="button"
              onClick={() => onInsertSummary(buildSummary())}
              className="mt-2 w-full text-xs font-medium text-orange-700 border border-orange-300 hover:bg-orange-100 rounded-lg py-2 transition-colors"
            >
              Inserir sumário na nota clínica
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function CheckRow({ item, onCycle }: { item: CheckItem; onCycle: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onCycle(item.id)}
      className={`w-full flex items-start gap-2 px-3 py-2 rounded-lg border text-left transition-colors ${STATUS_STYLE[item.status]}`}
    >
      <span className="text-sm font-mono font-bold w-4 shrink-0 mt-0.5">{STATUS_ICON[item.status]}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium leading-tight">{item.label}</p>
        {item.detail && (
          <p className="text-[11px] opacity-70 mt-0.5 leading-tight">{item.detail}</p>
        )}
      </div>
    </button>
  )
}
