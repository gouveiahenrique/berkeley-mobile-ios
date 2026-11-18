<!-- steering-agent-last-run: 2026-11-18 12:26 UTC -->
# Testing Standards

- No test targets were found: the shared scheme `berkeley-mobile.xcscheme` has an empty `<Testables>` block, and no `XCTest`/`Testing` imports or `func test` declarations were found under `berkeley-mobile/` or `BerkeleyMobileWidget/`.
- CodeGraph reported "no tests found" for inspected symbols.
- Test organization, fixtures, mocks and naming conventions: Not found in codebase.
- SwiftUI `#Preview`-style sample data exists in some view files (e.g. `BMEventCalendarEntry.swift`, `HomeSectionListRowView.swift`); these are preview fixtures, not tests.
