'use client'

/**
 * Gráfico de evolução longitudinal de exames laboratoriais.
 *
 * Permite ao usuário selecionar qual exame visualizar num gráfico de linha.
 * Exibe linha de referência (zona normal) quando disponível.
 * Pontos fora de referência aparecem em vermelho.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
  Dot,
} from 'recharts'
import { useState, useMemo } from 'react'

type LabResultRow = {
  examType: string
  value: number
  unit: string | null
  examDate: Date | string
}

// Metadados dos exames — deve manter consistência com LabTable.tsx
const LAB_META: Record<string, { label: string; unit: string; ref?: { min?: number; max?: number } }> = {
  creatinina:      { label: 'Creatinina',                    unit: 'mg/dL',   ref: { max: 1.2 } },
  ureia:           { label: 'Ureia',                         unit: 'mg/dL',   ref: { max: 50 } },
  tfg:             { label: 'TFG estimada',                  unit: 'mL/min',  ref: { min: 60 } },
  acido_urico:     { label: 'Ácido úrico',                   unit: 'mg/dL',   ref: { max: 7.0 } },
  microalbuminuria:{ label: 'RAC (albumina/creatinina)',     unit: 'mg/g',    ref: { max: 30 } },
  sodio:           { label: 'Sódio',                         unit: 'mEq/L',   ref: { min: 136, max: 145 } },
  potassio:        { label: 'Potássio',                      unit: 'mEq/L',   ref: { min: 3.5, max: 5.0 } },
  calcio:          { label: 'Cálcio',                        unit: 'mg/dL',   ref: { min: 8.5, max: 10.5 } },
  fosforo:         { label: 'Fósforo',                       unit: 'mg/dL',   ref: { min: 2.5, max: 4.5 } },
  hemoglobina:     { label: 'Hemoglobina',                   unit: 'g/dL',    ref: { min: 11.5 } },
  hematocrito:     { label: 'Hematócrito',                   unit: '%',       ref: { min: 36 } },
  ferro:           { label: 'Ferro sérico',                  unit: 'µg/dL',   ref: { min: 60 } },
  ferritina:       { label: 'Ferritina',                     unit: 'ng/mL',   ref: { min: 200 } },
  tsat:            { label: 'Saturação de transferrina',     unit: '%',       ref: { min: 20 } },
  pth:             { label: 'PTH intacto',                   unit: 'pg/mL' },
  vitamina_d:      { label: '25-OH Vitamina D',              unit: 'ng/mL',   ref: { min: 30 } },
  glicose:         { label: 'Glicose',                       unit: 'mg/dL',   ref: { max: 100 } },
  hba1c:           { label: 'Hemoglobina glicada',           unit: '%',       ref: { max: 7.0 } },
  colesterol:      { label: 'Colesterol total',              unit: 'mg/dL',   ref: { max: 190 } },
  ldl:             { label: 'LDL colesterol',                unit: 'mg/dL',   ref: { max: 70 } },
  hdl:             { label: 'HDL colesterol',                unit: 'mg/dL',   ref: { min: 40 } },
  triglicerides:   { label: 'Triglicerídeos',                unit: 'mg/dL',   ref: { max: 150 } },
  tsh:             { label: 'TSH',                           unit: 'µUI/mL',  ref: { min: 0.4, max: 4.0 } },
  ft4:             { label: 'T4 livre',                      unit: 'ng/dL',   ref: { min: 0.8, max: 1.8 } },
}

function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function isAbnormal(value: number, ref?: { min?: number; max?: number }): boolean {
  if (!ref) return false
  if (ref.min !== undefined && value < ref.min) return true
  if (ref.max !== undefined && value > ref.max) return true
  return false
}

// Ponto colorido: vermelho se fora do normal, azul se normal
function CustomDot(props: { cx?: number; cy?: number; payload?: { value: number; abnormal: boolean } }) {
  const { cx, cy, payload } = props
  if (cx === undefined || cy === undefined) return null
  const color = payload?.abnormal ? '#ef4444' : '#3b82f6'
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={1.5} />
}

// Tooltip customizado
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { date: string; value: number; abnormal: boolean }; name: string }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="text-gray-500 mb-1">{d.date}</p>
      <p className={`font-semibold text-sm ${d.abnormal ? 'text-red-600' : 'text-gray-900'}`}>
        {d.value}
      </p>
    </div>
  )
}

type Props = {
  labResults: LabResultRow[]
}

export default function LabChart({ labResults }: Props) {
  // Determina quais exames têm dados suficientes para graficar (≥2 pontos)
  const availableExams = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const lr of labResults) {
      counts[lr.examType] = (counts[lr.examType] ?? 0) + 1
    }
    return Object.entries(counts)
      .filter(([, count]) => count >= 2)
      .map(([key]) => key)
      .sort((a, b) => {
        // Prioridade: exames renais primeiro
        const priority = ['creatinina', 'tfg', 'ureia', 'potassio', 'hemoglobina']
        const ai = priority.indexOf(a)
        const bi = priority.indexOf(b)
        if (ai !== -1 && bi !== -1) return ai - bi
        if (ai !== -1) return -1
        if (bi !== -1) return 1
        return a.localeCompare(b)
      })
  }, [labResults])

  const [selectedExam, setSelectedExam] = useState<string>(() => availableExams[0] ?? '')

  const chartData = useMemo(() => {
    if (!selectedExam) return []
    const meta = LAB_META[selectedExam]
    return labResults
      .filter(lr => lr.examType === selectedExam)
      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
      .map(lr => ({
        date: formatDateShort(lr.examDate),
        value: lr.value,
        abnormal: isAbnormal(lr.value, meta?.ref),
      }))
  }, [labResults, selectedExam])

  if (availableExams.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-400 text-sm">
        São necessários pelo menos 2 resultados do mesmo exame para exibir o gráfico.
      </div>
    )
  }

  const meta = LAB_META[selectedExam]
  const ref = meta?.ref
  const values = chartData.map(d => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)

  // Calcula domínio do eixo Y com folga de 20%
  const padding = Math.max((maxVal - minVal) * 0.2, maxVal * 0.1, 0.5)
  const yMin = Math.max(0, Math.floor(minVal - padding))
  const yMax = Math.ceil(maxVal + padding)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Seletor de exame */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Exame</span>
        <div className="flex flex-wrap gap-1.5">
          {availableExams.map(key => {
            const label = LAB_META[key]?.label ?? key
            return (
              <button
                key={key}
                onClick={() => setSelectedExam(key)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  selectedExam === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Título e unidade */}
      <div className="mb-3">
        <p className="text-sm font-semibold text-gray-800">
          {meta?.label ?? selectedExam}
          {meta && <span className="ml-1.5 text-xs text-gray-400 font-normal">({meta.unit})</span>}
        </p>
        {ref && (
          <p className="text-xs text-gray-400 mt-0.5">
            Referência:{' '}
            {ref.min !== undefined && ref.max !== undefined && `${ref.min} – ${ref.max}`}
            {ref.min !== undefined && ref.max === undefined && `≥ ${ref.min}`}
            {ref.max !== undefined && ref.min === undefined && `≤ ${ref.max}`}
            {' '}{meta?.unit}
          </p>
        )}
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Zona de normalidade (fundo verde claro) */}
          {ref && (
            <ReferenceArea
              y1={ref.min ?? yMin}
              y2={ref.max ?? yMax}
              fill="#dcfce7"
              fillOpacity={0.5}
            />
          )}

          {/* Linhas de referência */}
          {ref?.min !== undefined && (
            <ReferenceLine y={ref.min} stroke="#86efac" strokeDasharray="4 3" strokeWidth={1.5} />
          )}
          {ref?.max !== undefined && (
            <ReferenceLine y={ref.max} stroke="#86efac" strokeDasharray="4 3" strokeWidth={1.5} />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: '#3b82f6' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
