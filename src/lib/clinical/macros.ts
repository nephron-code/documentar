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
  // --- Anamnese / queixa principal — atalhos rápidos ---
  { key: '//ret',   value: 'Retorno ambulatorial. Paciente refere ' },
  { key: '//sem',   value: 'Sem queixas no momento. ' },
  { key: '//eas',   value: 'Assintomático no período. ' },
  { key: '//inc',   value: 'Inchaço em membros inferiores. ' },
  { key: '//disp',  value: 'Dispneia aos médios esforços. ' },
  { key: '//hip',   value: 'Hipertensão arterial de difícil controle. ' },
  { key: '//nic',   value: 'Nictúria. ' },
  { key: '//hema',  value: 'Hematúria macroscópica. ' },
  { key: '//olig',  value: 'Oligúria nas últimas 24h. ' },
  { key: '//colic', value: 'Cólica nefrética à direita / esquerda. ' },

  // --- Anamnese estruturada por diagnóstico (templates completos) ---
  { key: '//qdrc',  value: 'Retorno para acompanhamento de DRC. Paciente refere controle pressórico regular em domicílio. Nega dispneia, edema progressivo ou alteração do volume urinário. Dieta hipossódica sendo seguida. Medicações em uso sem intercorrências. Aguardando exames laboratoriais para avaliação de progressão da DRC.' },
  { key: '//qhas',  value: 'Retorno para controle de HAS. Monitorização domiciliar da PA realizada — médias referidas pelo paciente: ___/___mmHg. Nega cefaleia occipital, escotomas ou palpitações. Refere boa adesão ao esquema anti-hipertensivo. Sem edema de MMII. Dieta hipossódica em andamento.' },
  { key: '//qdm',   value: 'Retorno para controle de Nefropatia Diabética. Monitorização glicêmica domiciliar — médias referidas: ___mg/dL. Nega hipoglicemias. Refere boa adesão ao iSGLT2 / IECA. Controle pressórico em domicílio: ___/___mmHg. Sem sinais de infecção urinária, retenção urinária ou lesão em pé diabético.' },
  { key: '//qglom', value: 'Retorno para acompanhamento de glomerulopatia. Paciente refere evolução do edema: ___ (melhorou / piorou / estável). Diurese ___ mL/dia estimado. Nega hematúria macroscópica recente. Medicações imunossupressoras em uso sem efeitos colaterais referidos. Aguardando resultado de ___ para ajuste terapêutico.' },
  { key: '//qlit',  value: 'Retorno para acompanhamento de nefrolitíase. Sem episódios de cólica nefrética desde a última consulta. Hidratação oral: ___ L/dia referido pelo paciente. Diurese estimada: ___ mL/dia. Dieta hipossódica e normoproteica em andamento. Sem disúria, hematúria ou sintomas de infecção urinária.' },

  // --- Achados ao exame físico ---
  { key: '//ef',    value: 'Exame físico: paciente em BEG, lúcido e orientado, corado, hidratado, acianótico, anictérico. PA: ___/___mmHg. FC: ___bpm. Peso: ___kg. Edema de MMII: ' },
  { key: '//efsem', value: 'Exame físico: paciente em BEG, lúcido e orientado, sem edema periférico, sem sinais de sobrecarga de volume. PA controlada. ' },
  { key: '//efed',  value: 'Exame físico: edema de MMII _+/4+ bilateral, fóvea presente até ___. Macicez à percussão de flancos. PA: ___/___mmHg. ' },

  // --- Evolução / impressão clínica — diagnósticos ---
  { key: '//drc',   value: 'Doença Renal Crônica ' },
  { key: '//has',   value: 'Hipertensão Arterial Sistêmica ' },
  { key: '//dm',    value: 'Diabetes Mellitus tipo 2 ' },
  { key: '//nd',    value: 'Nefropatia Diabética ' },
  { key: '//ns',    value: 'Nefrosclerose hipertensiva ' },
  { key: '//glom',  value: 'Glomerulopatia ' },
  { key: '//nlit',  value: 'Nefrolitíase ' },
  { key: '//estab', value: 'Paciente clínica e laboratorialmente estável. ' },
  { key: '//prog',  value: 'Progressão da doença renal evidenciada pela queda da TFG. ' },
  { key: '//prot',  value: 'Proteinúria em níveis nefróticos. ' },

  // --- Impressão clínica — DRC por estágio ---
  { key: '//g1',    value: 'DRC G1 — TFG preservada (≥ 90 mL/min), com marcadores de lesão renal. Paciente estável. ' },
  { key: '//g2',    value: 'DRC G2 — TFG levemente reduzida (60–89 mL/min). Monitorização regular. ' },
  { key: '//g3a',   value: 'DRC G3a — TFG moderadamente reduzida (45–59 mL/min). Risco moderado de progressão. ' },
  { key: '//g3b',   value: 'DRC G3b — TFG moderadamente a gravemente reduzida (30–44 mL/min). Iniciar planejamento de TRS. ' },
  { key: '//g4',    value: 'DRC G4 — TFG gravemente reduzida (15–29 mL/min). Preparo para TRS indicado. ' },
  { key: '//g5',    value: 'DRC G5 — Falência renal (TFG < 15 mL/min). Avaliar início de TRS. ' },

  // --- Impressão clínica — achados laboratoriais ---
  { key: '//tfgest', value: 'TFGe estável em relação à consulta anterior. ' },
  { key: '//tfgq',   value: 'Queda da TFGe em relação à última coleta — progressão da DRC. ' },
  { key: '//tfgm',   value: 'Melhora da TFGe em relação à última coleta. ' },
  { key: '//anemrc', value: 'Anemia normocrômica normocítica compatível com doença renal crônica. ' },
  { key: '//anemfe', value: 'Anemia ferropriva — TSAT reduzida, ferritina baixa. Indicar reposição de ferro. ' },
  { key: '//dmo',    value: 'Distúrbio mineral-ósseo da DRC — PTH elevado, vitamina D insuficiente. ' },
  { key: '//acidmet',value: 'Acidose metabólica leve a moderada (HCO₃ reduzido). ' },
  { key: '//hipk',   value: 'Hipercalemia — K⁺ elevado, necessita ajuste dietético e/ou terapêutico. ' },
  { key: '//hypok',  value: 'Hipocalemia — K⁺ reduzido, avaliar causa e repor se necessário. ' },
  { key: '//protr',  value: 'Redução da proteinúria em relação à última coleta — resposta ao tratamento. ' },
  { key: '//protp',  value: 'Piora da proteinúria em relação à última coleta — reavaliar estratégia. ' },
  // --- Impressão clínica — templates de avaliação integrada ---
  { key: '//avdrc',  value: 'Paciente com DRC em estadiamento ___, clinicamente estável. TFGe ___ (estável / em queda). Proteinúria: ACR ___mg/g (___ vs anterior). Controle pressórico ___ (adequado / inadequado). Anemia ___ (estável / piorando). Sem intercorrências desde a última consulta.' },
  { key: '//avnd',   value: 'Nefropatia Diabética com TFGe ___ e ACR ___mg/g. Controle glicêmico: HbA1c ___% (meta < 7%). Controle pressórico: PA ___/___mmHg (meta < 130/80). Uso de iSGLT2: ___ (sim / não). IECA/BRA: ___ (sim / não). Avaliação de progressão: ' },

  // --- Conduta ---
  { key: '//ret1',  value: 'Retorno em 1 mês para reavaliação. ' },
  { key: '//ret3',  value: 'Retorno em 3 meses com exames. ' },
  { key: '//ret6',  value: 'Retorno em 6 meses com exames. ' },
  { key: '//mant',  value: 'Manter medicações em uso. ' },
  { key: '//ajust', value: 'Ajuste de dose conforme função renal. ' },
  { key: '//enc',   value: 'Encaminhar para avaliação de acesso vascular para hemodiálise. ' },
  { key: '//hdenc', value: 'Encaminhar para preparo para terapia renal substitutiva. ' },
  { key: '//diet',  value: 'Orientar dieta hipossódica e hipoproteica. ' },
  { key: '//hidr',  value: 'Orientar restrição hídrica. ' },
  { key: '//peso',  value: 'Controle de peso diário em casa. ' },
  { key: '//pa',    value: 'Monitorização domiciliar da pressão arterial. ' },
  { key: '//nef',   value: 'Aguardar vaga para nefrologia terciária. ' },

  // --- Conduta — DRC por estágio (templates compactos) ---
  { key: '//cond1',  value: 'Controle pressórico (alvo < 130/80 mmHg). IECA/BRA se proteinúria. Dieta hipossódica. Atividade física regular. Retorno em 12 meses. ' },
  { key: '//cond2',  value: 'Controle pressórico + IECA/BRA. Considerar iSGLT2 se ACR ≥ 200 mg/g. Dieta hipossódica e hipoproteica leve. Rastrear dislipidemia. Retorno em 12 meses. ' },
  { key: '//cond3a', value: 'IECA/BRA + iSGLT2 se ACR ≥ 200 mg/g. Rastrear anemia e DMO. Avaliar bicarbonato se HCO₃ < 22. Dieta hipoproteica. Retorno em 6 meses. ' },
  { key: '//cond3b', value: 'Manter IECA/BRA com monitorização de K⁺. iSGLT2 se TFG ≥ 25. Eritropoetina se Hb < 10. Corrigir vitamina D. Bicarbonato se acidose. Discutir TRS. Retorno em 3–4 meses. ' },
  { key: '//cond4',  value: 'Suspender metformina. Eritropoetina + ferro IV. Quelante de fósforo. Bicarbonato oral. Encaminhar cirurgia vascular para FAV. Retorno em 2–3 meses. ' },
  { key: '//cond5',  value: 'Avaliar início urgente de TRS. Verificar acesso vascular. Controle rigoroso de K⁺, P e volemia. Eritropoetina + ferro IV. Evitar nefrotóxicos. ' },

  // --- Conduta — procedimentos e encaminhamentos específicos ---
  { key: '//inicbicar', value: 'Iniciar bicarbonato de sódio oral (objetivo HCO₃ > 22 mEq/L). ' },
  { key: '//cpo',    value: 'Controle de peso e orientação de restrição hídrica. ' },
  { key: '//fav',    value: 'Encaminhar cirurgia vascular para confecção de fístula arteriovenosa. ' },
  { key: '//trs',    value: 'Discutir modalidades de terapia renal substitutiva (hemodiálise, diálise peritoneal, transplante). ' },

  // --- HAS Resistente — anamnese e investigação ---
  { key: '//qhasr',   value: 'Retorno para investigação de HAS resistente. PA domiciliar: ___/___mmHg (média de ___ dias). Refere adesão ao esquema atual: [boa / parcial]. Nega uso de AINEs, anticoncepcionais ou outros fármacos que elevam PA. Sem sintomas sugestivos de apneia do sono. ' },
  { key: '//adhasr',  value: 'Adesão ao esquema anti-hipertensivo: [boa / parcial / não adesão confirmada — ___].' },
  { key: '//tecpa',   value: 'Técnica de medida da PA: repouso de 5 min, braço direito, manguito adequado, média de 2 medidas. PA consultório: ___/___mmHg. ' },
  { key: '//mapa',    value: 'MAPA 24h: PA média diurna ___/___mmHg, noturna ___/___mmHg. Descenso noturno: [normal / atenuado / ausente]. ' },
  { key: '//mrpa',    value: 'MRPA: média matinal ___/___mmHg, vespertina ___/___mmHg (referida pelo paciente). ' },
  { key: '//saos',    value: 'Suspeita de SAOS: ronco, apneias observadas, sonolência diurna, IMC > 30. Solicitar polissonografia. ' },
  { key: '//haldos',  value: 'Investigar hiperaldosteronismo primário: solicitar aldosterona plasmática e atividade de renina (ou renina direta) em ortostatismo, sem suspender anti-hipertensivos (exceto espironolactona 4 semanas antes). ' },
  { key: '//doppler', value: 'Solicitar Doppler de artérias renais para exclusão de estenose vasculorrenal. ' },
  { key: '//feocro',  value: 'Investigar feocromocitoma: metanefrinas urinárias de 24h ou metanefrinas plasmáticas livres. ' },
  { key: '//espadd',  value: 'Adicionar espironolactona [25 mg/dia] ao esquema atual. Monitorar K⁺ e creatinina em 2–4 semanas. Contraindicada se TFGe < 30 ou K⁺ > 5,0 mEq/L. ' },

  // --- HAS Resistente — conduta e orientações ---
  { key: '//hasrond',  value: 'Orientações para HAS resistente: dieta hipossódica (< 2 g/dia), perda de peso, exercício aeróbico regular, limitar álcool, cessar tabagismo. ' },
  { key: '//hasrret',  value: 'Retorno em ___ semanas com MAPA, K⁺, creatinina e diário de PA domiciliar. ' },
  { key: '//diurtico', value: 'Otimizar diurético: clortalidona [12,5–25 mg] ou indapamida [1,5 mg] preferíveis à hidroclorotiazida (maior duração de ação). ' },
  { key: '//bloqca',   value: 'Bloqueador de canal de cálcio di-hidropiridínico: [anlodipino 5–10 mg] — associar ao IECA/BRA. ' },
  { key: '//hasrescl', value: 'Avaliação de causa secundária [em andamento / concluída / descartada]: SAOS ___, hiperaldosteronismo ___, estenose AR ___, doença renal ___. ' },
  { key: '//avhasr',   value: 'HAS resistente — PA não controlada em uso de ___ anti-hipertensivos (___). Pseudo-resistência excluída. Causas secundárias: [em investigação / descartadas]. Proposta de ajuste: ___.' },

  // --- Medicações frequentes ---
  { key: '//enal',  value: 'Enalapril ' },
  { key: '//losa',  value: 'Losartana ' },
  { key: '//amlo',  value: 'Anlodipino ' },
  { key: '//furos', value: 'Furosemida ' },
  { key: '//spiro', value: 'Espironolactona ' },
  { key: '//bicar', value: 'Bicarbonato de sódio ' },
  { key: '//calci', value: 'Carbonato de cálcio ' },
  { key: '//epo',   value: 'Eritropoetina ' },
  { key: '//ferro', value: 'Sulfato ferroso ' },
  { key: '//dapa',  value: 'Dapagliflozina ' },
  { key: '//empa',  value: 'Empagliflozina ' },
  { key: '//fine',  value: 'Finerenona ' },
  { key: '//alop',  value: 'Alopurinol ' },
  { key: '//citr',  value: 'Citrato de potássio ' },
  { key: '//seve',  value: 'Sevelamer ' },
  // HAS resistente
  { key: '//chlort', value: 'Clortalidona ' },
  { key: '//indap',  value: 'Indapamida ' },
  { key: '//cloni',  value: 'Clonidina ' },
  { key: '//hidral', value: 'Hidralazina ' },
  { key: '//mino',   value: 'Minoxidil ' },
  { key: '//doxaz',  value: 'Doxazosina ' },
  { key: '//bisop',  value: 'Bisoprolol ' },
  { key: '//carve',  value: 'Carvedilol ' },
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
  // Pega o atalho //xxx que termina na posição do cursor (só após espaço ou início)
  const before = text.slice(0, cursorPos)
  const match = before.match(/(?:^|\s)(\/\/\w+)\s$/)
  if (!match) return null

  const macroKey = match[1]
  const macro = MACROS.find(m => m.key === macroKey)
  if (!macro) return null

  // Substitui o atalho (incluindo o espaço que o ativou) pelo texto expandido
  const start = cursorPos - macroKey.length - 1  // -1 pelo espaço
  const newText = text.slice(0, start) + macro.value + text.slice(cursorPos)
  const newCursor = start + macro.value.length

  return { newText, newCursor }
}
