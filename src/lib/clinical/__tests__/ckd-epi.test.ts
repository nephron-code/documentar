/**
 * Testes unitários — CKD-EPI 2021 (sem fator raça)
 *
 * Referência: Inker LA et al. NEJM 2021;385:1737-1749
 * Valores esperados verificados contra a calculadora oficial NIDDK/MDRD Study.
 */

import { describe, it, expect } from 'vitest'
import { calcTFGe, calcIdade } from '../ckd-epi-2021'

describe('calcTFGe — CKD-EPI 2021', () => {
  // ── Valores de referência publicados ──────────────────────────────────────
  // Fonte: Inker 2021 NEJM, Tabela suplementar com exemplos calculados

  it('homem 50 anos, creatinina 1.0 → TFGe normal (~93)', () => {
    const tfg = calcTFGe(1.0, 50, 'MALE')
    expect(tfg).not.toBeNull()
    expect(tfg!).toBeGreaterThan(85)
    expect(tfg!).toBeLessThan(100)
  })

  it('mesma creatinina → homem tem TFGe maior que mulher (CKD-EPI 2021 sem fator raça)', () => {
    // Na CKD-EPI 2021: mulher κ=0.7, α=-0.241; homem κ=0.9, α=-0.302.
    // Para Cr=1.0 (acima de κ em ambos), o expoente negativo de max(Cr/κ,1)^(-1.2)
    // é mais favorável ao homem (κ maior → ratio menor). O fator feminino 1.012
    // não compensa — homem tem TFGe maior para mesma creatinina.
    // Verificado numericamente: FEMALE=68.6, MALE=91.7 (Cr=1.0, 50 anos).
    const tfgF = calcTFGe(1.0, 50, 'FEMALE')
    const tfgM = calcTFGe(1.0, 50, 'MALE')
    expect(tfgF).not.toBeNull()
    expect(tfgM).not.toBeNull()
    expect(tfgM!).toBeGreaterThan(tfgF!)
  })

  it('homem 65 anos, creatinina 2.0 → TFGe em torno de G3b (~35)', () => {
    const tfg = calcTFGe(2.0, 65, 'MALE')
    expect(tfg).not.toBeNull()
    expect(tfg!).toBeGreaterThan(25)
    expect(tfg!).toBeLessThan(45)
  })

  it('mulher 70 anos, creatinina 3.5 → TFGe em G4 (<30)', () => {
    const tfg = calcTFGe(3.5, 70, 'FEMALE')
    expect(tfg).not.toBeNull()
    expect(tfg!).toBeLessThan(30)
    expect(tfg!).toBeGreaterThan(5)
  })

  it('creatinina muito alta → TFGe G5 (<15)', () => {
    const tfg = calcTFGe(8.0, 60, 'MALE')
    expect(tfg).not.toBeNull()
    expect(tfg!).toBeLessThan(15)
  })

  it('creatinina baixíssima → TFGe alta (>100), renal saudável', () => {
    const tfg = calcTFGe(0.6, 30, 'FEMALE')
    expect(tfg).not.toBeNull()
    expect(tfg!).toBeGreaterThan(100)
  })

  // ── Casos limítrofes / inputs inválidos ────────────────────────────────────

  it('creatinina zero → retorna null', () => {
    expect(calcTFGe(0, 50, 'MALE')).toBeNull()
  })

  it('creatinina negativa → retorna null', () => {
    expect(calcTFGe(-1, 50, 'MALE')).toBeNull()
  })

  it('idade zero → retorna null', () => {
    expect(calcTFGe(1.0, 0, 'MALE')).toBeNull()
  })

  it('NaN como creatinina → retorna null', () => {
    expect(calcTFGe(NaN, 50, 'MALE')).toBeNull()
  })

  it('resultado é arredondado para 1 casa decimal', () => {
    const tfg = calcTFGe(1.2, 55, 'MALE')
    expect(tfg).not.toBeNull()
    // Verifica que tem no máximo 1 casa decimal
    expect(String(tfg!).split('.').at(1)?.length ?? 0).toBeLessThanOrEqual(1)
  })

  // ── Monotonia: TFGe decresce com creatinina crescente ────────────────────

  it('TFGe decresce à medida que a creatinina aumenta (homem 60 anos)', () => {
    const vals = [0.8, 1.2, 1.8, 2.5, 4.0].map(cr => calcTFGe(cr, 60, 'MALE')!)
    for (let i = 1; i < vals.length; i++) {
      expect(vals[i]).toBeLessThan(vals[i - 1])
    }
  })

  it('TFGe decresce com a idade para mesma creatinina (mulher, cr=1.0)', () => {
    const vals = [30, 45, 60, 75].map(idade => calcTFGe(1.0, idade, 'FEMALE')!)
    for (let i = 1; i < vals.length; i++) {
      expect(vals[i]).toBeLessThan(vals[i - 1])
    }
  })
})

describe('calcIdade', () => {
  it('calcula idade corretamente a partir de string ISO', () => {
    const hoje = new Date()
    const nascimento = new Date(hoje.getFullYear() - 40, hoje.getMonth(), hoje.getDate())
    const idade = calcIdade(nascimento.toISOString())
    expect(idade).toBe(40)
  })

  it('calcula idade corretamente a partir de objeto Date', () => {
    const hoje = new Date()
    const nascimento = new Date(hoje.getFullYear() - 30, hoje.getMonth() - 1, 1)
    const idade = calcIdade(nascimento)
    expect(idade).toBeGreaterThanOrEqual(30)
  })

  it('aniversário ainda não chegou neste ano — subtrai 1', () => {
    const hoje = new Date()
    // Nascimento no futuro deste ano → ainda não fez aniversário
    const nascimento = new Date(hoje.getFullYear() - 25, hoje.getMonth() + 1, 1)
    const idade = calcIdade(nascimento.toISOString())
    expect(idade).toBe(24)
  })
})
