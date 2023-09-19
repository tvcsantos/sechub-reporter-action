import { SecHubFinding, SecHubReport } from '../model/sechub'
import { ReportResult } from '../model/report-result'
import { ReportGenerator } from './report-generator'
import { ExtendedContext } from '../github/extended-context'
import { pre } from '../utils/utils'
import { ReportProperties } from './report-properties'
import { TextBuilder } from './text-builder'
import { Severity } from '../input/inputs'

const HEADER = '| Severity | Type | Location | Relevant part | Source'
const HEADER_ALIGNMENT = '|-|-|-|-|-|'
const SUCCESS_COMMENT =
  '# :white_check_mark: SecHub - No findings detected on your code base!'
const FAIL_COMMENT = (fail: boolean): string =>
  `# ${
    fail ? ':x:' : ':warning:'
  } SecHub - We detected some findings on your code base!`
const CWE_LINK = (id: number): string =>
  `[CWE&#8209;${id}](https://cwe.mitre.org/data/definitions/${id}.html)`

export class SecHubReportGenerator implements ReportGenerator<SecHubReport> {
  private context: ExtendedContext

  constructor(context: ExtendedContext) {
    this.context = context
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

  private getSource(secHubFinding: SecHubFinding): string | undefined {
    const source = secHubFinding.code.source
    return source ? pre(source) : undefined
  }

  private getRelevantPart(secHubFinding: SecHubFinding): string | undefined {
    const relevantPart = secHubFinding.code.relevantPart
    return relevantPart ? pre(relevantPart) : undefined
  }

  private makeReportLine(secHubFinding: SecHubFinding): string {
    // server_url/user/repo/blob/<commit-ref>/path#line
    const linkedLocation = this.getLinkedLocation(secHubFinding)
    const type = this.getType(secHubFinding)

    const result = [
      secHubFinding.severity,
      type,
      linkedLocation,
      this.getRelevantPart(secHubFinding),
      this.getSource(secHubFinding)
    ]
      .map(x => x ?? '')
      .join(' | ')

    return `| ${result} |`
  }

  private addTitleToTextBuilder(
    textBuilder: TextBuilder,
    failed: boolean
  ): void {
    textBuilder.addLines(FAIL_COMMENT(failed))
  }

  private addHeaderToTextBuilder(textBuilder: TextBuilder): void {
    textBuilder.addLines(HEADER, HEADER_ALIGNMENT)
  }

  private async addContentToTextBuilder(
    textBuilder: TextBuilder,
    findings: SecHubFinding[]
  ): Promise<boolean> {
    let isContentTruncated = false
    for (const finding of findings) {
      const theReportLine = this.makeReportLine(finding)
      const addedLines = textBuilder.tryAddLines(theReportLine)
      if (!addedLines) {
        isContentTruncated = true
        break
      }
    }
    return isContentTruncated
  }

  async generateReport(
    reportData: SecHubReport,
    properties: ReportProperties
  ): Promise<ReportResult> {
    const findings: SecHubFinding[] = reportData.result.findings ?? []

    if (findings.length <= 0) {
      return {
        report: SUCCESS_COMMENT,
        failed: false,
        truncated: false,
        hasErrors: false
      }
    }

    const doNotConsiderErrorIfSeveritiesFound =
      properties.errorOnSeverities.includes(Severity.NONE)
    const errorOnAllSeverities =
      findings.length > 0 && properties.errorOnSeverities.includes(Severity.ALL)
    const errorOnOtherSeverities = (): boolean =>
      findings.some(x => properties.errorOnSeverities.includes(x.severity))

    const failed =
      !doNotConsiderErrorIfSeveritiesFound &&
      (errorOnAllSeverities || errorOnOtherSeverities())

    const textBuilder = new TextBuilder(properties.maxSize)

    this.addTitleToTextBuilder(textBuilder, failed)
    this.addHeaderToTextBuilder(textBuilder)
    const isContentTruncated = await this.addContentToTextBuilder(
      textBuilder,
      findings
    )

    return {
      report: textBuilder.build(),
      failed,
      truncated: isContentTruncated,
      hasErrors: findings.length > 0
    }
  }
}
