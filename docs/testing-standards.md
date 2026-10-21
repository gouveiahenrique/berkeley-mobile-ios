<!-- steering-agent-last-run: 2026-10-21 16:32 UTC -->
# Testing Standards

## Observed state
- No test target, test directories, or `*Tests*` files were found in the repository (excluding `Pods/`).
- The shared scheme `berkeley-mobile.xcscheme` has an empty `<Testables>` block.
- CodeGraph blast-radius reports for `BMNetworkingManager`, `DataManager`, `BMError`, `SafetyViewModel`, and `GymOccupancyWidget` listed "no tests found within 3 caller hops".
- Testing frameworks, unit/integration/UI test patterns, mocks, fixtures, and naming conventions: Not found in codebase.

## Test-adjacent artifacts that exist
- SwiftUI `#Preview` with sample timeline entries in `BerkeleyMobileWidget/GymOccupancyWidget.swift`.
- Sample data helper `SafetyViewModel.getSampleSafetyLog()` in `Safety/SafetyViewModel.swift`.
- `DebugView`/`DebugViewModel`, presented on shake under `#if DEBUG` (`TabBarController.motionEnded`).
