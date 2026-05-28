const CONDUCT_POINTS = [
  'Hidratação oral: alvo diurese > 2,5 L/dia (8–10 copos de água).',
  'Dieta hipossódica (< 2 g/dia de sódio) e normoproteica (0,8–1 g/kg/dia).',
  'Evitar excesso de proteína animal e oxalato (AUA/EAU 2023).',
  'Investigação metabólica: urina de 24h — cálcio, ácido úrico, oxalato, citrato, pH urinário.',
  'Citrato de potássio: se hipocitraturía ou litíase úrica (alvo pH urinário 6,5–7,0).',
  'Alopurinol: se hiperuricosúria ou litíase úrica persistente.',
  'Tiazídico: se hipercalciúria idiopática.',
  'Imagem: USG ou TC de abdome/pelve sem contraste para cálculos residuais.',
  'Encaminhar à urologia se cálculo > 6 mm, cólica refratária ou hidronefrose.',
  'Retorno em 3–6 meses com exames e nova imagem.',
]

export default function LitiaseAlert() {
  return (
    <div className="rounded-lg border p-4 space-y-3 bg-amber-50 border-amber-200">

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-tight text-amber-900">
            Litíase Renal
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            AUA/EAU 2023
          </span>
        </div>
        <div className="text-sm text-amber-900">
          <span className="font-semibold">Retorno em 3–6 meses</span>
        </div>
      </div>

      <p className="text-xs text-amber-900 opacity-80">
        Investigação metabólica com urina de 24h. Encaminhar à urologia se cálculo &gt; 6 mm ou hidronefrose.
      </p>

      <details className="group">
        <summary className="cursor-pointer text-sm font-medium select-none text-amber-900 list-none flex items-center gap-1.5">
          <svg className="w-4 h-4 transition-transform group-open:rotate-90 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Pontos de conduta — Litíase Renal (AUA/EAU 2023)
        </summary>
        <ul className="mt-2 space-y-1.5 pl-5">
          {CONDUCT_POINTS.map((point, i) => (
            <li key={i} className="text-xs text-amber-900 list-disc leading-relaxed">
              {point}
            </li>
          ))}
        </ul>
      </details>

    </div>
  )
}
