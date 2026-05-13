/**
 * Macros taquigráficas para campos de texto clínico.
 *
 * O hook useMacroExpander detecta quando o usuário digita uma macro seguida de espaço
 * e substitui pelo texto expandido correspondente.
 *
 * Convenção: macros terminam com um caractere de gatilho (espaço ou Tab).
 * A substituição preserva o restante do texto após o cursor.
 */

export type Macro = {
  key: string    // O que o usuário digita
  value: string  // O que será inserido
}

/**
 * Macros clínicas para Nefrologia ambulatorial.
 * Organizadas por categoria.
 */
export const MACROS: Macro[] = [
  // --- Anamnese / queixa principal ---
  { key: '.ret',   value: 'Retorno ambulatorial. Paciente refere ' },
  { key: '.sem',   value: 'Sem queixas no momento. ' },
  { key: '.eas',   value: 'Assintomático no período. ' },
  { key: '.inc',   value: 'Inchaço em membros inferiores. ' },
  { key: '.disp',  value: 'Dispneia aos médios esforços. ' },
  { key: '.hip',   value: 'Hipertensão arterial de difícil controle. ' },

  // --- Evolução / impressão clínica ---
  { key: '.drc',   value: 'Doença Renal Crônica ' },
  { key: '.has',   value: 'Hipertensão Arterial Sistêmica ' },
  { key: '.dm',    value: 'Diabetes Mellitus tipo 2 ' },
  { key: '.nd',    value: 'Nefropatia Diabética ' },
  { key: '.ns',    value: 'Nefrosclerose hipertensiva ' },
  { key: '.glom',  value: 'Glomerulopatia ' },
  { key: '.nlit',  value: 'Nefrolitíase ' },
  { key: '.estab', value: 'Paciente clínica e laboratorialmente estável. ' },
  { key: '.prog',  value: 'Progressão da doença renal evidenciada pela queda da TFG. ' },
  { key: '.prot',  value: 'Proteinúria em níveis nefróticos. ' },

  // --- Conduta ---
  { key: '.ret3',  value: 'Retorno em 3 meses com exames. ' },
  { key: '.ret6',  value: 'Retorno em 6 meses com exames. ' },
  { key: '.ret1',  value: 'Retorno em 1 mês para reavaliação. ' },
  { key: '.mant',  value: 'Manter medicações em uso. ' },
  { key: '.ajust', value: 'Ajuste de dose conforme função renal. ' },
  { key: '.enc',   value: 'Encaminhar para avaliação de acesso vascular para hemodiálise. ' },
  { key: '.hdenc', value: 'Encaminhar para preparo para terapia renal substitutiva. ' },
  { key: '.diet',  value: 'Orientar dieta hipossódica e hipoproteica. ' },
  { key: '.hidr',  value: 'Orientar restrição hídrica. ' },
  { key: '.peso',  value: 'Controle de peso diário em casa. ' },
  { key: '.pa',    value: 'Monitorização domiciliar da pressão arterial. ' },
  { key: '.nef',   value: 'Aguardar vaga para nefrologia terciária. ' },

  // --- Medicações frequentes ---
  { key: '.enal',  value: 'Enalapril ' },
  { key: '.losa',  value: 'Losartana ' },
  { key: '.amlo',  value: 'Anlodipino ' },
  { key: '.furos', value: 'Furosemida ' },
  { key: '.spiro', value: 'Espironolactona ' },
  { key: '.bicar', value: 'Bicarbonato de sódio ' },
  { key: '.calci', value: 'Carbonato de cálcio ' },
  { key: '.epo',   value: 'Eritropoetina ' },
  { key: '.ferro', value: 'Sulfato ferroso ' },
]

/**
 * Dado um texto e uma posição de cursor, tenta expandir a macro
 * que termina imediatamente antes do cursor.
 *
 * Retorna o novo texto e nova posição de cursor, ou null se nenhuma macro foi encontrada.
 */
export function tryExpandMacro(
  text: string,
  cursorPos: number,
): { newText: string; newCursor: number } | null {
  // Pega a palavra que termina na posição do cursor
  const before = text.slice(0, cursorPos)
  const match = before.match(/(\.\w+)\s$/)
  if (!match) return null

  const macroKey = match[1]
  const macro = MACROS.find(m => m.key === macroKey)
  if (!macro) return null

  // Substitui a macro (incluindo o espaço que a ativou) pelo texto expandido
  const start = cursorPos - macroKey.length - 1  // -1 pelo espaço
  const newText = text.slice(0, start) + macro.value + text.slice(cursorPos)
  const newCursor = start + macro.value.length

  return { newText, newCursor }
}
