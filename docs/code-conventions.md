# Code Conventions

**Last updated:** 2026-08-04

## Naming Conventions

### Types (classes, structs, enums, protocols)

`PascalCase` — matches Swift standard library conventions:

```swift
class DiningHallsViewModel { }
struct BMSafetyLog: Identifiable, Codable { }
protocol HasOpenClosedStatus: Identifiable { }
enum BMSafetyLogFilterState: String, CaseIterable { }
```

Prefix project-specific shared components with `BM`:
- `BMAlert`, `BMDrawerView`, `BMFont`, `BMColor`, `BMConstants`, `BMError`

### Properties and functions

`camelCase`:

```swift
var isFetching = false
var filteredSafetyLogs = [BMSafetyLog]()
func fetchDiningHalls(withAdditionalData:) async -> [BMDiningHall]
func updateIsOpenStatus(_ date: Date)
```

### Constants

- Module-level private constants: `camelCase` with `k` prefix (legacy) or plain `camelCase`:
  ```swift
  fileprivate let kDiningHallEndpoint = "Dining Halls V2"
  static let fetchInterval: TimeInterval = 60 * 60
  ```
- Nested `struct Constants` inside a type for grouped constants:
  ```swift
  private struct Constants {
      static let kAnnotationIdentifier = "MapMarkerAnnotation"
      static let kViewMargin: CGFloat = 16
  }
  ```

### Files

`PascalCase.swift` matching the primary type:
- `SafetyViewModel.swift` → `class SafetyViewModel`
- `BMDrawerView.swift` → `struct BMDrawerView`

Extensions follow `TypeName+CategoryName.swift` or `TypeName+Ext.swift`:
- `Logger+Ext.swift`, `UIView+Extensions.swift`, `Date+Extension.swift`

---

## Code Formatting

No automated formatter is configured. Follow these rules manually:

- **Indentation:** 4 spaces (Xcode default for Swift)
- **Line length:** No hard limit enforced; prefer staying under ~120 characters for readability
- **Braces:** Opening brace on the same line (K&R style), Swift standard
- **Trailing commas:** Not applicable in Swift; omit
- **Blank lines:** One blank line between functions; two blank lines before a `// MARK:` comment

---

## MARK Comments

Use `// MARK: -` to organize type members into logical sections. This is the primary organization tool in Swift files:

```swift
// MARK: - Properties

var safetyLogs = [BMSafetyLog]()

// MARK: - Lifecycle

override func viewDidLoad() { ... }

// MARK: - Private

private func updateFilterState() { ... }
```

Extension sections for protocol conformances:

```swift
// MARK: - OpenClosedStatusManagerDelegate

extension DiningHallsViewModel: OpenClosedStatusManagerDelegate {
    func didTimerFire(for itemID: String, with timer: Timer) { ... }
}
```

---

## SwiftUI Patterns

### Views should be thin

All business logic belongs in a ViewModel. Views only transform ViewModel state into UI:

```swift
struct SafetyView: View {
    @InjectedObject(\.safetyViewModel) private var safetyViewModel

    var body: some View {
        // Render from safetyViewModel state only
    }
}
```

### Computed sub-views

Extract large `body` sub-trees into private computed properties named with a `View` suffix:

```swift
private var drawerView: some View { ... }
private var alertsDrawerHeaderView: some View { ... }
private var loadingSafetyLogsView: some View { ... }
```

### Previews

Include `#Preview` at the bottom of each SwiftUI view file:

```swift
#Preview {
    SafetyView()
}
```

---

## Dependency Injection

All ViewModels are registered in `BerkeleyMobile+Injection.swift` using Factory 2.5.3:

```swift
extension Container {
    var safetyViewModel: Factory<SafetyViewModel> {
        self { SafetyViewModel() }.shared
    }
}
```

Inject into views with the appropriate property wrapper:
- `@Injected(\.key)` — non-observable value or reference type
- `@InjectedObject(\.key)` — `ObservableObject` (triggers SwiftUI updates)
- `@InjectedObservable(\.key)` — `@Observable` macro type (Swift 5.9+)

Use `.singleton` for app-wide shared state; `.shared` for view-hierarchy-scoped sharing.

---

## Observation / State Management

### New code — use `@Observable`

```swift
@Observable
class DiningHallsViewModel {
    var diningHalls: [BMDiningHall] = []
    var isFetching = false
}
```

`@ObservationIgnored` for properties that must not trigger UI updates:

```swift
@ObservationIgnored
private var config: FeedbackFormConfig?
```

### Legacy code — `ObservableObject` + `@Published`

Existing ViewModels using `ObservableObject`/`@Published` can remain as-is; do not refactor unnecessarily.

---

## Async/Await

Use `async/await` for all new I/O operations (Firestore, network, EventKit):

```swift
// Preferred
func fetchSafetyLogs() async throws -> [BMSafetyLog] {
    let querySnapshot = try await collection.getDocuments()
    return querySnapshot.documents.compactMap { try? $0.data(as: BMSafetyLog.self) }
}
```

Kick off async work from `init()` using a `Task`:

```swift
init() {
    isFetching = true
    Task { @MainActor in
        safetyLogs = try await fetchSafetyLogs()
        isFetching = false
    }
}
```

Mark UI-updating code with `@MainActor`:

```swift
@MainActor
private func listenForSafetyLogs() async { ... }
```

---

## Error Handling

### Custom errors

Define typed errors as `enum` conforming to `LocalizedError`. Provide `errorDescription` for user-facing messages:

```swift
enum BMError: Error, LocalizedError {
    case insufficientAccessToCalendar

    public var errorDescription: String? {
        switch self {
        case .insufficientAccessToCalendar:
            return NSLocalizedString("Insufficient permissions to access your calendar.", comment: "")
        }
    }
}
```

### ViewModel error surface

Convert caught errors to `BMAlert` for user display:

```swift
do {
    safetyLogs = try await BMNetworkingManager.shared.fetchSafetyLogs()
} catch {
    self.alert = BMAlert(title: "Failed To Fetch Safety Logs",
                         message: error.localizedDescription,
                         type: .notice)
}
```

Never swallow errors silently; always log and/or surface to the user.

---

## Logging

Use `os.Logger` (not `print`). Logger instances are defined centrally in `Utils/Logger+Ext.swift`:

```swift
extension Logger {
    static let diningHallsViewModel = Logger(
        subsystem: Bundle.main.bundleIdentifier!,
        category: String(describing: DiningHallsViewModel.self)
    )
}
```

Usage inside the corresponding type:

```swift
Logger.diningHallsViewModel.error("\(error)")
Logger.diningHallsViewModel.info("Fetched \(diningHalls.count) dining halls")
```

**Log levels:**
- `.debug` — diagnostic detail (development only)
- `.info` — normal events (fetch completed, user action)
- `.error` — recoverable errors (decode failure, network error)
- `.fault` — programmer errors / unexpected state

Add a new `Logger` extension property to `Logger+Ext.swift` when adding a new ViewModel or service.

---

## Comments and Documentation

- Write comments only when the **why** is non-obvious (a workaround, a constraint, a subtle invariant)
- Do **not** comment what the code obviously does
- Prefer doc comments (`///`) for public/internal protocol members and utility functions:
  ```swift
  /// Successor of `HasOpenTimes`. In the future, we should migrate to using `HasOpenClosedStatus`.
  protocol HasOpenClosedStatus: Identifiable { ... }
  ```
- Use `// MARK: -` for structural organization (see above)
- `// TODO:` for known gaps that will be addressed later

---

## Anti-Patterns to Avoid

- **Force unwrap (`!`):** Only acceptable for known-safe cases (e.g., `Bundle.main.bundleIdentifier!`). Avoid in model or network code.
- **`print()` for logging:** Use `os.Logger` instead.
- **Mutable global state:** Use singletons (`static let shared`) sparingly; prefer DI via Factory.
- **Nested Tasks without `@MainActor`:** Always annotate UI-mutating async functions with `@MainActor`.
- **Adding to the legacy `kDataSources` array:** New features should use `@Observable` ViewModels and `BMNetworkingManager`, not the `DataSource` protocol.
- **Direct Firestore access from Views:** Route all Firestore calls through a ViewModel or `BMNetworkingManager`.
- **Raw string collection names in ViewModels:** Define collection names as `fileprivate let` constants at file scope or in `BMConstants`.
