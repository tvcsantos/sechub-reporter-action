export interface SecHubReport {
  result: SecHubResult
  trafficLight: string
  status: string
}

export interface SecHubResult {
  count: number
  findings: SecHubFinding[]
}

export interface SecHubFinding {
  name: string
  severity: string
  code: SecHubCodeFinding
  cweId?: number
}

export interface SecHubCodeFinding {
  location: string
  line?: number
  column?: number
  source?: string
  relevantPart?: string
  calls?: SecHubCodeFinding
}
