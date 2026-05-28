// Folheto educativo gerado dinamicamente por paciente.
// Seções condicionais baseadas em diagnóstico, estágio CKD e comorbidades.
// Zero LLM — apenas template literals determinísticos.

const CKD_STAGE_ORDER = ['G1', 'G2', 'G3a', 'G3b', 'G4', 'G5', 'G5D']

function stageGte(stage: string | null | undefined, min: string): boolean {
  if (!stage) return false
  return CKD_STAGE_ORDER.indexOf(stage) >= CKD_STAGE_ORDER.indexOf(min)
}

function bar(char = '━', len = 44): string {
  return char.repeat(len)
}

const SEP = bar()
const THIN = bar('─', 44)

function section(title: string, lines: string[]): string {
  return [SEP, title, THIN, '', ...lines, ''].join('\n')
}

export type LeafletInput = {
  diagnosis: string
  ckdStage?: string | null
  albuminuria?: string | null
  comorbidities: string[]
  height?: number | null
  latestTfg?: number | null
  name: string
}

export function composePatientLeaflet(input: LeafletInput): string {
  const { diagnosis, ckdStage, comorbidities, latestTfg, name } = input
  const hasDiabetes =
    diagnosis === 'NEFROPATIA_DIABETICA' ||
    comorbidities.some(c => /diabet/i.test(c))
  const hasHas =
    diagnosis === 'HAS_NEFROSCLEROSE' ||
    comorbidities.some(c => /hiperten/i.test(c))

  const parts: string[] = []

  parts.push([
    SEP,
    'FOLHETO DE ORIENTAÇÕES AO PACIENTE',
    `Paciente: ${name}`,
    SEP,
    '',
    'Este folheto resume os principais cuidados para a sua saúde renal.',
    'Leia com atenção e guarde para consultar em casa.',
    '',
  ].join('\n'))

  // ── O que é DRC (diagnósticos renais com CKD stage)
  if (diagnosis === 'DRC' || ckdStage) {
    const stageLine = ckdStage
      ? `Seu estágio atual: ${ckdStage}${latestTfg ? ` (TFGe ${latestTfg} mL/min)` : ''}`
      : null
    const stageExplanation: Record<string, string> = {
      G1: 'A função renal está preservada, mas há sinais de lesão. Prevenção é o foco.',
      G2: 'Leve redução na função. Com cuidado, é possível manter a estabilidade.',
      G3a: 'Redução leve a moderada. Exames frequentes são importantes.',
      G3b: 'Redução moderada. Atenção especial à alimentação e pressão arterial.',
      G4: 'Redução grave. Preparação para eventual terapia de substituição renal.',
      G5: 'Redução muito grave. Avaliação de diálise ou transplante em andamento.',
      G5D: 'Em diálise. Manter as sessões e os cuidados combinados com a equipe.',
    }

    parts.push(section('O QUE É DOENÇA RENAL CRÔNICA (DRC)', [
      'Seus rins filtram o sangue e eliminam resíduos pela urina.',
      'Na DRC, essa função está reduzida — mas isso não significa',
      'que os rins vão parar. Com cuidado e acompanhamento,',
      'é possível manter a qualidade de vida por muitos anos.',
      ...(stageLine ? ['', stageLine] : []),
      ...(ckdStage && stageExplanation[ckdStage]
        ? ['', stageExplanation[ckdStage]]
        : []),
    ]))
  }

  // ── Alimentação base (sempre)
  const dietLines = [
    '• Reduza o sal: máximo 5 g por dia (1 colher de chá rasa)',
    '• Evite alimentos ultraprocessados (embutidos, sopas de pacote)',
    '• Beba 1,5 a 2 litros de água por dia, salvo orientação contrária',
    '• Evite anti-inflamatórios: ibuprofeno, diclofenaco, naproxeno',
    '  (podem piorar a função dos rins)',
  ]

  // Proteína moderada (G3a+)
  if (stageGte(ckdStage, 'G3a')) {
    dietLines.push('')
    dietLines.push('PROTEÍNA')
    dietLines.push('• Prefira qualidade à quantidade: frango, peixe, clara de ovo')
    dietLines.push('• Evite excesso de carne vermelha e proteína em pó sem orientação')
  }

  // Potássio (G3b+)
  if (stageGte(ckdStage, 'G3b')) {
    dietLines.push('')
    dietLines.push('POTÁSSIO — alimentos a reduzir:')
    dietLines.push('  Evite em excesso: banana, laranja, tomate, abacate,')
    dietLines.push('  feijão, lentilha, batata (sem escaldá-la primeiro)')
    dietLines.push('  Prefira: maçã, pera, uva, manga, arroz, macarrão, mandioca')
    dietLines.push('')
    dietLines.push('  Dica: escalde legumes e verduras em bastante água antes de comer.')
  }

  // Fósforo (G4+)
  if (stageGte(ckdStage, 'G4')) {
    dietLines.push('')
    dietLines.push('FÓSFORO — alimentos a reduzir:')
    dietLines.push('  Evite: laticínios em excesso, refrigerantes escuros (cola),')
    dietLines.push('  embutidos, frutos do mar, cerveja')
    dietLines.push('  Se prescrito quelante de fósforo: tome JUNTO com as refeições.')
  }

  // Restrição hídrica (G5D)
  if (ckdStage === 'G5D') {
    dietLines.push('')
    dietLines.push('LÍQUIDOS — ATENÇÃO ESPECIAL:')
    dietLines.push('  Em diálise, o volume de líquidos é limitado.')
    dietLines.push('  Siga a orientação da equipe de nefrologia e diálise.')
    dietLines.push('  Peso diário em jejum ajuda a controlar a retenção de líquidos.')
  }

  parts.push(section('ALIMENTAÇÃO', dietLines))

  // ── Pressão arterial
  if (hasHas || diagnosis === 'DRC' || diagnosis === 'NEFROPATIA_DIABETICA' || ckdStage) {
    const bpTarget =
      diagnosis === 'GLOMERULOPATIA' ? '125/75' :
      diagnosis === 'NEFROPATIA_DIABETICA' ? '130/80' :
      '130/80'
    parts.push(section('PRESSÃO ARTERIAL', [
      `Meta: abaixo de ${bpTarget} mmHg`,
      '',
      '• Meça a pressão 2 vezes por semana, em repouso, sentado',
      '• Anote os valores em um caderno ou aplicativo',
      '• Tome os remédios TODOS OS DIAS, mesmo se sentir bem',
      '• Nunca pare a medicação por conta própria',
      '• Reduza o sal — ele eleva a pressão',
    ]))
  }

  // ── Diabetes
  if (hasDiabetes) {
    parts.push(section('DIABETES E RINS', [
      '• Mantenha a glicemia controlada — a meta de HbA1c',
      '  será combinada com seu médico (geralmente < 7 a 8%)',
      '• Meça a glicemia conforme orientação',
      '• Não pule refeições — hipoglicemia é perigosa',
      '• Inspecione os pés diariamente: cortes, feridas, calos',
      '• Use calçados adequados e nunca ande descalço fora de casa',
      '• Consulte podologia regularmente',
    ]))
  }

  // ── Pedras nos rins
  if (diagnosis === 'NEFROLITIASE') {
    parts.push(section('PREVENÇÃO DE PEDRAS NOS RINS', [
      'HIDRATAÇÃO — o mais importante:',
      '• Beba ao menos 2,5 litros de água por dia',
      '• Distribua ao longo do dia — não espere sentir sede',
      '• A urina deve ser clara, levemente amarelada',
      '',
      'ALIMENTAÇÃO:',
      '• Reduza o sal — favorece a formação de cálculos',
      '• Evite excesso de proteína animal (carne, frango, peixe)',
      '• Evite vitamina C em suplementos acima de 500 mg/dia',
      '• Espinafre, beterraba e nozes: consuma com moderação',
      '  (ricos em oxalato — se seus cálculos forem de oxalato)',
      '',
      'EXAME DE URINA 24H:',
      '• Revela o tipo do cálculo e guia a prevenção',
      '• Faça conforme combinado com seu médico',
    ]))
  }

  // ── Glomerulopatia
  if (diagnosis === 'GLOMERULOPATIA') {
    parts.push(section('CUIDADOS COM GLOMERULOPATIA', [
      '• Tome os imunossupressores rigorosamente no horário',
      '• Nunca interrompa sem orientação médica',
      '• Evite exposição a pessoas com infecção (gripe, covid)',
      '• Lave as mãos com frequência',
      '• Informe ao médico qualquer sinal de infecção:',
      '  febre, tosse persistente, ferida que não fecha',
      '• Vacine-se conforme orientação (gripe, pneumococo)',
      '  — alguns imunossupressores reduzem a defesa do organismo',
      '• Monitore o peso diariamente: aumento rápido pode',
      '  indicar retenção de líquidos',
    ]))
  }

  // ── Atividade física (sempre)
  parts.push(section('ATIVIDADE FÍSICA', [
    '• Caminhada 30 minutos, 5 vezes por semana é ideal',
    '• Exercício aeróbico melhora a pressão, o peso e a função renal',
    '• Evite atividades muito intensas sem orientação médica',
    '• Se sentir dor no peito ou falta de ar durante o exercício,',
    '  pare e procure atendimento',
  ]))

  // ── Adesão medicamentosa (sempre)
  parts.push(section('SEUS REMÉDIOS — POR QUE TOMAR SEM FALHAR', [
    '• Os remédios para pressão e rins protegem seus rins ao longo',
    '  do tempo — o efeito é silencioso, mas essencial',
    '• Faltou uma dose: não dobre a próxima, apenas retome',
    '• Dificuldade de pagar ou encontrar o remédio: avise o médico',
    '• Efeitos colaterais: relate na próxima consulta antes de parar',
    '• Informe SEMPRE ao dentista, ortopedista e farmacêutico',
    '  que você tem doença renal — alguns medicamentos são perigosos',
  ]))

  // ── Sinais de alerta (sempre)
  const alertMap: Record<string, string[]> = {
    DRC: [
      'Pressão acima de 180/110 que não cede',
      'Inchaço súbito nas pernas, pés ou rosto',
      'Urina muito reduzida de um dia para o outro',
      'Confusão mental ou sonolência excessiva',
      'Dor no peito ou falta de ar',
    ],
    HAS_NEFROSCLEROSE: [
      'Pressão acima de 180/110 persistente',
      'Dor de cabeça intensa com visão turva',
      'Dor no peito ou falta de ar súbita',
      'Fraqueza ou alteração na fala (AVC)',
    ],
    NEFROPATIA_DIABETICA: [
      'Hipoglicemia grave: tremor, sudorese fria, desmaio',
      'Pressão acima de 180/110',
      'Ferida no pé que piora rapidamente',
      'Visão turva de surgimento súbito',
      'Urina muito reduzida',
    ],
    GLOMERULOPATIA: [
      'Inchaço súbito generalizado',
      'Espuma aumentada e persistente na urina',
      'Urina cor de coca-cola ou com sangue',
      'Febre com urina escura',
    ],
    NEFROLITIASE: [
      'Dor lombar intensa com irradiação para a virilha',
      'Sangue visível na urina',
      'Febre acompanhada de dor lombar',
      'Incapacidade de urinar',
    ],
    CONSULTA_GERAL: [
      'Pressão acima de 180/110',
      'Dor no peito ou falta de ar súbita',
      'Urina muito reduzida',
      'Confusão mental súbita',
    ],
  }

  const alerts = alertMap[diagnosis] ?? alertMap['CONSULTA_GERAL']
  parts.push(section('QUANDO IR AO PRONTO-SOCORRO', [
    'Procure atendimento urgente se apresentar:',
    '',
    ...alerts.map(a => `  • ${a}`),
  ]))

  parts.push(SEP)

  return parts.join('\n')
}
