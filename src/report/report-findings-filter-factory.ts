import { ExtendedContext } from '../github/extended-context'
import { ReportFindingsFilter } from './report-findings-filter'
import { PullRequestReportFindingsFilter } from './pull-request-report-findings-filter'
import { GitHub } from '@actions/github/lib/utils'
import { NoOpReportFindingsFilter } from './no-op-report-findings-filter'
import { Inputs } from '../input/inputs'

export class ReportFindingsFilterFactory {
  constructor(
    private readonly octokit: InstanceType<typeof GitHub>,
    private readonly context: ExtendedContext,
    private readonly inputs: Inputs
  ) {}

  create(): ReportFindingsFilter {
    if (this.context.isPullRequest())
      return new PullRequestReportFindingsFilter(
        this.octokit,
        this.context,
        this.inputs.pullRequestCompareMode
      )
    return NoOpReportFindingsFilter.getInstance()
  }
}
