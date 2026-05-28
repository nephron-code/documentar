'use client'

import { useState } from 'react'
import type { MacroRecord } from '@/lib/actions/macros'
import Link from 'next/link'

/**
 * MacroPanel — painel lateral de atalhos taquigráficos.
 *
 * Recebe os macros como prop (carregados pelo Server Component pai a partir do banco).
 * Ao clicar num atalho, o texto expandido é inserido no campo ativo via `onInsert`.
 *
 * Uso:
 *   <MacroPanel macros={macros} activeField="clinicalNote" onInsert={text => setClinicalNote(p => p + text)} />
 */

type Props = {
  /** Macros carregados do banco (ou built-ins como fallback) */
  macros: MacroRecord[]
  /** Qual campo está ativo — controla qual aba abre por padrão */
  activeField: 'complaint' | 'clinicalNote' | 'conductText' | null
  /** Callback chamado com o texto expandido ao clicar */
  onInsert: (text: string) => void
}

type TabKey = 'complaint' | 'clinicalNote' | 'conductText' | 'meds'

const TAB_LABELS: Record<TabKey, string> = {
  complaint:    'Anamnese',
  clinicalNote: 'Impressão',
  conductText:  'Conduta',
  meds:         'Meds',
}

export default function MacroPanel({ macros, activeField, onInsert }: Props) {
  // Abre na aba que corresponde ao campo ativo, ou 'complaint' como padrão
  const defaultTab: TabKey =
    activeField === 'clinicalNote' ? 'clinicalNote'
    : activeField === 'conductText' ? 'conductText'
    : 'complaint'

  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab)

  // Filtra macros da aba ativa
  const tabMacros = macros
    .filter(m => m.category === activeTab)
    .sort((a, b) => a.position - b.position)

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden h-full">
      {/* Abas */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {(Object.keys(TAB_LABELS) as TabKey[]).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs font-medium py-2 transition-colors ${
              activeTab === tab
                ? 'bg-white text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Lista de macros */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {tabMacros.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">Nenhum atalho nesta categoria.</p>
        ) : (
          tabMacros.map(macro => (
            <button
              key={macro.key}
              type="button"
              onClick={() => onInsert(macro.value)}
              title={macro.value}
              className="w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-blue-50 hover:text-blue-800 group transition-colors"
            >
              <span className="shrink-0 font-mono text-xs font-semibold text-blue-600 bg-blue-50 group-hover:bg-blue-100 px-1.5 py-0.5 rounded">
                {macro.key}
              </span>
              <span className="text-xs text-gray-600 group-hover:text-blue-700 leading-relaxed line-clamp-2">
                {macro.value}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Rodapé — dica + link para configurações */}
      <div className="border-t border-gray-100 px-3 py-2 bg-gray-50 flex items-center justify-between gap-2">
        <p className="text-[10px] text-gray-400">
          Clique para inserir · ou <span className="font-mono">//atalho</span> + espaço
        </p>
        <Link
          href="/configuracoes/macros"
          className="text-[10px] text-blue-500 hover:text-blue-700 hover:underline whitespace-nowrap"
          title="Editar macros"
        >
          Editar ↗
        </Link>
      </div>
    </div>
  )
}
