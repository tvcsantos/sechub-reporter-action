import { GitHubCheck } from '../github/check'
import { Reporter } from './reporter'
import { ReportResult } from '../model/report-result'

const FAIL_SUMMARY = 'SecHub - We detected some findings on your code base!'
const SUCCESS_SUMMARY = 'SecHub - No findings detected on your code base!'

export class CheckReporter implements Reporter {
  private gitHubCheck: GitHubCheck

  constructor(gitHubCheck: GitHubCheck) {
    this.gitHubCheck = gitHubCheck
  }

  async report(data: ReportResult): Promise<void> {
    if (data.failed) {
      await this.gitHubCheck.fail(FAIL_SUMMARY, data.report)
    } else {
      await this.gitHubCheck.pass(SUCCESS_SUMMARY, data.report)
    }
  }
}
