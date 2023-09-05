import { GitHubCheck, GitHubCheckCreator } from '../github/check'
import { Inputs, ModeOption } from '../input/inputs'
import { Reporter } from '../report/reporter'
import * as github from '@actions/github'
import { CommentReporter } from '../report/comment-reporter'
import { GitHubPRCommenter } from '../github/comment'
import { APPLICATION_NAME, CHECK_NAME } from './constants'
import { CheckReporter } from '../report/check-reporter'
import { SummaryReporter } from '../report/summary-reporter'
import * as core from '@actions/core'
import { GitHub } from '@actions/github/lib/utils'
import { SecHubReportGenerator } from '../report/sechub-report-generator'
import fs from 'fs/promises'
import { extendedContext } from '../github/extended-context'
import { ReportResult } from '../model/report-result'
import { SecHubReport } from '../model/sechub'

const FILE_ENCODING = 'utf-8'

export class ActionOrchestrator {
  private gitHubCheck: GitHubCheck | null = null
  private inputs?: Inputs

  private getOctokit(): InstanceType<typeof GitHub> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion,@typescript-eslint/no-extra-non-null-assertion
    return github.getOctokit(this.inputs!!.token)
  }

  private async getReporter(mode: ModeOption): Promise<Reporter> {
    switch (mode) {
      case ModeOption.PR_COMMENT:
        return new CommentReporter(
          new GitHubPRCommenter(
            APPLICATION_NAME,
            this.getOctokit(),
            extendedContext
          )
        )
      case ModeOption.CHECK: {
        const gitHubCheckCreator = new GitHubCheckCreator(
          this.getOctokit(),
          extendedContext
        )
        this.gitHubCheck = await gitHubCheckCreator.create(CHECK_NAME)
        return new CheckReporter(this.gitHubCheck)
      }
      case ModeOption.SUMMARY:
        return new SummaryReporter(core.summary)
    }
  }

  private async getReporters(): Promise<Reporter[]> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion,@typescript-eslint/no-extra-non-null-assertion
    const modes = this.inputs!!.modes
    const result: Reporter[] = []
    for (const mode of modes) {
      result.push(await this.getReporter(mode))
    }
    return result
  }

  private async parseReport(): Promise<SecHubReport> {
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion,@typescript-eslint/no-non-null-assertion
    const fileContents = await fs.readFile(this.inputs!!.file, {
      encoding: FILE_ENCODING
    })
    return JSON.parse(fileContents) as SecHubReport
  }

  private async doReports(
    reportData: SecHubReport,
    reporters: Reporter[]
  ): Promise<boolean> {
    const reportGenerator = new SecHubReportGenerator(extendedContext)
    const reportResults = new Map<number | null, ReportResult>()
    let failed = false

    for (const reporter of reporters) {
      let reportResult = reportResults.get(reporter.maxSize)

      if (reportResult === undefined) {
        reportResult = await reportGenerator.generateReport(reportData, {
          maxSize: reporter.maxSize ?? undefined
        })
        reportResults.set(reporter.maxSize, reportResult)
      }

      failed &&= reportResult.failed

      await reporter.report(reportResult)
    }

    return failed
  }

  async execute(inputs: Inputs): Promise<number> {
    this.inputs = inputs
    const reporters = await this.getReporters()
    try {
      const report = await this.parseReport()

      const failed = await this.doReports(report, reporters)

      return failed && this.inputs.failOnError ? 1 : 0
    } catch (e) {
      this.gitHubCheck?.cancel()
      throw e
    }
  }
}
