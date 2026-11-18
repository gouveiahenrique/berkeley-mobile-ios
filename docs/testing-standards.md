<!-- steering-agent-last-run: 2026-11-17 20:35 UTC -->
# Testing Standards

- Test targets: Not found in codebase. `berkeley-mobile.xcodeproj/project.pbxproj` lists only application and app-extension product types; `berkeley-mobile.xcscheme` has an empty `<Testables>` element.
- Files importing `XCTest` or `Testing` under `berkeley-mobile/`: none found.
- Test fixtures, mocks, naming conventions, CI test execution: Not found in codebase.
- Debug tooling present instead: `Debug/DebugView.swift` and `DebugViewModel`, presented on device shake under `#if DEBUG` (`TabBarController.motionEnded`).
- SwiftUI sample data appears in source files for previews (e.g. `BMEventCalendarEntry.swift`, `BMHomeSectionListView.swift`).
