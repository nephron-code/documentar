/**
 * Templates de conduta pré-preenchida por diagnóstico e estadiamento CKD.
 *
 * Baseados em:
 * - KDIGO 2026 (DRC)
 * - ADA 2024 (Diabetes / Nefropatia Diabética)
 * - ACC/AHA 2019 + SBC 2020 (Lipídeos / HAS)
 * - AUA/EAU 2023 (Nefrolitíase)
 * - KDIGO GN 2021 (Glomerulopatia)
 *
 * Regra: texto determinístico, sem IA. O médico edita após inserir.
 * Todos os textos usam linguagem clínica concisa, prontos para prontuário.
 */

import type { GStage } from './kdigo'

type DiagnosisKey =
  | 'DRC'
  | 'HAS_NEFROSCLEROSE'
  | 'NEFROPATIA_DIABETICA'
  | 'GLOMERULOPATIA'
  | 'NEFROLITIASE'
  | 'CONSULTA_GERAL'

// ── Templates por estágio G (para diagnósticos com DRC) ───────────────────

const DRC_BY_STAGE: Record<GStage, string> = {
  G1: `- Controle pressórico rigoroso: alvo PA < 130/80 mmHg (KDIGO 2026).
- IECA ou BRA: manter se proteinúria presente, avaliar tolerância.
- Restrição de sódio: < 2 g/dia (< 5 g de sal).
- Atividade física regular: 150 min/semana (exercício aeróbico moderado).
- Manter IMC < 25 kg/m² — orientar perda de peso se sobrepeso.
- Investigar e tratar causa da DRC.
- Retorno em 12 meses com exames (função renal, eletrólitos, ACR).`,

  G2: `- Controle pressórico: alvo PA < 130/80 mmHg.
- IECA ou BRA: primeira linha se ACR > 30 mg/g.
- iSGLT2 (dapagliflozina/empagliflozina): considerar se ACR ≥ 200 mg/g ou DM2 concomitante.
- Restrição de sódio: < 2 g/dia. Dieta hipoproteica leve (0,8 g/kg/dia).
- Cessar tabagismo. Atividade física regular.
- Rastrear e tratar dislipidemia (alvo LDL < 70 mg/dL em alto risco).
- Retorno em 12 meses com exames.`,

  G3a: `- Controle pressórico: alvo PA < 130/80 mmHg.
- IECA ou BRA + iSGLT2: dupla nefroproteção se ACR ≥ 200 mg/g.
- Finerenona: considerar se DM2 + ACR persistentemente elevada sob IECA/BRA.
- Investigar e corrigir anemia (Hb alvo 10–11,5 g/dL se eritropoetina necessária).
- Rastrear distúrbio mineral-ósseo: Ca, P, PTH, 25-OH Vit D.
- Dieta hipoproteica (0,6–0,8 g/kg/dia) e hipopotassêmica se K+ elevado.
- Avaliar necessidade de bicarbonato de sódio se HCO₃ < 22 mEq/L.
- Retorno em 6 meses com exames.`,

  G3b: `- Controle pressórico: alvo PA < 130/80 mmHg. Evitar AINES e contrastes iodados.
- IECA ou BRA: monitorar K+ e creatinina (aceitar elevação de até 30% na creatinina).
- iSGLT2: manter se TFG ≥ 25 mL/min; suspender eletivamente se TFG < 25.
- Anemia: avaliar ferro (TSAT, ferritina); iniciar eritropoetina se Hb < 10 g/dL refratária.
- Distúrbio mineral-ósseo: corrigir vitamina D, controlar fósforo, avaliar PTH.
- Acidose metabólica: bicarbonato se HCO₃ < 22 mEq/L (2–3 cp 650 mg 8/8h).
- Dieta hipoproteica (0,6 g/kg/dia) com suporte nutricional.
- Discutir planejamento para terapia renal substitutiva (TRS) a médio prazo.
- Retorno em 3–4 meses com exames.`,

  G4: `- Controle pressórico intensivo: alvo PA < 130/80 mmHg.
- Suspender metformina. Ajustar doses de medicamentos à função renal.
- Anemia renal: eritropoetina + reposição de ferro (preferir IV se TSAT < 20%).
- Distúrbio mineral-ósseo: controlar P com quelantes (carbonato de cálcio ou sevelamer), corrigir vitamina D, tratar hiperparatireoidismo secundário.
- Acidose metabólica: bicarbonato de sódio oral (alvo HCO₃ > 22 mEq/L).
- Iniciar preparo para TRS: avaliar acesso vascular (fístula AV), peritoneal ou transplante.
- Encaminhar para cirurgia vascular para confecção de FAV se hemodiálise planejada.
- Educação em saúde renal: dieta, restrição hídrica, controle de peso.
- Retorno em 2–3 meses com exames.`,

  G5: `- Avaliação urgente para início de terapia renal substitutiva (TRS).
- Critérios para TRS: uremia sintomática, hipercalemia refratária, acidose grave, sobrecarga de volume.
- Verificar patência do acesso vascular (FAV/cateter).
- Suspender IECA/BRA se hipercalemia grave ou hipovolemia.
- Controle rigoroso de fósforo, potássio e sódio — restrição dietética máxima.
- Eritropoetina + ferro IV para manter Hb 10–11 g/dL.
- Evitar nefrotóxicos, contrastes e AINES.
- Retorno em 4–6 semanas ou antes se deterioração clínica.`,
}

// ── Templates por diagnóstico específico ─────────────────────────────────

const DIAGNOSIS_TEMPLATES: Partial<Record<DiagnosisKey, string>> = {
  HAS_NEFROSCLEROSE: `- Controle pressórico: alvo PA < 130/80 mmHg (ACC/AHA 2019 / SBC 2020).
- Esquema anti-hipertensivo: IECA ou BRA + bloqueador de canal de cálcio ± diurético tiazídico.
- Monitorização domiciliar da pressão arterial (MAPA se disponível).
- Restrição de sódio: < 2 g/dia. Atividade física regular. Cessação do tabagismo.
- Rastrear proteinúria (ACR): se ACR > 30 mg/g, otimizar bloqueio do SRAA.
- Considerar iSGLT2 se ACR ≥ 200 mg/g ou risco cardiovascular alto.
- Rastrear e tratar dislipidemia: alvo LDL < 70 mg/dL (alto risco CV).
- Retorno em 3–6 meses com exames.`,

  NEFROPATIA_DIABETICA: `- Controle glicêmico: alvo HbA1c < 7% (individualizar: < 8% em idosos/comórbidos).
- iSGLT2 (dapagliflozina 10mg ou empagliflozina 10mg): primeira linha nefroprotetora se TFG ≥ 25.
- IECA ou BRA: manter; monitorar K+ e creatinina.
- Finerenona: adicionar se ACR persistentemente elevada sob IECA/BRA + iSGLT2.
- GLP-1 (semaglutida/liraglutida): considerar se IMC > 30 ou doença cardiovascular estabelecida.
- Controle pressórico: alvo PA < 130/80 mmHg.
- Alvo LDL < 70 mg/dL; estatina de alta intensidade (atorvastatina 40–80 mg).
- Rastrear complicações microvasculares: neuropatia, retinopatia (oftalmologista anual).
- Suspender metformina se TFG < 30 mL/min.
- Retorno em 3 meses com exames (HbA1c, função renal, ACR).`,

  GLOMERULOPATIA: `- Aguardar resultado de biópsia renal / confirmar diagnóstico histológico.
- Controle pressórico: alvo PA < 125/75 mmHg se proteinúria > 1 g/dia.
- IECA ou BRA: máxima dose tolerada para redução de proteinúria.
- Avaliar indicação de imunossupressão conforme diagnóstico histológico (KDIGO GN 2021).
- Monitorizar efeitos colaterais da imunossupressão.
- Dieta hipossódica e normoproteica.
- Rastrear trombose (risco elevado em síndrome nefrótica): se albumina < 2,5 g/dL, avaliar anticoagulação.
- Retorno em 4–6 semanas com exames (proteinúria 24h ou ACR, albumina, função renal).`,

  NEFROLITIASE: `- Hidratação oral: alvo diurese > 2,5 L/dia (8–10 copos de água).
- Dieta hipossódica (< 2 g/dia de sódio) e normoproteica (0,8–1 g/kg/dia).
- Evitar excesso de proteína animal e oxalato (AUA/EAU 2023).
- Investigação metabólica: cálcio, ácido úrico, oxalúria, citratúria, pH urinário (urina 24h).
- Citrato de potássio: se hipocitraturía ou litíase úrica (alvo pH urinário 6,5–7,0).
- Alopurinol: se hiperuricosúria ou litíase úrica persistente.
- Tiazídico: se hipercalciúria idiopática.
- Solicitar imagem: USG ou TC de abdome/pelve sem contraste para avaliar cálculos residuais.
- Encaminhar à urologia se cálculo > 6 mm, cólica refratária ou hidronefrose.
- Retorno em 3–6 meses com exames e nova imagem.`,

  CONSULTA_GERAL: `- Revisão de exames laboratoriais e clínica geral.
- Orientações individualizadas conforme achados da consulta.
- Manter acompanhamento regular.
- Retorno conforme necessidade clínica com exames.`,
}

// ── Função principal ──────────────────────────────────────────────────────

/**
 * Retorna o template de conduta adequado ao diagnóstico e estadiamento.
 *
 * Para diagnósticos com DRC (DRC pura), usa o template específico por estágio G.
 * Para os demais diagnósticos, usa o template por diagnóstico (com complemento por estágio se G3+).
 */
export function getConductTemplate(
  diagnosisKey: DiagnosisKey | string,
  ckdStage?: string | null,
): string {
  const gStage = ckdStage as GStage | undefined

  // DRC pura — template inteiramente baseado no estágio
  if (diagnosisKey === 'DRC') {
    if (gStage && DRC_BY_STAGE[gStage]) {
      return DRC_BY_STAGE[gStage]
    }
    return DRC_BY_STAGE['G2'] // fallback se não classificado
  }

  // Outros diagnósticos — template específico
  const base = DIAGNOSIS_TEMPLATES[diagnosisKey as DiagnosisKey]
  if (!base) return ''

  // Para nefropatia diabética e HAS com DRC avançada (G3b+), acrescenta nota sobre TRS
  if (
    gStage &&
    ['G3b', 'G4', 'G5'].includes(gStage) &&
    (diagnosisKey === 'NEFROPATIA_DIABETICA' || diagnosisKey === 'HAS_NEFROSCLEROSE')
  ) {
    const trsNote: Record<string, string> = {
      G3b: '\n- DRC G3b concomitante: discutir planejamento de TRS a médio prazo.',
      G4:  '\n- DRC G4 concomitante: iniciar preparo para TRS (avaliação de acesso vascular). Encaminhar cirurgia vascular.',
      G5:  '\n- DRC G5 concomitante: avaliar início urgente de TRS.',
    }
    return base + (trsNote[gStage] ?? '')
  }

  return base
}
