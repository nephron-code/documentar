'use client'

import { useState, useRef } from 'react'
import type { MacroRecord } from '@/lib/actions/macros'
import { tryExpandMacro } from '@/lib/clinical/macros'

type Props = {
  value: string
  onChange: (v: string) => void
  onFocus?: () => void
  macros: MacroRecord[]
  category: string
  placeholder?: string
  rows?: number
  className?: string
  name?: string
}

/**
 * Textarea com sugestões inline de macros.
 *
 * - Digite // para abrir o painel de atalhos da categoria deste campo.
 * - Continue digitando para filtrar: //ret mostra macros com "ret".
 * - ↑ ↓ para navegar, Enter ou Tab para inserir, Esc para fechar.
 * - //atalho + espaço também expande automaticamente (built-ins).
 */
export default function TextareaWithMacros({
  value, onChange, onFocus, macros, category, placeholder, rows = 4, className, name,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [query, setQuery] = useState<string | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  const categoryMacros = macros
    .filter(m => m.category === category)
    .sort((a, b) => a.position - b.position)

  const filtered = query !== null
    ? categoryMacros.filter(m =>
        m.key.slice(2).toLowerCase().startsWith(query.toLowerCase()) ||
        (query.length >= 2 && m.value.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 9)
    : []

  function detectQuery(text: string, cursor: number): string | null {
    const before = text.slice(0, cursor)
    const match = before.match(/(?:^|\s)\/\/(\w*)$/)
    return match ? match[1] : null
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value
    onChange(text)
    setQuery(detectQuery(text, e.target.selectionStart ?? text.length))
    setActiveIdx(0)
  }

  function doInsert(macro: MacroRecord) {
    const textarea = ref.current
    const cursor = textarea?.selectionStart ?? value.length
    const before = value.slice(0, cursor)
    const match = before.match(/(?:^|\s)(\/\/\w*)$/)
    if (!match) return
    const slashPos = before.lastIndexOf('//')
    const newText = value.slice(0, slashPos) + macro.value + value.slice(cursor)
    onChange(newText)
    setQuery(null)
    requestAnimationFrame(() => {
      if (textarea) {
        const pos = slashPos + macro.value.length
        textarea.selectionStart = pos
        textarea.selectionEnd = pos
        textarea.focus()
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (query !== null && filtered.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); return }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); return }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); doInsert(filtered[activeIdx]); return }
      if (e.key === 'Escape') { setQuery(null); return }
    }

    if (e.key === ' ') {
      const textarea = e.currentTarget
      const cursorPos = textarea.selectionStart ?? 0
      const textWithSpace = value.slice(0, cursorPos) + ' ' + value.slice(cursorPos)
      const result = tryExpandMacro(textWithSpace, cursorPos + 1)
      if (result) {
        e.preventDefault()
        onChange(result.newText)
        setQuery(null)
        requestAnimationFrame(() => {
          if (ref.current) {
            ref.current.selectionStart = result.newCursor
            ref.current.selectionEnd = result.newCursor
          }
        })
      }
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        name={name}
        rows={rows}
        value={value}
        placeholder={placeholder}
        className={className}
        onChange={handleChange}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setQuery(null), 150)}
      />
      {query !== null && filtered.length > 0 && (
        <ul className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-full max-h-52 overflow-y-auto">
          {filtered.map((m, i) => (
            <li
              key={m.key}
              onMouseDown={e => { e.preventDefault(); doInsert(m) }}
              className={`flex items-start gap-2 px-3 py-2 cursor-pointer transition-colors ${
                i === activeIdx ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <span className="shrink-0 font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                {m.key}
              </span>
              <span className="text-xs text-gray-500 line-clamp-1 min-w-0">
                {m.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
