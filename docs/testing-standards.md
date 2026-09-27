# Testing Standards

## Test Target Status

No automated test target was found in this repository during this pass:

- `berkeley-mobile.xcodeproj/project.pbxproj` contains no `PBXNativeTarget` of test-bundle product type, and no reference to `XCTest`.
- The repository's shared Xcode scheme, `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`, declares a `<TestAction>` with an empty `<Testables>` block — i.e. the scheme is wired for testing but no test bundle is attached to it.
- No files matching `*Tests*`, `*Test.swift`, or a `Tests/` directory were found under `berkeley-mobile/` or `BerkeleyMobileWidget/`.

This should be read as "no test target was found in the inspected repository areas," not as a definitive claim that testing is entirely absent from the project's process (e.g. manual QA may exist outside this repository) — not found in codebase for anything beyond the states above.

## Testing Frameworks

Not found in codebase. No `XCTest` import, no third-party testing framework (e.g. Quick/Nimble) appears in `Podfile`, `Podfile.lock`, or `project.pbxproj`.

## Test Organization, Fixtures, Mocks, Naming Conventions

Not applicable — there is no test code in the repository to derive organizational or naming conventions from.

## Manual/Debug-Time Verification Surfaces

The repository does implement a `#if DEBUG`-gated in-app debug surface, which is the closest analog to a manual test harness found in the codebase:

- `berkeley-mobile/BerkeleyMobile+Injection.swift` declares `debugViewModel: Factory<DebugViewModel>` only under `#if DEBUG`.
- `berkeley-mobile/Debug/DebugView.swift` and `berkeley-mobile/Debug/DebugViewModel.swift` implement this debug-only view/view model pair. Its exact contents were not inspected beyond confirming its existence and injection gating — not found in codebase for further detail, since it was outside the discovery scope needed for this document.

## Recommendation Scope

Per the operating constraints of this document, no testing framework or process is recommended here; only what exists is documented. Since no test target, framework, or fixtures exist, this document records that absence rather than a set of standards.
