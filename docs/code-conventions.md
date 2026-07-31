# Code Conventions

**Last updated:** 2026-07-31

## Naming Conventions

### Types (classes, structs, enums, protocols)

`PascalCase` always:

```swift
class SafetyViewModel: NSObject, ObservableObject { ... }
struct BMSafetyLog: Identifiable, Codable, Hashable { ... }
enum HomeDrawerViewType { ... }
protocol DetailView: UIView { ... }
```

### Type Prefix `BM`

Domain model types and major managers are prefixed with `BM` to distinguish app-level types from system types:

```swift
BMDiningHall, BMLibrary, BMGym          // data models
BMNetworkingManager, BMLocationManager  // service singletons
BMError, BMConstants, BMColor, BMFont   // supporting types
```

Do not prefix ViewModels, Views, DataSources, or utility extensions with `BM`.

### Properties, variables, functions

`camelCase`:

```swift
var isFetching: Bool = false
var selectedDiningHall: BMDiningHall?
func fetchDiningHalls(withAdditionalData additionalDataDict: ...) async -> [BMDiningHall]
```

### Constants (file-scoped endpoints / keys)

Use `fileprivate let k<Name>` for Firestore endpoint names and other file-local constants:

```swift
fileprivate let kEventsDataServiceEndpoint = "Events"
fileprivate let kDiningHallEndpoint = "Dining Halls V2"
```

Use `static let` inside a struct for app-wide constants (`BMConstants`).

### Files

`PascalCase.swift`, matching the primary type declared in the file:

```
DiningHallsViewModel.swift  ← class DiningHallsViewModel
BMDiningHall.swift          ← struct BMDiningHall
Logger+Ext.swift            ← extension Logger (utility extension)
Date+Extension.swift        ← extension Date
```

Extensions use `Type+Category.swift` naming.

---

## Code Formatting

No auto-formatter is configured (no SwiftFormat / SwiftLint). Follow these manual conventions:

- **Indentation:** 4 spaces (Xcode default)
- **Line length:** ~120 characters soft limit; break long function signatures across lines at parameter boundaries
- **Braces:** K&R style — opening brace on same line
- **Blank lines:** One blank line between methods; two blank lines between `// MARK:` sections

---

## MARK Comments

Use `// MARK: -` to divide files into logical sections. This is required for files with multiple responsibilities:

```swift
// MARK: - UNUserNotificationCenterDelegate

extension AppDelegate: UNUserNotificationCenterDelegate { ... }

// MARK: - MessagingDelegate

extension AppDelegate: MessagingDelegate { ... }
```

```swift
// MARK: - OpenClosedStatusManagerDelegate

extension DiningHallsViewModel: OpenClosedStatusManagerDelegate { ... }
```

---

## SwiftUI Conventions

### View body decomposition

Extract sub-views as `private var` computed properties on the same type rather than standalone structs, unless the subview is reused across multiple files:

```swift
struct HomeView: View {
    var body: some View { ... }

    private var segmentedControlHeader: some View { ... }
    private var homeDrawerContentView: some View { ... }
}
```

### Previews

Include a `#Preview` macro block at the bottom of every SwiftUI view file:

```swift
#Preview {
    TodayView()
}
```

### State and binding

- `@State` for local ephemeral view state
- `@Binding` for two-way child ↔ parent state
- `@InjectedObject` / `@InjectedObservable` / `@Injected` for ViewModel injection via FactoryKit
- Do not use `@StateObject` for ViewModels registered in the FactoryKit container — use `@InjectedObject` instead

---

## Observable / ObservableObject Conventions

### Modern (`@Observable` macro — Swift 5.9+, preferred for new code)

```swift
@Observable
class DiningHallsViewModel {
    var diningHalls: [BMDiningHall] = []
    var isFetching = false

    @ObservationIgnored          // suppress observation on private/non-UI fields
    private var config: FeedbackFormConfig?
}
```

### Legacy (`ObservableObject` + `@Published`)

Existing ViewModels using `ObservableObject` are retained as-is. Do not mix `@Observable` and `@Published` in the same class.

```swift
class HomeViewModel: ObservableObject {
    @Published var isFetching = false
    @Published var diningHalls: [BMDiningHall] = []
}
```

---

## Async/Await Patterns

All new Firestore access must use `async/await`:

```swift
func fetchSafetyLogs() async throws -> [BMSafetyLog] {
    let snap = try await db.collection(BMConstants.safetyLogsCollectionName).getDocuments()
    return snap.documents.compactMap { try? $0.data(as: BMSafetyLog.self) }
}
```

Dispatch back to the main actor for `@Published` / `@Observable` property updates:

```swift
Task { @MainActor in
    self.isFetching = true
    // ...
    self.isFetching = false
}
```

Mark functions that must run on the main actor explicitly:

```swift
@MainActor
private func listenForSafetyLogs() async { ... }
```

Use `defer` to guarantee cleanup (e.g., `isLoading = false`) even on early returns:

```swift
defer { isLoading = false }
let logs = try await BMNetworkingManager.shared.fetchSafetyLogs()
```

---

## Dependency Injection (FactoryKit)

Register all ViewModels in `BerkeleyMobile+Injection.swift` in the `Container` extension. Choose the appropriate scope:

| Scope | Use when |
|-------|----------|
| `.singleton` | Shared across the entire app lifetime (e.g., `guidesViewModel`) |
| `.shared` | Shared per feature / retained while any consumer exists (e.g., `safetyViewModel`) |
| _(none)_ | New instance per injection (e.g., `feedbackFormViewModel`) |

```swift
var safetyViewModel: Factory<SafetyViewModel> {
    self { SafetyViewModel() }.shared
}
```

Inject in views:

```swift
// ObservableObject (legacy)
@InjectedObject(\.homeViewModel) private var homeViewModel

// @Observable (modern)
@InjectedObservable(\.diningHallsViewModel) private var diningHallsViewModel

// Non-observable (services, managers)
@Injected(\.menuItemIconCacheManager) private var menuItemIconCacheManager
```

---

## Error Handling

- Use `try?` with `compactMap` when individual document decoding failures should be skipped silently.
- Use `try await` with `do/catch` when a single fetch failure should surface to the user.
- Always log errors before swallowing them:

```swift
} catch {
    Logger.diningHallsViewModel.error("\(error)")
    return []
}
```

- Define new app-domain errors in `BMError.swift` as enum cases with `LocalizedError` conformance.

---

## Logging

Use `os.Logger` via the category constants in `Logger+Ext.swift`. Add a new static logger per class when introducing a new ViewModel or service:

```swift
extension Logger {
    static let myNewViewModel = Logger(
        subsystem: Bundle.main.bundleIdentifier!,
        category: String(describing: MyNewViewModel.self)
    )
}
```

Log levels:
- `.debug` — verbose diagnostic, development only
- `.info` — normal operations (successful fetches, user actions)
- `.error` — recoverable failures (Firestore decode error, missing data)
- `.fault` — programmer errors / invariant violations

```swift
Logger.diningHallsViewModel.info("Fetched \(diningHalls.count) dining halls")
Logger.diningHallsViewModel.error("Unable to find dining hall with id: \(itemID)")
```

---

## Property Wrappers

### `@Display` (app-defined)

Wrap any `String` or `String?` model property intended to be shown in UI. It trims whitespace and removes replacement characters:

```swift
@Display var name: String
@Display var address: String?
```

---

## Anti-Patterns to Avoid

- **Direct `print()` calls** — use `os.Logger` instead
- **`DispatchQueue.main.async { }` for ObservableObject updates** — use `@MainActor` or `Task { @MainActor in }`
- **Hardcoded Firestore collection strings outside constants** — always declare as `fileprivate let k*`
- **New `DataSource`-protocol implementations** — prefer `@Observable` ViewModel with `async/await`
- **`@StateObject` for injected ViewModels** — use `@InjectedObject` / `@InjectedObservable` so FactoryKit controls lifecycle
- **Mutable global state outside singletons** — use FactoryKit-managed scope instead
