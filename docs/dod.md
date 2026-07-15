# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Build the main app target (requires Xcode and a connected simulator or device)
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build

# Build the widget extension target
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.

---

**Note:** No `package.json`, `pyproject.toml`, `Makefile`, or `Fastfile` was found in this repository. There are no lint or test scripts defined in build tooling configuration files. The project uses Xcode as its build system (`.xcworkspace` + CocoaPods). The commands above reflect the only build gate discoverable from the repository.

No automated test targets were found in the Xcode project; the test step is therefore not applicable until a test target is added.
