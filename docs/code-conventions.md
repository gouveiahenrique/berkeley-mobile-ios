# Code Conventions

## Naming Conventions

- **App-specific type prefix `BM`**: Recurring prefix for app-specific (as opposed to generic/reusable) types tied to Berkeley Mobile domain concepts — `BMAlert`, `BMError`, `BMConstants`, `BMEventManager`, `BMNetworkingManager`, `BMLocationManager`, `BMColor`, `BMFont`, `BMSafetyLog`, `BMSafetyLogFilterState`, `BMResourceCategory`, `BMDrawerView`, `BMActionButton`, `BMFilterButton`, `BMTopBlobView`, `BMSegmentedControlView`, `BMContentUnavailableView`, `BMCachedAsyncImageView`, `BMMPDRoomInfo`, `BMCalendarEvent`, `BMEventCalendarEntry`.
- **`Has`-prefixed capability protocols**: model capability/mixin protocols follow a `Has<Capability>` naming scheme — `HasLocation`, `HasOpenTimes`, `HasImage`, `HasName`, `HasPhoneNumber`, `HasWebsite` (`berkeley-mobile/Data/ItemProtocols/`). A boolean-capability protocol follows the same style without `Has`: `CanFavorite`.
- **`k`-prefixed constants**: file-scoped `fileprivate let` string/constant declarations for endpoint names and similar magic values are prefixed `k`, e.g. `kMapEndpoint`, `kLibrariesEndpoint`, `kGymsEndpoint`, `kGymClassesEndpoint`, `kEventsDataServiceEndpoint`, `kDataSources`, `kLatestLaunchedVersionKey`, `kCellIdentifier`, `kNewsDataEndpoint`.
- **ViewModel suffix**: SwiftUI-facing state/business-logic types are suffixed `ViewModel` — `HomeViewModel`, `SafetyViewModel`, `ResourcesViewModel`, `EventsViewModel`, `WeatherDataViewModel`, `NewsDataViewModel`, `DiningHallsViewModel`, `FeedbackFormViewModel`, `DebugViewModel`, `SearchViewModel`, `MapMarkersDropdownViewModel`, `MapUserLocationButtonViewModel`, `GymOccupancyViewModel`, `HomeDrawerPinViewModel`, `GuidesViewModel`, `CalendarViewModel`, all registered as `Factory<T>` properties on `Container` (`berkeley-mobile/BerkeleyMobile+Injection.swift`).
- **File organization mirrors type names**: one primary type per file, file name matches the type (e.g. `MapDataSource.swift` declares `class MapDataSource`).
- **Extension-in-separate-file pattern** for cross-cutting behavior on a single type, e.g. `AppDelegate.swift` (core delegate + `UNUserNotificationCenterDelegate`/`MessagingDelegate` extensions) vs. `AppDelegate+Migration.swift` (a `+Suffix` file adding an isolated concern — versioned migrations — via `extension AppDelegate`). The same `Type+Concern.swift` pattern is used broadly for Foundation/UIKit extensions in `Utils/` (e.g. `Date+Extension.swift`, `String+Extension.swift`, `UIView+Extensions.swift`, `CLLocation+Extension.swift`, `UserDefaults+Extension.swift`) and for DI registration (`BerkeleyMobile+Injection.swift`).
- **`// MARK: -` section comments**: consistently used to delineate logical sections within a file (e.g. `// MARK: - Analytics`, `// MARK: - Migrations`, `// MARK: - Safety`, `// MARK: - Sample Data`), including within `extension` blocks.

## File Organization

- Feature-first folder structure under `berkeley-mobile/` (see `docs/structure.md`): each tab/feature (`Home/`, `Today/`, `Safety/`, `Resources/`, `Events/`, `FeedbackForm/`, `Debug/`) owns its View, ViewModel, and (where applicable) DataSource/model files together, often in a nested subfolder (e.g. `Home/Map/MapDataSource/`, `Today/Tiles/Weather Tile/`).
- Cross-cutting concerns are factored out into dedicated top-level folders: `Data/` (persistence/networking/domain protocols), `Common/` (shared UI components), `Utils/` (Swift/Foundation/UIKit extensions), `Assets/` (fonts/colors as Swift code, distinct from the `.xcassets` catalog), `Drawer/` (reusable bottom-sheet infrastructure).
- Some feature folders use spaces in their names (e.g. `Home/Home Drawer/`, `Today/Tiles/Weather Tile/`, `Today/Tiles/News Tile/`) rather than concatenated or hyphenated names.

## Coding Patterns

### Singletons

Widely used for app-wide managers, exposed as `static let shared = Type()` with a `private init()`:
`DataManager.shared`, `BMNetworkingManager.shared`, `BMLocationManager.shared`, `WeatherService.shared` (Apple's own).

### Dependency Injection via FactoryKit

ViewModels are registered as `Factory<T>` computed properties on `Container` (`BerkeleyMobile+Injection.swift`) with explicit lifetime scoping — `.singleton` (app-lifetime, e.g. `diningHallsViewModel`, `homeViewModel`, `gymOccupancyViewModel`, `guidesViewModel`), `.shared` (weakly-shared while referenced, e.g. `eventsViewModel`, `resourcesViewModel`, `safetyViewModel`, `searchViewModel`, `newsDataViewModel`, `weatherDataViewModel`, `homeDrawerPinViewModel`, `mapMarkersDropdownViewModel`, `mapUserLocationButtonViewModel`, `menuItemIconCacheManager`), or unscoped/graph-lifetime by default (e.g. `feedbackFormPresenter`, `feedbackFormViewModel`, `debugViewModel`). Consumers use the `@Injected(\.keyPath)` (UIKit types, e.g. `TabBarController`, `MainContainerViewController`, `MapViewController`) or `@InjectedObservable(\.keyPath)` (SwiftUI views, e.g. `NewsTileView`, `EventsContextMenuModifier`) property wrappers rather than constructing dependencies directly.

### Two coexisting concurrency styles

1. **Completion-handler + `DispatchGroup`** (older code, primarily in `Data/DataSource.swift`-conforming types and `DataManager`): `static func fetchItems(_ completion: @escaping ...)`, manual `DispatchGroup().enter()/.leave()`/`.notify(queue:)` to coordinate and deduplicate concurrent work.
2. **Swift Concurrency (`async`/`await`, `@MainActor`, `@Observable`, `Task`, `TaskGroup`)** (newer code, e.g. `BMNetworkingManager`, `BMEventManager`, `WeatherDataViewModel`, `NewsDataViewModel`, `EventsViewModel`, `SafetyViewModel`'s Firestore listener). `@concurrent` (Swift's structured-concurrency executor attribute) is used in `NewsDataViewModel.fetchNewsArticles()`.

New Firestore-backed features generally follow the newer `BMNetworkingManager`-style async/await + `Codable` pattern rather than extending the older `DataSource` protocol (evidenced by file `Created by` dates: `BMNetworkingManager.swift`, `BMError.swift`, `HomeViewModel.swift` are dated 2025, versus `DataSource.swift`, `MapDataSource.swift`, `GymDataSource.swift` dated 2019–2020).

### Protocol-oriented model composition

Domain models compose small capability protocols (`HasLocation`, `HasOpenTimes`, `HasImage`, `HasName`, `SearchItem`, etc.) rather than inheriting from a shared base class, with **default implementations supplied via protocol extensions** (e.g. `extension HasLocation { var distanceToUser: Double? { ... } }`, `extension SearchItem where Self: HasLocation { ... }`).

### Error modeling

Domain errors are modeled as `Error`-conforming enums (`BMError`) with `LocalizedError` conformance supplying user-facing `errorDescription` strings, rather than passing raw `NSError`/generic errors up to the UI.

### SwiftUI state/alert conventions

- `@Published`/`ObservableObject` is used for older SwiftUI ViewModels (`SafetyViewModel`, `HomeViewModel`), while `@Observable`/`@ObservationIgnored` (the newer Observation framework) is used for more recently authored ones (`SearchViewModel`, `WeatherDataViewModel`, `NewsDataViewModel`, `EventsViewModel`).
- User-facing errors/confirmations flow through a single `BMAlert?` published/observed property bound to the view via `.presentAlert(alert:)` (`View+Extension.swift`), rather than ad hoc `Bool` "isShowingAlert" flags per error case.
- `withoutAnimation { ... }` wraps state mutations that should not animate (seen in `SafetyViewModel.listenForSafetyLogs()`).

### UIKit + SwiftUI interop

UIKit view controllers embed SwiftUI views via `UIHostingController(rootView:)` as child view controllers/tab items (`TabBarController`, `MainContainerViewController`), rather than SwiftUI hosting the whole app via `App`/`Scene` — the app's lifecycle remains UIKit-driven (`AppDelegate`/`SceneDelegate`).

## Architectural Patterns

- **MVVM-leaning, feature-folder architecture**: each feature pairs a `View` (SwiftUI) or `ViewController` (UIKit) with a `ViewModel` that owns state and Firestore/service access, with shared data access centralized in `Data/`.
- **Delegate protocols with default implementations via `extension ... where Self: ...`**: e.g. `MainDrawerViewDelegate` and `DetailView`/`DetailViewDelegate` supply most of their behavior through protocol extensions constrained to a conforming base type, keeping conforming types (`MainContainerViewController`, `LocationDetailView`) thin.
- **Version-gated migrations**: `AppDelegate+Migration.swift` implements an extensible migration list pattern (`if last < Version(version: "X.Y.Z") { ... }`) explicitly documented as "should not be trimmed of old migrations," for one-time state cleanup across app updates.
- **Typed `UserDefaults` access**: raw `UserDefaults` string keys are avoided in favor of a `UserDefaultsKeys: String` enum and generic typed accessors (`set<T>(_:forKey:)`, `integer(forKey:)`, `increment(forKey:)`) defined in `Utils/UserDefaults+Extension.swift`.

## Recurring Implementation Approaches

- Parsing raw Firestore `[String: Any]` dictionaries into typed structs via private `static func parse<Type>(_ dict:...) -> Type` helpers colocated in the same file as the corresponding `DataSource`.
- Defensive optional-binding (`guard let`, `as?`) when reading dictionary values from Firestore, defaulting to sensible fallbacks (e.g. `dict["name"] as? String ?? "Unnamed"`).
- Logging via bracketed source tags in `print` statements for older code (`print("[Error @ MapDataSource.fetchItems()]: \(err)")`), transitioning to structured `os.Logger` categories (`Logger.weatherDataViewModel.error(...)`) for newer code — see `berkeley-mobile/Utils/Logger+Ext.swift`.
