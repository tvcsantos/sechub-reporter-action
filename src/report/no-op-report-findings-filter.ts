import { SecHubFinding } from '../model/sechub'
import { ReportFindingsFilter } from './report-findings-filter'

export class NoOpReportFindingsFilter implements ReportFindingsFilter {
  async filter(findings: SecHubFinding[]): Promise<SecHubFinding[]> {
    return findings
  }

  private static instance: NoOpReportFindingsFilter | undefined

  static getInstance(): NoOpReportFindingsFilter {
    if (!NoOpReportFindingsFilter.instance) {
      NoOpReportFindingsFilter.instance = new NoOpReportFindingsFilter()
    }
    return NoOpReportFindingsFilter.instance
  }
}
