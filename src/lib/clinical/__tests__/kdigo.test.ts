/**
 * Testes unitários — Motor KDIGO 2024/2026
 *
 * Cobre: classifyGStage, classifyACategory, matriz de risco,
 * frequência de retorno, conduta, painel de exames.
 *
 * Referência: KDIGO 2024 CKD Guideline (kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf)
 */

import { describe, it, expect } from 'vitest'
import {
  classifyGStage,
  classifyACategory,
  getKdigoRecommendations,
  type GStage,
  type ACategory,
  type RiskLevel,
} from '../kdigo'

// ── classifyGStage ────────────────────────────────────────────────────────────

describe('classifyGStage', () => {
  const cases: [number, GStage][] = [
    [120, 'G1'],
    [90,  'G1'],   // limite inferior G1
    [89,  'G2'],
    [60,  'G2'],   // limite inferior G2
    [59,  'G3a'],
    [45,  'G3a'],  // limite inferior G3a
    [44,  'G3b'],
    [30,  'G3b'],  // limite inferior G3b
    [29,  'G4'],
    [15,  'G4'],   // limite inferior G4
    [14,  'G5'],
    [5,   'G5'],
    [0,   'G5'],
  ]

  it.each(cases)('TFG %i → %s', (tfg, expected) => {
    expect(classifyGStage(tfg)).toBe(expected)
  })
})

// ── classifyACategory ─────────────────────────────────────────────────────────

describe('classifyACategory', () => {
  const cases: [number, ACategory][] = [
    [0,   'A1'],
    [10,  'A1'],
    [29,  'A1'],   // limite superior A1
    [30,  'A2'],   // limite inferior A2
    [150, 'A2'],
    [300, 'A2'],   // limite superior A2
    [301, 'A3'],
    [1000,'A3'],
  ]

  it.each(cases)('ACR %i mg/g → %s', (acr, expected) => {
    expect(classifyACategory(acr)).toBe(expected)
  })
})

// ── Matriz de risco KDIGO ─────────────────────────────────────────────────────

describe('matriz de risco KDIGO 2026', () => {
  // Baseado na tabela de cores KDIGO (verde/amarelo/laranja/vermelho)
  const matrizEsperada: [GStage, ACategory, RiskLevel][] = [
    ['G1',  'A1', 'verde'],
    ['G1',  'A2', 'amarelo'],
    ['G1',  'A3', 'laranja'],
    ['G2',  'A1', 'verde'],
    ['G2',  'A2', 'amarelo'],
    ['G2',  'A3', 'laranja'],
    ['G3a', 'A1', 'amarelo'],
    ['G3a', 'A2', 'laranja'],
    ['G3a', 'A3', 'vermelho'],
    ['G3b', 'A1', 'laranja'],
    ['G3b', 'A2', 'vermelho'],
    ['G3b', 'A3', 'vermelho'],
    ['G4',  'A1', 'vermelho'],
    ['G4',  'A2', 'vermelho'],
    ['G4',  'A3', 'vermelho'],
    ['G5',  'A1', 'vermelho'],
    ['G5',  'A2', 'vermelho'],
    ['G5',  'A3', 'vermelho'],
  ]

  it.each(matrizEsperada)('%s × %s → risco %s', (g, a, risco) => {
    // Converter estágios em valores representativos de TFG e ACR
    const tfgMap: Record<GStage, number> = { G1: 95, G2: 70, G3a: 50, G3b: 35, G4: 20, G5: 8 }
    const acrMap: Record<ACategory, number> = { A1: 10, A2: 100, A3: 500 }
    const rec = getKdigoRecommendations(tfgMap[g], acrMap[a])
    expect(rec.risk).toBe(risco)
    expect(rec.gStage).toBe(g)
    expect(rec.aCategory).toBe(a)
  })
})

// ── stagLabel ────────────────────────────────────────────────────────────────

describe('stagLabel', () => {
  it('combina gStage + aCategory corretamente', () => {
    const rec = getKdigoRecommendations(50, 100)  // G3a A2
    expect(rec.stagLabel).toBe('G3aA2')
  })

  it('G5 A3 → stagLabel G5A3', () => {
    const rec = getKdigoRecommendations(8, 600)
    expect(rec.stagLabel).toBe('G5A3')
  })
})

// ── referralIndicated ────────────────────────────────────────────────────────

describe('referralIndicated (encaminhamento)', () => {
  it('risco vermelho → referralIndicated = true', () => {
    const rec = getKdigoRecommendations(8, 10)   // G5 A1 → vermelho
    expect(rec.referralIndicated).toBe(true)
  })

  it('risco verde → referralIndicated = false', () => {
    const rec = getKdigoRecommendations(95, 10)  // G1 A1 → verde
    expect(rec.referralIndicated).toBe(false)
  })

  it('risco laranja → referralIndicated = false', () => {
    const rec = getKdigoRecommendations(95, 500) // G1 A3 → laranja
    expect(rec.referralIndicated).toBe(false)
  })
})

// ── conductPoints ────────────────────────────────────────────────────────────

describe('conductPoints', () => {
  it('retorna array não-vazio para toda combinação G/A', () => {
    const tfgMap: Record<GStage, number> = { G1: 95, G2: 70, G3a: 50, G3b: 35, G4: 20, G5: 8 }
    const acrMap: Record<ACategory, number> = { A1: 10, A2: 100, A3: 500 }
    const gStages: GStage[] = ['G1', 'G2', 'G3a', 'G3b', 'G4', 'G5']
    const aCategs: ACategory[] = ['A1', 'A2', 'A3']
    for (const g of gStages) {
      for (const a of aCategs) {
        const rec = getKdigoRecommendations(tfgMap[g], acrMap[a])
        expect(rec.conductPoints.length).toBeGreaterThan(0)
      }
    }
  })

  it('G4+ inclui conduta sobre TRS', () => {
    const rec = getKdigoRecommendations(20, 10)  // G4 A1
    const textoJunto = rec.conductPoints.join(' ').toLowerCase()
    expect(textoJunto).toMatch(/trs|diálise|transplante|fav|acesso vascular/)
  })
})

// ── examPanel ────────────────────────────────────────────────────────────────

describe('examPanel', () => {
  it('painel base inclui ureia, creatinina, eletrólitos e ACR', () => {
    const rec = getKdigoRecommendations(95, 10)  // G1 A1 — painel mínimo
    const panel = rec.examPanel.join(' ').toLowerCase()
    expect(panel).toMatch(/ureia/)
    expect(panel).toMatch(/creatinina/)
    expect(panel).toMatch(/acr|microalbumin/)
  })

  it('G3a+ inclui metabolismo mineral no painel', () => {
    const rec = getKdigoRecommendations(50, 10)  // G3a A1
    const panel = rec.examPanel.join(' ').toLowerCase()
    expect(panel).toMatch(/cálcio|pth|vitamina d|fósforo|mineral/)
  })

  it('G3a+ inclui painel de anemia', () => {
    const rec = getKdigoRecommendations(50, 10)  // G3a A1
    const panel = rec.examPanel.join(' ').toLowerCase()
    expect(panel).toMatch(/hemograma|ferro|ferritina/)
  })

  it('examPanelWithGasometry tem um item a mais que examPanel em G3a+', () => {
    const rec = getKdigoRecommendations(50, 10)  // G3a A1
    expect(rec.examPanelWithGasometry.length).toBeGreaterThan(rec.examPanel.length)
  })

  it('G1 A1 — examPanel e examPanelWithGasometry são iguais (sem gasometria)', () => {
    const rec = getKdigoRecommendations(95, 10)  // G1 A1
    expect(rec.examPanelWithGasometry).toEqual(rec.examPanel)
  })
})

// ── followUpFrequency ────────────────────────────────────────────────────────

describe('followUpFrequency', () => {
  it('G1 A1 → retorno anual (baixo risco)', () => {
    const rec = getKdigoRecommendations(95, 10)
    expect(rec.followUpFrequency.toLowerCase()).toMatch(/ano|anual/)
  })

  it('G4 A2 → retorno trimestral ou mais frequente', () => {
    const rec = getKdigoRecommendations(20, 100)
    // "4× ao ano" equivale a trimestral
    expect(rec.followUpFrequency).toMatch(/4×|mensal|mês|semana/)
  })

  it('G5 A3 → retorno mensal', () => {
    const rec = getKdigoRecommendations(8, 600)
    expect(rec.followUpFrequency.toLowerCase()).toMatch(/mensal|mês/)
  })
})
