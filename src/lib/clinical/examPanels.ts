/**
 * Pacotes de exames por frequência clínica — NefroDoc
 * Baseado nas diretrizes KDIGO 2026, ADA 2024, ACC/AHA 2019, SBC 2020, SBD 2024.
 * Nomes completos, sem abreviaturas. Zero LLM — definições estáticas determinísticas.
 */

// ── Tipos ──────────────────────────────────────────────────────────────────

export type ExamPackage = {
  /** Chave interna */
  key: string
  /** Label exibido no dropdown */
  label: string
  /** Descrição curta da frequência/indicação */
  description: string
  /** Lista plana de exames (nomes completos) */
  exams: string[]
}

// ── Blocos reutilizáveis ────────────────────────────────────────────────────

const FUNCAO_RENAL = [
  'Ureia',
  'Creatinina (com TFG estimada por CKD-EPI)',
  'Ácido úrico',
]

const ELETROLITOS = [
  'Sódio',
  'Potássio',
  'Cálcio',
  'Fósforo',
]

const PROTEINURIA = [
  'Microalbuminúria em amostra isolada',
  'Creatinina urinária em amostra isolada',
  'Relação albumina/creatinina',
]

const SUMARIO_URINA = ['Sumário de urina']

const HEMOGRAMA_FERRO = [
  'Hemograma completo',
  'Ferro sérico',
  'Ferritina',
  'Saturação de transferrina',
]

const METABOLISMO_OSSEO = [
  'Paratormônio intacto (PTH)',
  '25-Hidroxivitamina D',
  'Fosfatase alcalina',
]

const LIPIDOGRAMA = [
  'Colesterol total',
  'LDL colesterol',
  'HDL colesterol',
  'Triglicérides',
]

const HBA1C = ['Hemoglobina glicada (HbA1c)']

const GLICOSE = ['Glicose de jejum']

const TIREOIDE = [
  'TSH (hormônio tireoestimulante)',
  'T4 livre',
]

const SOROLOGIAS_GLOMERULO = [
  'FAN (fator antinuclear)',
  'Anti-DNA dupla fita',
  'Complemento C3 e C4',
  'ANCA (PR3 e MPO)',
  'Anti-MBG (antimembrana basal glomerular)',
  'Imunoeletroforese sérica e urinária',
  'Hepatite B (HBsAg, Anti-HBs, Anti-HBc)',
  'Hepatite C (Anti-HCV)',
  'HIV',
  'VDRL',
]

const URINA_24H_LITIASE = [
  'Sódio urinário (24 horas)',
  'Cálcio urinário (24 horas)',
  'Ácido úrico urinário (24 horas)',
  'Oxalato urinário (24 horas)',
  'Citrato urinário (24 horas)',
  'Creatinina urinária (24 horas)',
  'Volume urinário (24 horas)',
]

const BASICO_LITIASE = [
  'Ureia',
  'Creatinina',
  'Ácido úrico',
  'Cálcio',
  'Fósforo',
  'Paratormônio intacto (PTH)',
  '25-Hidroxivitamina D',
  'Sódio',
  'Potássio',
]

// ── Pacotes por frequência clínica ────────────────────────────────────────

export const EXAM_PACKAGES: ExamPackage[] = [

  {
    key: 'rotina',
    label: 'Rotina — consulta de seguimento',
    description: 'Cada consulta — função renal, eletrólitos, proteinúria, sumário de urina, hemograma',
    exams: [
      ...FUNCAO_RENAL,
      ...ELETROLITOS,
      ...PROTEINURIA,
      ...SUMARIO_URINA,
      ...HEMOGRAMA_FERRO,
    ],
  },

  {
    key: 'semestral',
    label: 'Semestral — rotina + lipídeos',
    description: 'A cada 6 meses — inclui lipidograma (ACC/AHA, SBC: alvo LDL em DRC)',
    exams: [
      ...FUNCAO_RENAL,
      ...ELETROLITOS,
      ...PROTEINURIA,
      ...SUMARIO_URINA,
      ...HEMOGRAMA_FERRO,
      ...LIPIDOGRAMA,
    ],
  },

  {
    key: 'trimestral_dm',
    label: 'Trimestral — rotina + HbA1c (diabéticos)',
    description: 'A cada 3 meses — HbA1c para diabéticos (ADA 2024, SBD 2024)',
    exams: [
      ...FUNCAO_RENAL,
      ...ELETROLITOS,
      ...PROTEINURIA,
      ...SUMARIO_URINA,
      ...HEMOGRAMA_FERRO,
      ...GLICOSE,
      ...HBA1C,
    ],
  },

  {
    key: 'semestral_dm',
    label: 'Semestral — rotina + HbA1c + lipídeos (diabéticos)',
    description: 'A cada 6 meses — controle glicêmico e lipídico em diabéticos (ADA + SBC)',
    exams: [
      ...FUNCAO_RENAL,
      ...ELETROLITOS,
      ...PROTEINURIA,
      ...SUMARIO_URINA,
      ...HEMOGRAMA_FERRO,
      ...GLICOSE,
      ...HBA1C,
      ...LIPIDOGRAMA,
    ],
  },

  {
    key: 'anual_completo',
    label: 'Anual — painel completo',
    description: 'Anual — metabolismo ósseo, tireoide, metabólico completo (KDIGO)',
    exams: [
      ...FUNCAO_RENAL,
      ...ELETROLITOS,
      ...PROTEINURIA,
      ...SUMARIO_URINA,
      ...HEMOGRAMA_FERRO,
      ...METABOLISMO_OSSEO,
      ...GLICOSE,
      ...HBA1C,
      ...LIPIDOGRAMA,
      ...TIREOIDE,
    ],
  },

  {
    key: 'drc_avancada',
    label: 'DRC avançada (G4–G5) — cada consulta',
    description: 'G4–G5: monitoramento frequente de metabolismo mineral e anemia (KDIGO 2026)',
    exams: [
      ...FUNCAO_RENAL,
      ...ELETROLITOS,
      ...PROTEINURIA,
      ...SUMARIO_URINA,
      ...HEMOGRAMA_FERRO,
      ...METABOLISMO_OSSEO,
    ],
  },

  {
    key: 'glomerulopatia',
    label: 'Glomerulopatia — investigação inicial',
    description: 'Proteinúria quantificada + sorologias imunológicas (KDIGO GN 2021)',
    exams: [
      ...FUNCAO_RENAL,
      ...ELETROLITOS,
      'Microalbuminúria em amostra isolada',
      'Creatinina urinária em amostra isolada',
      'Relação albumina/creatinina',
      'Proteína total urinária em amostra isolada',
      'Relação proteína/creatinina urinária',
      'Proteinúria em urina de 24 horas',
      ...SUMARIO_URINA,
      ...HEMOGRAMA_FERRO,
      ...SOROLOGIAS_GLOMERULO,
    ],
  },

  {
    key: 'nefrolitiase',
    label: 'Nefrolitíase — investigação metabólica',
    description: 'Urina de 24h para cálcio, oxalato, citrato, ácido úrico (AUA/EAU 2023)',
    exams: [
      ...BASICO_LITIASE,
      ...SUMARIO_URINA,
      ...URINA_24H_LITIASE,
    ],
  },
]

/**
 * Retorna a lista de exames de um pacote pela chave.
 */
export function getExamsByPackageKey(key: string): string[] {
  return EXAM_PACKAGES.find(p => p.key === key)?.exams ?? []
}

/**
 * Recomenda pacotes de exames com base no diagnóstico e estágio CKD.
 *
 * Sempre inclui 'rotina'. Acrescenta pacotes adicionais conforme diagnóstico/estágio.
 * Retorna array de ExamPackage prontos para exibição no dropdown.
 */
export function getRecommendedPackages(
  diagnosisKey: string,
  ckdStage: string | null | undefined,
): ExamPackage[] {
  const keys: string[] = ['rotina']

  // DRC avançada (G4, G5) — monitoramento mineral e anemia mais frequente
  if (ckdStage && ['G4', 'G5'].includes(ckdStage)) {
    keys.push('drc_avancada')
  }

  // Diabéticos — HbA1c trimestral ou semestral com lipídeos
  if (
    diagnosisKey === 'NEFROPATIA_DIABETICA' ||
    diagnosisKey === 'DM2_DRC'
  ) {
    keys.push('semestral_dm')
  } else {
    // Para não-diabéticos, lipidograma semestral
    keys.push('semestral')
  }

  // Glomerulopatia — sorologias imunológicas
  if (diagnosisKey === 'GLOMERULOPATIA') {
    keys.push('glomerulopatia')
  }

  // Nefrolitíase — investigação metabólica urina 24h
  if (diagnosisKey === 'NEFROLITIASE') {
    keys.push('nefrolitiase')
  }

  // Remove duplicatas preservando ordem
  const uniqueKeys = [...new Set(keys)]
  return uniqueKeys
    .map(k => EXAM_PACKAGES.find(p => p.key === k))
    .filter((p): p is ExamPackage => p !== undefined)
}
