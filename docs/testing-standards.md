# Testing Standards

## Test Infrastructure

No XCTest target directories were found in the repository under `berkeley-mobile/` or as separate `*Tests*`/`*Spec*` directories. The CodeGraph symbol analysis flagged "no covering tests found" for every inspected symbol across the codebase.

The only test-related files found in the repository are inside the `Pods/` directory (third-party dependency test utilities):

- `Pods/PromisesObjC/Sources/FBLPromises/FBLPromise+Testing.m`
- `Pods/PromisesObjC/Sources/FBLPromises/include/FBLPromise+Testing.h`
- `Pods/FirebaseCoreInternal/FirebaseCore/Internal/Sources/HeartbeatLogging/HeartbeatLoggingTestUtils.swift`

These are test utilities shipped with vendor dependencies, not application test code.

## Application Test Coverage

No application-level unit tests, integration tests, UI tests, or snapshot tests were found in the inspected repository areas.

## Testing Frameworks

No XCTest, Quick/Nimble, or other testing framework usage was found in the main app or widget extension source trees.

## Observed Test Conventions

Not applicable — no application test files were found in the inspected repository areas.
