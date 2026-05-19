'use client'

import { useState, useRef, useEffect } from 'react'
import { searchMedications } from '@/lib/medications'

export type ActiveMedication = {
  id: string
  name: string
  dose?: string | null
  frequency?: string | null
}

export type NewMedicationInput = {
  name: string
  dose?: string
  frequency?: string
  notes?: string
}

type Props = {
  activeMedications: ActiveMedication[]
  suspendedIds: string[]
  onSuspend: (id: string) => void
  onUnsuspend: (id: string) => void
  newMedications: NewMedicationInput[]
  onAddNew: (med: NewMedicationInput) => void
  onRemoveNew: (idx: number) => void
  onViewPrescription: () => void
}

/**
 * Smart Prescription Flow — gerencia medicamentos ativos, suspensões e novas prescrições.
 *
 * - Medicamentos ativos: vêm do banco via props, podem ser suspensos nesta consulta
 * - Novos medicamentos: adicionados via autocomplete + posologia
 * - Prescrição: botão abre modal com lista consolidada
 */
export default function MedicationList({
  activeMedications,
  suspendedIds,
  onSuspend,
  onUnsuspend,
  newMedications,
  onAddNew,
  onRemoveNew,
  onViewPrescription,
}: Props) {
  const [nameInput, setNameInput] = useState('')
  const [doseInput, setDoseInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const nameRef = useRef<HTMLInputElement>(null)
  const doseRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  function updateSuggestions(q: string) {
    if (q.length < 2) { setSuggestions([]); return }
    const results = searchMedications(q, 8).map(m => m.name)
    setSuggestions(results)
    setActiveIdx(-1)
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNameInput(e.target.value)
    updateSuggestions(e.target.value)
  }

  function selectSuggestion(name: string) {
    setNameInput(name)
    setSuggestions([])
    setTimeout(() => doseRef.current?.focus(), 50)
  }

  function addMedication() {
    const name = nameInput.trim()
    if (!name) return
    const dose = doseInput.trim()
    onAddNew({ name, dose: dose || undefined })
    setNameInput('')
    setDoseInput('')
    setSuggestions([])
    nameRef.current?.focus()
  }

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); return }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); return }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0 && suggestions[activeIdx]) { selectSuggestion(suggestions[activeIdx]) }
      else if (nameInput.trim()) { doseRef.current?.focus() }
      return
    }
    if (e.key === 'Escape') { setSuggestions([]); return }
    if (e.key === 'Tab' && suggestions.length > 0 && activeIdx >= 0) { e.preventDefault(); selectSuggestion(suggestions[activeIdx]) }
  }

  function handleDoseKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addMedication(); return }
    if (e.key === 'Backspace' && doseInput === '') { nameRef.current?.focus() }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (listRef.current && !listRef.current.contains(e.target as Node) &&
          nameRef.current && !nameRef.current.contains(e.target as Node)) {
        setSuggestions([])
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const inputClass = "border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="space-y-3">
      {/* Medicamentos ativos do banco */}
      {activeMedications.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Em uso</p>
          {activeMedications.map(m => {
            const suspended = suspendedIds.includes(m.id)
            return (
              <div
                key={m.id}
                className={`flex items-center justify-between rounded-lg px-3 py-2 border ${
                  suspended
                    ? 'bg-gray-50 border-gray-200 opacity-60'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div>
                  <span className={`text-sm font-medium ${suspended ? 'line-through text-gray-500' : 'text-blue-900'}`}>
                    {m.name}
                  </span>
                  {m.dose && (
                    <span className={`text-sm ml-2 ${suspended ? 'text-gray-400' : 'text-blue-600'}`}>
                      {m.dose}
                    </span>
                  )}
                  {suspended && (
                    <span className="ml-2 text-xs text-red-500 font-medium">suspenso nesta consulta</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => suspended ? onUnsuspend(m.id) : onSuspend(m.id)}
                  className={`text-xs px-2 py-1 rounded-md ml-3 transition-colors ${
                    suspended
                      ? 'text-blue-600 hover:bg-blue-50 border border-blue-200'
                      : 'text-red-500 hover:bg-red-50 border border-red-200'
                  }`}
                >
                  {suspended ? 'Restaurar' : 'Suspender'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Novos medicamentos adicionados nesta consulta */}
      {newMedications.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Novos nesta consulta</p>
          {newMedications.map((m, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2"
            >
              <div>
                <span className="text-sm font-medium text-green-900">{m.name}</span>
                {m.dose && <span className="text-sm text-green-600 ml-2">{m.dose}</span>}
              </div>
              <button
                type="button"
                onClick={() => onRemoveNew(idx)}
                className="text-green-300 hover:text-green-600 ml-3 text-lg leading-none"
                aria-label={`Remover ${m.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulário de adição */}
      <div className="flex gap-2 items-start">
        <div className="relative flex-1">
          <input
            ref={nameRef}
            type="text"
            value={nameInput}
            onChange={handleNameChange}
            onKeyDown={handleNameKeyDown}
            placeholder="Adicionar medicamento"
            className={inputClass + " w-full"}
          />
          {suggestions.length > 0 && (
            <ul
              ref={listRef}
              className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              {suggestions.map((name, i) => (
                <li
                  key={name}
                  onMouseDown={e => { e.preventDefault(); selectSuggestion(name) }}
                  className={`px-3 py-2 text-sm cursor-pointer ${
                    i === activeIdx ? 'bg-blue-50 text-blue-900' : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          ref={doseRef}
          type="text"
          value={doseInput}
          onChange={e => setDoseInput(e.target.value)}
          onKeyDown={handleDoseKeyDown}
          placeholder="Posologia (ex: 100mg 1x/dia)"
          className={inputClass + " w-48"}
        />

        <button
          type="button"
          onClick={addMedication}
          disabled={!nameInput.trim()}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          + Adicionar
        </button>
      </div>

      {/* Botão receituário */}
      {(activeMedications.filter(m => !suspendedIds.includes(m.id)).length > 0 || newMedications.length > 0) && (
        <button
          type="button"
          onClick={onViewPrescription}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Ver receituário completo
        </button>
      )}

      <p className="text-xs text-gray-400">
        Enter no nome vai para posologia · Enter na posologia adiciona o medicamento
      </p>
    </div>
  )
}
