<!-- steering-agent-last-run: 2026-10-29 13:05 UTC -->
# Testing Standards

- Test targets: Not found in codebase. The project file lists an application target and an app-extension target only, and the shared scheme `berkeley-mobile.xcscheme` has an empty `<Testables>` block.
- Files matching `*Test*` outside `Pods/`: none found; `XCTest` / `import Testing`: not found in `berkeley-mobile/`.
- Unit/integration/e2e patterns, fixtures, mocks: Not found in codebase.
- Preview/sample data: some source files embed sample values for SwiftUI previews (e.g. `BMEventCalendarEntry.swift`, `BMHomeSectionListView.swift`, `BMCachedAsyncImageView.swift`). These are preview fixtures, not tests.
