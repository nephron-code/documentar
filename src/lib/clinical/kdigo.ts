/**
 * Motor de Regras Clínicas — KDIGO 2024/2026
 * Classificação de risco, frequência de retorno, conduta sugerida e painel de exames.
 * Zero LLM — lógica determinística pura.
 */

// ── Tipos ──────────────────────────────────────────────────────────────────

export type GStage = 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5'
export type ACategory = 'A1' | 'A2' | 'A3'
export type RiskLevel = 'verde' | 'amarelo' | 'laranja' | 'vermelho'

export type KdigoRecommendations = {
  gStage: GStage
  aCategory: ACategory
  /** Ex: "G3bA2" */
  stagLabel: string
  risk: RiskLevel
  /** Ex: "A cada 6 meses" */
  followUpFrequency: string
  /** Detalhe clínico da frequência de retorno */
  followUpDetail: string
  /** Referenciamento a nefrologia indicado */
  referralIndicated: boolean
  /** Pontos de conduta sugeridos para este estágio/categoria */
  conductPoints: string[]
  /** Painel base (sem gasometria) */
  examPanel: string[]
  /** Painel incluindo gasometria venosa (para acidose metabólica) */
  examPanelWithGasometry: string[]
}

// ── Classificação G (por TFG estimada, mL/min/1,73m²) ─────────────────────

export function classifyGStage(tfg: number): GStage {
  if (tfg >= 90) return 'G1'
  if (tfg >= 60) return 'G2'
  if (tfg >= 45) return 'G3a'
  if (tfg >= 30) return 'G3b'
  if (tfg >= 15) return 'G4'
  return 'G5'
}

// ── Classificação A (por albuminúria/ACR, mg/g) ───────────────────────────

export function classifyACategory(acr: number): ACategory {
  if (acr < 30) return 'A1'
  if (acr <= 300) return 'A2'
  return 'A3'
}

// ── Matriz de risco KDIGO 2026 ────────────────────────────────────────────

const RISK_MATRIX: Record<GStage, Record<ACategory, RiskLevel>> = {
  G1:  { A1: 'verde',    A2: 'amarelo',  A3: 'laranja'  },
  G2:  { A1: 'verde',    A2: 'amarelo',  A3: 'laranja'  },
  G3a: { A1: 'amarelo',  A2: 'laranja',  A3: 'vermelho' },
  G3b: { A1: 'laranja',  A2: 'vermelho', A3: 'vermelho' },
  G4:  { A1: 'vermelho', A2: 'vermelho', A3: 'vermelho' },
  G5:  { A1: 'vermelho', A2: 'vermelho', A3: 'vermelho' },
}

// ── Frequência de retorno refinada (KDIGO 2024) ───────────────────────────
// Inclui número de consultas/ano e detalhe clínico

type FollowUpInfo = { label: string; detail: string }

const FOLLOW_UP: Record<GStage, Record<ACategory, FollowUpInfo>> = {
  G1: {
    A1: { label: '1× ao ano',       detail: 'Monitorização anual com função renal e ACR.' },
    A2: { label: '1× ao ano',       detail: 'Retorno anual; otimizar IECA/BRA e controle pressórico.' },
    A3: { label: '2× ao ano',       detail: 'Proteinúria elevada — retorno semestral; avaliar biópsia.' },
  },
  G2: {
    A1: { label: '1× ao ano',       detail: 'Monitorização anual com função renal e ACR.' },
    A2: { label: '1× ao ano',       detail: 'Retorno anual; investigar e tratar causa da DRC.' },
    A3: { label: '2× ao ano',       detail: 'Proteinúria em A3 — retorno semestral; considerar iSGLT2.' },
  },
  G3a: {
    A1: { label: '1–2× ao ano',     detail: 'Retorno semestral a anual; monitorar metabolismo mineral.' },
    A2: { label: '2× ao ano',       detail: 'Retorno a cada 6 meses; dupla nefroproteção (IECA + iSGLT2).' },
    A3: { label: '3× ao ano',       detail: 'Retorno a cada 4 meses; avaliar biópsia renal e imunossupressão.' },
  },
  G3b: {
    A1: { label: '2× ao ano',       detail: 'Retorno semestral; discutir planejamento de TRS a médio prazo.' },
    A2: { label: '3–4× ao ano',     detail: 'Retorno a cada 3–4 meses; rastrear anemia, acidose e DMO.' },
    A3: { label: '4× ao ano',       detail: 'Retorno trimestral; discutir TRS e acesso vascular.' },
  },
  G4: {
    A1: { label: '3–4× ao ano',     detail: 'Retorno a cada 3 meses; iniciar preparo para TRS.' },
    A2: { label: '4× ao ano',       detail: 'Retorno trimestral; encaminhar cirurgia vascular para FAV.' },
    A3: { label: '4× ao ano',       detail: 'Retorno trimestral; urgência no preparo para TRS.' },
  },
  G5: {
    A1: { label: '4–6× ao ano',     detail: 'Retorno mensal a cada 2 meses; avaliar início urgente de TRS.' },
    A2: { label: '4–6× ao ano',     detail: 'Retorno mensal a cada 2 meses; verificar acesso vascular.' },
    A3: { label: 'Mensal ou antes', detail: 'Retorno mensal ou antes conforme evolução clínica.' },
  },
}

// ── Pontos de conduta por estágio G + categoria A ─────────────────────────
// Baseados em KDIGO 2024, ADA 2024, ACC/AHA 2023

const CONDUCT_POINTS: Record<GStage, Record<ACategory, string[]>> = {
  G1: {
    A1: [
      'Controle pressórico: alvo PA < 130/80 mmHg.',
      'Investigar e tratar causa da DRC.',
      'Estilo de vida: dieta hipossódica, atividade física regular, cessação do tabagismo.',
    ],
    A2: [
      'IECA ou BRA: primeira linha se ACR 30–300 mg/g.',
      'Controle pressórico: alvo PA < 130/80 mmHg.',
      'Considerar iSGLT2 se ACR ≥ 200 mg/g (dapagliflozina 10 mg).',
      'Estilo de vida: dieta hipossódica (< 2 g/dia), exercício aeróbico 150 min/semana.',
    ],
    A3: [
      'IECA ou BRA em dose máxima tolerada.',
      'iSGLT2: indicado se ACR ≥ 200 mg/g.',
      'Investigar proteinúria em range nefrótico: avaliar biópsia renal.',
      'Rastrear síndrome nefrótica: albumina sérica, colesterol, tromboprofilaxia.',
      'Controle pressórico: alvo PA < 125/75 mmHg se proteinúria > 1 g/dia.',
    ],
  },
  G2: {
    A1: [
      'Controle pressórico: alvo PA < 130/80 mmHg.',
      'IECA ou BRA se proteinúria presente.',
      'Rastrear e tratar fatores de risco cardiovascular (dislipidemia, diabetes, tabagismo).',
      'Dieta hipossódica e normoproteica.',
    ],
    A2: [
      'IECA ou BRA: otimizar dose.',
      'iSGLT2 (dapagliflozina/empagliflozina): indicado se ACR ≥ 200 mg/g.',
      'Controle pressórico rigoroso: alvo PA < 130/80 mmHg.',
      'LDL: alvo < 70 mg/dL (risco cardiovascular alto). Estatina se necessário.',
      'Rastrear DM2 concomitante (HbA1c, glicemia de jejum).',
    ],
    A3: [
      'IECA ou BRA em dose máxima + iSGLT2.',
      'Finerenona: considerar se ACR persistentemente > 300 mg/g sob IECA/BRA + iSGLT2.',
      'Proteinúria A3: investigar causa — biópsia renal se indicado.',
      'Controle pressórico: alvo PA < 125/75 mmHg se proteinúria > 1 g/dia.',
      'Rastrear tromboembolismo se síndrome nefrótica.',
    ],
  },
  G3a: {
    A1: [
      'IECA ou BRA se proteinúria presente; monitorar K⁺ e creatinina.',
      'Rastrear metabolismo mineral-ósseo: Ca, P, PTH, 25-OH Vitamina D.',
      'Rastrear anemia (Hb < 12 g/dL em mulheres; < 13 g/dL em homens).',
      'Avaliar acidose metabólica: HCO₃ — tratar se < 22 mEq/L.',
      'Dieta: restrição de sódio; orientar proteínas (0,8 g/kg/dia).',
    ],
    A2: [
      'IECA ou BRA + iSGLT2: dupla nefroproteção (redução de progressão ~40%).',
      'Finerenona: adicionar se ACR persistente sob IECA/BRA + iSGLT2.',
      'Metabolismo mineral: corrigir vitamina D, controlar fósforo.',
      'Anemia: avaliar ferro (TSAT, ferritina); suplementar se TSAT < 20%.',
      'Bicarbonato de sódio se HCO₃ < 22 mEq/L.',
      'LDL: alvo < 55 mg/dL (risco muito alto, KDIGO Lipídeos 2023).',
    ],
    A3: [
      'IECA ou BRA (dose máxima) + iSGLT2 + finerenona (tripla nefroproteção).',
      'Controle pressórico estrito: alvo PA < 120/80 mmHg se tolerado.',
      'Proteinúria A3 em G3a: considerar biópsia renal para diagnóstico etiológico.',
      'Rastrear e tratar anemia, acidose metabólica e DMO.',
      'Iniciar discussão precoce sobre planejamento de TRS.',
    ],
  },
  G3b: {
    A1: [
      'IECA ou BRA: monitorar K⁺ (aceitar elevação de até 30% na creatinina).',
      'iSGLT2: manter se TFG ≥ 25 mL/min.',
      'Metabolismo mineral-ósseo: quelante de fósforo se P > 4,5 mg/dL.',
      'Anemia: iniciar eritropoetina se Hb < 10 g/dL refratária à reposição de ferro.',
      'Bicarbonato de sódio: 2–3 cp 650 mg 8/8h se HCO₃ < 22.',
      'Iniciar planejamento de TRS: discutir modalidades (HD, DP, transplante).',
    ],
    A2: [
      'IECA ou BRA + iSGLT2 (manter se TFG ≥ 25 mL/min) + finerenona.',
      'Anemia: eritropoetina (alvo Hb 10–11,5 g/dL) + ferro IV se TSAT < 20%.',
      'DMO: corrigir vitamina D, controlar PTH, quelante de fósforo.',
      'Acidose: bicarbonato oral (alvo HCO₃ > 22 mEq/L).',
      'Encaminhar para pré-diálise/TRS: avaliação multidisciplinar.',
      'Dieta hipoproteica (0,6–0,8 g/kg/dia) com acompanhamento nutricional.',
    ],
    A3: [
      'Tripla nefroproteção: IECA/BRA + iSGLT2 + finerenona.',
      'Eritropoetina + ferro IV: rastrear e tratar anemia.',
      'Encaminhar cirurgia vascular para confecção de FAV (se hemodiálise planejada).',
      'Discutir urgência no planejamento de TRS — G3b A3 = risco muito alto.',
      'Controle rigoroso de K⁺, P, HCO₃ e volemia.',
    ],
  },
  G4: {
    A1: [
      'Suspender metformina. Ajustar doses de medicamentos à função renal.',
      'IECA ou BRA: manter com monitorização frequente de K⁺ e creatinina.',
      'iSGLT2: considerar suspender se TFG < 25 mL/min.',
      'Eritropoetina + ferro IV: anemia renal — alvo Hb 10–11 g/dL.',
      'Quelante de fósforo (carbonato de cálcio ou sevelamer).',
      'Vitamina D ativa (calcitriol/alfacalcidol) se PTH elevado.',
      'Bicarbonato de sódio oral: alvo HCO₃ > 22 mEq/L.',
      'Encaminhar cirurgia vascular para FAV se hemodiálise planejada.',
    ],
    A2: [
      'Tripla nefroproteção se TFG ainda ≥ 25 mL/min.',
      'Eritropoetina + ferro IV urgente.',
      'Controle de DMO: quelante de P, vitamina D ativa, tratar HPT secundário.',
      'Acidose: bicarbonato oral (meta HCO₃ > 22).',
      'Confecção de FAV: encaminhar cirurgia vascular.',
      'Educação em saúde renal: restrição dietética, controle de peso e hídrico.',
    ],
    A3: [
      'Preparo urgente para TRS — G4 A3 tem progressão acelerada.',
      'Avaliar acesso vascular (FAV ou cateter peritoneal) com urgência.',
      'Controle rigoroso de K⁺ (evitar hipercalemia), P e volemia.',
      'Eritropoetina + ferro IV.',
      'Evitar nefrotóxicos, AINES, contrastes iodados e aminoglicosídeos.',
    ],
  },
  G5: {
    A1: [
      'Avaliar critérios de início de TRS: uremia sintomática, hipercalemia refratária, acidose grave, sobrecarga de volume.',
      'Verificar patência do acesso vascular (FAV/cateter).',
      'Eritropoetina + ferro IV: manter Hb 10–11 g/dL.',
      'Controle dietético máximo: P, K⁺, sódio e volume.',
      'Evitar nefrotóxicos absolutos.',
    ],
    A2: [
      'Indicação de TRS: avaliar urgência clínica.',
      'Suspender IECA/BRA se hipercalemia grave ou hipovolemia.',
      'Quelante de fósforo, bicarbonato IV/oral, controle de volume.',
      'Eritropoetina + ferro IV.',
      'Verificar acesso vascular; se sem acesso, discutir cateter temporário.',
    ],
    A3: [
      'TRS urgente: indicar hemodiálise ou diálise peritoneal sem demora.',
      'Controle clínico máximo enquanto aguarda TRS.',
      'Suspender medicamentos nefrotóxicos e ajustar todas as doses à função renal atual.',
      'Controle de K⁺, P, HCO₃ e volemia — risco de complicações agudas.',
    ],
  },
}

// ── Painéis de exames ──────────────────────────────────────────────────────

const BASE_PANEL = [
  'Ureia e Creatinina (com TFG estimada)',
  'Eletrólitos (Na, K, Ca, P)',
  'EAS (urina tipo 1)',
  'ACR (microalbuminúria/creatinina)',
]

const MINERAL_METABOLISM_PANEL = [
  'Ca, P, PTH, 25-OH Vitamina D',
]

const METABOLIC_PANEL = [
  'HbA1c',
  'Lipidograma (CT, LDL, HDL, TG)',
]

const ANEMIA_PANEL = [
  'Hemograma completo',
  'Ferro sérico, Ferritina, TSAT',
]

const GASOMETRY = 'Gasometria venosa (rastrear acidose metabólica)'

// ── Função principal ───────────────────────────────────────────────────────

export function getKdigoRecommendations(
  tfg: number,
  acr: number,
): KdigoRecommendations {
  const gStage = classifyGStage(tfg)
  const aCategory = classifyACategory(acr)
  const risk = RISK_MATRIX[gStage][aCategory]

  const gRank = ['G1', 'G2', 'G3a', 'G3b', 'G4', 'G5'].indexOf(gStage)
  const aRank = ['A1', 'A2', 'A3'].indexOf(aCategory)

  const followUp = FOLLOW_UP[gStage][aCategory]
  const conductPoints = CONDUCT_POINTS[gStage][aCategory]

  // Monta painel de exames
  const panel: string[] = [...BASE_PANEL]
  if (gRank >= 2) panel.push(...MINERAL_METABOLISM_PANEL)
  if (aRank >= 1) panel.push(...METABOLIC_PANEL)
  if (gRank >= 2) panel.push(...ANEMIA_PANEL) // G3a+ rastrear anemia sistematicamente

  return {
    gStage,
    aCategory,
    stagLabel: `${gStage}${aCategory}`,
    risk,
    followUpFrequency: followUp.label,
    followUpDetail: followUp.detail,
    referralIndicated: risk === 'vermelho',
    conductPoints,
    examPanel: panel,
    examPanelWithGasometry: gRank >= 2 ? [...panel, GASOMETRY] : panel,
  }
}

// ── Helpers de UI ──────────────────────────────────────────────────────────

export const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  verde:    { bg: 'bg-green-50',  text: 'text-green-800',  border: 'border-green-300' },
  amarelo:  { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-300' },
  laranja:  { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-300' },
  vermelho: { bg: 'bg-red-50',    text: 'text-red-800',    border: 'border-red-300' },
}

export const RISK_LABEL: Record<RiskLevel, string> = {
  verde:    'Risco baixo',
  amarelo:  'Risco moderado',
  laranja:  'Risco alto',
  vermelho: 'Risco muito alto',
}
