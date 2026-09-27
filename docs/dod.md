# Definition of Done

## Discovery Notes

The standard discovery sources for this template — `package.json` `"scripts"` (Node/TypeScript) or `pyproject.toml` `[tool.ruff]`/`[tool.pytest.ini_options]`/script aliases (Python/uv) — are **not applicable** to this repository. This repository is a native iOS Xcode project (see `docs/tech.md`), and no `package.json` or `pyproject.toml` file exists anywhere in the repository.

Additional build-tooling locations were checked and none were found in the inspected repository areas:
- No `Fastfile`/`Appfile` (fastlane) — not found in codebase.
- No `.swiftlint.yml` or `.swiftformat` configuration — not found in codebase.
- No CI configuration (`.github/workflows/`, `.circleci/`, `bitrise.yml`, `.travis.yml`) — not found in codebase.
- No `Makefile` or shell scripts defining lint/test/build commands — not found in codebase.
- No test target exists in `berkeley-mobile.xcodeproj` (see `docs/testing-standards.md`), so no repository-defined test-invocation command exists either.

**Not found in codebase: a repository-defined lint, test, or build command gate.**

## Commands

No lint, test, or build commands are defined by this repository's own configuration files. The only build mechanism evidenced by the repository is standard Xcode/xcodebuild project building, which is a platform capability of Xcode rather than a repository-defined script:

```bash
# Platform capability (Xcode/xcodebuild), not a repository-defined script.
# The repository does not define a canonical build/lint/test command itself.
open berkeley-mobile.xcworkspace   # build/run manually via Xcode, per README.md "Getting set up"
```

`README.md` ("Getting set up") states only that Xcode 10.2+ and Swift 5, plus `pod install`, are required before opening the project — it does not define lint/test/build CLI commands.

## Rules

- Because no repository-defined lint, test, or build command was found, there is no discoverable CLI-based DoD gate to run and report output for.
- If this project adopts a CocoaPods `pod install` step, a fastlane lane, a CI workflow, or an Xcode test target in the future, this file should be regenerated from that configuration rather than from assumptions.
- Do not fabricate `xcodebuild` invocation flags (scheme, destination, configuration) as if they were repository-authoritative — none are defined in the inspected repository files.
