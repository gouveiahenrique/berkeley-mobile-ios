# Code Conventions

## Naming Conventions

### Types
- Classes, structs, enums, and protocols use `UpperCamelCase`: `DataManager`, `BMLibrary`, `DrawerState`, `DataSource`
- App-specific types are prefixed with `BM`: `BMColor`, `BMFont`, `BMLibrary`, `BMGym`, `BMDiningHall`, `BMSafetyLog`, `BMDrawerView`, `BMNetworkingManager`, `BMLocationManager`

### Files
- File names match the primary type defined inside them: `LibraryDataSource.swift` contains `LibraryDataSource`
- Feature extensions are named `Type+Category.swift`: `Colors+ActionButton.swift`, `Colors+MapMarker.swift`, `Date+Extension.swift`, `UserDefaults+Extension.swift`, `Logger+Ext.swift`
- `AppDelegate+Migration.swift` contains the `checkForUpdate` extension

### Constants
- File-private constants use `k` prefix and `lowerCamelCase`: `kLibrariesEndpoint`, `kGymsEndpoint`, `kMapEndpoint`, `kDiningHallEndpoint`, `kCellIdentifier`
- Shared constants live in `BMConstants.swift`

### Enums
- Enum cases use `lowerCamelCase`: `.hidden`, `.collapsed`, `.middle`, `.full` (`DrawerState`); `.breakfast`, `.lunch`, `.dinner` (`BMMealType`)
- `UserDefaultsKeys` raw values are string-typed and match the key name exactly

## File Organization

- Feature code is grouped into named directories under `berkeley-mobile/` (e.g., `Home/`, `Safety/`, `Resources/`, `Today/`, `Events/`)
- Each feature's model types, data sources, view models, and views reside within its directory
- Reusable non-feature code lives in `Common/`, `Data/`, `Drawer/`, and `Utils/`
- Assets (colors, fonts) live in `Assets/`

## Architecture Patterns

### Singleton
Used for shared services that must have a single instance:
- `DataManager.shared`
- `BMNetworkingManager.shared`
- `BMLocationManager.shared`

### DataSource Protocol
Data source classes implement `DataSource` and are registered in `DataManager`'s `kDataSources` array. Each implements:
- `static func fetchItems(_ completion: @escaping DataSource.completionHandler)` — performs the Firestore fetch
- `static var fetchDispatch: DispatchGroup` — deduplicates concurrent fetches

### Dependency Injection via FactoryKit
All view models are registered in `BerkeleyMobile+Injection.swift` as `Factory` instances on `Container`. Injection uses:
- `@Injected(\.keyPath)` — for non-observable value-type or class dependencies
- `@InjectedObject(\.keyPath)` — for `ObservableObject` view models
- `@InjectedObservable(\.keyPath)` — for `@Observable` view models

### ObservableObject vs @Observable
The codebase contains both patterns:
- Older view models use `class ViewModel: ObservableObject` with `@Published` properties: `HomeViewModel`, `SafetyViewModel`, `CalendarViewModel`
- Newer view models use the `@Observable` macro: `DiningHallsViewModel`, `HomeDrawerPinViewModel`

### UIKit + SwiftUI Bridging
- SwiftUI views are embedded into UIKit containers using `UIHostingController`: used in `SceneDelegate` (to host nothing directly), `MainContainerViewController` (hosts `HomeView`), and `TabBarController` (hosts `TodayView`, `SafetyView`, `ResourcesView`)
- UIKit view controllers are exposed to SwiftUI via `UIViewControllerRepresentable`: `HomeMapView` wraps `MapViewController`; `LibraryDetailView` wraps `LibraryDetailViewController`

### Drawer System
Two concurrent drawer implementations exist:
1. **UIKit drawer** (`Drawer/`): `DrawerViewController` + `DrawerViewDelegate` protocol. States: `hidden`, `collapsed`, `middle`, `full`. Used by the home map and search interactions.
2. **SwiftUI drawer** (`Common/BMDrawerView.swift`): `BMDrawerView` generic view with `BMDrawerViewState` (`.small`, `.medium`, `.large`). Used in `HomeView` and `SafetyView`.

### Thread Safety
`AtomicDictionary` wraps `Dictionary` with a POSIX read-write lock (`pthread_rwlock_t`) for concurrent access. Used by `DataManager` to cache data fetched from multiple background threads.

### Version Migration
`AppDelegate+Migration.swift` contains a `checkForUpdate()` method that compares the current bundle version against `UserDefaults`-stored last-seen version, and runs inline migration blocks. Comments in the code state "This function should not be trimmed of old migrations."

## UI Conventions

### Colors
All colors are defined on the `BMColor` struct (`Assets/Colors/Colors.swift`) and its extensions (`Colors+Calendar.swift`, `Colors+MapMarker.swift`, `Colors+Resource.swift`, etc.). Colors adapt to dark mode using `UIColor.init { trait in ... }` trait collection closures.

### Fonts
Fonts are accessed via `BMFont` (referenced throughout the codebase as `BMFont.regular(size)`, `BMFont.bold(size)`, `BMFont.medium(size)`, `BMFont.light(size)`).

### Analytics
Firebase Analytics events are logged directly in view models and view controllers using `Analytics.logEvent(_:parameters:)`. Category strings are inline string literals (e.g., `"opened_library"`, `"opened_food"`, `"opened_academic_calendar"`).

### Logging
`os.Logger` is used for structured logging in newer code. Logger categories are defined as static constants in `Logger+Ext.swift`, one per subsystem (e.g., `Logger.diningHallsViewModel`, `Logger.eventsDataService`).

### iOS Version Gating
The codebase conditionally branches on iOS version availability using `if #available(iOS 26.0, *)` and `if #unavailable(iOS 26.0)`. iOS 17 and iOS 26 are the two observed availability thresholds. The `Map` and `MapCameraBounds` APIs also use `@available(iOS 17.0, *)`.

### Debug-Only Code
`#if DEBUG` guards wrap debug-only views:
```swift
#if DEBUG
let debugView = UIHostingController(rootView: DebugView())
present(debugView, animated: true)
#endif
```
`DebugView` is accessible by shaking the device.

## Recurring Implementation Patterns

### `@Display` Property Wrapper
Model properties use a `@Display` property wrapper (defined in `Data/PropertyWrappers/`) to annotate fields that should be visible in overview/detail cards.

### `Hashable` on Models
Model types conform to `Hashable` to support SwiftUI `NavigationStack` `navigationDestination(for:)` navigation. `BMLibrary`, `BMGym`, and `BMDiningHall` all implement `Hashable` this way.

### `SearchItem` Protocol
Items that appear in global search implement the `SearchItem` protocol (defined in `Data/ItemProtocols/SearchItem.swift`). `DataManager.searchable` aggregates all searchable items from registered data sources.

### `HasOpenTimes` / `WeeklyHours`
Items with open hours conform to `HasOpenTimes` and use a shared `WeeklyHours` / `HoursInterval` model. Hours intervals are parsed from Firestore's `open_close_array` field via a static `parseWeeklyHours(dict:)` method present on model types.
