'use client'

import { useState, useTransition } from 'react'
import { upsertMacro, deleteMacro, seedDefaultMacros } from '@/lib/actions/macros'
import type { MacroRecord } from '@/lib/actions/macros'

const CATEGORY_LABELS: Record<string, string> = {
  complaint:    'Anamnese',
  clinicalNote: 'Impressão clínica',
  conductText:  'Conduta',
  meds:         'Medicamentos',
}

const CATEGORIES = ['complaint', 'clinicalNote', 'conductText', 'meds'] as const

type Props = {
  initialMacros: MacroRecord[]
}

type EditingState = {
  id: string | null   // null = novo macro
  key: string
  value: string
  category: string
}

export default function MacrosEditor({ initialMacros }: Props) {
  const [macros, setMacros] = useState<MacroRecord[]>(initialMacros)
  const [activeCategory, setActiveCategory] = useState<string>('complaint')
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = macros
    .filter(m => m.category === activeCategory)
    .sort((a, b) => a.position - b.position)

  function startNew() {
    setEditing({ id: null, key: '.', value: '', category: activeCategory })
    setError('')
    setSuccess('')
  }

  function startEdit(m: MacroRecord) {
    setEditing({ id: m.id, key: m.key, value: m.value, category: m.category })
    setError('')
    setSuccess('')
  }

  function cancelEdit() {
    setEditing(null)
    setError('')
  }

  function handleSave() {
    if (!editing) return
    setError('')

    startTransition(async () => {
      try {
        const saved = await upsertMacro({
          key: editing.key.trim(),
          value: editing.value,
          category: editing.category,
        })
        setMacros(prev => {
          const without = prev.filter(m => m.key !== saved.key)
          return [...without, saved].sort((a, b) => a.position - b.position)
        })
        setEditing(null)
        setSuccess('Macro salvo.')
        setTimeout(() => setSuccess(''), 2500)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Erro ao salvar.')
      }
    })
  }

  function handleDelete(m: MacroRecord) {
    if (!confirm(`Remover o macro "${m.key}"?`)) return
    startTransition(async () => {
      try {
        await deleteMacro(m.id)
        setMacros(prev => prev.filter(x => x.id !== m.id))
        setSuccess('Macro removido.')
        setTimeout(() => setSuccess(''), 2500)
      } catch {
        setError('Erro ao remover.')
      }
    })
  }

  function handleSeed() {
    if (!confirm('Isso vai importar todos os macros padrão do NefroDoc. Macros com a mesma chave NÃO serão substituídos. Continuar?')) return
    startTransition(async () => {
      try {
        await seedDefaultMacros()
        // Recarrega a página para refletir o seed
        window.location.reload()
      } catch {
        setError('Erro ao importar macros padrão.')
      }
    })
  }

  const inputClass = "w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="space-y-6">
      {/* Barra de ações */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setEditing(null) }}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSeed}
            disabled={isPending}
            className="text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            ↓ Importar padrões
          </button>
          <button
            onClick={startNew}
            disabled={isPending}
            className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            + Novo macro
          </button>
        </div>
      </div>

      {/* Feedback */}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">{success}</p>
      )}
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
      )}

      {/* Formulário de edição / criação */}
      {editing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-semibold text-blue-800">
            {editing.id ? 'Editar macro' : 'Novo macro'}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Atalho <span className="font-normal text-gray-400">(começa com ponto)</span>
              </label>
              <input
                value={editing.key}
                onChange={e => setEditing(prev => prev ? { ...prev, key: e.target.value } : null)}
                placeholder=".meu_atalho"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={editing.category}
                onChange={e => setEditing(prev => prev ? { ...prev, category: e.target.value } : null)}
                className={inputClass}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Texto expandido</label>
            <textarea
              value={editing.value}
              onChange={e => setEditing(prev => prev ? { ...prev, value: e.target.value } : null)}
              rows={3}
              placeholder="Texto que será inserido ao usar o atalho..."
              className={inputClass + " resize-none"}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={cancelEdit}
              className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 px-4 py-2 rounded-lg transition-colors"
            >
              {isPending ? 'Salvando…' : 'Salvar macro'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de macros da categoria ativa */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500">Nenhum macro em <strong>{CATEGORY_LABELS[activeCategory]}</strong>.</p>
            <p className="text-xs text-gray-400 mt-1">Clique em "+ Novo macro" ou "↓ Importar padrões" para começar.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Atalho</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Texto expandido</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 group transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {m.key}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 leading-relaxed">{m.value}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(m)}
                        className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(m)}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Os macros são usados no painel lateral durante a consulta. O atalho digitado + espaço também expande automaticamente nos campos de texto.
      </p>
    </div>
  )
}
