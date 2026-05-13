'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { searchMedications, type Medication } from '@/lib/medications'

type Props = {
  value: string
  onChange: (v: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  rows?: number
  placeholder?: string
  className?: string
  name?: string
}

/**
 * Textarea com autocomplete de medicamentos nefrologicos.
 *
 * Comportamento:
 * - Detecta a palavra sendo digitada na posição do cursor
 * - Exibe um dropdown com sugestões quando há ≥ 3 caracteres
 * - Seleção por clique ou teclado (↑ ↓ Enter Esc)
 * - Insere o nome do medicamento no lugar da palavra atual
 * - Compatível com o hook useMacroExpander (onKeyDown delegado)
 */
export default function MedicationAutocomplete({
  value,
  onChange,
  onKeyDown,
  rows = 5,
  placeholder,
  className,
  name,
}: Props) {
  const [suggestions, setSuggestions] = useState<Medication[]>([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const [wordStart, setWordStart] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Atualiza sugestões conforme o texto muda
  const updateSuggestions = useCallback((text: string, cursor: number) => {
    // Pega a palavra atual (até o cursor, sem espaços)
    const before = text.slice(0, cursor)
    const wordMatch = before.match(/(\S+)$/)
    if (!wordMatch || wordMatch[1].startsWith('.')) {
      // Não mostrar autocomplete quando está digitando uma macro
      setSuggestions([])
      return
    }
    const word = wordMatch[1]
    const start = cursor - word.length
    setWordStart(start)

    if (word.length < 3) {
      setSuggestions([])
      return
    }
    setSuggestions(searchMedications(word))
    setActiveIdx(-1)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newVal = e.target.value
    onChange(newVal)
    updateSuggestions(newVal, e.target.selectionStart ?? newVal.length)
  }

  function handleSelect(med: Medication) {
    const cursor = textareaRef.current?.selectionStart ?? value.length
    const before = value.slice(0, wordStart)
    const after = value.slice(cursor)
    const inserted = med.name + ' '
    const newVal = before + inserted + after
    onChange(newVal)
    setSuggestions([])
    // Posiciona cursor após o medicamento inserido
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        const pos = before.length + inserted.length
        textareaRef.current.selectionStart = pos
        textareaRef.current.selectionEnd = pos
        textareaRef.current.focus()
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx(i => Math.min(i + 1, suggestions.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx(i => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter' && activeIdx >= 0) {
        e.preventDefault()
        handleSelect(suggestions[activeIdx])
        return
      }
      if (e.key === 'Escape') {
        setSuggestions([])
        return
      }
    }
    // Delega para o hook de macros (se fornecido)
    onKeyDown?.(e)
  }

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setSuggestions([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        name={name}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={className}
      />
      {suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto"
        >
          {suggestions.map((med, i) => (
            <li
              key={med.name}
              onMouseDown={e => { e.preventDefault(); handleSelect(med) }}
              className={`px-3 py-2 cursor-pointer flex items-baseline gap-2 ${
                i === activeIdx ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-sm text-gray-900 font-medium">{med.name}</span>
              {med.hint && (
                <span className="text-xs text-gray-400 truncate">{med.hint}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
