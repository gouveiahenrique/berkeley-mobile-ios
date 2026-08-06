# Testing Standards

## Test Infrastructure

`berkeley-mobile.xcodeproj/project.pbxproj` defines exactly two `PBXNativeTarget` entries:
- `berkeley-mobile` (`productType = "com.apple.product-type.application"`)
- `BerkeleyMobileWidgetExtension` (`productType = "com.apple.product-type.app-extension"`)

No `com.apple.product-type.bundle.unit-test` or `com.apple.product-type.bundle.ui-testing` target was found in the project file. No occurrences of `XCTest` were found in `berkeley-mobile.xcodeproj/project.pbxproj`.

The checked-in scheme `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` contains a `TestAction` element with an empty `<Testables>` list:

```xml
<TestAction ...>
   <Testables>
   </Testables>
</TestAction>
```

No files matching `*Tests*` (by filename) were found anywhere in the repository outside `Pods/` (searched via `find . -iname "*Tests*"`, excluding `Pods/` and `.git/`).

The CodeGraph blast-radius output for `DataManager`, `GymDataSource`, `MapDataSource`, `LibraryDataSource`, `BMNetworkingManager`, and `BMEventCalendarEntry` each explicitly notes "⚠️ no covering tests found" for their callers.

## Conclusion

Not found in codebase: unit tests, integration tests, UI tests, test fixtures, mocking utilities, or any XCTest-based test suite in the inspected repository areas.

This finding applies specifically to the inspected repository areas (project configuration, shared scheme, and a repository-wide filename search); it does not constitute exhaustive verification of every file in the repository.
