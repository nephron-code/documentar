/**
 * Calculadora CKD-EPI 2021 (sem fator raça)
 *
 * Referência: Inker LA et al. NEJM 2021;385:1737-1749
 * Fórmula adotada pelas diretrizes KDIGO 2024 para estimativa de TFG.
 *
 * A equação usa creatinina sérica (mg/dL), idade (anos) e sexo.
 * O fator raça foi removido na revisão de 2021.
 */

export type Sex = 'MALE' | 'FEMALE'

/**
 * Calcula a Taxa de Filtração Glomerular estimada (TFGe) pela equação CKD-EPI 2021.
 *
 * @param creatinina  Creatinina sérica em mg/dL
 * @param idadeAnos   Idade em anos inteiros
 * @param sexo        'MALE' | 'FEMALE'
 * @returns TFGe arredondada para 1 casa decimal (mL/min/1,73m²), ou null se inputs inválidos
 */
export function calcTFGe(
  creatinina: number,
  idadeAnos: number,
  sexo: Sex,
): number | null {
  if (!creatinina || creatinina <= 0 || !idadeAnos || idadeAnos <= 0) return null

  // Constantes por sexo
  const kappa = sexo === 'FEMALE' ? 0.7 : 0.9
  const alpha = sexo === 'FEMALE' ? -0.241 : -0.302
  const sexFactor = sexo === 'FEMALE' ? 1.012 : 1.0

  const ratio = creatinina / kappa

  // Parte da equação: min(Cr/κ, 1)^α × max(Cr/κ, 1)^(−1.200)
  const minPart = Math.pow(Math.min(ratio, 1), alpha)
  const maxPart = Math.pow(Math.max(ratio, 1), -1.2)

  const tfg = 142 * minPart * maxPart * Math.pow(0.9938, idadeAnos) * sexFactor

  return Math.round(tfg * 10) / 10
}

/**
 * Calcula idade em anos a partir da data de nascimento.
 */
export function calcIdade(birthDate: Date | string): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}
