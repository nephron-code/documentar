'use client'

import { useState, useRef, useEffect } from 'react'
import { searchMedications } from '@/lib/medications'

type Props = {
  value: string[]
  onChange: (meds: string[]) => void
}

/**
 * Campo para gerenciar lista de medicamentos em uso com posologia.
 *
 * Cada entrada é armazenada como string no formato "Nome Posologia"
 * ex: "Losartana 100mg 1x/dia"
 *
 * - Autocomplete por nome ao digitar 2+ caracteres
 * - Campo de posologia separado (livre)
 * - Medicamentos aparecem como tags removíveis
 * - Backspace com campos vazios remove o último item
 */
export default function MedicationList({ value, onChange }: Props) {
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
    // Foca no campo de posologia após selecionar o nome
    setTimeout(() => doseRef.current?.focus(), 50)
  }

  function addMedication() {
    const name = nameInput.trim()
    if (!name) return
    const dose = doseInput.trim()
    const entry = dose ? `${name} — ${dose}` : name
    // Evita duplicatas exatas
    if (value.includes(entry)) return
    onChange([...value, entry])
    setNameInput('')
    setDoseInput('')
    setSuggestions([])
    nameRef.current?.focus()
  }

  function removeMedication(entry: string) {
    onChange(value.filter(m => m !== entry))
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
    if (e.key === 'Tab') { if (suggestions.length > 0 && activeIdx >= 0) { e.preventDefault(); selectSuggestion(suggestions[activeIdx]) } }
  }

  function handleDoseKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addMedication(); return }
    if (e.key === 'Backspace' && doseInput === '') {
      // Volta para o campo nome
      nameRef.current?.focus()
    }
  }

  // Fecha dropdown ao clicar fora
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
      {/* Tags dos medicamentos cadastrados */}
      {value.length > 0 && (
        <div className="space-y-1.5">
          {value.map(entry => {
            const [namePart, dosePart] = entry.split(' — ')
            return (
              <div
                key={entry}
                className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
              >
                <div>
                  <span className="text-sm font-medium text-blue-900">{namePart}</span>
                  {dosePart && (
                    <span className="text-sm text-blue-600 ml-2">{dosePart}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeMedication(entry)}
                  className="text-blue-300 hover:text-blue-600 ml-3 text-lg leading-none"
                  aria-label={`Remover ${namePart}`}
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Formulário de adição */}
      <div className="flex gap-2 items-start">
        {/* Campo nome com autocomplete */}
        <div className="relative flex-1">
          <input
            ref={nameRef}
            type="text"
            value={nameInput}
            onChange={handleNameChange}
            onKeyDown={handleNameKeyDown}
            placeholder="Nome do medicamento"
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

        {/* Campo posologia */}
        <input
          ref={doseRef}
          type="text"
          value={doseInput}
          onChange={e => setDoseInput(e.target.value)}
          onKeyDown={handleDoseKeyDown}
          placeholder="Posologia (ex: 100mg 1x/dia)"
          className={inputClass + " w-52"}
        />

        {/* Botão adicionar */}
        <button
          type="button"
          onClick={addMedication}
          disabled={!nameInput.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          + Adicionar
        </button>
      </div>

      <p className="text-xs text-gray-400">
        Enter no nome vai para posologia · Enter na posologia adiciona o medicamento
      </p>
    </div>
  )
}
