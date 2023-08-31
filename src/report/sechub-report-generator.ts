import * as fs from 'fs/promises'
import { SecHubFinding, SecHubReport } from '../model/sechub'
import { ReportResult } from '../model/report-result'
import { ReportGenerator } from './report-generator'

const HEADER = '| Severity | Type | Location | Relevant part | Source'
const HEADER_ALIGNMENT = '|-|-|-|-|-|'
const FILE_ENCODING = 'utf-8'
const SUCCESS_COMMENT =
  '# :white_check_mark: SecHub - No findings detected on your code base!'
const FAIL_COMMENT =
  '# :x: SecHub - We detected some findings on your code base!'

export class SecHubReportGenerator implements ReportGenerator {
  private constructor() {}

  private makeReportLine(secHubFinding: SecHubFinding): string {
    // server_url/user/repo/blob/<commit-ref>/path#line
    const location = [
      secHubFinding.code.location,
      secHubFinding.code.line,
      secHubFinding.code.column
    ]
      .filter(x => !!x)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map(x => x!)
      .join(':')
    const type = [secHubFinding.name, secHubFinding.cweId?.toString()]
      .filter(x => !!x)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map(x => x)
      .join('-')
    const result = [
      secHubFinding.severity,
      type,
      location,
      secHubFinding.code.relevantPart,
      secHubFinding.code.source ?? ''
    ]
      .map(x => x ?? '')
      .join('|')
    return `| ${result} |`
  }

  async generateReport(path: string): Promise<ReportResult> {
    const result = await fs.readFile(path, FILE_ENCODING)
    const secHubReport = JSON.parse(result) as SecHubReport

    const reportTable: string[] = []

    const findings: SecHubFinding[] = secHubReport.result.findings ?? []

    if (findings.length <= 0) return { report: SUCCESS_COMMENT, failed: false }

    reportTable.push(FAIL_COMMENT)
    reportTable.push(HEADER)
    reportTable.push(HEADER_ALIGNMENT)

    for (const finding of findings) {
      reportTable.push(this.makeReportLine(finding))
    }

    return { report: reportTable.join('\n'), failed: true }
  }

  private static instance: SecHubReportGenerator | null

  static getInstance(): SecHubReportGenerator {
    if (!SecHubReportGenerator.instance) {
      SecHubReportGenerator.instance = new SecHubReportGenerator()
    }
    return SecHubReportGenerator.instance
  }
}
