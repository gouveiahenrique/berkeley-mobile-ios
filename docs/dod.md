# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Build the main application target
xcodebuild -workspace berkeley-mobile.xcworkspace \
           -scheme berkeley-mobile \
           -destination 'platform=iOS Simulator,name=iPhone 16' \
           build

# Build the Widget Extension target
xcodebuild -workspace berkeley-mobile.xcworkspace \
           -scheme BerkeleyMobileWidgetExtension \
           -destination 'platform=iOS Simulator,name=iPhone 16' \
           build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.

---

## Notes

- No `package.json`, `pyproject.toml`, `Makefile`, or CI lint script was found in the repository root. There is no discovered lint or test command.
- No automated test target was found in the inspected repository areas. The test step is therefore not applicable until a test target is added.
- The `xcodebuild` commands above require Xcode to be installed and the `Pods/` directory to be present (run `pod install` first if the workspace is freshly checked out).
- Replace `iPhone 16` with an available simulator identifier if needed (`xcrun simctl list devices available`).
