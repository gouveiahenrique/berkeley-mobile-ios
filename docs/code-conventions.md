# Code Conventions

## Language and Frameworks

The codebase mixes UIKit and SwiftUI. Older screens (map, drawer system, detail cards) use UIKit; newer screens (Today, Safety, Resources, Events) and the widget extension use SwiftUI. SwiftUI views are bridged into UIKit hierarchies via `UIHostingController`.

## Naming Conventions

### Types

- **Prefix `BM`** is used on application-specific model and utility types: `BMLibrary`, `BMGym`, `BMSafetyLog`, `BMFont`, `BMColor`, `BMAlert`, `BMLocationManager`, `BMNetworkingManager`, `BMError`, `BMEventManager`, `BMCalendarEvent`, `BMResourceCategory`.
- **View model classes** are named `<Feature>ViewModel` (e.g., `SafetyViewModel`, `ResourcesViewModel`, `EventsViewModel`, `WeatherDataViewModel`, `HomeViewModel`).
- **Data source classes** are named `<Feature>DataSource` (e.g., `MapDataSource`, `LibraryDataSource`, `GymDataSource`).
- **Protocols** describing capabilities use adjective or "Has" prefix: `HasLocation`, `HasImage`, `HasName`, `HasOpenTimes`, `HasOpenClosedStatus`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `SearchItem`.

### Constants

- Module-private constants at file scope use a `k` prefix (`kLibrariesEndpoint`, `kViewMargin`, `kCardPadding`, `kGymsEndpoint`, `kMapEndpoint`).
- Public shared constants are grouped into `struct BMConstants` with static properties.

### `UserDefaults` keys

`UserDefaultsKeys` is a `String` raw-value enum (`Utils/UserDefaults+Extension.swift`) listing all keys in one place. `UserDefaults` is extended with typed overloads accepting `UserDefaultsKeys`.

### Files

- Extensions on existing types are named `<Type>+<Purpose>.swift` (e.g., `AppDelegate+Migration.swift`, `UIImage+Extensions.swift`, `Date+Extension.swift`, `Colors+Calendar.swift`).
- `BMColor` color extensions are split into per-feature files under `Assets/Colors/`.

## Architecture Patterns

### MVVM

The codebase uses MVVM. SwiftUI views inject view models via FactoryKit (`@Injected`, `@InjectedObject`, `@InjectedObservable`). UIKit view controllers access view models directly via `Container.shared.*.resolve()`.

### Protocol-oriented capability composition

Domain model objects gain capabilities by conforming to item protocols in `Data/ItemProtocols/`. A single model can conform to multiple protocols (e.g., a `BMLibrary` may conform to `SearchItem`, `HasLocation`, `HasImage`, `HasOpenTimes`, `CanFavorite`). Protocol extensions provide default implementations where applicable.

### Singleton services

Core infrastructure classes are singletons accessed via a `static let shared` property: `DataManager`, `BMNetworkingManager`, `BMLocationManager`, `ImageLoader`, `EventsDataService`. The FactoryKit container itself is accessed as `Container.shared`.

### Dependency injection via FactoryKit

All view model instantiation intended to be shared or testable is registered in `BerkeleyMobile+Injection.swift`. Lifecycle scopes observed:

| Scope | Usage |
|---|---|
| `.singleton` | `diningHallsViewModel`, `guidesViewModel`, `gymOccupancyViewModel`, `homeViewModel` |
| `.shared` | `calendarViewModel`, `eventsViewModel`, `homeDrawerPinViewModel`, `mapMarkersDropdownViewModel`, `mapUserLocationButtonViewModel`, `menuItemIconCacheManager`, `newsDataViewModel`, `resourcesViewModel`, `safetyViewModel`, `searchViewModel`, `weatherDataViewModel` |
| Default (transient) | `feedbackFormPresenter`, `feedbackFormViewModel` |

### Drawer navigation system

The Home tab uses a custom drawer navigation pattern built on `DrawerViewController` and `DrawerViewDelegate`. `MainContainerViewController` conforms to `MainDrawerViewDelegate` and manages a `drawerStack: [DrawerViewDelegate]` array, allowing detail drawers to be stacked on top of the main drawer and dismissed individually. States are `hidden`, `collapsed`, `middle`, `full`.

### Notification-based location updates

`BMLocationManager` broadcasts location changes via `NotificationCenter` (notification name `.locationUpdated`). Consumers register as observers rather than coupling directly to `BMLocationManager`.

### Data source deduplication

`DataSource` implementations declare a `static var fetchDispatch: DispatchGroup`. `DataManager` uses this to ensure Firestore is called at most once per source per fetch cycle, coalescing concurrent callers.

### Thread dispatch conventions

- Completion handlers and UI updates dispatched to `DispatchQueue.main.async` in UIKit data path.
- SwiftUI view models use `@MainActor` annotation and/or `await MainActor.run { }` for main-thread UI updates.
- Background Firestore fetches dispatched to `.global(qos: .utility)` in `DataManager.fetch`.

## File Organization

- Feature code is organized under top-level directories matching the tab or domain: `Home/`, `Today/`, `Safety/`, `Resources/`, `Events/`, `FeedbackForm/`.
- Each feature subdirectory may contain further subdirectories for data sources, view models, and views (e.g., `Home/Fitness/GymDataSource/`, `Today/Tiles/Weather Tile/`).
- Shared utilities live in `Utils/`.
- Shared UI components live in `Common/`.
- Design tokens (colors, fonts) live in `Assets/`.

## SwiftUI Conventions

- Preview macros (`#Preview { ... }`) are present on SwiftUI view files.
- `@Observable` macro (Swift 5.9 Observation framework) is used in newer view models (`EventsViewModel`, `WeatherDataViewModel`, `NewsDataViewModel`).
- Older view models use `ObservableObject` with `@Published` properties (`SafetyViewModel`, `ResourcesViewModel`).
- FactoryKit `@InjectedObservable` is used for `@Observable` view models; `@InjectedObject` is used for `ObservableObject` view models.

## Error Handling

- Firestore fetch failures in UIKit data sources print an error string to the console and do not call the completion handler.
- Async/await fetches in `BMNetworkingManager`, `EventsDataService`, and view models surface errors to the UI via a `BMAlert` model exposed as a `@Published var alert: BMAlert?` property. Views observe this and present the alert.
- Image loading failures in `ImageLoader` call the completion with `.failure(error)` for non-cancellation errors.
- Codable document decode failures in `EventsDataService` are logged via `os.Logger` (`Logger.eventsDataService`).

## Comments and Documentation

- Public protocol members and non-obvious private methods carry documentation comments (`///` format).
- MARK annotations (`// MARK: -`) are consistently used to section extensions and logical groups within files.
- Module-level comments on constants describe their purpose (e.g., `WeeklyHours.swift` documents the `DateInterval.duration = 0` convention for 24-hour services).
