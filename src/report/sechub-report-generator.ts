import * as fs from 'fs/promises'
import { SecHubFinding, SecHubReport } from '../model/sechub'
import { ReportResult } from '../model/report-result'
import { ReportGenerator } from './report-generator'
import { ContextExtensions } from '../github/utils'
import { Context } from '@actions/github/lib/context'

const HEADER = '| Severity | Type | Location | Relevant part | Source'
const HEADER_ALIGNMENT = '|-|-|-|-|-|'
const FILE_ENCODING = 'utf-8'
const SUCCESS_COMMENT =
  '# :white_check_mark: SecHub - No findings detected on your code base!'
const FAIL_COMMENT =
  '# :x: SecHub - We detected some findings on your code base!'
const CWE_LINK = (id: number): string =>
  `[CWE ${id}](https://cwe.mitre.org/data/definitions/${id}.html)`

export class SecHubReportGenerator implements ReportGenerator {
  private context: ContextExtensions

  constructor(context: Context) {
    this.context = ContextExtensions.of(context)
  }

  private getLinkedLocation(secHubFinding: SecHubFinding): string {
    const location = [
      secHubFinding.code.location,
      secHubFinding.code.line,
      secHubFinding.code.column
    ]
      .filter(x => !!x)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map(x => x!)
      .join(':')
    return location
      ? `[${location}](${this.context.getLinkToFile(
          secHubFinding.code.location,
          secHubFinding.code.line
        )})`
      : location
  }

  private getLinkedCwe(secHubFinding: SecHubFinding): string | undefined {
    return secHubFinding?.cweId ? CWE_LINK(secHubFinding.cweId) : undefined
  }

  private getType(secHubFinding: SecHubFinding): string {
    const cweLink = this.getLinkedCwe(secHubFinding)
    return (
      [secHubFinding.name, cweLink]
        .filter(x => !!x)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map(x => x)
        .join(' - ')
    )
  }

  private makeReportLine(secHubFinding: SecHubFinding): string {
    // server_url/user/repo/blob/<commit-ref>/path#line
    const linkedLocation = this.getLinkedLocation(secHubFinding)
    const type = this.getType(secHubFinding)

    const result = [
      secHubFinding.severity,
      type,
      linkedLocation,
      secHubFinding.code.relevantPart,
      secHubFinding.code.source ?? ''
    ]
      .map(x => x ?? '')
      .join(' | ')

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
}
