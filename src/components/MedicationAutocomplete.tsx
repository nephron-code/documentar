'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { searchMedications, type Medication } from '@/lib/medications'
import type { MacroRecord } from '@/lib/actions/macros'
import { tryExpandMacro } from '@/lib/clinical/macros'

type Props = {
  value: string
  onChange: (v: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onFocus?: () => void
  rows?: number
  placeholder?: string
  className?: string
  name?: string
  macros?: MacroRecord[]
  macroCategory?: string
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
  onFocus,
  rows = 5,
  placeholder,
  className,
  name,
  macros,
  macroCategory,
}: Props) {
  const [suggestions, setSuggestions] = useState<Medication[]>([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const [wordStart, setWordStart] = useState(0)
  const [macroQuery, setMacroQuery] = useState<string | null>(null)
  const [macroIdx, setMacroIdx] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const categoryMacros = (macros ?? [])
    .filter(m => m.category === macroCategory)
    .sort((a, b) => a.position - b.position)

  const filteredMacros = macroQuery !== null
    ? categoryMacros.filter(m =>
        m.key.slice(2).toLowerCase().startsWith(macroQuery.toLowerCase()) ||
        (macroQuery.length >= 2 && m.value.toLowerCase().includes(macroQuery.toLowerCase()))
      ).slice(0, 9)
    : []

  const updateSuggestions = useCallback((text: string, cursor: number) => {
    const before = text.slice(0, cursor)
    const wordMatch = before.match(/(\S+)$/)
    if (!wordMatch || wordMatch[1].startsWith('//')) {
      setSuggestions([])
      return
    }
    const word = wordMatch[1]
    const start = cursor - word.length
    setWordStart(start)
    if (word.length < 3) { setSuggestions([]); return }
    setSuggestions(searchMedications(word))
    setActiveIdx(-1)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newVal = e.target.value
    onChange(newVal)
    const cursor = e.target.selectionStart ?? newVal.length
    const before = newVal.slice(0, cursor)
    const macroMatch = before.match(/(?:^|\s)\/\/(\w*)$/)
    if (macroMatch && macros) {
      setMacroQuery(macroMatch[1])
      setMacroIdx(0)
      setSuggestions([])
      return
    }
    setMacroQuery(null)
    updateSuggestions(newVal, cursor)
  }

  function insertMacro(macro: MacroRecord) {
    const textarea = textareaRef.current
    const cursor = textarea?.selectionStart ?? value.length
    const before = value.slice(0, cursor)
    const match = before.match(/(?:^|\s)(\/\/\w*)$/)
    if (!match) return
    const slashPos = before.lastIndexOf('//')
    const newText = value.slice(0, slashPos) + macro.value + value.slice(cursor)
    onChange(newText)
    setMacroQuery(null)
    requestAnimationFrame(() => {
      if (textarea) {
        const pos = slashPos + macro.value.length
        textarea.selectionStart = pos
        textarea.selectionEnd = pos
        textarea.focus()
      }
    })
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
    // Macro popup
    if (macroQuery !== null && filteredMacros.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMacroIdx(i => Math.min(i + 1, filteredMacros.length - 1)); return }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setMacroIdx(i => Math.max(i - 1, 0)); return }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMacro(filteredMacros[macroIdx]); return }
      if (e.key === 'Escape') { setMacroQuery(null); return }
    }

    // Med autocomplete
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); return }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); return }
      if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); handleSelect(suggestions[activeIdx]); return }
      if (e.key === 'Escape')    { setSuggestions([]); return }
    }

    // Space-triggered macro expansion (//atalho + espaço)
    if (e.key === ' ') {
      const textarea = e.currentTarget
      const cursorPos = textarea.selectionStart ?? 0
      const textWithSpace = value.slice(0, cursorPos) + ' ' + value.slice(cursorPos)
      const result = tryExpandMacro(textWithSpace, cursorPos + 1)
      if (result) {
        e.preventDefault()
        onChange(result.newText)
        setMacroQuery(null)
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = result.newCursor
            textareaRef.current.selectionEnd = result.newCursor
          }
        })
        return
      }
    }

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
        onFocus={onFocus}
        onBlur={() => setTimeout(() => setMacroQuery(null), 150)}
        className={className}
      />
      {macroQuery !== null && filteredMacros.length > 0 && (
        <ul className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-full max-h-52 overflow-y-auto">
          {filteredMacros.map((m, i) => (
            <li
              key={m.key}
              onMouseDown={e => { e.preventDefault(); insertMacro(m) }}
              className={`flex items-start gap-2 px-3 py-2 cursor-pointer transition-colors ${
                i === macroIdx ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <span className="shrink-0 font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                {m.key}
              </span>
              <span className="text-xs text-gray-500 line-clamp-1 min-w-0">{m.value}</span>
            </li>
          ))}
        </ul>
      )}
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
