import * as core from '@actions/core'
import { extendedContext } from '../github/extended-context'

export interface Inputs {
  file: string
  modes: Set<ModeOption>
  token: string
  failOnError: boolean
  considerErrorOnSeverities: string[]
  pullRequestFilterMode: PullRequestFilterMode
  commentPrOnSuccess: boolean
}

export enum Input {
  FILE = 'file',
  MODES = 'modes',
  GITHUB_TOKEN = 'token',
  FAIL_ON_ERROR = 'fail-on-error',
  CONSIDER_ERROR_ON_SEVERITIES = 'consider-error-on-severities',
  PR_FILTER_MODE = 'pr-filter-mode',
  COMMENT_PR_ON_SUCCESS = 'comment-pr-on-success'
}

export enum ModeOption {
  PR_COMMENT = 'pr-comment',
  CHECK = 'check',
  SUMMARY = 'summary'
}

export enum Severity {
  NONE = 'NONE',
  ALL = 'ALL'
}

export enum PullRequestFilterMode {
  NONE = 'NONE',
  ENTRY_POINT = 'ENTRY_POINT',
  CALL_HIERARCHY = 'CALL_HIERARCHY'
}

export function gatherInputs(): Inputs {
  const file = getInputFile()
  const modes = getInputModes()
  const token = getInputToken()
  const failOnError = getInputFailOnError()
  const considerErrorOnSeverities = getInputConsiderErrorOnSeverities()
  const pullRequestFilterMode = getInputPullRequestFilterMode()
  const commentPrOnSuccess = getInputCommentPrOnSuccess()
  return {
    file,
    modes,
    token,
    failOnError,
    considerErrorOnSeverities,
    pullRequestFilterMode,
    commentPrOnSuccess
  }
}

function getInputFile(): string {
  return core.getInput(Input.FILE, { required: true })
}

function internalGetInputModes(): ModeOption[] {
  const multilineInput = core.getMultilineInput(Input.MODES)
  return multilineInput
    .filter(x => !!x)
    .map(x => {
      if (!Object.values<string>(ModeOption).includes(x)) {
        throw new Error(
          `Invalid ${Input.MODES} option '${x}' on input '${JSON.stringify(
            multilineInput
          )}'`
        )
      }
      return x as ModeOption
    })
}

const NOT_IN_PR_CONTEXT_WARNING = (mode: string): string => {
  return `Selected '${mode}' mode but the action is not running in a pull request context. Ignoring this mode.`
}
const NO_ADDITIONAL_MODE_SELECTED_USE_CHECK =
  "No additional mode selected, using 'check' mode."
const SEVERITY_ALL_TAKES_PRECEDENCE_WARNING =
  "Selected 'ALL' on fail-on-severities with other finer grained severities. Severity 'ALL' takes precedence."

function getInputModes(): Set<ModeOption> {
  const modes = new Set(internalGetInputModes())
  const isPullRequest = extendedContext.isPullRequest()
  if (modes.size <= 0) {
    if (isPullRequest) {
      modes.add(ModeOption.PR_COMMENT)
    }
    modes.add(ModeOption.CHECK)
  }
  if (modes.has(ModeOption.PR_COMMENT) && !isPullRequest) {
    core.warning(NOT_IN_PR_CONTEXT_WARNING(ModeOption.PR_COMMENT))
    modes.delete(ModeOption.PR_COMMENT)
    if (modes.size <= 0) {
      core.warning(NO_ADDITIONAL_MODE_SELECTED_USE_CHECK)
      modes.add(ModeOption.CHECK)
    }
  }
  return modes
}

function getInputToken(): string {
  return core.getInput(Input.GITHUB_TOKEN, { required: true })
}

function getInputFailOnError(): boolean {
  return core.getBooleanInput(Input.FAIL_ON_ERROR)
}

function getInputConsiderErrorOnSeverities(): string[] {
  const multilineInput = core.getMultilineInput(
    Input.CONSIDER_ERROR_ON_SEVERITIES
  )
  const nonEmptyResult = multilineInput.filter(x => !!x)
  let uniqueResult = Array.from(new Set(nonEmptyResult))
  if (uniqueResult.includes(Severity.NONE) && uniqueResult.length > 1) {
    throw new Error(
      `Severity '${
        Severity.NONE
      }' incompatible with other severities provided! '${JSON.stringify(
        multilineInput
      )}'`
    )
  }
  if (uniqueResult.includes(Severity.ALL) && uniqueResult.length > 1) {
    core.warning(SEVERITY_ALL_TAKES_PRECEDENCE_WARNING)
    uniqueResult = [Severity.ALL]
  }
  return uniqueResult
}

function getInputPullRequestFilterMode(): PullRequestFilterMode {
  const input = core.getInput(Input.PR_FILTER_MODE)
  if (!Object.values<string>(PullRequestFilterMode).includes(input)) {
    throw new Error(
      `Invalid ${Input.PR_FILTER_MODE} '${input}' on input '${JSON.stringify(
        input
      )}'`
    )
  }
  let pullRequestFilterMode = input as PullRequestFilterMode
  const isPullRequest = extendedContext.isPullRequest()
  if (pullRequestFilterMode !== PullRequestFilterMode.NONE && !isPullRequest) {
    core.warning(NOT_IN_PR_CONTEXT_WARNING(pullRequestFilterMode))
    pullRequestFilterMode = PullRequestFilterMode.NONE
  }
  return pullRequestFilterMode
}

function getInputCommentPrOnSuccess(): boolean {
  const input = core.getInput(Input.COMMENT_PR_ON_SUCCESS)?.toLowerCase()
  if (!input) return true
  return input === 'true'
}

// Add methods for your extra inputs
// Pattern: function getInput<input-name>(): <type>
