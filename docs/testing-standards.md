# Testing Standards

## Findings

A repository-wide search for `import XCTest` and `XCTestCase` returned no matches. `berkeley-mobile.xcodeproj/project.pbxproj` defines exactly two `PBXNativeTarget` entries (`berkeley-mobile`, product type `com.apple.product-type.application`; `BerkeleyMobileWidgetExtension`, product type `com.apple.product-type.app-extension`) — neither has a test-bundle product type (`com.apple.product-type.bundle.unit-test` or `.ui-testing`). The shared Xcode scheme (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`) contains a `TestAction` element with an empty `<Testables>` list.

No directories named `*Tests*` exist in the repository (verified by directory search).

## Conclusion

Not found in codebase: a unit test target, a UI test target, test files, fixtures, mocks, or test utilities. This is a direct observation (a `PBXNativeTarget`/test-bundle search and an `XCTest` symbol search both returned zero results), not an inference from absence in a partial sample.

## Not Applicable

Sections on testing frameworks, test organization, unit/integration/e2e patterns, fixtures, mocks, and testing utilities/naming conventions are not applicable — no such repository content exists to document.
