import { GitHub } from '@actions/github/lib/utils'
import { ExtendedContext } from '../github/extended-context'
import { SecHubCodeFinding, SecHubFinding } from '../model/sechub'
import { CompareMode } from '../input/inputs'

export class ReportFindingsFilter {
  constructor(
    private readonly octokit: InstanceType<typeof GitHub>,
    private readonly context: ExtendedContext
  ) {}

  async filter(
    findings: SecHubFinding[],
    compareMode: CompareMode
  ): Promise<SecHubFinding[]> {
    if (compareMode === CompareMode.NONE) return findings

    const { data } = await this.octokit.rest.pulls.listFiles({
      ...this.context.repo,
      pull_number: this.context.issue.number
    })

    const filenames = data.map(file => file.filename)
    return findings.filter(finding =>
      this.findingHasReferenceToAnyFilename(finding, compareMode, filenames)
    )
  }

  private findingHasReferenceToAnyFilename(
    finding: SecHubFinding,
    compareMode: CompareMode,
    filenames: string[]
  ): boolean {
    return filenames.some(filename =>
      this.findingHasReferenceToFilename(finding.code, compareMode, filename)
    )
  }

  private findingHasReferenceToFilename(
    codeFinding: SecHubCodeFinding,
    compareMode: CompareMode,
    filename: string
  ): boolean {
    let currentCodeFinding: SecHubCodeFinding | undefined = codeFinding
    let found = false
    do {
      found = currentCodeFinding.location === filename
      switch (compareMode) {
        case CompareMode.ENTRY_POINT:
          currentCodeFinding = undefined
          break
        case CompareMode.CALL_HIERARCHY:
          currentCodeFinding = currentCodeFinding.calls
          break
      }
    } while (!found && currentCodeFinding !== undefined)
    return found
  }
}
