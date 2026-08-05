# Testing Standards

## Discovery Method

Searched the entire repository (excluding `Pods/` and `.git/`) for:
- Directories/files matching `*Tests*` — none found outside `Pods/`.
- Swift source files importing `XCTest` — none found.
- A test target in the Xcode project — `grep` over `berkeley-mobile.xcodeproj/project.pbxproj` for `Tests` returned no matches; only two `PBXNativeTarget` entries exist (`berkeley-mobile`, `BerkeleyMobileWidgetExtension`), neither is a test bundle.
- The shared scheme `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` defines a `<TestAction>` block, but its `<Testables>` list is empty:
  ```xml
  <TestAction ...>
     <Testables>
     </Testables>
  </TestAction>
  ```

## Conclusion

**Not found in codebase.** No unit test target, no UI test target, no XCTest-based test files, no test fixtures/mocks directories, and no test-runner configuration (e.g. `xcodebuild test` scripts, Fastlane test lanes, CI workflow files) were found in the inspected repository areas.

## Related Observations (Not Testing, But Adjacent)

- A `#if DEBUG` conditional compilation block exists for developer-facing debug UI (`berkeley-mobile/Debug/DebugView.swift`, `berkeley-mobile/Debug/DebugViewModel.swift`), triggered by a shake gesture in `berkeley-mobile/TabBarController.swift:29-38`. This is a debug-mode UI feature, not an automated test.
- Sample/preview data exists in several view models for use with SwiftUI previews, e.g. `BMEventCalendarEntry.sampleEntry` (`berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift:134-147`) and `SafetyViewModel.getSampleSafetyLog()` (`berkeley-mobile/Safety/SafetyViewModel.swift:157-161`). This is framework capability (SwiftUI `#Preview`) demonstrated for previewing purposes, not an automated test fixture. A `#Preview` block is present in `BerkeleyMobileWidget/GymOccupancyWidget.swift:184-191` for the same purpose.

If this repository is expected to have automated tests, that expectation is not reflected in the current on-disk state.
