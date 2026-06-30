# Testing Standards

## Test Coverage

No test files (XCTest targets, `*Tests*.swift`, or `@testable import` usages) were found in the inspected repository areas. The Xcode project file (`berkeley-mobile.xcodeproj/project.pbxproj`) contains no references to `XCTestCase` or test bundle targets in the inspected output.

The CodeGraph blast-radius annotations on every symbol in this codebase consistently report: **"no covering tests found"**.

## Observed State

- No unit test files found in `berkeley-mobile/`
- No UI test files found in the repository
- No test schemes or test targets found in the Xcode project
- No test fixtures, mocks, or test helper utilities were found in the inspected source

## In-App Debug Tooling

A debug-only `DebugView` / `DebugViewModel` exists in `berkeley-mobile/Debug/`. It is presented via device shake gesture (`motionEnded`) gated by a `#if DEBUG` compile condition in `TabBarController.swift`. This is not a test framework.

```swift
// berkeley-mobile/TabBarController.swift:33
#if DEBUG
let debugView = UIHostingController(rootView: DebugView())
present(debugView, animated: true)
#endif
```

## Build Verification

While no automated tests are present, the project can be verified by building with Xcode or `xcodebuild`. See `docs/dod.md` for the available build command.
