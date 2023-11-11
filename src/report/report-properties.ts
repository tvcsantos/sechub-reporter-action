import { PullRequestCompareMode } from '../input/inputs'

export interface ReportProperties {
  maxSize?: number
  considerErrorOnSeverities: string[]
  pullRequestCompareMode: PullRequestCompareMode
}
