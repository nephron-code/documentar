type Sex = 'MALE' | 'FEMALE'
export type AlertLevel = 'normal' | 'low' | 'high' | 'critical-low' | 'critical-high'

type Range = { critLow?: number; low?: number; high?: number; critHigh?: number }
type SexRange = { MALE: Range; FEMALE: Range }
type AnyRange = Range | SexRange

function resolve(r: AnyRange, sex: Sex): Range {
  return 'MALE' in r ? r[sex] : r
}

const REF: Record<string, AnyRange> = {
  creatinina:       { MALE: { low: 0.7, high: 1.2 },    FEMALE: { low: 0.5, high: 1.0 } },
  ureia:            { low: 10, high: 50 },
  acido_urico:      { MALE: { high: 7.2 },               FEMALE: { high: 6.0 } },
  sodio:            { critLow: 125, low: 135, high: 145, critHigh: 155 },
  potassio:         { critLow: 3.0, low: 3.5, high: 5.0, critHigh: 6.0 },
  calcio:           { low: 8.5, high: 10.5 },
  fosforo:          { low: 2.5, high: 4.5 },
  microalbuminuria: { high: 30 },
  hemoglobina:      { MALE: { critLow: 7.0, low: 13.5 }, FEMALE: { critLow: 7.0, low: 12.0 } },
  hematocrito:      { MALE: { low: 41, high: 53 },        FEMALE: { low: 36, high: 46 } },
  reticulocitos:    { low: 0.5, high: 2.5 },
  ferro:            { low: 60, high: 170 },
  ferritina:        { MALE: { low: 24, high: 336 },       FEMALE: { low: 11, high: 307 } },
  tsat:             { low: 20, high: 50 },
  pth:              { low: 15, high: 65 },
  vitamina_d:       { low: 30 },
  glicose:          { critLow: 55, low: 70, high: 100,   critHigh: 500 },
  hba1c:            { high: 5.7 },
  colesterol:       { high: 200 },
  ldl:              { high: 130 },
  hdl:              { MALE: { low: 40 },                  FEMALE: { low: 50 } },
  triglicerides:    { high: 150 },
  tsh:              { low: 0.4, high: 4.0 },
  ft4:              { low: 0.8, high: 1.8 },
}

export function getLabAlert(key: string, value: number, sex: Sex): AlertLevel {
  const entry = REF[key]
  if (!entry) return 'normal'
  const r = resolve(entry, sex)
  if (r.critLow !== undefined && value <= r.critLow) return 'critical-low'
  if (r.critHigh !== undefined && value >= r.critHigh) return 'critical-high'
  if (r.low !== undefined && value < r.low) return 'low'
  if (r.high !== undefined && value > r.high) return 'high'
  return 'normal'
}

export function getLabRefText(key: string, sex: Sex): string {
  const entry = REF[key]
  if (!entry) return ''
  const r = resolve(entry, sex)
  if (r.low !== undefined && r.high !== undefined) return `${r.low}–${r.high}`
  if (r.low !== undefined) return `>${r.low}`
  if (r.high !== undefined) return `<${r.high}`
  return ''
}
