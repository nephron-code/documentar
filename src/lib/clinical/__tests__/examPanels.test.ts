/**
 * Testes unitários — Pacotes de exames (examPanels.ts)
 *
 * Verifica integridade estrutural dos pacotes: chaves, labels,
 * ausência de abreviaturas proibidas e exames obrigatórios por pacote.
 */

import { describe, it, expect } from 'vitest'
import { EXAM_PACKAGES, getRecommendedPackages, type ExamPackage } from '../examPanels'

// ── Estrutura dos pacotes ────────────────────────────────────────────────────

describe('EXAM_PACKAGES — estrutura', () => {
  it('existe pelo menos 5 pacotes', () => {
    expect(EXAM_PACKAGES.length).toBeGreaterThanOrEqual(5)
  })

  it('todo pacote tem key, label, description e exams', () => {
    for (const pkg of EXAM_PACKAGES) {
      expect(pkg.key, `pacote sem key`).toBeTruthy()
      expect(pkg.label, `${pkg.key} sem label`).toBeTruthy()
      expect(pkg.description, `${pkg.key} sem description`).toBeTruthy()
      expect(pkg.exams, `${pkg.key} sem exams`).toBeInstanceOf(Array)
      expect(pkg.exams.length, `${pkg.key} com exams vazio`).toBeGreaterThan(0)
    }
  })

  it('chaves são únicas', () => {
    const keys = EXAM_PACKAGES.map(p => p.key)
    const unique = new Set(keys)
    expect(unique.size).toBe(keys.length)
  })

  it('pacotes esperados estão presentes', () => {
    const keys = EXAM_PACKAGES.map(p => p.key)
    const esperados = ['rotina', 'semestral', 'drc_avancada']
    for (const k of esperados) {
      expect(keys, `pacote '${k}' ausente`).toContain(k)
    }
  })
})

// ── Regra: sem abreviaturas nos nomes de exames ─────────────────────────────
// AGENTS.md: "Nomes completos nos pedidos de exame. Nunca abreviaturas."

describe('EXAM_PACKAGES — sem abreviaturas proibidas', () => {
  // Abreviaturas que não devem aparecer como itens isolados nos exames
  const abreviaturas = [/^\s*EAS\s*$/i, /^\s*U1\s*$/i, /^\s*HMG\s*$/i, /^\s*CR\s*$/i]

  for (const pkg of EXAM_PACKAGES) {
    it(`pacote '${pkg.key}' não usa abreviaturas proibidas`, () => {
      for (const exame of pkg.exams) {
        for (const re of abreviaturas) {
          expect(exame, `abreviatura encontrada em '${pkg.key}': "${exame}"`).not.toMatch(re)
        }
      }
    })
  }
})

// ── Conteúdo mínimo por pacote ───────────────────────────────────────────────

describe('pacote rotina — conteúdo mínimo', () => {
  const rotina = EXAM_PACKAGES.find(p => p.key === 'rotina')!

  it('existe', () => expect(rotina).toBeDefined())

  it('inclui creatinina', () => {
    const texto = rotina.exams.join(' ').toLowerCase()
    expect(texto).toMatch(/creatinina/)
  })

  it('inclui ureia', () => {
    const texto = rotina.exams.join(' ').toLowerCase()
    expect(texto).toMatch(/ureia/)
  })

  it('inclui potássio', () => {
    const texto = rotina.exams.join(' ').toLowerCase()
    expect(texto).toMatch(/potássio/)
  })

  it('inclui sumário de urina (não EAS)', () => {
    const texto = rotina.exams.join(' ').toLowerCase()
    expect(texto).toMatch(/sumário de urina|urina/)
    expect(texto).not.toMatch(/\beas\b/)
  })
})

describe('pacote drc_avancada — inclui exames de DRC avançada', () => {
  const pkg = EXAM_PACKAGES.find(p => p.key === 'drc_avancada')!

  it('existe', () => expect(pkg).toBeDefined())

  it('inclui hemograma (anemia renal)', () => {
    const texto = pkg.exams.join(' ').toLowerCase()
    expect(texto).toMatch(/hemograma/)
  })

  it('inclui PTH (metabolismo ósseo)', () => {
    const texto = pkg.exams.join(' ').toLowerCase()
    expect(texto).toMatch(/pth|paratormônio/)
  })

  it('inclui fósforo', () => {
    const texto = pkg.exams.join(' ').toLowerCase()
    expect(texto).toMatch(/fósforo/)
  })
})

// ── getRecommendedPackages ───────────────────────────────────────────────────

describe('getRecommendedPackages', () => {
  it('retorna array para diagnóstico DRC', () => {
    const pkgs = getRecommendedPackages('DRC', 'G3a')
    expect(pkgs).toBeInstanceOf(Array)
    expect(pkgs.length).toBeGreaterThan(0)
  })

  it('DRC G4/G5 inclui pacote drc_avancada', () => {
    const pkgsG4 = getRecommendedPackages('DRC', 'G4')
    const keys = pkgsG4.map(p => p.key)
    expect(keys).toContain('drc_avancada')
  })

  it('DRC G1 não recomenda drc_avancada', () => {
    const pkgsG1 = getRecommendedPackages('DRC', 'G1')
    const keys = pkgsG1.map(p => p.key)
    expect(keys).not.toContain('drc_avancada')
  })

  it('diagnóstico desconhecido retorna pelo menos rotina', () => {
    const pkgs = getRecommendedPackages('DIAGNOSTICO_INEXISTENTE', null)
    const keys = pkgs.map(p => p.key)
    expect(keys).toContain('rotina')
  })

  it('nefropatia diabética inclui pacote com HbA1c', () => {
    const pkgs = getRecommendedPackages('NEFROPATIA_DIABETICA', 'G2')
    const todosExames = pkgs.flatMap(p => p.exams).join(' ').toLowerCase()
    expect(todosExames).toMatch(/hba1c|hemoglobina glicada/)
  })
})
