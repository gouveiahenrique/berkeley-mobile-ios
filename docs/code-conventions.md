# Code Conventions

## Language

The codebase is written in Swift. UIKit is used for older and lower-level components; SwiftUI is used for newer views and features. Bridging between the two frameworks occurs via `UIHostingController` (UIKit hosting SwiftUI) and `UIViewControllerRepresentable` (SwiftUI wrapping UIKit).

---

## Naming Conventions

### Types

- Concrete types use `UpperCamelCase`.
- Protocols use `UpperCamelCase`, typically describing a capability: `DataSource`, `HasImage`, `HasLocation`, `CanFavorite`, `DrawerViewDelegate`, `OpenClosedStatusManagerDelegate`.
- Enums use `UpperCamelCase` with `lowerCamelCase` cases: `UserDefaultsKeys`, `HomeDrawerViewType`, `BMSafetyLogFilterState`, `SearchResultsState`.

### App-Prefixed Names

Types belonging to the app's shared design system or data layer are prefixed with `BM`:
- `BMColor`, `BMFont`, `BMAlert`, `BMError`, `BMConstants`
- `BMDiningHall`, `BMGym`, `BMLibrary`, `BMSafetyLog`, `BMResourceCategory`
- `BMNetworkingManager`, `BMLocationManager`, `BMEventManager`
- `BMCalendarEvent`, `BMEventCalendarEntry`
- `BMDrawerView`, `BMFilterButton`, `BMActionButton`, `BMCachedAsyncImageView`, `BMContentUnavailableView`
- `BMSegmentedControlView`, `BMTopBlobView`, `BMHomeSectionListView`

### Files

- Files are named after their primary type: `DataManager.swift`, `HomeViewModel.swift`, `GymDataSource.swift`.
- Extension files use `TypeName+Category.swift`: `AppDelegate+Migration.swift`, `UserDefaults+Extension.swift`, `Date+Extension.swift`, `Colors+Calendar.swift`.
- Color extension files follow `Colors+FeatureName.swift` for every feature domain.

### Constants

- File-private module-level constants use the `k` prefix: `kDataSources`, `kGymsEndpoint`, `kLatestLaunchedVersionKey`, `kAnnotationIdentifier`, `kViewMargin`.
- Static struct members do not use the `k` prefix: `BMConstants.safetyLogsCollectionName`, `BMConstants.berkeleyRegion`.

### View Models

All ViewModels are suffixed `ViewModel`: `HomeViewModel`, `SafetyViewModel`, `ResourcesViewModel`, `SearchViewModel`, `EventsViewModel`.

### Data Sources

All data fetching classes for the `DataManager` pattern are suffixed `DataSource`: `GymDataSource`, `LibraryDataSource`, `MapDataSource`.

---

## File Organization

- **Feature directories** group related view, view model, and data source files together: `Home/Dining/`, `Home/Fitness/`, `Safety/`, `Events/`.
- **Sub-directories** within a feature hold data source files separately: `Home/Fitness/GymDataSource/`, `Home/Fitness/GymClassDataSource/`.
- **Shared design tokens** live under `Assets/Colors/` (split into extension files per domain) and `Assets/Fonts.swift`.
- **Reusable UI** lives under `Common/` with sub-directories for `DetailView/`, `FilterView/`, `Images/`.
- **Utilities** live under `Utils/`.

---

## MARK Comments

Files use `// MARK: -` annotations to segment code within a file. Observed patterns:

```swift
// MARK: - TypeName
// MARK: - Protocol conformance (e.g., CLLocationManagerDelegate)
// MARK: - Static Methods
// MARK: - Instance Methods
// MARK: - Private Methods
// MARK: - Sample Data
```

---

## State Management

### ObservableObject (UIKit-compatible ViewModels)

ViewModels used with UIKit or older SwiftUI adopt `ObservableObject` with `@Published` properties:
- `HomeViewModel`, `SafetyViewModel`, `ResourcesViewModel`, `DiningHallsViewModel`

### @Observable (Swift Observation framework)

Newer ViewModels use the `@Observable` macro:
- `SearchViewModel`, `EventsViewModel`, `NewsDataViewModel`

### FactoryKit Injection

ViewModels are never directly instantiated in views. Instead, they are resolved from the FactoryKit `Container` using property wrappers:
- `@Injected` — for regular (non-observable) dependencies
- `@InjectedObservable` — for `@Observable` classes
- `@InjectedObject` — for `ObservableObject` classes

Lifetime scopes used in `BerkeleyMobile+Injection.swift`:
- `.singleton` — one instance for the entire app lifetime (e.g., `homeViewModel`, `diningHallsViewModel`, `guidesViewModel`)
- `.shared` — shared instance within a scope (e.g., `feedbackFormPresenter`, `searchViewModel`, `safetyViewModel`)
- No scope modifier — new instance per resolution (e.g., `feedbackFormViewModel`)

---

## Concurrency Patterns

### Callback-based (DataSource pattern)

`DataSource` implementations call completion handlers on the main thread. `DataManager.fetch` routes work through `DispatchGroup` on a `.utility` global queue, then dispatches results to the main queue.

### async/await

Newer ViewModels use Swift concurrency:
- Methods marked `async throws` in `BMNetworkingManager`
- `@MainActor` on ViewModel fetch methods to ensure UI updates on main thread
- `@concurrent` annotation on `NewsDataViewModel.fetchNewsArticles()` for background execution

### Thread-safe shared state

`AtomicDictionary` uses `pthread_rwlock_t` for concurrent read / exclusive write access. It is used by `DataManager` to store fetched items.

---

## Property Wrappers

| Wrapper | File | Purpose |
|---|---|---|
| `@Display` | `Data/PropertyWrappers/Display.swift` | Trims whitespace and removes `�` characters from `String` and `String?` values |

---

## Error Surfacing

ViewModels expose errors through a `@Published var alert: BMAlert?` pattern. Views observe this property and present an alert. The `BMAlert` type carries a title, message, and type (`.notice` or `.action`). Updates that should bypass SwiftUI animation use a `withoutAnimation { }` helper (observed in `SafetyViewModel` and `ResourcesViewModel`).

---

## SwiftUI Previews

SwiftUI components include `#Preview` blocks for development-time rendering. Preview data is inline within the preview block or uses static factory methods (`SafetyViewModel.getSampleSafetyLog()`).

---

## Migration Pattern

Version-based data migrations are accumulated in `AppDelegate+Migration.swift`. The file comment states `"This function should not be trimmed of old migrations"`. Each migration checks whether the previous version is below a threshold before executing.

---

## Color System

All color references go through `BMColor` (defined in `Assets/Colors/Colors.swift` and extended in `Assets/Colors/Colors+*.swift`). Colors are defined as adaptive `UIColor` closures that return different values for `.dark` and `.light` user interface styles. No hardcoded hex values appear in view code directly.

---

## Typography System

All font references use `BMFont.regular(size)`, `BMFont.bold(size)`, `BMFont.medium(size)`, `BMFont.mediumItalic(size)`, or `BMFont.light(size)`. These return the custom Apercu typeface with a system font fallback. In SwiftUI contexts, `Font(BMFont.regular(size))` bridges `UIFont` to `Font`.
