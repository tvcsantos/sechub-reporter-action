import { SecHubFinding } from '../model/sechub'

export interface ReportFindingsFilter {
  filter(findings: SecHubFinding[]): Promise<SecHubFinding[]>
}
