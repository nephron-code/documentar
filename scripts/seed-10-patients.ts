/**
 * Script de seed — 10 pacientes de teste com diagnósticos variados.
 * Executa com: npx tsx scripts/seed-10-patients.ts
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

// ── Helpers ───────────────────────────────────────────────────────────────────

function labs(
  patientId: string,
  entries: { examType: string; value: number; unit: string; examDate: string }[]
) {
  return entries.map(l => ({
    patientId,
    examType: l.examType,
    value: l.value,
    unit: l.unit,
    examDate: new Date(l.examDate),
  }))
}

// ── Pacientes ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('Criando 10 pacientes...\n')

  // ── 1. Nefropatia Diabética avançada ──────────────────────────────────────
  const p1 = await prisma.patient.create({ data: {
    name: 'Maria Aparecida Santos',
    birthDate: new Date('1958-03-14'),
    sex: 'FEMALE',
    diagnosis: 'NEFROPATIA_DIABETICA',
    ckdStage: 'G3b', albuminuria: 'A3',
    comorbidities: ['HAS', 'DM2', 'Dislipidemia', 'Obesidade'],
    medications: ['Losartana 100mg — 1cp/dia', 'Furosemida 40mg — 1cp/dia', 'Dapagliflozina 10mg — 1cp/dia', 'Atorvastatina 40mg — 1cp/noite'],
  }})
  await prisma.evolution.create({ data: {
    patientId: p1.id, consultationDate: new Date('2026-02-17'),
    chiefComplaint: 'Retorno ambulatorial. Edema em MMII, glicemias irregulares.',
    bloodPressure: '148/90', weight: 80.0,
    clinicalNote: 'Nefropatia diabética G3b A3. TFG em queda progressiva. Proteinúria em níveis nefróticos. HbA1c melhorou mas ainda acima da meta.',
    conductText: 'Manter Losartana 100mg/dia. Furosemida 40mg/dia. Acrescentar Dapagliflozina 10mg/dia. Reforçar dieta. Retorno em 3 meses.',
  }})
  await prisma.labResult.createMany({ data: labs(p1.id, [
    { examType: 'creatinina', value: 2.3, unit: 'mg/dL', examDate: '2026-02-10' },
    { examType: 'ureia', value: 74, unit: 'mg/dL', examDate: '2026-02-10' },
    { examType: 'tfg', value: 22.7, unit: 'mL/min', examDate: '2026-02-10' },
    { examType: 'potassio', value: 4.8, unit: 'mEq/L', examDate: '2026-02-10' },
    { examType: 'microalbuminuria', value: 620, unit: 'mg/g', examDate: '2026-02-10' },
    { examType: 'hba1c', value: 8.1, unit: '%', examDate: '2026-02-10' },
    { examType: 'hemoglobina', value: 10.5, unit: 'g/dL', examDate: '2026-02-10' },
    { examType: 'ldl', value: 88, unit: 'mg/dL', examDate: '2026-02-10' },
  ])})
  console.log(`✓ ${p1.name}`)

  // ── 2. HAS / Nefrosclerose leve ───────────────────────────────────────────
  const p2 = await prisma.patient.create({ data: {
    name: 'José Carlos Ferreira',
    birthDate: new Date('1955-07-22'),
    sex: 'MALE',
    diagnosis: 'HAS_NEFROSCLEROSE',
    ckdStage: 'G2', albuminuria: 'A1',
    comorbidities: ['HAS', 'Dislipidemia'],
    medications: ['Anlodipino 5mg — 1cp/dia', 'Hidroclorotiazida 25mg — 1cp/manhã', 'Atorvastatina 20mg — 1cp/noite'],
  }})
  await prisma.evolution.create({ data: {
    patientId: p2.id, consultationDate: new Date('2026-03-05'),
    chiefComplaint: 'Retorno. PA controlada em domicílio. Sem queixas.',
    bloodPressure: '128/78', weight: 74.0,
    clinicalNote: 'HAS/Nefrosclerose G2 A1. Bom controle pressórico. Função renal estável. LDL dentro da meta.',
    conductText: 'Manter esquema atual. Monitorização domiciliar da PA. Retorno em 6 meses com exames.',
  }})
  await prisma.labResult.createMany({ data: labs(p2.id, [
    { examType: 'creatinina', value: 1.2, unit: 'mg/dL', examDate: '2026-02-28' },
    { examType: 'ureia', value: 38, unit: 'mg/dL', examDate: '2026-02-28' },
    { examType: 'tfg', value: 62, unit: 'mL/min', examDate: '2026-02-28' },
    { examType: 'potassio', value: 4.1, unit: 'mEq/L', examDate: '2026-02-28' },
    { examType: 'microalbuminuria', value: 18, unit: 'mg/g', examDate: '2026-02-28' },
    { examType: 'ldl', value: 64, unit: 'mg/dL', examDate: '2026-02-28' },
    { examType: 'colesterol', value: 158, unit: 'mg/dL', examDate: '2026-02-28' },
  ])})
  console.log(`✓ ${p2.name}`)

  // ── 3. DRC avançada (rim policístico) ─────────────────────────────────────
  const p3 = await prisma.patient.create({ data: {
    name: 'Ana Lúcia Rodrigues',
    birthDate: new Date('1970-11-08'),
    sex: 'FEMALE',
    diagnosis: 'DRC',
    etiology: 'Doença renal policística autossômica dominante (DRPAD)',
    ckdStage: 'G4', albuminuria: 'A2',
    comorbidities: ['HAS', 'Hiperuricemia'],
    medications: ['Ramipril 10mg — 1cp/dia', 'Furosemida 40mg — 1cp/dia', 'Alopurinol 300mg — 1cp/dia', 'Bicarbonato de sódio 650mg — 2cp 8/8h'],
  }})
  await prisma.evolution.create({ data: {
    patientId: p3.id, consultationDate: new Date('2026-01-20'),
    chiefComplaint: 'Retorno. Dor lombar bilateral ocasional. Sem hematúria recente.',
    bloodPressure: '138/88', weight: 68.5,
    clinicalNote: 'DRPAD com TFG G4. Rins com volume aumentado bilateralmente. Acidose metabólica compensada em uso de bicarbonato. Uricemia controlada com alopurinol. Preparo para TRS iniciado — aguardando avaliação cirurgia vascular para confecção de FAV.',
    conductText: 'Manter Ramipril 10mg. Furosemida 40mg. Bicarbonato 650mg 2cp 8/8h. Alopurinol 300mg. Encaminhar cirurgia vascular. Retorno em 2 meses.',
  }})
  await prisma.labResult.createMany({ data: labs(p3.id, [
    { examType: 'creatinina', value: 3.1, unit: 'mg/dL', examDate: '2026-01-10' },
    { examType: 'ureia', value: 96, unit: 'mg/dL', examDate: '2026-01-10' },
    { examType: 'tfg', value: 16.2, unit: 'mL/min', examDate: '2026-01-10' },
    { examType: 'potassio', value: 5.0, unit: 'mEq/L', examDate: '2026-01-10' },
    { examType: 'sodio', value: 138, unit: 'mEq/L', examDate: '2026-01-10' },
    { examType: 'microalbuminuria', value: 145, unit: 'mg/g', examDate: '2026-01-10' },
    { examType: 'hemoglobina', value: 9.8, unit: 'g/dL', examDate: '2026-01-10' },
    { examType: 'acido_urico', value: 6.2, unit: 'mg/dL', examDate: '2026-01-10' },
    { examType: 'calcio', value: 8.6, unit: 'mg/dL', examDate: '2026-01-10' },
    { examType: 'fosforo', value: 5.2, unit: 'mg/dL', examDate: '2026-01-10' },
    { examType: 'pth', value: 210, unit: 'pg/mL', examDate: '2026-01-10' },
    { examType: 'vitamina_d', value: 14, unit: 'ng/mL', examDate: '2026-01-10' },
  ])})
  console.log(`✓ ${p3.name}`)

  // ── 4. Glomerulopatia (nefropatia IgA) ───────────────────────────────────
  const p4 = await prisma.patient.create({ data: {
    name: 'Lucas Henrique Oliveira',
    birthDate: new Date('1990-04-15'),
    sex: 'MALE',
    diagnosis: 'GLOMERULOPATIA',
    ckdStage: 'G2', albuminuria: 'A3',
    comorbidities: ['HAS'],
    medications: ['Losartana 50mg — 1cp/dia', 'Prednisolona 40mg — 1cp/manhã (em desmame)'],
  }})
  await prisma.evolution.create({ data: {
    patientId: p4.id, consultationDate: new Date('2026-04-08'),
    chiefComplaint: 'Retorno pós-biópsia. Aguardando laudo definitivo. Edema leve em face pela manhã.',
    bloodPressure: '132/84', weight: 82.0,
    clinicalNote: 'Nefropatia IgA confirmada em biópsia (Oxford MEST-C: M1 E0 S1 T0 C0). Proteinúria em queda sob corticoterapia. Função renal preservada. Sem sinais de síndrome nefrótica plena.',
    conductText: 'Manter Losartana 50mg/dia. Desmame gradual de Prednisolona conforme protocolo. Dieta hipossódica. Retorno em 4 semanas com proteinúria 24h e função renal.',
  }})
  await prisma.labResult.createMany({ data: labs(p4.id, [
    { examType: 'creatinina', value: 1.3, unit: 'mg/dL', examDate: '2026-04-01' },
    { examType: 'ureia', value: 42, unit: 'mg/dL', examDate: '2026-04-01' },
    { examType: 'tfg', value: 74, unit: 'mL/min', examDate: '2026-04-01' },
    { examType: 'microalbuminuria', value: 1840, unit: 'mg/g', examDate: '2026-04-01' },
    { examType: 'albumina', value: 2.9, unit: 'g/dL', examDate: '2026-04-01' },
    { examType: 'hemoglobina', value: 13.1, unit: 'g/dL', examDate: '2026-04-01' },
    { examType: 'potassio', value: 4.2, unit: 'mEq/L', examDate: '2026-04-01' },
    { examType: 'colesterol', value: 245, unit: 'mg/dL', examDate: '2026-04-01' },
    { examType: 'ldl', value: 162, unit: 'mg/dL', examDate: '2026-04-01' },
  ])})
  console.log(`✓ ${p4.name}`)

  // ── 5. Nefrolitíase recorrente ────────────────────────────────────────────
  const p5 = await prisma.patient.create({ data: {
    name: 'Fernanda Costa Lima',
    birthDate: new Date('1985-09-30'),
    sex: 'FEMALE',
    diagnosis: 'NEFROLITIASE',
    comorbidities: ['Hiperuricemia'],
    medications: ['Citrato de potássio 10mEq — 2cp 12/12h', 'Alopurinol 100mg — 1cp/dia'],
  }})
  await prisma.evolution.create({ data: {
    patientId: p5.id, consultationDate: new Date('2026-03-18'),
    chiefComplaint: 'Episódio de cólica renal à esquerda há 2 semanas, resolvido espontaneamente. Nega hematúria atual.',
    bloodPressure: '118/72', weight: 62.0,
    clinicalNote: 'Nefrolitíase cálcica recorrente com componente hiperuricosúrico confirmado em urina 24h. Litíase residual < 4mm à USG. Diurese ainda insuficiente (1,8L/dia pela história). Uricemia controlada com alopurinol.',
    conductText: 'Reforçar hidratação — alvo diurese > 2,5L/dia. Manter Citrato de potássio e Alopurinol. Dieta hipossódica e com restrição de proteína animal. Retorno em 3 meses com urina 24h e USG de controle.',
  }})
  await prisma.labResult.createMany({ data: labs(p5.id, [
    { examType: 'creatinina', value: 0.8, unit: 'mg/dL', examDate: '2026-03-10' },
    { examType: 'ureia', value: 28, unit: 'mg/dL', examDate: '2026-03-10' },
    { examType: 'tfg', value: 98, unit: 'mL/min', examDate: '2026-03-10' },
    { examType: 'acido_urico', value: 7.8, unit: 'mg/dL', examDate: '2026-03-10' },
    { examType: 'calcio', value: 9.6, unit: 'mg/dL', examDate: '2026-03-10' },
    { examType: 'potassio', value: 3.8, unit: 'mEq/L', examDate: '2026-03-10' },
    { examType: 'microalbuminuria', value: 12, unit: 'mg/g', examDate: '2026-03-10' },
  ])})
  console.log(`✓ ${p5.name}`)

  // ── 6. DRC por GESF ───────────────────────────────────────────────────────
  const p6 = await prisma.patient.create({ data: {
    name: 'Roberto Alves Mendes',
    birthDate: new Date('1978-01-25'),
    sex: 'MALE',
    diagnosis: 'DRC',
    etiology: 'Glomeruloesclerose segmentar e focal (GESF)',
    ckdStage: 'G3a', albuminuria: 'A3',
    comorbidities: ['HAS', 'Obesidade'],
    medications: ['Enalapril 20mg — 1cp/dia', 'Furosemida 40mg — 1cp/dia', 'Atorvastatina 40mg — 1cp/noite'],
  }})
  await prisma.evolution.create({ data: {
    patientId: p6.id, consultationDate: new Date('2026-02-28'),
    chiefComplaint: 'Retorno. Edema persistente em MMII. PA mal controlada.',
    bloodPressure: '152/94', weight: 98.0,
    clinicalNote: 'GESF com TFG G3a A3. Síndrome nefrótica parcial — proteinúria elevada, sem hipoalbuminemia grave. Edema por sobrecarga volêmica. Otimizar bloqueio do SRAA e controle pressórico.',
    conductText: 'Aumentar Enalapril para 40mg/dia. Furosemida 40mg/dia. Atorvastatina 40mg/noite. Meta PA < 125/75 mmHg. Encaminhar nutrição para controle de peso. Retorno em 6 semanas.',
  }})
  await prisma.labResult.createMany({ data: labs(p6.id, [
    { examType: 'creatinina', value: 1.8, unit: 'mg/dL', examDate: '2026-02-20' },
    { examType: 'ureia', value: 55, unit: 'mg/dL', examDate: '2026-02-20' },
    { examType: 'tfg', value: 44, unit: 'mL/min', examDate: '2026-02-20' },
    { examType: 'microalbuminuria', value: 2800, unit: 'mg/g', examDate: '2026-02-20' },
    { examType: 'albumina', value: 3.1, unit: 'g/dL', examDate: '2026-02-20' },
    { examType: 'potassio', value: 4.5, unit: 'mEq/L', examDate: '2026-02-20' },
    { examType: 'sodio', value: 136, unit: 'mEq/L', examDate: '2026-02-20' },
    { examType: 'colesterol', value: 285, unit: 'mg/dL', examDate: '2026-02-20' },
    { examType: 'ldl', value: 195, unit: 'mg/dL', examDate: '2026-02-20' },
    { examType: 'hemoglobina', value: 11.8, unit: 'g/dL', examDate: '2026-02-20' },
  ])})
  console.log(`✓ ${p6.name}`)

  // ── 7. HAS / Nefrosclerose avançada ──────────────────────────────────────
  const p7 = await prisma.patient.create({ data: {
    name: 'Sebastião Pereira da Silva',
    birthDate: new Date('1948-06-10'),
    sex: 'MALE',
    diagnosis: 'HAS_NEFROSCLEROSE',
    ckdStage: 'G3b', albuminuria: 'A2',
    comorbidities: ['HAS', 'Dislipidemia', 'FA', 'ICC'],
    medications: ['Carvedilol 25mg — 1cp 12/12h', 'Furosemida 80mg — 1cp/dia', 'Espironolactona 25mg — 1cp/dia', 'Rivaroxabana 20mg — 1cp/jantar', 'Rosuvastatina 20mg — 1cp/noite'],
  }})
  await prisma.evolution.create({ data: {
    patientId: p7.id, consultationDate: new Date('2026-04-15'),
    chiefComplaint: 'Retorno. Dispneia aos esforços moderados. Edema em MMII ++/4+.',
    bloodPressure: '142/88', weight: 88.0,
    clinicalNote: 'Nefrosclerose hipertensiva G3b A2 em contexto de ICC e FA. TFG estável. Edema por descompensação cardíaca leve. Ajuste de diurético necessário. Uso de rivaroxabana pela FA com monitorização da função renal.',
    conductText: 'Aumentar Furosemida para 80mg/dia. Manter Espironolactona 25mg. Carvedilol e Rivaroxabana sem alteração. Controle de peso diário. Retorno em 4 semanas ou antes se ganho > 2kg.',
  }})
  await prisma.labResult.createMany({ data: labs(p7.id, [
    { examType: 'creatinina', value: 2.0, unit: 'mg/dL', examDate: '2026-04-08' },
    { examType: 'ureia', value: 62, unit: 'mg/dL', examDate: '2026-04-08' },
    { examType: 'tfg', value: 31, unit: 'mL/min', examDate: '2026-04-08' },
    { examType: 'potassio', value: 4.6, unit: 'mEq/L', examDate: '2026-04-08' },
    { examType: 'sodio', value: 137, unit: 'mEq/L', examDate: '2026-04-08' },
    { examType: 'microalbuminuria', value: 180, unit: 'mg/g', examDate: '2026-04-08' },
    { examType: 'hemoglobina', value: 11.0, unit: 'g/dL', examDate: '2026-04-08' },
    { examType: 'bnp', value: 380, unit: 'pg/mL', examDate: '2026-04-08' },
  ])})
  console.log(`✓ ${p7.name}`)

  // ── 8. Nefropatia Diabética inicial ──────────────────────────────────────
  const p8 = await prisma.patient.create({ data: {
    name: 'Claudia Regina Souza',
    birthDate: new Date('1968-12-03'),
    sex: 'FEMALE',
    diagnosis: 'NEFROPATIA_DIABETICA',
    ckdStage: 'G2', albuminuria: 'A2',
    comorbidities: ['HAS', 'DM2', 'Obesidade', 'Dislipidemia'],
    medications: ['Metformina 850mg — 1cp 12/12h', 'Empagliflozina 10mg — 1cp/manhã', 'Losartana 50mg — 1cp/dia', 'Atorvastatina 40mg — 1cp/noite', 'Semaglutida 1mg — 1x/semana SC'],
  }})
  await prisma.evolution.create({ data: {
    patientId: p8.id, consultationDate: new Date('2026-05-02'),
    chiefComplaint: 'Primeira consulta nefrologista. Encaminhada por clínico geral por microalbuminúria detectada em check-up.',
    bloodPressure: '136/82', weight: 92.0,
    clinicalNote: 'Nefropatia diabética incipiente G2 A2. Bom controle glicêmico com HbA1c 7.1%. Já em uso de iSGLT2 e GLP-1 pelo endocrinologista. Função renal preservada. Foco em manutenção de nefroproteção e perda de peso.',
    conductText: 'Manter esquema atual — iSGLT2 e GLP-1 já otimizados. Adicionar Losartana 50mg/dia para nefroproteção. Alvo PA < 130/80 mmHg. Meta LDL < 70 mg/dL — aumentar Atorvastatina se necessário. Retorno em 6 meses.',
  }})
  await prisma.labResult.createMany({ data: labs(p8.id, [
    { examType: 'creatinina', value: 1.0, unit: 'mg/dL', examDate: '2026-04-25' },
    { examType: 'ureia', value: 32, unit: 'mg/dL', examDate: '2026-04-25' },
    { examType: 'tfg', value: 68, unit: 'mL/min', examDate: '2026-04-25' },
    { examType: 'microalbuminuria', value: 85, unit: 'mg/g', examDate: '2026-04-25' },
    { examType: 'hba1c', value: 7.1, unit: '%', examDate: '2026-04-25' },
    { examType: 'potassio', value: 4.0, unit: 'mEq/L', examDate: '2026-04-25' },
    { examType: 'colesterol', value: 188, unit: 'mg/dL', examDate: '2026-04-25' },
    { examType: 'ldl', value: 98, unit: 'mg/dL', examDate: '2026-04-25' },
    { examType: 'hdl', value: 44, unit: 'mg/dL', examDate: '2026-04-25' },
    { examType: 'triglicerides', value: 168, unit: 'mg/dL', examDate: '2026-04-25' },
  ])})
  console.log(`✓ ${p8.name}`)

  // ── 9. DRC por nefropatia lúpica ─────────────────────────────────────────
  const p9 = await prisma.patient.create({ data: {
    name: 'Patrícia Gonçalves Martins',
    birthDate: new Date('1986-08-19'),
    sex: 'FEMALE',
    diagnosis: 'DRC',
    etiology: 'Nefrite lúpica classe IV (LES)',
    ckdStage: 'G3a', albuminuria: 'A2',
    comorbidities: ['HAS', 'Tabagismo'],
    medications: ['Hidroxicloroquina 400mg — 1cp/dia', 'Micofenolato de mofetila 1g — 1cp 12/12h', 'Prednisona 5mg — 1cp/dia (manutenção)', 'Losartana 100mg — 1cp/dia', 'Omeprazol 20mg — 1cp/dia'],
  }})
  await prisma.evolution.create({ data: {
    patientId: p9.id, consultationDate: new Date('2026-03-25'),
    chiefComplaint: 'Retorno. Doença em remissão. Sem sinais de atividade lúpica recente.',
    bloodPressure: '128/80', weight: 58.0,
    clinicalNote: 'Nefrite lúpica em remissão sustentada há 18 meses. TFG estável G3a. Proteinúria em queda — boa resposta à manutenção com micofenolato + HCQ. Tabagismo — aconselhamento realizado. Atenção ao risco cardiovascular elevado no LES.',
    conductText: 'Manter esquema imunossupressor atual. Losartana 100mg/dia. Orientar cessação do tabagismo — encaminhar programa de apoio. Anti-Sm e C3/C4 para acompanhamento de atividade. Retorno em 3 meses.',
  }})
  await prisma.labResult.createMany({ data: labs(p9.id, [
    { examType: 'creatinina', value: 1.5, unit: 'mg/dL', examDate: '2026-03-18' },
    { examType: 'ureia', value: 46, unit: 'mg/dL', examDate: '2026-03-18' },
    { examType: 'tfg', value: 48, unit: 'mL/min', examDate: '2026-03-18' },
    { examType: 'microalbuminuria', value: 210, unit: 'mg/g', examDate: '2026-03-18' },
    { examType: 'albumina', value: 3.6, unit: 'g/dL', examDate: '2026-03-18' },
    { examType: 'hemoglobina', value: 11.4, unit: 'g/dL', examDate: '2026-03-18' },
    { examType: 'potassio', value: 4.2, unit: 'mEq/L', examDate: '2026-03-18' },
    { examType: 'sodio', value: 139, unit: 'mEq/L', examDate: '2026-03-18' },
    { examType: 'calcio', value: 9.0, unit: 'mg/dL', examDate: '2026-03-18' },
    { examType: 'vitamina_d', value: 20, unit: 'ng/mL', examDate: '2026-03-18' },
  ])})
  console.log(`✓ ${p9.name}`)

  // ── 10. Consulta Geral (avaliação pré-transplante) ────────────────────────
  const p10 = await prisma.patient.create({ data: {
    name: 'Eduardo Nascimento Torres',
    birthDate: new Date('1962-02-28'),
    sex: 'MALE',
    diagnosis: 'CONSULTA_GERAL',
    comorbidities: ['HAS', 'DM2', 'Dislipidemia'],
    medications: ['Anlodipino 10mg — 1cp/dia', 'Metformina 500mg — 1cp 12/12h', 'Sinvastatina 40mg — 1cp/noite'],
  }})
  await prisma.evolution.create({ data: {
    patientId: p10.id, consultationDate: new Date('2026-04-22'),
    chiefComplaint: 'Encaminhado pelo nefrologista de hemodiálise para avaliação de função residual e acompanhamento ambulatorial paralelo.',
    bloodPressure: '144/90', weight: 78.5,
    clinicalNote: 'Paciente em hemodiálise há 2 anos. Função renal residual preservada (diurese ~500mL/dia). Controle pressórico inadequado. Otimizar anti-hipertensivos. Avaliar acesso para transplante.',
    conductText: 'Ajustar Anlodipino para 10mg/dia. Orientar restrição hídrica e de potássio. Solicitar avaliação imunológica para lista de transplante. Retorno em 2 meses.',
  }})
  await prisma.labResult.createMany({ data: labs(p10.id, [
    { examType: 'creatinina', value: 8.4, unit: 'mg/dL', examDate: '2026-04-15' },
    { examType: 'ureia', value: 142, unit: 'mg/dL', examDate: '2026-04-15' },
    { examType: 'potassio', value: 5.4, unit: 'mEq/L', examDate: '2026-04-15' },
    { examType: 'sodio', value: 136, unit: 'mEq/L', examDate: '2026-04-15' },
    { examType: 'hemoglobina', value: 10.8, unit: 'g/dL', examDate: '2026-04-15' },
    { examType: 'calcio', value: 8.4, unit: 'mg/dL', examDate: '2026-04-15' },
    { examType: 'fosforo', value: 6.1, unit: 'mg/dL', examDate: '2026-04-15' },
    { examType: 'pth', value: 485, unit: 'pg/mL', examDate: '2026-04-15' },
    { examType: 'albumina', value: 3.4, unit: 'g/dL', examDate: '2026-04-15' },
    { examType: 'hba1c', value: 7.8, unit: '%', examDate: '2026-04-15' },
  ])})
  console.log(`✓ ${p10.name}`)

  console.log('\n✅ 10 pacientes criados com sucesso!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
