# Testing Standards

## Test Target Discovery

No XCTest target, test files, or test scheme was found in the inspected areas of the repository. The `find` command searching for files matching `*Test*`, `*test*`, and `*Spec*` returned only files within the `Pods/` directory (third-party library test helpers). No application-level test files were identified.

The CodeGraph blast-radius analysis annotates every inspected symbol with: `⚠️ no covering tests found`.

---

## Observed State

- **Unit tests**: Not found in codebase.
- **Integration tests**: Not found in codebase.
- **UI / End-to-end tests**: Not found in codebase.
- **XCTest framework**: Not found in codebase.
- **Test fixtures or mocks**: Not found in codebase.
- **Test schemes in `.xcodeproj`**: Not inspected exhaustively; no evidence found in source directories.

---

## Debug Tooling

A `DebugView` (gated with `#if DEBUG`) is accessible at runtime by shaking the device (`TabBarController.motionEnded(_:with:)`). This is the only observed developer-facing runtime diagnostic mechanism. It does not constitute a testing framework.

## SwiftUI Previews

Several SwiftUI views include `#Preview` blocks (e.g., `HomeView`, `BMActionButton`, `BMCachedAsyncImageView`, `SafetyView`, `EventsView`, `ResourcesView`). These previews provide interactive development feedback within Xcode but are not automated tests.
