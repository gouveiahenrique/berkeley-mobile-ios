# Definition of Done

This repository is an **iOS (Xcode/CocoaPods) project**, not a Node.js/TypeScript or Python project. There is no `package.json`, `pyproject.toml`, Ruff config, or pytest config anywhere in the tracked source (verified: no `package.json` found outside `Pods/`; no `pyproject.toml`; no `.swiftlint.yml`/`.swiftlint.yaml`; no Ruff/pytest config). The Node.js/TypeScript and Python sections of the standard DoD checklist are therefore **not applicable for this repository type**.

## iOS Project Configuration (discovered)

- **Workspace:** `berkeley-mobile.xcworkspace` (references `berkeley-mobile.xcodeproj` and the CocoaPods-generated `Pods/Pods.xcodeproj`) — per CocoaPods convention and `README.md`'s setup instructions, this workspace, not the bare `.xcodeproj`, must be opened/built.
- **Project:** `berkeley-mobile.xcodeproj`
- **Targets:**
  - `berkeley-mobile` — main app (product `Berkeley.app`)
  - `BerkeleyMobileWidgetExtension` — WidgetKit extension
- **Scheme:** `berkeley-mobile` (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`) — the only shared scheme found. Its `<TestAction>` declares `buildConfiguration = "Debug"` but its `<Testables>` list is **empty** (no test target attached).
- **Build configurations:** `Debug` and `Release` (default configuration: `Release`).
- **Swift version:** `5.0`.
- **Deployment targets:** `13.0`, `17.0`, `18.0` appear across different build settings/targets in `project.pbxproj`.
- **Code signing:** `CODE_SIGN_STYLE = Automatic`, `DEVELOPMENT_TEAM = 4HBETBULVA`.
- **Dependency setup step (from `README.md`):** run `pod install` in the repository root before opening the workspace.

## Discovered Commands

No `Fastfile`, `Gemfile`, npm scripts, or CI workflow files were found in the repository, so there is no repo-defined lint/test/build script wrapper. The commands below are derived directly from the actual scheme/target/workspace names discovered above (`xcodebuild` invoked against the CocoaPods workspace, which is required since the app depends on Pods):

### Dependency install (prerequisite)

```
pod install
```

### Build

```
xcodebuild build \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -configuration Debug
```

### Test

```
xcodebuild test \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16'
```

Note: as documented in `docs/testing-standards.md`, the `berkeley-mobile` scheme currently has **no test target attached** (`<Testables>` is empty in `berkeley-mobile.xcscheme`). Running the above command will build but will not execute any tests, since none exist in this repository — not found in codebase.

### Lint

No lint tool configuration (`.swiftlint.yml`, `.swiftformat`, or an Xcode "Run Script" lint build phase) was found in the repository — not found in codebase.

### Archive / Release build (discovered via the scheme's `ArchiveAction`)

```
xcodebuild archive \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -configuration Release \
  -archivePath build/berkeley-mobile.xcarchive
```

## Definition of Done (based on discovered tooling)

Given the absence of a configured test target and lint tool, the verifiable "done" criteria discoverable from this repository's own configuration are:

1. `pod install` completes without error against the committed `Podfile.lock`.
2. The `berkeley-mobile` scheme builds successfully for the `Debug` configuration via `xcodebuild build` (above) — this is the only build/verification gate the repository's own scheme configuration currently supports.
3. No automated test gate exists to satisfy — not found in codebase.
4. No automated lint gate exists to satisfy — not found in codebase.

Not applicable for this repository type: Node.js/TypeScript script inspection (`package.json` scripts, `lint`/`test`/`test:ci`/`build`), Python inspection (`pyproject.toml`, Ruff, pytest, script aliases).
