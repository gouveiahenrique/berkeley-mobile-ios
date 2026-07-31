# Definition of Done

Every task is only complete when **all applicable steps below pass with zero errors**.

Before marking any task complete, run each applicable command, wait for it to finish, and confirm the result in your response. A task without this confirmation is **incomplete**.

## Commands

```bash
# 1. Build — compile the app and verify no build errors
xcodebuild build \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' \
  | xcpretty || xcodebuild build \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest'

# 2. Test — run the test suite (when tests exist)
xcodebuild test \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest'

# 3. Build widget extension
xcodebuild build \
  -workspace berkeley-mobile.xcworkspace \
  -scheme BerkeleyMobileWidgetExtension \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest'
```

**Note on tests:** The project currently has no automated test target. Step 2 is a no-op until tests are added. Once a test target is added to the Xcode project, this command becomes mandatory.

## Pre-flight Checklist

Before submitting a pull request, verify the following manually:

- [ ] `berkeley-mobile.xcworkspace` opens without errors in Xcode
- [ ] The app builds for simulator with **zero warnings introduced by your change** (existing warnings are acceptable, new ones are not)
- [ ] The app builds for a physical device target (Release configuration) — ensures no simulator-only APIs snuck in
- [ ] SwiftUI Previews for modified views render without crashes
- [ ] The feature works end-to-end in the iOS Simulator (golden path tested)
- [ ] No hardcoded Firestore collection name strings introduced inline (must use `fileprivate let k*` constant or `BMConstants`)
- [ ] No new `print()` calls — use `os.Logger` categories from `Logger+Ext.swift`
- [ ] No force unwraps (`!`) introduced outside of `#Preview` or test code
- [ ] `GoogleService-Info.plist` is **not committed** (it is in `.gitignore`)
- [ ] New ViewModels are registered in `BerkeleyMobile+Injection.swift` with the appropriate scope

## Rules

- Run all build commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-verify from step 1 until all commands pass.
- If a command is not applicable for the change (e.g., widget-only change skips main app build), explain why in your response — do not silently skip it.
- Changes that touch `Podfile` must also run `pod install` and commit the updated `Podfile.lock`.
- Changes that touch Swift Package dependencies must commit the updated `Package.resolved`.
