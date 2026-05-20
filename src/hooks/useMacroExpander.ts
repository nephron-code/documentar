'use client'

import { useCallback, useRef } from 'react'
import { tryExpandMacro } from '@/lib/clinical/macros'

/**
 * Hook para expansão automática de macros taquigráficas em textareas.
 *
 * Uso:
 *   const { onKeyDown } = useMacroExpander(value, setValue)
 *   <textarea value={value} onChange={e => setValue(e.target.value)} onKeyDown={onKeyDown} />
 *
 * A expansão ocorre quando o usuário digita espaço após uma macro conhecida (ex: ".ret ").
 */
export function useMacroExpander(
  value: string,
  setValue: (v: string) => void,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== ' ') return

      const textarea = e.currentTarget
      const cursorPos = textarea.selectionStart ?? 0

      // O espaço ainda não foi inserido; simula o texto com espaço
      const textWithSpace = value.slice(0, cursorPos) + ' ' + value.slice(cursorPos)
      const result = tryExpandMacro(textWithSpace, cursorPos + 1)

      if (!result) return

      // Previne o espaço default e aplica a expansão
      e.preventDefault()
      setValue(result.newText)

      // Restaura a posição do cursor após o React re-renderizar
      requestAnimationFrame(() => {
        if (textarea) {
          textarea.selectionStart = result.newCursor
          textarea.selectionEnd = result.newCursor
        }
      })
    },
    [value, setValue],
  )

  return { onKeyDown, textareaRef }
}
