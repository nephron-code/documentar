/**
 * @deprecated Use `composeConsultationNote` from `@/lib/composeConsultationNote` instead.
 * Este arquivo é mantido apenas para compatibilidade retroativa e será removido em breve.
 */
export {
  composeConsultationNote as generateEHRText,
  composeCompactSummary as generateCompactSummary,
} from './composeConsultationNote'

export type { PatientData, EvolutionData, LabResultData } from './composeConsultationNote'
