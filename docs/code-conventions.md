# Code Conventions

**Last updated:** 2026-07-31

## Naming Conventions

### Types (classes, structs, enums, protocols)

- **PascalCase** for all types: `BMLibrary`, `GymOccupancyViewModel`, `DataSource`, `BMError`
- **`BM` prefix** for shared/infrastructure types owned by this project: `BMColor`, `BMFont`, `BMConstants`, `BMError`, `BMLibrary`, `BMGym`
- Feature-specific types do **not** need the `BM` prefix when they live in a dedicated feature directory: `DiningItem`, `SafetyViewModel`, `GymOccupancyEntry`

### Properties and Functions

- **camelCase** for all instance/static properties and function names: `fetchItems`, `weeklyHours`, `occupancyPercentage`
- **`k` prefix** for `fileprivate`/`private` constants that are string literals or collection literals: `kLibrariesEndpoint`, `kDataSources`

### Constants

- **Static `let` inside a `struct` or `enum`:** `BMConstants.safetyLogsCollectionName`, `GymOccupancyViewModel.Constants.refreshIntervalSecs`
- Prefer a nested `Constants` struct inside the type that owns the value:

```swift
struct Constants {
    static let refreshIntervalSecs: TimeInterval = 15 * 60
    static let gymOccupancyCollectionName = "Gym Occupancy Meters"
}
```

### Files

- One primary type per file; file name matches the primary type: `LibraryDataSource.swift`, `HomeViewModel.swift`
- Extensions on a type live in `TypeName+Category.swift`: `Colors+ActionButton.swift`, `AppDelegate+Migration.swift`
- Utility extensions: `TypeName+Extension.swift` or `TypeName+Ext.swift` (both patterns exist; prefer `+Extension` for new files)

---

## Code Formatting

No automated formatter is configured. Follow these conventions by hand (or configure SwiftFormat/SwiftLint if added later):

- **Indentation:** 4 spaces (Xcode default)
- **Line length:** No hard limit enforced; aim for readability (≤120 characters per line is a reasonable guideline)
- **Braces:** Opening brace on the same line (`{` at end of declaration)
- **Blank lines:** One blank line between methods; two blank lines between `// MARK:` sections
- **Trailing whitespace:** None

---

## MARK Comments

Use `// MARK: -` to organize code within a file. Standard sections:

```swift
// MARK: - Properties
// MARK: - Initialization
// MARK: - Public Methods
// MARK: - Private Methods
// MARK: - SomeDelegateProtocol
```

Extensions in the same file use `// MARK: - ExtensionName`:

```swift
extension AppDelegate: MessagingDelegate {
    // MARK: - MessagingDelegate
}
```

---

## SwiftUI View Structure

Break complex `body` into named computed properties or `@ViewBuilder` functions. Avoid deeply nested view bodies:

```swift
var body: some View {
    ZStack {
        mapLayer
        drawerLayer
    }
}

private var mapLayer: some View { ... }
private var drawerLayer: some View { ... }
```

Keep `View` structs focused on layout. Move business logic into the ViewModel.

---

## ViewModel Patterns

### New code — use `@Observable` (iOS 17+)

```swift
@Observable
class GymOccupancyViewModel: NSObject {
    var occupancyPercentages: [GymOccupancyLocation: Double] = [:]
    var isLoading = false
    var errorMessage: String? = nil

    @ObservationIgnored
    private var timer: Timer?
}
```

Use `@ObservationIgnored` for stored properties that should not trigger view updates (timers, stored callbacks, `DispatchGroup`).

### Legacy code — use `ObservableObject` + `@Published`

```swift
class HomeViewModel: ObservableObject {
    @Published var isFetching = false
    @Published var diningHalls: [BMDiningHall] = []
}
```

Do not mix `@Observable` and `@Published` in the same class.

### `@MainActor` placement

Mark ViewModels `@MainActor` when all their state updates must happen on the main thread:

```swift
@MainActor
@Observable
class WeatherDataViewModel { ... }
```

Use `Task { @MainActor in ... }` inside async functions that need to update state on the main actor from a background context.

---

## Dependency Injection (Factory)

Register all ViewModels and shared services in `BerkeleyMobile+Injection.swift` as extensions on `Container`:

```swift
extension Container {
    var gymOccupancyViewModel: Factory<GymOccupancyViewModel> {
        self { @MainActor in GymOccupancyViewModel() }.singleton
    }
}
```

**Scopes:**
- `.singleton` — single instance for the app lifetime (global shared state)
- `.shared` — shared as long as any view holds a reference (weak reference semantics)
- No scope (default) — new instance per injection

**Inject in views:**
```swift
@Injected(\.menuItemIconCacheManager) private var menuItemIconCacheManager
@InjectedObservable(\.diningHallsViewModel) private var diningHallsViewModel   // for @Observable
@InjectedObject(\.homeViewModel) private var homeViewModel                     // for ObservableObject
```

---

## Async/Await Patterns

Prefer `async/await` over completion handlers for new code:

```swift
// Preferred
func fetchSafetyLogs() async throws -> [BMSafetyLog] {
    let snapshot = try await db.collection(endpoint).getDocuments()
    return snapshot.documents.compactMap { try? $0.data(as: BMSafetyLog.self) }
}

// Use TaskGroup for parallel fetches
return await withTaskGroup(of: (GymOccupancyLocation, Double).self, ...) { group in
    for location in GymOccupancyLocation.allCases {
        group.addTask { ... }
    }
    return await group.reduce(into: [:]) { ... }
}
```

Initiate async tasks from ViewModel `init` or lifecycle methods using `Task { @MainActor in ... }`:

```swift
init() {
    Task { @MainActor in
        diningHalls = await fetchDiningHalls()
    }
}
```

---

## Error Handling

- Define domain errors in `BMError` enum conforming to `LocalizedError`
- Use `throws` + `try/catch` for errors that callers must handle
- Use `try?` with a guard or `compactMap` for best-effort decoding where a missing item is acceptable:

```swift
let items = documents.compactMap { try? $0.data(as: BMSafetyLog.self) }
```

- Log errors with `os.Logger` (see Logging section); do not use `print()` in new code

---

## Logging

Use `os.Logger` with per-subsystem, per-category instances defined in `Utils/Logger+Ext.swift`:

```swift
extension Logger {
    static let diningHallsViewModel = Logger(
        subsystem: Bundle.main.bundleIdentifier!,
        category: String(describing: DiningHallsViewModel.self)
    )
}
```

Usage:

```swift
Logger.diningHallsViewModel.error("\(error)")
Logger.diningHallsViewModel.info("Fetched \(halls.count) dining halls")
```

**Log levels:**
- `.debug` — verbose development info (omitted in release builds by default)
- `.info` — normal operation milestones
- `.error` — recoverable errors (Firestore decode failure, network error)
- `.fault` — critical programmer errors (should never happen)

Do **not** use `print()` for new logging. Remove `print()` calls before merging.

---

## Property Wrappers

Use the `@Display` property wrapper for any `String` or `String?` model property that will be shown in the UI. It strips whitespace and replacement characters automatically:

```swift
@Display var name: String
@Display var description: String?
```

---

## Protocol-Oriented Models

Domain models conform to capability protocols from `Data/ItemProtocols/` rather than inheriting from a base class:

```swift
struct BMLibrary: HomeDrawerSectionRowItemType, CanFavorite, HasPhoneNumber, HasOpenTimes {
    ...
}
```

Define new capability protocols in `Data/ItemProtocols/` with focused, single-purpose definitions.

---

## UIKit ↔ SwiftUI Interop

- Wrap SwiftUI views for UIKit containers with `UIHostingController`
- Wrap UIKit view controllers for SwiftUI with `UIViewControllerRepresentable`
- Keep bridging code minimal; do not put business logic in `makeUIViewController` or `updateUIViewController`

---

## Anti-Patterns to Avoid

- ❌ **`print()` for logging** — use `os.Logger` instead
- ❌ **Force unwrap (`!`)** — except in rare cases where nil is a programmer error (e.g., `Bundle.main.bundleIdentifier!`); always add a comment explaining why
- ❌ **Blocking the main thread** — all network/Firestore calls must be async; use `Task.detached` for CPU-heavy work
- ❌ **Mixing `@Observable` and `@Published`** — pick one per class
- ❌ **Giant ViewControllers** — move data fetching to ViewModels; keep UIViewController/SwiftUI View code to layout and user interaction
- ❌ **Hardcoded Firebase collection name strings** — define in `BMConstants` or as `fileprivate let` at the file top
- ❌ **`#if DEBUG` in production logic paths** — confine debug-only code to `Debug/` feature group and `#if DEBUG` guards
