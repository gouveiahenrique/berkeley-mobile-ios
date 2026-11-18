<!-- steering-agent-last-run: 2026-11-17 21:29 UTC -->
# Testing Standards

- Test targets, test directories, and `XCTest` / `Testing` imports were not found in inspected repository areas (searched `berkeley-mobile/` for `XCTest`/`import Testing`, and the repo root for `*Tests*` paths outside `Pods`).
- The shared scheme `berkeley-mobile.xcscheme` contains no `TestableReference` entries.
- CodeGraph reported "no tests found within 3 caller hops" for inspected symbols (`DataManager.fetchAll`, `fetch`, `BMConstants`).
- Mocks/fixtures: Not found in codebase. Sample data exists in production code (`BMEventCalendarEntry.sampleEntry`), and a `Debug/` module (`DebugView`, `DebugViewModel`, compiled under `#if DEBUG` in the injection container).
- Test naming conventions: Not found in codebase.
