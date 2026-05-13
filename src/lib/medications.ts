/**
 * Lista de medicamentos frequentes em nefrologia ambulatorial.
 *
 * Organizada por classe terapêutica.
 * Nomes em português (denominação comum brasileira / DCB).
 *
 * Fontes: Formulário Terapêutico Nacional, KDIGO 2024, RENAME 2022.
 */

export type Medication = {
  name: string
  hint?: string  // dose ou observação curta para o autocomplete
}

export const MEDICATIONS: Medication[] = [
  // --- SRAA ---
  { name: 'Enalapril',            hint: 'IECA — 5 a 40 mg/dia' },
  { name: 'Lisinopril',           hint: 'IECA — 5 a 40 mg/dia' },
  { name: 'Ramipril',             hint: 'IECA — 2,5 a 10 mg/dia' },
  { name: 'Losartana',            hint: 'BRA — 50 a 100 mg/dia' },
  { name: 'Valsartana',           hint: 'BRA — 80 a 320 mg/dia' },
  { name: 'Irbesartana',          hint: 'BRA — 150 a 300 mg/dia' },
  { name: 'Candesartana',         hint: 'BRA — 8 a 32 mg/dia' },
  { name: 'Finerenona',           hint: 'ARM não esteroidal — DRC + DM' },
  { name: 'Espironolactona',      hint: 'ARM — 25 a 100 mg/dia' },

  // --- SGLT2 ---
  { name: 'Dapagliflozina',       hint: 'iSGLT2 — 10 mg/dia (DRC/DM/IC)' },
  { name: 'Empagliflozina',       hint: 'iSGLT2 — 10 a 25 mg/dia' },

  // --- Anti-hipertensivos ---
  { name: 'Anlodipino',           hint: 'BCC — 5 a 10 mg/dia' },
  { name: 'Nifedipino retard',    hint: 'BCC — 30 a 60 mg/dia' },
  { name: 'Hidralazina',          hint: '25 a 100 mg 8/8h' },
  { name: 'Clonidina',            hint: '0,1 a 0,3 mg 8/8h' },
  { name: 'Metildopa',            hint: '250 a 500 mg 8/8h' },
  { name: 'Carvedilol',           hint: 'Beta-bloq — 6,25 a 25 mg 12/12h' },
  { name: 'Atenolol',             hint: 'Beta-bloq — 25 a 100 mg/dia' },
  { name: 'Metoprolol',           hint: 'Beta-bloq — 25 a 200 mg/dia' },
  { name: 'Furosemida',           hint: 'Diurético de alça — 20 a 120 mg/dia' },
  { name: 'Hidroclorotiazida',    hint: 'Tiazídico — 12,5 a 25 mg/dia' },
  { name: 'Clortalidona',         hint: 'Tiazídico-like — 12,5 a 25 mg/dia' },

  // --- Anemia renal ---
  { name: 'Eritropoetina alfa',   hint: 'AEE — SC 3x/semana' },
  { name: 'Darbepoetina alfa',    hint: 'AEE — SC semanal ou quinzenal' },
  { name: 'Sulfato ferroso',      hint: 'Reposição de ferro oral — 300 mg 2x/dia' },
  { name: 'Sacarato de hidróxido de ferro',  hint: 'Ferro IV — 100-200 mg por sessão' },
  { name: 'Carboximaltose férrica', hint: 'Ferro IV — 500-1000 mg dose única' },

  // --- Metabolismo mineral-ósseo ---
  { name: 'Carbonato de cálcio',  hint: 'Quelante de fósforo — 500 mg às refeições' },
  { name: 'Sevelamer',            hint: 'Quelante de fósforo sem cálcio — 800 mg às refeições' },
  { name: 'Carbonato de lantânio', hint: 'Quelante de fósforo — 500 mg às refeições' },
  { name: 'Calcitriol',           hint: 'Vitamina D ativa — 0,25 a 0,5 µg/dia' },
  { name: 'Colecalciferol',       hint: 'Vitamina D3 — reposição 25-OH Vit D' },
  { name: 'Paricalcitol',         hint: 'Vitamina D análogo — IV ou VO' },
  { name: 'Cinacalcete',          hint: 'Calcimimético — 30 a 180 mg/dia' },

  // --- Acidose metabólica ---
  { name: 'Bicarbonato de sódio', hint: 'Alcalinização — 650 mg a 1 g 8/8h' },

  // --- Diabetes ---
  { name: 'Metformina',           hint: 'Biguanida — suspender se TFG < 30' },
  { name: 'Insulina NPH',         hint: 'Ajustar dose conforme função renal' },
  { name: 'Insulina regular',     hint: 'Ajustar dose conforme função renal' },
  { name: 'Semaglutida',          hint: 'GLP-1 — 0,5 a 2 mg semanal' },
  { name: 'Liraglutida',          hint: 'GLP-1 — 1,2 a 1,8 mg/dia' },

  // --- Lipídeos ---
  { name: 'Atorvastatina',        hint: '10 a 80 mg/dia' },
  { name: 'Rosuvastatina',        hint: '5 a 20 mg/dia (ajustar em DRC avançada)' },
  { name: 'Ezetimiba',            hint: '10 mg/dia' },
  { name: 'Fenofibrato',          hint: 'Evitar em TFG < 30' },

  // --- Nefrolitíase ---
  { name: 'Citrato de potássio',  hint: 'Alcalinização urinária — 20-60 mEq/dia' },
  { name: 'Alopurinol',           hint: 'Redução de urato — 100 a 300 mg/dia' },
  { name: 'Clortalidona',         hint: 'Tiazídico — hipercalciúria, 12,5 a 25 mg/dia' },

  // --- Outros ---
  { name: 'Prednisona',           hint: 'Corticoide — glomerulopatias' },
  { name: 'Micofenolato de mofetila', hint: 'Imunossupressor — glomerulopatias' },
  { name: 'Azatioprina',          hint: 'Imunossupressor' },
  { name: 'Tacrolimo',            hint: 'Imunossupressor — pós-transplante / GESF' },
]

/**
 * Filtra medicamentos pelo termo de busca (insensível a maiúsculas).
 * Retorna no máximo `limit` resultados.
 */
export function searchMedications(query: string, limit = 8): Medication[] {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  return MEDICATIONS
    .filter(m => m.name.toLowerCase().includes(q))
    .slice(0, limit)
}
