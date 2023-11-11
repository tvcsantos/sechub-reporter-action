import { GitHub } from '@actions/github/lib/utils'
import { ExtendedContext } from '../github/extended-context'
import { SecHubCodeFinding, SecHubFinding } from '../model/sechub'
import { PullRequestCompareMode } from '../input/inputs'
import { ReportFindingsFilter } from './report-findings-filter'

export class PullRequestReportFindingsFilter implements ReportFindingsFilter {
  constructor(
    private readonly octokit: InstanceType<typeof GitHub>,
    private readonly context: ExtendedContext,
    private readonly pullRequestCompareMode: PullRequestCompareMode
  ) {}

  async filter(findings: SecHubFinding[]): Promise<SecHubFinding[]> {
    if (this.pullRequestCompareMode === PullRequestCompareMode.NONE)
      return findings

    const { data } = await this.octokit.rest.pulls.listFiles({
      ...this.context.repo,
      pull_number: this.context.issue.number
    })

    const filenames = data.map(file => file.filename)
    return findings.filter(finding =>
      this.findingHasReferenceToAnyFilename(finding, filenames)
    )
  }

  private findingHasReferenceToAnyFilename(
    finding: SecHubFinding,
    filenames: string[]
  ): boolean {
    return filenames.some(filename =>
      this.findingHasReferenceToFilename(finding.code, filename)
    )
  }

  private findingHasReferenceToFilename(
    codeFinding: SecHubCodeFinding,
    filename: string
  ): boolean {
    let currentCodeFinding: SecHubCodeFinding | undefined = codeFinding
    let found = false
    do {
      found = currentCodeFinding.location === filename
      switch (this.pullRequestCompareMode) {
        case PullRequestCompareMode.ENTRY_POINT:
          currentCodeFinding = undefined
          break
        case PullRequestCompareMode.CALL_HIERARCHY:
          currentCodeFinding = currentCodeFinding.calls
          break
      }
    } while (!found && currentCodeFinding !== undefined)
    return found
  }
}
