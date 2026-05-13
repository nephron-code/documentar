/**
 * Tabela pivô de resultados laboratoriais.
 *
 * Linhas  = tipos de exame (ordem clínica definida em LAB_ORDER)
 * Colunas = datas de coleta únicas, ordenadas do mais recente para o mais antigo
 *
 * Células: valor + unidade. Células sem resultado ficam em branco (—).
 * Valores fora de referência são destacados visualmente.
 */

// Tipo de resultado laboratorial (subconjunto dos campos usados na tabela)
type LabResultRow = {
  examType: string
  value: number
  unit: string | null
  examDate: Date | string
}

// Ordem de exibição e labels completos (sem abreviaturas — exibição ao paciente/médico)
const LAB_ORDER: { key: string; label: string; unit: string; ref?: { min?: number; max?: number } }[] = [
  // Função renal
  { key: 'creatinina',      label: 'Creatinina',          unit: 'mg/dL',   ref: { max: 1.2 } },
  { key: 'ureia',           label: 'Ureia',               unit: 'mg/dL',   ref: { max: 50 } },
  { key: 'tfg',             label: 'TFG estimada',        unit: 'mL/min',  ref: { min: 60 } },
  { key: 'acido_urico',     label: 'Ácido úrico',         unit: 'mg/dL',   ref: { max: 7.0 } },
  // Proteinúria
  { key: 'microalbuminuria', label: 'Relação albumina/creatinina', unit: 'mg/g', ref: { max: 30 } },
  // Eletrólitos
  { key: 'sodio',           label: 'Sódio',               unit: 'mEq/L',   ref: { min: 136, max: 145 } },
  { key: 'potassio',        label: 'Potássio',            unit: 'mEq/L',   ref: { min: 3.5, max: 5.0 } },
  { key: 'calcio',          label: 'Cálcio',              unit: 'mg/dL',   ref: { min: 8.5, max: 10.5 } },
  { key: 'fosforo',         label: 'Fósforo',             unit: 'mg/dL',   ref: { min: 2.5, max: 4.5 } },
  // Hemograma / Anemia
  { key: 'hemoglobina',     label: 'Hemoglobina',         unit: 'g/dL',    ref: { min: 11.5 } },
  { key: 'hematocrito',     label: 'Hematócrito',         unit: '%',       ref: { min: 36 } },
  { key: 'reticulocitos',   label: 'Reticulócitos',       unit: '%' },
  // Ferro
  { key: 'ferro',           label: 'Ferro sérico',        unit: 'µg/dL',   ref: { min: 60 } },
  { key: 'ferritina',       label: 'Ferritina',           unit: 'ng/mL',   ref: { min: 200 } },
  { key: 'tsat',            label: 'Saturação de transferrina', unit: '%', ref: { min: 20 } },
  // Metabolismo ósseo
  { key: 'pth',             label: 'PTH intacto',         unit: 'pg/mL' },
  { key: 'vitamina_d',      label: '25-OH Vitamina D',    unit: 'ng/mL',   ref: { min: 30 } },
  // Metabólico
  { key: 'glicose',         label: 'Glicose',             unit: 'mg/dL',   ref: { max: 100 } },
  { key: 'hba1c',           label: 'Hemoglobina glicada', unit: '%',       ref: { max: 7.0 } },
  { key: 'colesterol',      label: 'Colesterol total',    unit: 'mg/dL',   ref: { max: 190 } },
  { key: 'ldl',             label: 'LDL colesterol',      unit: 'mg/dL',   ref: { max: 70 } },
  { key: 'hdl',             label: 'HDL colesterol',      unit: 'mg/dL',   ref: { min: 40 } },
  { key: 'triglicerides',   label: 'Triglicerídeos',      unit: 'mg/dL',   ref: { max: 150 } },
  // Tireoide
  { key: 'tsh',             label: 'TSH',                 unit: 'µUI/mL',  ref: { min: 0.4, max: 4.0 } },
  { key: 'ft4',             label: 'T4 livre',            unit: 'ng/dL',   ref: { min: 0.8, max: 1.8 } },
]

type Props = {
  labResults: LabResultRow[]
}

function isAbnormal(value: number, ref?: { min?: number; max?: number }): boolean {
  if (!ref) return false
  if (ref.min !== undefined && value < ref.min) return true
  if (ref.max !== undefined && value > ref.max) return true
  return false
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default function LabTable({ labResults }: Props) {
  if (labResults.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
        <p className="text-sm">Nenhum exame registrado.</p>
      </div>
    )
  }

  // 1. Coleta datas únicas ordenadas do mais recente para o mais antigo
  const dateSet = new Set(labResults.map(lr => new Date(lr.examDate).toISOString().split('T')[0]))
  const dates = Array.from(dateSet).sort((a, b) => b.localeCompare(a))

  // 2. Monta índice: examType → dateKey → { value, unit }
  const index: Record<string, Record<string, { value: number; unit: string | null }>> = {}
  for (const lr of labResults) {
    const dateKey = new Date(lr.examDate).toISOString().split('T')[0]
    if (!index[lr.examType]) index[lr.examType] = {}
    // Guarda o mais recente por (examType, date) — já vem ordenado desc
    if (!index[lr.examType][dateKey]) {
      index[lr.examType][dateKey] = { value: lr.value, unit: lr.unit }
    }
  }

  // 3. Filtra apenas os exames que têm pelo menos um resultado
  const presentRows = LAB_ORDER.filter(exam => index[exam.key])

  // Exames não reconhecidos (não estão em LAB_ORDER) — aparecem no final
  const knownKeys = new Set(LAB_ORDER.map(e => e.key))
  const unknownTypes = [...new Set(labResults.map(lr => lr.examType))].filter(t => !knownKeys.has(t))

  // Limite de colunas visíveis para não quebrar o layout (mostra mais recentes)
  const MAX_COLS = 8
  const visibleDates = dates.slice(0, MAX_COLS)
  const hiddenCount = dates.length - visibleDates.length

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide sticky left-0 bg-gray-50 z-10 min-w-[180px]">
                Exame
              </th>
              {visibleDates.map(d => (
                <th key={d} className="text-center px-3 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap min-w-[80px]">
                  {formatDate(d)}
                </th>
              ))}
              {hiddenCount > 0 && (
                <th className="text-center px-3 py-3 text-xs text-gray-400">
                  +{hiddenCount} datas
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {presentRows.map((exam, rowIdx) => (
              <tr key={exam.key} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className={`px-4 py-2.5 text-xs font-medium text-gray-700 sticky left-0 z-10 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  {exam.label}
                  <span className="block text-gray-400 font-normal">{exam.unit}</span>
                </td>
                {visibleDates.map(d => {
                  const cell = index[exam.key]?.[d]
                  const abnormal = cell ? isAbnormal(cell.value, exam.ref) : false
                  return (
                    <td key={d} className="px-3 py-2.5 text-center">
                      {cell ? (
                        <span className={`text-sm font-medium ${abnormal ? 'text-red-600' : 'text-gray-900'}`}>
                          {cell.value % 1 === 0 ? cell.value : cell.value.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  )
                })}
                {hiddenCount > 0 && <td />}
              </tr>
            ))}

            {/* Exames não catalogados */}
            {unknownTypes.map((type, rowIdx) => (
              <tr key={type} className={(presentRows.length + rowIdx) % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className={`px-4 py-2.5 text-xs font-medium text-gray-500 italic sticky left-0 z-10 ${(presentRows.length + rowIdx) % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  {type}
                </td>
                {visibleDates.map(d => {
                  const cell = index[type]?.[d]
                  return (
                    <td key={d} className="px-3 py-2.5 text-center">
                      {cell ? (
                        <span className="text-sm font-medium text-gray-900">
                          {cell.value % 1 === 0 ? cell.value : cell.value.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  )
                })}
                {hiddenCount > 0 && <td />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hiddenCount > 0 && (
        <p className="text-xs text-gray-400 px-4 py-2 border-t border-gray-100">
          Mostrando as {MAX_COLS} datas mais recentes. {hiddenCount} data{hiddenCount > 1 ? 's' : ''} anterior{hiddenCount > 1 ? 'es' : ''} ocult{hiddenCount > 1 ? 'as' : 'a'}.
        </p>
      )}
    </div>
  )
}
