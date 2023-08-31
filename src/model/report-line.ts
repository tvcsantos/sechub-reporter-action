export interface ReportLine {
  severity: string
  type: string
  location: string
  line?: number
  column?: number
  source?: string
  relevantPart?: string
  cweId?: number
}
