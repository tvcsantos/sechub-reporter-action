import { CompareMode } from '../input/inputs'

export interface ReportProperties {
  maxSize?: number
  considerErrorOnSeverities: string[]
  compareMode: CompareMode
}
