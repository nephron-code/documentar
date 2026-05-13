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

  // --- Evolução / impressão clínica — diagnósticos ---
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

  // --- Impressão clínica — DRC por estágio ---
  { key: '.g1',    value: 'DRC G1 — TFG preservada (≥ 90 mL/min), com marcadores de lesão renal. Paciente estável. ' },
  { key: '.g2',    value: 'DRC G2 — TFG levemente reduzida (60–89 mL/min). Monitorização regular. ' },
  { key: '.g3a',   value: 'DRC G3a — TFG moderadamente reduzida (45–59 mL/min). Risco moderado de progressão. ' },
  { key: '.g3b',   value: 'DRC G3b — TFG moderadamente a gravemente reduzida (30–44 mL/min). Iniciar planejamento de TRS. ' },
  { key: '.g4',    value: 'DRC G4 — TFG gravemente reduzida (15–29 mL/min). Preparo para TRS indicado. ' },
  { key: '.g5',    value: 'DRC G5 — Falência renal (TFG < 15 mL/min). Avaliar início de TRS. ' },

  // --- Impressão clínica — achados laboratoriais ---
  { key: '.tfgest', value: 'TFGe estável em relação à consulta anterior. ' },
  { key: '.anemrc', value: 'Anemia normocrômica normocítica compatível com doença renal crônica. ' },
  { key: '.dmo',    value: 'Distúrbio mineral-ósseo da DRC — PTH elevado, vitamina D insuficiente. ' },
  { key: '.acidmet',value: 'Acidose metabólica leve a moderada (HCO₃ reduzido). ' },

  // --- Conduta ---
  { key: '.ret1',  value: 'Retorno em 1 mês para reavaliação. ' },
  { key: '.ret3',  value: 'Retorno em 3 meses com exames. ' },
  { key: '.ret6',  value: 'Retorno em 6 meses com exames. ' },
  { key: '.mant',  value: 'Manter medicações em uso. ' },
  { key: '.ajust', value: 'Ajuste de dose conforme função renal. ' },
  { key: '.enc',   value: 'Encaminhar para avaliação de acesso vascular para hemodiálise. ' },
  { key: '.hdenc', value: 'Encaminhar para preparo para terapia renal substitutiva. ' },
  { key: '.diet',  value: 'Orientar dieta hipossódica e hipoproteica. ' },
  { key: '.hidr',  value: 'Orientar restrição hídrica. ' },
  { key: '.peso',  value: 'Controle de peso diário em casa. ' },
  { key: '.pa',    value: 'Monitorização domiciliar da pressão arterial. ' },
  { key: '.nef',   value: 'Aguardar vaga para nefrologia terciária. ' },

  // --- Conduta — DRC por estágio (templates compactos) ---
  { key: '.cond1',  value: 'Controle pressórico (alvo < 130/80 mmHg). IECA/BRA se proteinúria. Dieta hipossódica. Atividade física regular. Retorno em 12 meses. ' },
  { key: '.cond2',  value: 'Controle pressórico + IECA/BRA. Considerar iSGLT2 se ACR ≥ 200 mg/g. Dieta hipossódica e hipoproteica leve. Rastrear dislipidemia. Retorno em 12 meses. ' },
  { key: '.cond3a', value: 'IECA/BRA + iSGLT2 se ACR ≥ 200 mg/g. Rastrear anemia e DMO. Avaliar bicarbonato se HCO₃ < 22. Dieta hipoproteica. Retorno em 6 meses. ' },
  { key: '.cond3b', value: 'Manter IECA/BRA com monitorização de K⁺. iSGLT2 se TFG ≥ 25. Eritropoetina se Hb < 10. Corrigir vitamina D. Bicarbonato se acidose. Discutir TRS. Retorno em 3–4 meses. ' },
  { key: '.cond4',  value: 'Suspender metformina. Eritropoetina + ferro IV. Quelante de fósforo. Bicarbonato oral. Encaminhar cirurgia vascular para FAV. Retorno em 2–3 meses. ' },
  { key: '.cond5',  value: 'Avaliar início urgente de TRS. Verificar acesso vascular. Controle rigoroso de K⁺, P e volemia. Eritropoetina + ferro IV. Evitar nefrotóxicos. ' },

  // --- Conduta — procedimentos e encaminhamentos específicos ---
  { key: '.inicbicar', value: 'Iniciar bicarbonato de sódio oral (objetivo HCO₃ > 22 mEq/L). ' },
  { key: '.cpo',    value: 'Controle de peso e orientação de restrição hídrica. ' },
  { key: '.fav',    value: 'Encaminhar cirurgia vascular para confecção de fístula arteriovenosa. ' },
  { key: '.trs',    value: 'Discutir modalidades de terapia renal substitutiva (hemodiálise, diálise peritoneal, transplante). ' },

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
  { key: '.dapa',  value: 'Dapagliflozina ' },
  { key: '.empa',  value: 'Empagliflozina ' },
  { key: '.fine',  value: 'Finerenona ' },
  { key: '.alop',  value: 'Alopurinol ' },
  { key: '.citr',  value: 'Citrato de potássio ' },
  { key: '.seve',  value: 'Sevelamer ' },
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
