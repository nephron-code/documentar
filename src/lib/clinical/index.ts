/**
 * Biblioteca clínica determinística — NefroDoc
 *
 * Regra: zero dependências de Next.js, Prisma, React, Supabase ou APIs de browser.
 * Roda em ambiente Node e browser (web, extensão, testes unitários).
 *
 * Módulos:
 *   kdigo              — Classificação KDIGO 2024/2026, matriz de risco, conduta
 *   ckd-epi-2021       — Calculadora TFGe CKD-EPI 2021 (sem fator raça)
 *   examPanels         — Pacotes de exames por frequência/diagnóstico
 *   conductTemplates   — Templates de conduta pré-preenchida por diagnóstico/estágio
 *   macros             — Macros taquigráficas para campos de texto clínico
 *   composeConsultationNote — Geração determinística de nota de consulta
 */

export * from './kdigo'
export * from './ckd-epi-2021'
export * from './examPanels'
export * from './conductTemplates'
export * from './macros'
export * from './composeConsultationNote'
