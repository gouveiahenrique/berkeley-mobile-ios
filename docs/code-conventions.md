# Code Conventions

**Last updated:** 2026-07-31

## Naming Conventions

### Variables and Properties

- `camelCase` for all variables, properties, and function parameters
- `@Published` and `@Observable` properties use the same `camelCase` rule
- Boolean properties use `is`, `has`, `should`, or `can` prefixes: `isLoading`, `isFetching`, `isEmailValid`

### Functions and Methods

- `camelCase` for functions: `fetchSafetyLogs()`, `updateFilterState()`, `associateCrimesWithColor()`
- Async methods are named like their synchronous counterparts — the `async` keyword signals the calling convention
- Factory/sample data methods are static on the type: `static func getSampleSafetyLog() -> BMSafetyLog`

### Types (Classes, Structs, Enums, Protocols)

- `PascalCase` for all type names
- App-specific types are prefixed with `BM`: `BMSafetyLog`, `BMError`, `BMConstants`, `BMColor`, `BMFont`, `BMCalendarEvent`
- SwiftUI views do not use the `BM` prefix: `SafetyView`, `DiningHallsView`, `GuidesView`
- ViewModels are suffixed with `ViewModel`: `SafetyViewModel`, `DiningHallsViewModel`
- Data services are suffixed with `DataService`: `EventsDataService`
- Protocols are named by capability (not prefixed with `I`): `DataSource`, `CanFavorite`, `HasName`, `HasLocation`

### Constants

- `fileprivate let kConstantName` — file-scoped Firestore endpoint constants (lowercase `k` prefix)
- `static let constantName` — camelCase for type-level static constants in structs: `BMConstants.safetyLogsCollectionName`
- Enum cases use `camelCase`: `.today`, `.thisWeek`, `.aggravatedAssault`

### Files

- `PascalCase.swift` for all Swift files: `SafetyViewModel.swift`, `DiningHallsView.swift`
- Extensions follow `TypeName+Category.swift`: `Colors+Text.swift`, `AppDelegate+Migration.swift`, `Date+Extension.swift`
- Asset files use their natural names (Apercu font family, image sets)

## Code Formatting

No automated formatter is configured. Follow these conventions manually:

- **Indentation:** 4 spaces (Xcode default)
- **Line length:** No hard limit enforced; keep lines readable at ~120 characters
- **Braces:** Same-line opening brace (K&R style): `func foo() {`
- **Trailing commas:** Not required in Swift; omit on last item
- **Blank lines:** One blank line between methods; two blank lines before `// MARK:` sections

## MARK Comments

Use `// MARK: -` to organize large files into named sections. This is the primary navigation aid:

```swift
// MARK: - SafetyViewManager

final class SafetyViewModel: NSObject, ObservableObject { ... }

// MARK: - Sample Data

extension SafetyViewModel { ... }
```

Use `// MARK: -` (with dash) for section separators. Use `// MARK:` (without dash) for sub-sections within a class body:

```swift
// MARK: - UNUserNotificationCenterDelegate
// MARK: - MessagingDelegate
```

## ViewModel Pattern

### `@Observable` (preferred for iOS 17+ features)

```swift
@MainActor
@Observable
class DiningHallsViewModel {
    var diningHalls: [BMDiningHall] = []
    var isFetching = false

    init() {
        isFetching = true
        Task { @MainActor in
            diningHalls = await fetchDiningHalls()
            isFetching = false
        }
    }
}
```

### `ObservableObject` (for iOS 13+ compatibility)

```swift
final class SafetyViewModel: NSObject, ObservableObject {
    @Published var safetyLogs = [BMSafetyLog]()
    @Published var isLoading = false

    override init() {
        super.init()
        isLoading = true
        Task { await listenForSafetyLogs() }
    }

    @MainActor
    private func listenForSafetyLogs() async {
        do {
            defer { isLoading = false }
            safetyLogs = try await BMNetworkingManager.shared.fetchSafetyLogs()
        } catch {
            alert = BMAlert(title: "...", message: error.localizedDescription, type: .notice)
        }
    }
}
```

**Rules:**
- Mark `init` tasks as `@MainActor` or dispatch back to main for UI state updates
- Use `defer { isLoading = false }` to guarantee loading state resets even on error
- Error state is surfaced via a `BMAlert` property, never via `fatalError` or `assertionFailure` in production code

## Dependency Injection Pattern

Inject ViewModels in SwiftUI views using `@InjectedObservable` (for `@Observable` classes) or `@Injected` (for services):

```swift
// SwiftUI view — @Observable ViewModel
struct GuidesView: View {
    @InjectedObservable(\.guidesViewModel) private var viewModel
}

// UIKit or presenter — service injection
class TabBarController: UITabBarController {
    @Injected(\.feedbackFormPresenter) private var feedbackFormPresenter
}
```

Register all dependencies in `BerkeleyMobile+Injection.swift` as `Container` extensions. Never instantiate ViewModels directly inside views.

## Async/Await Patterns

- Use `async throws` for all Firestore fetch methods
- Fire-and-forget tasks from `init()` use `Task { ... }` — mark the closure `@MainActor` when updating UI state
- Use `withTaskGroup` for concurrent independent operations (e.g., checking calendar existence for multiple events)
- Avoid callbacks (`completionHandler`) in new code — only legacy `DataSource` subclasses use them

```swift
// Concurrent independent async work
let results: [(BMEventCalendarEntry, Bool)] = await withTaskGroup(of: (BMEventCalendarEntry, Bool).self) { group in
    for event in events {
        group.addTask {
            let exists = await self.doesEventExists(for: event)
            return (event, exists)
        }
    }
    return await group.reduce(into: []) { $0.append($1) }
}
```

## Error Handling

- App-domain errors go in `BMError` (an enum conforming to `LocalizedError`)
- Firestore errors are caught at the ViewModel level with user-visible alerts
- Log errors with `os.Logger` at the appropriate severity — never print to stdout in production code:

```swift
// Logger categories are declared in Logger+Ext.swift
Logger.diningHallsViewModel.error("\(error)")
Logger.eventsDataService.error("Cannot decode BerkeleyEventsDaySnapshot: \(error.localizedDescription)")
```

- Use `compactMap { try? ... }` when individual document decode failures should be silently skipped
- Use `do { try ... } catch { Logger.category.error(...) }` when failures should be logged but not fatal

## Logging

All loggers are pre-declared in `Utils/Logger+Ext.swift` using `os.Logger`:

```swift
extension Logger {
    static let diningHallsViewModel = Logger(
        subsystem: Bundle.main.bundleIdentifier!,
        category: String(describing: DiningHallsViewModel.self)
    )
}
```

- Add a new static property to `Logger+Ext.swift` for each new ViewModel or service — never create inline `Logger` instances
- Use `.error` for decode/network failures, `.info` for informational events (not currently used), `.debug` for development-only traces
- No `print()` statements in committed code

## Design System Usage

### Colors

Use `BMColor` static properties — never use raw `UIColor(red:green:blue:alpha:)` inline in views:

```swift
tabBar.tintColor = BMColor.blackText
appearance.backgroundColor = BMColor.cardBackground
```

### Fonts

Use `BMFont` helpers — never use `UIFont.systemFont` or string literals for font names:

```swift
.font(Font(BMFont.bold(20)))
.font(Font(BMFont.regular(11)))
```

## Property Wrappers

Use `@Display` for any string property that will be shown in the UI and may contain leading/trailing whitespace or invalid characters:

```swift
struct DiningItem {
    @Display var name: String
    @Display var description: String?
}
```

## SwiftUI View Composition

- Break large `body` implementations into `private var` computed properties or `@ViewBuilder` private functions
- Name sub-views descriptively: `private var appInfoSection: some View { ... }`
- Use `#Preview` macros for all new SwiftUI views — include at least one populated and one empty/loading state

## Anti-Patterns to Avoid

- Never hardcode Firestore collection names — use `BMConstants.*` or `fileprivate let k*` constants
- Never instantiate ViewModels directly in views — use `@InjectedObservable` / `@Injected`
- Never use `print()` for logging — use `os.Logger` with a category declared in `Logger+Ext.swift`
- Never make Firestore calls directly from SwiftUI views — delegate to a ViewModel
- Never use `DispatchQueue.main.async` in new async/await code — use `@MainActor` instead
- Never expose mutable arrays directly from a ViewModel without going through a sorted/filtered computed property
