// Folha de saída para o paciente — linguagem simples, sem jargão clínico.
// Zero LLM, apenas template literals determinísticos.

const DIAGNOSIS_LABEL: Record<string, string> = {
  DRC: 'Doença Renal Crônica',
  HAS_NEFROSCLEROSE: 'Hipertensão / Nefrosclerose',
  NEFROPATIA_DIABETICA: 'Nefropatia Diabética',
  GLOMERULOPATIA: 'Glomerulopatia',
  NEFROLITIASE: 'Cálculos Renais (Pedras nos Rins)',
  CONSULTA_GERAL: 'Nefrologia',
}

const ALERT_SIGNS: Record<string, string[]> = {
  DRC: [
    'Pressão arterial acima de 180/110 que não cede com os remédios',
    'Inchaço súbito nas pernas, pés ou rosto',
    'Urina muito reduzida de um dia para o outro',
    'Confusão mental, sonolência excessiva',
    'Dor no peito ou falta de ar',
  ],
  HAS_NEFROSCLEROSE: [
    'Pressão arterial acima de 180/110 persistente',
    'Dor de cabeça intensa com visão turva',
    'Dor no peito ou falta de ar',
    'Déficit neurológico súbito (fala, força, equilíbrio)',
    'Inchaço súbito nas pernas ou rosto',
  ],
  NEFROPATIA_DIABETICA: [
    'Hipoglicemia grave: tremor, sudorese fria, desmaio',
    'Pressão arterial acima de 180/110',
    'Ferida no pé que não cicatriza ou piora rapidamente',
    'Visão turva de surgimento súbito',
    'Urina muito reduzida',
  ],
  GLOMERULOPATIA: [
    'Inchaço súbito generalizado (pernas, rosto, abdômen)',
    'Espuma aumentada e persistente na urina',
    'Urina cor de coca-cola ou com sangue visível',
    'Febre com urina escura',
    'Dificuldade para respirar',
  ],
  NEFROLITIASE: [
    'Dor lombar intensa com irradiação para virilha ou genitais',
    'Sangue visível na urina',
    'Febre acompanhada de dor lombar (pode indicar infecção)',
    'Incapacidade de urinar',
    'Vômitos incontroláveis com dor intensa',
  ],
  CONSULTA_GERAL: [
    'Pressão arterial acima de 180/110',
    'Dor no peito ou falta de ar súbita',
    'Urina muito reduzida de um dia para o outro',
    'Inchaço súbito nas pernas ou rosto',
    'Confusão mental ou déficit neurológico',
  ],
}

function fmt(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function bar(char = '─', len = 44): string {
  return char.repeat(len)
}

export type PatientSheetInput = {
  patient: {
    name: string
    diagnosis: string
    height?: number | null
    medications: { name: string; dose?: string | null; frequency?: string | null }[]
  }
  evolution: {
    consultationDate: Date
    bloodPressure?: string | null
    weight?: number | null
    heartRate?: number | null
    nextConsultationDate?: Date | null
    orderedExams?: string | null
    edema?: string | null
  }
  suspendedThisVisit: { name: string; dose?: string | null }[]
}

export function composePatientSheet({
  patient,
  evolution,
  suspendedThisVisit,
}: PatientSheetInput): string {
  const lines: string[] = []
  const sep = bar()
  const thin = bar('─', 44)

  lines.push(sep)
  lines.push('ORIENTAÇÕES DA CONSULTA')
  lines.push(`Data: ${fmt(evolution.consultationDate)}`)
  lines.push(sep)
  lines.push(`Paciente: ${patient.name}`)
  lines.push(`Acompanhamento: ${DIAGNOSIS_LABEL[patient.diagnosis] ?? patient.diagnosis}`)
  lines.push('')

  // Dados vitais
  const hasVitals = evolution.bloodPressure || evolution.weight || evolution.heartRate
  if (hasVitals) {
    lines.push(thin)
    lines.push('SEUS DADOS DE HOJE')
    lines.push(thin)
    if (evolution.bloodPressure) {
      lines.push(`Pressão arterial:  ${evolution.bloodPressure} mmHg`)
    }
    if (evolution.heartRate) {
      lines.push(`Frequência cardíaca: ${evolution.heartRate} bpm`)
    }
    if (evolution.weight) {
      let weightLine = `Peso:              ${evolution.weight} kg`
      if (patient.height && patient.height > 0) {
        const bmi = +(evolution.weight / (patient.height / 100) ** 2).toFixed(1)
        const bmiLabel =
          bmi < 18.5 ? 'Baixo peso' :
          bmi < 25 ? 'Peso normal' :
          bmi < 30 ? 'Sobrepeso' : 'Obesidade'
        weightLine += `   (IMC ${bmi} — ${bmiLabel})`
      }
      lines.push(weightLine)
    }
    if (evolution.edema && evolution.edema !== '—') {
      lines.push(`Edema:             ${evolution.edema}`)
    }
    lines.push('')
  }

  // Medicamentos
  lines.push(thin)
  lines.push('SEUS MEDICAMENTOS')
  lines.push(thin)
  if (patient.medications.length > 0) {
    lines.push('Tome todos os dias, nos horários combinados:')
    lines.push('')
    patient.medications.forEach((m, i) => {
      const detail = [m.dose, m.frequency].filter(Boolean).join(' — ')
      lines.push(`  ${i + 1}. ${m.name}${detail ? `\n     ${detail}` : ''}`)
    })
  } else {
    lines.push('  Nenhum medicamento em uso registrado.')
  }

  if (suspendedThisVisit.length > 0) {
    lines.push('')
    lines.push('Medicamentos suspensos nesta consulta (não tomar mais):')
    suspendedThisVisit.forEach(m => {
      const detail = m.dose ? ` ${m.dose}` : ''
      lines.push(`  ✗ ${m.name}${detail}`)
    })
  }
  lines.push('')

  // Exames solicitados
  if (evolution.orderedExams?.trim()) {
    lines.push(thin)
    lines.push('EXAMES SOLICITADOS')
    lines.push(thin)
    lines.push('Trazer os resultados na próxima consulta:')
    lines.push('')
    evolution.orderedExams.trim().split('\n').forEach(exam => {
      if (exam.trim()) lines.push(`  □  ${exam.trim()}`)
    })
    lines.push('')
  }

  // Próximo retorno
  lines.push(thin)
  lines.push('PRÓXIMA CONSULTA')
  lines.push(thin)
  if (evolution.nextConsultationDate) {
    lines.push(`Data prevista: ${fmt(evolution.nextConsultationDate)}`)
  } else {
    lines.push('Data a combinar — aguarde confirmação do consultório.')
  }
  lines.push('')

  // Sinais de alerta
  const alerts = ALERT_SIGNS[patient.diagnosis] ?? ALERT_SIGNS['CONSULTA_GERAL']
  lines.push(thin)
  lines.push('QUANDO PROCURAR ATENDIMENTO URGENTE')
  lines.push(thin)
  lines.push('Vá ao pronto-socorro se apresentar:')
  lines.push('')
  alerts.forEach(sign => lines.push(`  • ${sign}`))
  lines.push('')

  lines.push(sep)

  return lines.join('\n')
}
