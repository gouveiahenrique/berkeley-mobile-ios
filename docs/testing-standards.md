# Testing Standards

## Discovery Method

Searched for: a unit-test/UI-test `PBXNativeTarget` in `berkeley-mobile.xcodeproj/project.pbxproj`, directories/files matching `*Test*` (excluding `Pods/`, `.git/`, `.codegraph/`), Swift files importing `XCTest`, and files containing `Mock`/`Stub` naming.

## Findings

- **No test target** is defined in `berkeley-mobile.xcodeproj/project.pbxproj`. The `PBXNativeTarget` section (project.pbxproj:1009-1057) contains exactly two targets: `berkeley-mobile` (`com.apple.product-type.application`) and `BerkeleyMobileWidgetExtension` (`com.apple.product-type.app-extension`). Neither has `productType` `com.apple.product-type.bundle.unit-test` or `com.apple.product-type.bundle.ui-testing`.
- The shared scheme `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` contains a `<TestAction>` element, but its `<Testables>` list is empty — no test bundles are registered to run.
- **No files matching `*Test*`** were found anywhere in the repository outside of `Pods/` (third-party dependency internals) and `.git.bfg-report/` (unrelated history-rewrite artifact).
- **No Swift file imports `XCTest`** anywhere in the repository.
- **No `Mock`- or `Stub`-named files** were found under `berkeley-mobile/` or `BerkeleyMobileWidget/`.
- The build settings do include `ENABLE_TESTABILITY = YES` (project.pbxproj:1430), a default Xcode setting for Debug configurations, but this alone does not indicate an active test suite.

## Conclusion

Not found in codebase: this repository does not contain a unit-test target, UI-test target, test files, test fixtures, mocks, or stubs. There is no discoverable testing framework usage (e.g. XCTest, Quick/Nimble) or test-naming convention to document.

## Not Applicable

- Testing frameworks, test organization, fixture/mock conventions, and naming conventions cannot be documented, as none exist in the repository at the time of this analysis.
