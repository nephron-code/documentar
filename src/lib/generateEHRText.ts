// Escriba determinístico — zero LLM, apenas template literals e lógica pura.

export type PatientData = {
  name: string
  birthDate: Date
  sex: 'MALE' | 'FEMALE'
  diagnosis: string
  ckdStage?: string | null
  albuminuria?: string | null
  comorbidities: string[]
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
  tfg: 'TFG',
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
  colesterol: 'Col',
  ldl: 'LDL',
  hdl: 'HDL',
  triglicerides: 'TG',
  tsh: 'TSH',
  ft4: 'T4L',
}

// Nome completo usado no histórico expandido (se necessário)
const EXAM_LABEL: Record<string, string> = {
  creatinina: 'Creatinina',
  ureia: 'Ureia',
  potassio: 'Potássio',
  sodio: 'Sódio',
  calcio: 'Cálcio',
  fosforo: 'Fósforo',
  acido_urico: 'Ácido úrico',
  hemoglobina: 'Hemoglobina',
  hematocrito: 'Hematócrito',
  ferritina: 'Ferritina',
  ferro: 'Ferro sérico',
  tsat: 'Saturação de transferrina',
  transferrina: 'Transferrina',
  reticulocitos: 'Reticulócitos',
  pth: 'PTH',
  vitamina_d: '25-OH Vitamina D',
  microalbuminuria: 'Microalbuminúria (ACR)',
  glicose: 'Glicose',
  hba1c: 'Hemoglobina glicada',
  colesterol: 'Colesterol total',
  ldl: 'LDL',
  hdl: 'HDL',
  triglicerides: 'Triglicérides',
  tsh: 'TSH',
  ft4: 'T4 livre',
  tfg: 'TFG estimada (CKD-EPI)',
}

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

function formatLabHistory(labResults: LabResultData[]): string {
  if (labResults.length === 0) return '  Sem resultados registrados.'

  // Agrupa por DATA de exame
  const byDate = new Map<string, LabResultData[]>()
  for (const lr of labResults) {
    const dateKey = fmt(new Date(lr.examDate))
    if (!byDate.has(dateKey)) byDate.set(dateKey, [])
    byDate.get(dateKey)!.push(lr)
  }

  // Ordena as datas de forma decrescente
  const sortedDates = [...byDate.keys()].sort((a, b) => {
    const [da, ma, ya] = a.split('/').map(Number)
    const [db, mb, yb] = b.split('/').map(Number)
    return new Date(yb, mb - 1, db).getTime() - new Date(ya, ma - 1, da).getTime()
  })

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

  // Uma linha por data: "12/05/2026: Cr 1,2  Ur 65  TFG 34  Na 136  K 4,5 ..."
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
        const val = Number.isInteger(r.value) ? r.value : r.value.toLocaleString('pt-BR')
        return `${abbrev} ${val}`
      })
      .join('  ')
    return `  ${date}: ${values}`
  })

  return lines.join('\n')
}

export function generateEHRText(
  patient: PatientData,
  evolution: EvolutionData,
  labResults: LabResultData[]
): string {
  const age = calcAge(new Date(patient.birthDate))
  const sex = patient.sex === 'MALE' ? 'Masculino' : 'Feminino'
  const diagnosis = DIAGNOSIS_LABEL[patient.diagnosis] ?? patient.diagnosis
  const stadio = [patient.ckdStage, patient.albuminuria].filter(Boolean).join(' / ')
  const comorbidities = patient.comorbidities.length > 0
    ? patient.comorbidities.join(', ')
    : 'Nenhuma registrada'

  const vitalSigns = [
    evolution.bloodPressure ? `PA: ${evolution.bloodPressure} mmHg` : null,
    evolution.weight ? `Peso: ${evolution.weight} kg` : null,
  ].filter(Boolean).join('   ')

  const labHistory = formatLabHistory(labResults)

  return `
EVOLUÇÃO CLÍNICA — NefroDoc
Data: ${fmt(evolution.consultationDate)}
${'─'.repeat(48)}

IDENTIFICAÇÃO
  Paciente: ${patient.name}
  Idade: ${age} anos   Sexo: ${sex}
  Diagnóstico: ${diagnosis}${stadio ? `   Estadio: ${stadio}` : ''}
  Comorbidades: ${comorbidities}

DADOS VITAIS
  ${vitalSigns || 'Não registrados'}

HISTÓRICO LABORATORIAL
${labHistory}

IMPRESSÃO CLÍNICA
  ${evolution.clinicalNote?.trim() || 'Não registrada'}

CONDUTA
  ${evolution.conductText?.trim() || 'Não registrada'}

${'─'.repeat(48)}
`.trim()
}