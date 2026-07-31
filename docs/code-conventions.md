# Code Conventions

**Last updated:** 2026-07-31

## Naming Conventions

### Types (Classes, Structs, Enums, Protocols)

`PascalCase`. App-specific types are prefixed with `BM` to avoid conflicts with system types:

```swift
class BMNetworkingManager { ... }
struct BMSafetyLog { ... }
enum BMError { ... }
protocol HasImage { ... }
struct BMConstants { ... }
```

### Variables and Functions

`camelCase`:

```swift
var isFetching = false
var diningHalls: [BMDiningHall] = []
func fetchSafetyLogs() async throws -> [BMSafetyLog] { ... }
func logOpenedDiningDetailViewAnalytics(for diningHallName: String) { ... }
```

### Constants

- **File-scope private constants** use `k` prefix + camelCase (Objective-C legacy convention):

```swift
fileprivate let kLibrariesEndpoint = "Libraries"
fileprivate let kDiningHallEndpoint = "Dining Halls V2"
```

- **Static struct constants** use camelCase inside a `Constants` nested struct or `BMConstants`:

```swift
struct Constants {
    static let refreshIntervalSecs: TimeInterval = 15 * 60
    static let gymOccupancyCollectionName = "Gym Occupancy Meters"
}
```

- **Global enum-case-style constants**: use `UPPER_SNAKE_CASE` only for `NotificationCenter` names or similar cross-module identifiers (rare).

### Files

`PascalCase.swift` matching the primary type name. Extension files use `TypeName+Category.swift`:

```
DiningHallsViewModel.swift
AppDelegate+Migration.swift
Colors+TagView.swift
Date+Extension.swift
Logger+Ext.swift
```

### Enums and Cases

`PascalCase` for the enum type; `camelCase` for cases:

```swift
enum HomeDrawerViewType {
    case dining
    case fitness
    case study
}

enum BMSafetyLogFilterState: String, CaseIterable {
    case today = "Today"
    case thisWeek = "This Week"
    case aggravatedAssault = "Aggravated Assault"
}
```

## Code Formatting

- **Indentation:** 4 spaces (Xcode default)
- **Line length:** No enforced limit; follow Xcode default wrapping (~100-120 chars practical target)
- **Braces:** Opening brace on same line (K&R style)
- **No trailing semicolons**

## Type Annotations

Explicit type annotations are used when the type is non-obvious from the right-hand side. Omit them when inference is clear:

```swift
// Explicit — type not obvious from initializer
var data: AtomicDictionary<String, [Any]>
var crimeInfos = [BMSafetyLogFilterState: BMCrimeInfo]()

// Inferred — type is clear
var isFetching = false
var diningHalls: [BMDiningHall] = []
```

## SwiftUI Patterns

### View State

Inject ViewModels from the FactoryKit container — do not instantiate ViewModels directly in views:

```swift
struct HomeView: View {
    // Preferred — injected from Container
    @InjectedObject(\.homeViewModel) private var homeViewModel
    @InjectedObservable(\.diningHallsViewModel) private var diningHallsViewModel
    @Injected(\.menuItemIconCacheManager) private var menuItemIconCacheManager

    // Local view state only
    @State private var tabSelectedIndex = 0
    @State private var navigationPath = NavigationPath()
}
```

### Observable ViewModels

New ViewModels use `@Observable` (Swift Observation framework, iOS 17+):

```swift
@Observable
class DiningHallsViewModel {
    var diningHalls: [BMDiningHall] = []
    var isFetching = false
}
```

Legacy ViewModels use `ObservableObject` + `@Published`:

```swift
class HomeViewModel: ObservableObject {
    @Published var isFetching = false
    @Published var diningHalls: [BMDiningHall] = []
}
```

Do not mix the two patterns in a single ViewModel. New ViewModels should use `@Observable`.

### View Decomposition

Break views into `private var` computed properties rather than separate files for small sub-components:

```swift
var body: some View {
    ZStack {
        mapView
        drawerView
    }
}

private var drawerView: some View {
    BMDrawerView(...) { homeDrawerContentView }
}

private var homeDrawerContentView: some View {
    NavigationStack { ... }
}
```

### MARK Comments

Use `// MARK: -` to organize code within a file:

```swift
// MARK: - UNUserNotificationCenterDelegate
extension AppDelegate: UNUserNotificationCenterDelegate { ... }

// MARK: - MessagingDelegate
extension AppDelegate: MessagingDelegate { ... }

// MARK: - OpenClosedStatusManagerDelegate
extension DiningHallsViewModel: OpenClosedStatusManagerDelegate { ... }
```

### NavigationStack

Use `NavigationStack(path:)` with typed navigation destinations. Navigation destinations are declared via `.navigationDestination(for:)` modifiers:

```swift
NavigationStack(path: $navigationPath) {
    contentView
        .navigationDestination(for: BMDiningHall.self) { diningHall in
            DiningDetailView(diningHall: diningHall)
        }
}
```

Navigate by appending typed values: `navigationPath.append(selectedDiningHall)`

## Async/Await Patterns

Prefer `async/await` over callbacks for new Firestore fetch logic. Use `Task { @MainActor in ... }` to dispatch async work that updates `@Published` or `@Observable` state from `init()`:

```swift
init() {
    isFetching = true
    Task { @MainActor in
        diningHalls = await fetchDiningHalls()
        isFetching = false
    }
}
```

Mark functions that must run on main actor explicitly:

```swift
@MainActor
private func listenForSafetyLogs() async {
    do {
        let logs = try await BMNetworkingManager.shared.fetchSafetyLogs()
        safetyLogs = logs
    } catch {
        self.alert = BMAlert(...)
    }
}
```

Use `defer` for cleanup that should always run (e.g., clearing loading state):

```swift
async func fetchData() {
    defer { isLoading = false }
    // fetch...
}
```

## Error Handling

Do not silently swallow errors. Prefer one of:

1. Propagate with `throws` when the caller needs to handle the failure
2. Return an empty/default value with a logged error for non-critical data:

```swift
guard let snap = try? await db.collection(endpoint).getDocuments() else {
    Logger.diningHallsViewModel.error("Failed to fetch dining halls")
    return []
}
```

3. Set a `BMAlert` on the ViewModel for user-visible errors:

```swift
} catch {
    withoutAnimation {
        self.alert = BMAlert(title: "Title", message: error.localizedDescription, type: .notice)
    }
}
```

Do not use `print()` for error logging. Use `os.Logger` via the categories defined in `Logger+Ext.swift`.

## Logging

Use `os.Logger` with per-ViewModel/service categories. Add new categories to `Logger+Ext.swift`:

```swift
// Logger+Ext.swift — register new category
extension Logger {
    static let myNewViewModel = Logger(
        subsystem: Bundle.main.bundleIdentifier!,
        category: String(describing: MyNewViewModel.self)
    )
}

// Usage in ViewModel
Logger.myNewViewModel.error("Something went wrong: \(error.localizedDescription)")
Logger.myNewViewModel.info("Fetched \(items.count) items")
```

Log levels:
- `.debug` — verbose diagnostic info (development)
- `.info` — normal operational events
- `.error` — recoverable errors

## Dependency Injection

Register all ViewModels and services in `BerkeleyMobile+Injection.swift`. Choose scope deliberately:

- `.singleton` — single instance for the entire app lifetime (e.g., `homeViewModel`, `diningHallsViewModel`)
- `.shared` — single instance while at least one strong reference exists (e.g., `safetyViewModel`)
- Default (no scope) — new instance per resolution (e.g., `feedbackFormViewModel`)

```swift
extension Container {
    var myViewModel: Factory<MyViewModel> {
        self { MyViewModel() }.singleton
    }
}
```

## Design Tokens

Use `BMColor` and `BMFont` — never hardcode `UIColor` literal values or font names inline in views:

```swift
// Correct
label.font = BMFont.bold(16)
label.textColor = BMColor.blackText

// Avoid
label.font = UIFont(name: "Apercu-Bold", size: 16)
label.textColor = UIColor(red: 0.1, green: 0.1, blue: 0.1, alpha: 1.0)
```

## DEBUG Guards

Wrap debug-only code in `#if DEBUG`:

```swift
#if DEBUG
var debugViewModel: Factory<DebugViewModel> {
    self { DebugViewModel(...) }
}
#endif
```

## Anti-Patterns to Avoid

- ❌ **Direct Firestore calls in Views** — fetch in ViewModels only
- ❌ **`print()` for logging** — use `os.Logger`
- ❌ **Instantiating ViewModels in `View.init()`** — use `@Injected` / `@InjectedObject`
- ❌ **Mixing `@Observable` and `ObservableObject` in a single ViewModel**
- ❌ **Hardcoded Firestore collection name strings inline** — use `fileprivate let k*` constants or `BMConstants`
- ❌ **`DispatchQueue.main.async` in new code** — use `await MainActor.run { }` or `@MainActor`
- ❌ **Force unwrapping** (`!`) outside of tests — use `guard let` or `??` with a safe default
