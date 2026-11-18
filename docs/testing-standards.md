<!-- steering-agent-last-run: 2026-11-18 18:30 UTC -->
# Testing Standards

- Test targets: Not found in codebase. `project.pbxproj` lists only an application and an app-extension product type; a search of `.swift` files outside `Pods/` found no `XCTest` or `Testing` imports; the shared scheme has no testable references.
- Test organization, mocks, fixtures, naming conventions: Not found in codebase.
- Preview-only sample data exists in production sources (e.g. `BMEventCalendarEntry.sampleEntry`, `GymOccupancyEntry.default*` values, `#Preview` in `GymOccupancyWidget.swift`); these are not tests.
- CodeGraph blast-radius output reported "no tests found within 3 caller hops" for the symbols queried.
