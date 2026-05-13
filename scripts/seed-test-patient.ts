/**
 * Script de seed — paciente de teste realista para NefroDoc.
 * Executa com: npx tsx scripts/seed-test-patient.ts
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // --- Paciente ---
  const patient = await prisma.patient.create({
    data: {
      name: 'Maria Aparecida Santos',
      birthDate: new Date('1958-03-14'),   // 68 anos
      sex: 'FEMALE',
      diagnosis: 'NEFROPATIA_DIABETICA',
      etiology: 'Diabetes Mellitus tipo 2',
      ckdStage: 'G3b',
      albuminuria: 'A3',
      comorbidities: ['HAS', 'DM2', 'Dislipidemia', 'Obesidade'],
    },
  })

  console.log(`Paciente criado: ${patient.name} (id: ${patient.id})`)

  // --- Consulta 1 — 6 meses atrás ---
  const ev1 = await prisma.evolution.create({
    data: {
      patientId: patient.id,
      consultationDate: new Date('2025-11-10'),
      chiefComplaint: 'Retorno ambulatorial. Paciente refere edema em membros inferiores ao final do dia e dificuldade de controle pressórico.',
      bloodPressure: '158/96',
      weight: 82.5,
      clinicalNote: 'Paciente com nefropatia diabética em estágio G3b A3. TFG em queda progressiva em relação à consulta anterior. Proteinúria em níveis nefróticos. HbA1c elevada sugerindo controle glicêmico inadequado. Potássio no limite superior — atenção ao uso de IECA.',
      conductText: 'Manter Losartana 100mg/dia. Ajuste de Furosemida para 40mg/dia. Orientar dieta hipossódica e hipoproteica. Controle de peso diário em casa. Solicitar exames para retorno em 3 meses.',
      imagingResults: 'Ultrassonografia renal (08/2025): rins com dimensões reduzidas bilateralmente (D: 9,8cm / E: 9,6cm), ecogenicidade aumentada, sem dilatação pielocalicial. Compatível com nefropatia crônica.',
    },
  })

  // --- Consulta 2 — 3 meses atrás ---
  const ev2 = await prisma.evolution.create({
    data: {
      patientId: patient.id,
      consultationDate: new Date('2026-02-17'),
      chiefComplaint: 'Retorno ambulatorial. Paciente refere melhora do edema após ajuste da Furosemida. Glicemias domiciliares ainda irregulares.',
      bloodPressure: '148/90',
      weight: 80.0,
      clinicalNote: 'Leve melhora pressórica e do edema. TFG estável em relação à última coleta. Proteinúria ainda em A3 — iniciar discussão sobre preparo para TRS a longo prazo. HbA1c melhorou mas ainda acima da meta.',
      conductText: 'Manter Losartana 100mg/dia. Furosemida 40mg/dia. Acrescentar Dapagliflozina 10mg/dia (TFG > 25). Reforçar dieta. Retorno em 3 meses com exames. Encaminhar para educação em saúde renal.',
      imagingResults: 'Ultrassonografia renal (08/2025): rins com dimensões reduzidas bilateralmente (D: 9,8cm / E: 9,6cm), ecogenicidade aumentada, sem dilatação pielocalicial. Compatível com nefropatia crônica.',
    },
  })

  // --- Consulta 3 — hoje ---
  const ev3 = await prisma.evolution.create({
    data: {
      patientId: patient.id,
      consultationDate: new Date('2026-05-12'),
      chiefComplaint: 'Retorno ambulatorial. Paciente refere bem-estar geral. Sem edema. Glicemias mais controladas desde início da Dapagliflozina.',
      bloodPressure: '140/86',
      weight: 78.5,
      clinicalNote: 'Paciente clinicamente estável. TFG com queda leve mas esperada com o iSGLT2 (efeito hemodinâmico). Proteinúria em queda — boa resposta à Dapagliflozina. Anemia leve instalada — investigar deficiência de ferro e indicar suporte.',
      conductText: 'Manter Losartana 100mg/dia. Furosemida 40mg/dia. Dapagliflozina 10mg/dia. Iniciar Sulfato ferroso 300mg 2x/dia. Monitorização domiciliar da pressão arterial. Retorno em 3 meses com exames.',
      imagingResults: 'Ultrassonografia renal (08/2025): rins com dimensões reduzidas bilateralmente (D: 9,8cm / E: 9,6cm), ecogenicidade aumentada, sem dilatação pielocalicial. Compatível com nefropatia crônica.',
    },
  })

  console.log(`Consultas criadas: ${ev1.id}, ${ev2.id}, ${ev3.id}`)

  // --- Resultados laboratoriais ao longo do tempo ---
  const labs = [
    // Coleta de agosto/2025
    { examType: 'creatinina',      value: 2.1,  unit: 'mg/dL',  examDate: '2025-08-05' },
    { examType: 'ureia',           value: 68,   unit: 'mg/dL',  examDate: '2025-08-05' },
    { examType: 'tfg',             value: 26.4, unit: 'mL/min', examDate: '2025-08-05' },
    { examType: 'potassio',        value: 4.9,  unit: 'mEq/L',  examDate: '2025-08-05' },
    { examType: 'sodio',           value: 139,  unit: 'mEq/L',  examDate: '2025-08-05' },
    { examType: 'microalbuminuria',value: 820,  unit: 'mg/g',   examDate: '2025-08-05' },
    { examType: 'hemoglobina',     value: 11.2, unit: 'g/dL',   examDate: '2025-08-05' },
    { examType: 'hematocrito',     value: 33.5, unit: '%',      examDate: '2025-08-05' },
    { examType: 'glicose',         value: 182,  unit: 'mg/dL',  examDate: '2025-08-05' },
    { examType: 'hba1c',           value: 9.2,  unit: '%',      examDate: '2025-08-05' },
    { examType: 'colesterol',      value: 198,  unit: 'mg/dL',  examDate: '2025-08-05' },
    { examType: 'ldl',             value: 118,  unit: 'mg/dL',  examDate: '2025-08-05' },
    { examType: 'hdl',             value: 38,   unit: 'mg/dL',  examDate: '2025-08-05' },
    { examType: 'triglicerides',   value: 210,  unit: 'mg/dL',  examDate: '2025-08-05' },
    { examType: 'pth',             value: 88,   unit: 'pg/mL',  examDate: '2025-08-05' },
    { examType: 'vitamina_d',      value: 18,   unit: 'ng/mL',  examDate: '2025-08-05' },

    // Coleta de novembro/2025
    { examType: 'creatinina',      value: 2.3,  unit: 'mg/dL',  examDate: '2025-11-03' },
    { examType: 'ureia',           value: 74,   unit: 'mg/dL',  examDate: '2025-11-03' },
    { examType: 'tfg',             value: 23.8, unit: 'mL/min', examDate: '2025-11-03' },
    { examType: 'potassio',        value: 5.1,  unit: 'mEq/L',  examDate: '2025-11-03' },
    { examType: 'sodio',           value: 138,  unit: 'mEq/L',  examDate: '2025-11-03' },
    { examType: 'microalbuminuria',value: 760,  unit: 'mg/g',   examDate: '2025-11-03' },
    { examType: 'hemoglobina',     value: 10.8, unit: 'g/dL',   examDate: '2025-11-03' },
    { examType: 'hematocrito',     value: 32.1, unit: '%',      examDate: '2025-11-03' },
    { examType: 'glicose',         value: 165,  unit: 'mg/dL',  examDate: '2025-11-03' },
    { examType: 'hba1c',           value: 8.7,  unit: '%',      examDate: '2025-11-03' },
    { examType: 'ferro',           value: 45,   unit: 'µg/dL',  examDate: '2025-11-03' },
    { examType: 'ferritina',       value: 88,   unit: 'ng/mL',  examDate: '2025-11-03' },
    { examType: 'tsat',            value: 14,   unit: '%',      examDate: '2025-11-03' },

    // Coleta de fevereiro/2026
    { examType: 'creatinina',      value: 2.4,  unit: 'mg/dL',  examDate: '2026-02-10' },
    { examType: 'ureia',           value: 78,   unit: 'mg/dL',  examDate: '2026-02-10' },
    { examType: 'tfg',             value: 22.7, unit: 'mL/min', examDate: '2026-02-10' },
    { examType: 'potassio',        value: 4.8,  unit: 'mEq/L',  examDate: '2026-02-10' },
    { examType: 'sodio',           value: 140,  unit: 'mEq/L',  examDate: '2026-02-10' },
    { examType: 'microalbuminuria',value: 620,  unit: 'mg/g',   examDate: '2026-02-10' },
    { examType: 'hemoglobina',     value: 10.5, unit: 'g/dL',   examDate: '2026-02-10' },
    { examType: 'hematocrito',     value: 31.4, unit: '%',      examDate: '2026-02-10' },
    { examType: 'glicose',         value: 148,  unit: 'mg/dL',  examDate: '2026-02-10' },
    { examType: 'hba1c',           value: 8.1,  unit: '%',      examDate: '2026-02-10' },
    { examType: 'calcio',          value: 8.8,  unit: 'mg/dL',  examDate: '2026-02-10' },
    { examType: 'fosforo',         value: 4.8,  unit: 'mg/dL',  examDate: '2026-02-10' },
    { examType: 'pth',             value: 142,  unit: 'pg/mL',  examDate: '2026-02-10' },
    { examType: 'vitamina_d',      value: 22,   unit: 'ng/mL',  examDate: '2026-02-10' },

    // Coleta de maio/2026
    { examType: 'creatinina',      value: 2.6,  unit: 'mg/dL',  examDate: '2026-05-05' },
    { examType: 'ureia',           value: 82,   unit: 'mg/dL',  examDate: '2026-05-05' },
    { examType: 'tfg',             value: 20.9, unit: 'mL/min', examDate: '2026-05-05' },
    { examType: 'potassio',        value: 4.6,  unit: 'mEq/L',  examDate: '2026-05-05' },
    { examType: 'sodio',           value: 141,  unit: 'mEq/L',  examDate: '2026-05-05' },
    { examType: 'microalbuminuria',value: 480,  unit: 'mg/g',   examDate: '2026-05-05' },
    { examType: 'hemoglobina',     value: 10.2, unit: 'g/dL',   examDate: '2026-05-05' },
    { examType: 'hematocrito',     value: 30.8, unit: '%',      examDate: '2026-05-05' },
    { examType: 'glicose',         value: 132,  unit: 'mg/dL',  examDate: '2026-05-05' },
    { examType: 'hba1c',           value: 7.4,  unit: '%',      examDate: '2026-05-05' },
    { examType: 'ferro',           value: 52,   unit: 'µg/dL',  examDate: '2026-05-05' },
    { examType: 'ferritina',       value: 110,  unit: 'ng/mL',  examDate: '2026-05-05' },
    { examType: 'tsat',            value: 17,   unit: '%',      examDate: '2026-05-05' },
    { examType: 'calcio',          value: 9.0,  unit: 'mg/dL',  examDate: '2026-05-05' },
    { examType: 'fosforo',         value: 4.5,  unit: 'mg/dL',  examDate: '2026-05-05' },
    { examType: 'pth',             value: 168,  unit: 'pg/mL',  examDate: '2026-05-05' },
    { examType: 'colesterol',      value: 174,  unit: 'mg/dL',  examDate: '2026-05-05' },
    { examType: 'ldl',             value: 88,   unit: 'mg/dL',  examDate: '2026-05-05' },
    { examType: 'hdl',             value: 42,   unit: 'mg/dL',  examDate: '2026-05-05' },
    { examType: 'triglicerides',   value: 178,  unit: 'mg/dL',  examDate: '2026-05-05' },
  ]

  await prisma.labResult.createMany({
    data: labs.map(l => ({
      patientId: patient.id,
      examType: l.examType,
      value: l.value,
      unit: l.unit,
      examDate: new Date(l.examDate),
    })),
  })

  console.log(`${labs.length} resultados laboratoriais inseridos.`)
  console.log(`\nAbrir em: http://localhost:3000/patients/${patient.id}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
