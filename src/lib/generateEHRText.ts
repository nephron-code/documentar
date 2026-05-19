// Escriba determinístico — zero LLM, apenas template literals e lógica pura.

export type PatientData = {
  name: string
  birthDate: Date
  sex: 'MALE' | 'FEMALE'
  diagnosis: string
  ckdStage?: string | null
  albuminuria?: string | null
  comorbidities: string[]
  /** Medicamentos — array de strings simples (ex: "Losartana 50mg 1x/dia") */
  medications?: string[]
  etiology?: string | null
}

export type EvolutionData = {
  consultationDate: Date
  bloodPressure?: string | null
  weight?: number | null
  chiefComplaint?: string | null
  clinicalNote?: string | null
  conductText?: string | null
}

export type LabResultData = {
  examType: string
  value: number
  unit?: string | null
  examDate: Date
}

const DIAGNOSIS_LABEL: Record<string, string> = {
  DRC: 'Doença Renal Crônica',
  HAS_NEFROSCLEROSE: 'HAS / Nefrosclerose',
  NEFROPATIA_DIABETICA: 'Nefropatia Diabética',
  GLOMERULOPATIA: 'Glomerulopatia',
  NEFROLITIASE: 'Nefrolitíase',
  CONSULTA_GERAL: 'Consulta Geral de Nefrologia',
}

// Abreviatura usada na linha compacta do prontuário
const EXAM_ABBREV: Record<string, string> = {
  creatinina: 'Cr',
  ureia: 'Ur',
  tfg: 'TFGe',
  acido_urico: 'AcUr',
  sodio: 'Na',
  potassio: 'K',
  calcio: 'Ca',
  fosforo: 'P',
  microalbuminuria: 'ACR',
  hemoglobina: 'Hb',
  hematocrito: 'Ht',
  reticulocitos: 'Retic',
  ferro: 'Fe',
  ferritina: 'Ferrit',
  tsat: 'TSAT',
  pth: 'PTH',
  vitamina_d: 'VitD',
  glicose: 'Gli',
  hba1c: 'HbA1c',
  colesterol: 'CT',
  ldl: 'LDL',
  hdl: 'HDL',
  triglicerides: 'TG',
  tsh: 'TSH',
  ft4: 'T4L',
}

// Unidades de cada exame — usadas na linha de exames mais recentes
const EXAM_UNIT: Record<string, string> = {
  creatinina: 'mg/dL',
  ureia: 'mg/dL',
  tfg: 'mL/min/1,73m²',
  acido_urico: 'mg/dL',
  sodio: 'mEq/L',
  potassio: 'mEq/L',
  calcio: 'mg/dL',
  fosforo: 'mg/dL',
  microalbuminuria: 'mg/g',
  hemoglobina: 'g/dL',
  hematocrito: '%',
  reticulocitos: '%',
  ferro: 'µg/dL',
  ferritina: 'ng/mL',
  tsat: '%',
  pth: 'pg/mL',
  vitamina_d: 'ng/mL',
  glicose: 'mg/dL',
  hba1c: '%',
  colesterol: 'mg/dL',
  ldl: 'mg/dL',
  hdl: 'mg/dL',
  triglicerides: 'mg/dL',
  tsh: 'µUI/mL',
  ft4: 'ng/dL',
}

// Ordem clínica preferencial
const EXAM_ORDER = [
  'creatinina', 'ureia', 'tfg', 'acido_urico',
  'sodio', 'potassio', 'calcio', 'fosforo',
  'microalbuminuria',
  'hemoglobina', 'hematocrito', 'reticulocitos',
  'ferro', 'ferritina', 'tsat',
  'pth', 'vitamina_d',
  'glicose', 'hba1c',
  'colesterol', 'ldl', 'hdl', 'triglicerides',
  'tsh', 'ft4',
]

function calcAge(birthDate: Date): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function fmt(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

function fmtVal(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toLocaleString('pt-BR')
}

/**
 * Retorna o registro mais recente de cada tipo de exame.
 * Usado para gerar a linha "Últimos exames" no topo da evolução.
 */
function getLatestByType(labResults: LabResultData[]): Map<string, LabResultData> {
  const latest = new Map<string, LabResultData>()
  for (const lr of labResults) {
    const key = lr.examType.toLowerCase()
    const existing = latest.get(key)
    if (!existing || new Date(lr.examDate) > new Date(existing.examDate)) {
      latest.set(key, lr)
    }
  }
  return latest
}

/**
 * Linha compacta com os últimos valores de cada exame.
 * Formato: "Cr 1,2  TFGe 45  K 5,1  ACR 180  Hb 10,5"
 */
function formatLatestExams(labResults: LabResultData[]): string {
  if (labResults.length === 0) return '  Sem exames registrados'
  const latest = getLatestByType(labResults)
  const sorted = EXAM_ORDER
    .filter(k => latest.has(k))
    .map(k => {
      const lr = latest.get(k)!
      const abbrev = EXAM_ABBREV[k] ?? k
      return `${abbrev} ${fmtVal(lr.value)}`
    })
  return `  ${sorted.join('  ')}`
}

/**
 * Histórico laboratorial cronológico — uma linha por data de coleta.
 * Formato: "  12/05/2026: Cr 1,2  Ur 65  TFGe 34  Na 136  K 4,5 ..."
 */
function formatLabHistory(labResults: LabResultData[]): string {
  if (labResults.length === 0) return '  Sem resultados registrados.'

  const byDate = new Map<string, LabResultData[]>()
  for (const lr of labResults) {
    const dateKey = fmt(new Date(lr.examDate))
    if (!byDate.has(dateKey)) byDate.set(dateKey, [])
    byDate.get(dateKey)!.push(lr)
  }

  const sortedDates = [...byDate.keys()].sort((a, b) => {
    const [da, ma, ya] = a.split('/').map(Number)
    const [db, mb, yb] = b.split('/').map(Number)
    return new Date(yb, mb - 1, db).getTime() - new Date(ya, ma - 1, da).getTime()
  })

  const lines = sortedDates.map(date => {
    const results = byDate.get(date)!
    const sorted = [...results].sort((a, b) => {
      const ia = EXAM_ORDER.indexOf(a.examType.toLowerCase())
      const ib = EXAM_ORDER.indexOf(b.examType.toLowerCase())
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
    })
    const values = sorted
      .map(r => {
        const abbrev = EXAM_ABBREV[r.examType.toLowerCase()] ?? r.examType
        return `${abbrev} ${fmtVal(r.value)}`
      })
      .join('  ')
    return `  ${date}: ${values}`
  })

  return lines.join('\n')
}

/**
 * Gera o texto estruturado para cópia no prontuário de texto livre.
 *
 * O formato foi desenhado para ser colado em qualquer campo de texto:
 * — Compacto, sem formatação markdown
 * — Seções separadas por traços
 * — Última linha de exames no topo para leitura rápida
 * — Histórico longitudinal abaixo para rastreio de tendência
 */
export function generateEHRText(
  patient: PatientData,
  evolution: EvolutionData,
  labResults: LabResultData[]
): string {
  const age = calcAge(new Date(patient.birthDate))
  const sex = patient.sex === 'MALE' ? 'M' : 'F'
  const diagnosis = DIAGNOSIS_LABEL[patient.diagnosis] ?? patient.diagnosis
  const stadio = [patient.ckdStage, patient.albuminuria].filter(Boolean).join(' / ')
  const comorbidities = patient.comorbidities.length > 0
    ? patient.comorbidities.join(', ')
    : 'Nenhuma'

  // Linha de identificação compacta — otimizada para cópia em prontuários de texto livre
  const idLine = [
    `${age}a/${sex}`,
    diagnosis,
    stadio ? `(${stadio})` : null,
    patient.etiology ? `— ${patient.etiology}` : null,
  ].filter(Boolean).join(' ')

  // Sinais vitais
  const vitals: string[] = []
  if (evolution.bloodPressure) vitals.push(`PA ${evolution.bloodPressure} mmHg`)
  if (evolution.weight) vitals.push(`Peso ${evolution.weight} kg`)

  // Medicamentos — lista de strings simples
  const meds = patient.medications && patient.medications.length > 0
    ? patient.medications.join(', ')
    : null

  // Linha de últimos exames (para referência rápida no topo)
  const latestExamsLine = formatLatestExams(labResults)

  // Histórico longitudinal
  const labHistory = formatLabHistory(labResults)

  const sep = '─'.repeat(50)

  const lines: string[] = []

  lines.push(`EVOLUÇÃO — NefroDoc  |  ${fmt(evolution.consultationDate)}`)
  lines.push(sep)
  lines.push('')
  lines.push(`PACIENTE: ${patient.name}`)
  lines.push(`  ${idLine}`)
  lines.push(`  Comorbidades: ${comorbidities}`)
  if (meds) lines.push(`  Medicamentos: ${meds}`)
  lines.push('')

  if (vitals.length > 0) {
    lines.push(`DADOS DA CONSULTA`)
    lines.push(`  ${vitals.join('   ')}`)
    lines.push('')
  }

  if (evolution.chiefComplaint?.trim()) {
    lines.push(`SUBJETIVO / ANAMNESE`)
    lines.push(`  ${evolution.chiefComplaint.trim().replace(/\n/g, '\n  ')}`)
    lines.push('')
  }

  // Últimos exames — linha compacta no topo para leitura rápida
  if (labResults.length > 0) {
    lines.push(`ÚLTIMOS EXAMES`)
    lines.push(latestExamsLine)
    lines.push('')
  }

  if (evolution.clinicalNote?.trim()) {
    lines.push(`AVALIAÇÃO / IMPRESSÃO CLÍNICA`)
    lines.push(`  ${evolution.clinicalNote.trim().replace(/\n/g, '\n  ')}`)
    lines.push('')
  }

  if (evolution.conductText?.trim()) {
    lines.push(`PLANO / CONDUTA`)
    lines.push(`  ${evolution.conductText.trim().replace(/\n/g, '\n  ')}`)
    lines.push('')
  }

  // Histórico laboratorial longitudinal — ao final para não poluir o início
  if (labResults.length > 0) {
    lines.push(`HISTÓRICO LABORATORIAL (do mais recente ao mais antigo)`)
    lines.push(labHistory)
    lines.push('')
  }

  lines.push(sep)

  return lines.join('\n')
}

/**
 * Versão ultracompacta — apenas os dados essenciais numa única linha.
 * Útil para colar no campo de resumo ou título de consulta em outros sistemas.
 */
export function generateCompactSummary(
  patient: PatientData,
  evolution: EvolutionData,
  labResults: LabResultData[]
): string {
  const age = calcAge(new Date(patient.birthDate))
  const sex = patient.sex === 'MALE' ? 'M' : 'F'
  const stadio = [patient.ckdStage, patient.albuminuria].filter(Boolean).join('/')

  const latest = getLatestByType(labResults)
  const keyExams = ['creatinina', 'tfg', 'potassio', 'hemoglobina', 'microalbuminuria']
    .filter(k => latest.has(k))
    .map(k => {
      const abbrev = EXAM_ABBREV[k] ?? k
      return `${abbrev} ${fmtVal(latest.get(k)!.value)}`
    })
    .join(' | ')

  const vitals = [
    evolution.bloodPressure ? `PA ${evolution.bloodPressure}` : null,
    evolution.weight ? `${evolution.weight}kg` : null,
  ].filter(Boolean).join(' ')

  const parts = [
    `${age}a/${sex}`,
    stadio,
    vitals,
    keyExams,
  ].filter(Boolean)

  return parts.join(' — ')
}
