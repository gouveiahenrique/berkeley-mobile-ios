# Testing Standards

## Test Target

No test target was found in the Xcode project. Inspection of `berkeley-mobile.xcodeproj/project.pbxproj` shows only two `PBXNativeTarget` entries: `berkeley-mobile` (the app) and `BerkeleyMobileWidgetExtension` (the widget) — no `*Tests` or `*UITests` target, and no `XCTest` framework reference was found in `project.pbxproj`.

The project's shared scheme (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`) contains a `TestAction` block, but its `<Testables>` element is empty:
```xml
<TestAction ...>
   <Testables>
   </Testables>
</TestAction>
```

A search for `*Tests.swift` / `*Test.swift` files across the repository (excluding `Pods/`) returned no results.

## Consequence

Not found in codebase: no unit tests, integration tests, UI tests, test fixtures, mocks, or testing utilities exist in the inspected repository. CodeGraph blast-radius data for core singletons (`DataManager`, `BMNetworkingManager`, `BMLocationManager`) explicitly reports "no tests found within 3 caller hops" for each.

## Sample/Preview Data (Not Tests)

Some view models expose static sample-data helpers used for SwiftUI previews rather than automated testing, e.g.:
```swift
// berkeley-mobile/Safety/SafetyViewModel.swift
extension SafetyViewModel {
    static func getSampleSafetyLog() -> BMSafetyLog { ... }
}
```
This is SwiftUI preview-fixture data, not a test utility, and should not be documented as evidence of a testing framework or test coverage.

## Recommendation Scope

Per this task's scope, no testing framework, organization pattern, or convention can be documented because none exists in the repository. Introducing a testing standard would be a recommendation, which is out of scope for this documentation pass.
