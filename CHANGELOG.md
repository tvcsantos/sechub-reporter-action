# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2024-03-02

### Changed

- Update to Node 20
- Update to latest `tool-reporter-action-template`

## [3.2.1] - 2024-01-31

### Fixed

- Fix clashing constructor variables initializations

## [3.2.0] - 2024-01-31

### Added

- Add `comment-pr-on-success` input to control when to comment on PRs

## [3.1.0] - 2023-11-11

### Added

- Add `pr-filter-mode` input for filtering report findings in PRs

## [3.0.0] - 2023-09-19

### Changed

- Remove `fail-on-severities` and separate in two flags
  - Add `consider-error-on-severities` to consider specific severities as errors
  - Re-add `fail-on-error` to fail the action if an error occurs

## [2.0.0] - 2023-09-19

### Added

- Add `fail-on-severities` input for failing the action based on severities

## [1.4.1] - 2023-09-19

### Fixed

- Fix wrong condition for failed exit

## [1.4.0] - 2023-09-16

### Changed

- Improve `package.json`
- Improve `tsconfig.json`
- Bump `@typescript-eslint/eslint-plugin` from 6.6.0 to 6.7.0
- Bump `eslint` from 8.48.0 to 8.49.0
- Bump `@typescript-eslint/parser` from 6.6.0 to 6.7.0
- Bump `@actions/core` from 1.10.0 to 1.10.1
- Bump `jest` from 29.6.3 to 29.7.0
- Bump `@types/node` from 20.5.9 to 20.6.1

## [1.3.0] - 2023-09-09

### Changed

- Bump `actions/checkout` from 3 to 4
- Bump `@vercel/ncc` from 0.36.1 to 0.38.0
- Update to latest `tool-reporter-action-template`

## [1.2.0] - 2023-09-05

### Changed

- Update to latest `tool-reporter-action-template`

## [1.1.0] - 2023-09-01

### Changed

- Improve GitHub extended context code

## [1.0.1] - 2023-08-31

### Fixed

- Truncate long reports and avoid GitHub check max limit

## [1.0.0] - 2023-08-31

### Added

- Implement `sechub-reporter-action` GitHub action

[4.0.0]: https://github.com/tvcsantos/sechub-reporter-action/compare/v3.2.1...v4.0.0
[3.2.1]: https://github.com/tvcsantos/sechub-reporter-action/compare/v3.2.0...v3.2.1
[3.2.0]: https://github.com/tvcsantos/sechub-reporter-action/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/tvcsantos/sechub-reporter-action/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/tvcsantos/sechub-reporter-action/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/tvcsantos/sechub-reporter-action/compare/v1.4.1...v2.0.0
[1.4.1]: https://github.com/tvcsantos/sechub-reporter-action/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/tvcsantos/sechub-reporter-action/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/tvcsantos/sechub-reporter-action/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/tvcsantos/sechub-reporter-action/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/tvcsantos/sechub-reporter-action/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/tvcsantos/sechub-reporter-action/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/tvcsantos/sechub-reporter-action/releases/tag/v1.0.0
