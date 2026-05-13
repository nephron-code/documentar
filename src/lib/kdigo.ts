/**
 * Motor de Regras Clínicas — KDIGO 2026
 * Classificação de risco, frequência de retorno e painel de exames sugerido.
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
  /** Ex: "2× ao ano" */
  followUpFrequency: string
  /** Referenciamento a nefrologia indicado */
  referralIndicated: boolean
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
// Linhas = G, Colunas = A

const RISK_MATRIX: Record<GStage, Record<ACategory, RiskLevel>> = {
  G1:  { A1: 'verde',    A2: 'amarelo',  A3: 'laranja'  },
  G2:  { A1: 'verde',    A2: 'amarelo',  A3: 'laranja'  },
  G3a: { A1: 'amarelo',  A2: 'laranja',  A3: 'vermelho' },
  G3b: { A1: 'laranja',  A2: 'vermelho', A3: 'vermelho' },
  G4:  { A1: 'vermelho', A2: 'vermelho', A3: 'vermelho' },
  G5:  { A1: 'vermelho', A2: 'vermelho', A3: 'vermelho' },
}

const FOLLOW_UP: Record<RiskLevel, string> = {
  verde:    '1× ao ano',
  amarelo:  '1× ao ano',
  laranja:  '2× ao ano',
  vermelho: '3–4× ao ano',
}

// ── Painéis de exames ──────────────────────────────────────────────────────

/** Exames solicitados em todos os estágios */
const BASE_PANEL = [
  'Ureia e Creatinina (com TFG estimada)',
  'Eletrólitos (Na, K, Ca, P)',
  'EAS (urina tipo 1)',
  'ACR (microalbuminúria/creatinina)',
]

/** Adicionados a partir de G3a */
const MINERAL_METABOLISM_PANEL = [
  'Ca, P, PTH, 25-OH Vitamina D',
]

/** Adicionados a partir de A2 */
const METABOLIC_PANEL = [
  'HbA1c',
  'Lipidograma completo (CT, LDL, HDL, TG)',
]

/** Exame opcional — acidose metabólica (G3a+) */
const GASOMETRY = 'Gasometria venosa (acidose metabólica)'

// ── Função principal ───────────────────────────────────────────────────────

export function getKdigoRecommendations(tfg: number, acr: number): KdigoRecommendations {
  const gStage = classifyGStage(tfg)
  const aCategory = classifyACategory(acr)
  const risk = RISK_MATRIX[gStage][aCategory]

  const gRank = ['G1', 'G2', 'G3a', 'G3b', 'G4', 'G5'].indexOf(gStage)
  const aRank = ['A1', 'A2', 'A3'].indexOf(aCategory)

  // Monta painel base
  const panel: string[] = [...BASE_PANEL]

  // Metabolismo mineral — G3a ou superior
  if (gRank >= 2) {
    panel.push(...MINERAL_METABOLISM_PANEL)
  }

  // Metabolismo glicídico/lipídico — A2 ou superior
  if (aRank >= 1) {
    panel.push(...METABOLIC_PANEL)
  }

  return {
    gStage,
    aCategory,
    stagLabel: `${gStage}${aCategory}`,
    risk,
    followUpFrequency: FOLLOW_UP[risk],
    referralIndicated: risk === 'vermelho',
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
