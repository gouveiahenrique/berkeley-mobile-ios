# Code Conventions

Conventions below are derived from patterns observed across the repository source files.

---

## Naming

### Types

- **Structs and classes** use `UpperCamelCase`: `DataManager`, `BMLibrary`, `GymOccupancyViewModel`, `TodayTilePlacementEngine`.
- **Protocols** use `UpperCamelCase` with a noun or adjective suffix: `DataSource`, `DrawerViewDelegate`, `HasImage`, `HasLocation`, `SearchItem`.
- **Enums** use `UpperCamelCase` for the type and `lowerCamelCase` for cases: `DrawerState.hidden`, `DrawerState.collapsed`, `UserDefaultsKeys.recentSearches`.
- **App-specific types** are prefixed with `BM`: `BMLibrary`, `BMGym`, `BMColor`, `BMFont`, `BMNetworkingManager`, `BMConstants`, `BMLocationManager`, `BMEventManager`.

### Properties and Methods

- `lowerCamelCase` throughout.
- Private file-scoped constants use the `k` prefix: `kDataSources`, `kLibrariesEndpoint`, `kGymsEndpoint`, `kMapEndpoint`, `kEventsDataServiceEndpoint`.

### Files

- One primary type per file; file name matches the type name: `TabBarController.swift`, `DataManager.swift`, `HomeView.swift`.
- Extensions that add conformances or feature-specific logic use `+` in the file name: `AppDelegate+Migration.swift`, `BerkeleyMobile+Injection.swift`, `Date+Extension.swift`, `UIView+Extensions.swift`.
- Color extensions are namespaced as `Colors+<Feature>.swift` (e.g., `Colors+Calendar.swift`, `Colors+ActionButton.swift`, `Colors+Event.swift`).

---

## File and Module Organization

- Source files are grouped into feature folders matching the tab/feature: `Home/`, `Events/`, `Safety/`, `Today/`, `Resources/`, `FeedbackForm/`.
- Shared UI components live in `Common/`.
- All data-layer code (data sources, managers, protocols, item protocols) lives in `Data/`.
- Utility extensions live in `Utils/`.
- Design tokens (`BMFont`, `BMColor`) live in `Assets/`.
- Swift extensions that augment UIKit/Foundation types live in `Utils/` alongside their module name: `Date+Extension.swift`, `UIView+Extensions.swift`, `UserDefaults+Extension.swift`.

---

## Architectural Patterns

### MVVM

The current SwiftUI screens follow MVVM. Views are structs conforming to `View`; business logic and state live in `ObservableObject` or `@Observable` view model classes. Examples:
- `HomeView` ↔ `HomeViewModel`
- `EventsView` ↔ `EventsViewModel`
- `SafetyView` ↔ `SafetyViewModel`
- `WeatherDataViewModel` (standalone, no associated view struct by the same pattern)

### Dependency Injection via FactoryKit

All view model and manager dependencies are registered in `Container` extensions (`BerkeleyMobile+Injection.swift`). Call sites use FactoryKit property wrappers:
- `@Injected(\.key)` — for value types or non-observable references
- `@InjectedObject(\.key)` — for `ObservableObject` view models (triggers SwiftUI `@StateObject`-equivalent binding)
- `@InjectedObservable(\.key)` — for `@Observable` view models

### Singleton Pattern

Services that are shared application-wide and have no per-caller identity are implemented as singletons accessed via a `static let shared` property:
- `DataManager.shared`
- `BMNetworkingManager.shared`
- `BMLocationManager.shared`
- `ImageLoader.shared`
- `EventsDataService.shared`

### Protocol-oriented Item Capabilities

Data model types compose their capabilities through protocols:
- `HasImage` — provides `imageURL` and a default `fetchImage(completion:)` via `ImageLoader`
- `HasLocation` — geographic coordinates
- `HasName` — display name
- `HasPhoneNumber`
- `SearchItem` — used by `DataManager.searchable` to expose items to global search
- `CanFavorite`

### UIKit / SwiftUI Interop

UIKit view controllers embed SwiftUI views via `UIHostingController`. The reverse (SwiftUI embedding UIKit) is done via `UIViewControllerRepresentable` wrappers (e.g., `HomeMapView` wrapping `MapViewController`). The main `HomeView` and `MapViewController` communicate through `homeViewModel` (injected) and direct method calls on `mapViewController` passed as a parameter.

---

## UIKit Conventions

- `MARK:` comments are used to delimit protocol conformances and logical sections within a file: `// MARK: - UNUserNotificationCenterDelegate`, `// MARK: - MessagingDelegate`, `// MARK: - Map Markers`.
- `UIViewController` subclasses call `super.viewDidLoad()` first in `viewDidLoad`.
- Auto Layout is used exclusively via `NSLayoutConstraint.activate([...])` and convenience `setConstraintsToView(top:bottom:left:right:)` helpers.
- `translatesAutoresizingMaskIntoConstraints = false` is set on every programmatic view before adding to the hierarchy.

---

## SwiftUI Conventions

- Views are split into `var body: some View` plus named private computed properties for sub-components (e.g., `private var segmentedControlHeader`, `private var homeDrawerContentView`).
- `#Preview` blocks are included in most SwiftUI view files.
- `ViewModifier` structs encapsulate reusable styling (`Shadowfy`, `PositionAtTopModifier`, `BMBadgeStyleViewModifer`, `AlertPresentationViewModifier`). Convenience `View` extension methods call `modifier(...)`.
- iOS version checks use `if #available(iOS 26.0, *)` / `if #unavailable(iOS 26.0)` for conditional glass-effect APIs and navigation toolbar items.

---

## Concurrency

- Pre-async code uses `DispatchGroup` + `DispatchQueue.main.async` callbacks (e.g., `DataManager`, `GymDataSource`, `LibraryDataSource`).
- Newer code uses Swift Concurrency (`async/await`, `Task`, `TaskGroup`): `BMNetworkingManager`, `EventsDataService`, `GymOccupancyViewModel`, `WeatherDataViewModel`.
- `@MainActor` is applied to view model classes that update UI state: `EventsViewModel`, `WeatherDataViewModel`, `HomeViewModel`.
- `AtomicDictionary` provides thread-safe dictionary access for `DataManager`'s internal cache.

---

## Constants

- Application-wide constants are collected in `BMConstants` (`berkeley-mobile/Data/BMConstants.swift`): Berkeley coordinates, Firestore collection names, section title strings, map zoom limits.
- Per-type constants are defined in a nested `private struct Constants` or `struct Constants` within the owning type (e.g., `GymOccupancyViewModel.Constants`, `MapViewController.Constants`, `TodayWeatherTileView.Constants`).
- `UserDefaultsKeys` enum centralises all `UserDefaults` key strings.

---

## Error Handling

- Callback-based data sources print errors to the console and do not invoke the completion handler on failure (e.g., `print("Error getting documents: \(err)")`).
- Async/await code uses `do { try await ... } catch { ... }` with `Logger` calls for diagnostics (e.g., `Logger.eventsDataService.error(...)`).
- `BMError` is the app-level error enum; `BMNetworkingManager` methods are marked `throws` and propagate errors to callers.

---

## Logging

`os.Logger` is used in newer code for structured logging. Logger instances are extended on `Logger` via `extension Logger` in `Utils/Logger+Ext.swift`. Older code uses `print(...)` calls.
