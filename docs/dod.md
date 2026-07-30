# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Build the main app target (requires Xcode and a valid simulator destination)
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -configuration Debug \
  build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.

## Notes

No `package.json`, `pyproject.toml`, `Makefile`, `Fastfile`, or `.swiftlint.yml` were found in the repository root. The project has no configured lint, test, or CI script commands. The above `xcodebuild` invocation is the only discovered automated gate. A valid CocoaPods workspace (`berkeley-mobile.xcworkspace`) and the pod dependencies under `Pods/` must be present before running the build.
