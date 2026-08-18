# Code Conventions

No SwiftLint configuration (`.swiftlint.yml`) or other linter configuration was found in the repository, so the conventions below are observed patterns in the source, not enforced rules.

## Naming Conventions

- **`BM` prefix for app-specific domain types.** Examples found: `BMGym`, `BMLibrary`, `BMDiningHall`, `BMSafetyLog`, `BMResourceCategory`, `BMAlert`, `BMError`, `BMEventManager`, `BMEventCalendarEntry`, `BMConstants`, `BMNetworkingManager`, `BMLocationManager`, `BMColor`, `BMFont`, `BMMPDRoomInfo`, `BMCachedAsyncImageView`, `BMDrawerViewState`. Of 174 Swift files in `berkeley-mobile/`, 20 have filenames starting with `BM`. Not every type uses the prefix (e.g. `MapMarker`, `MapDataSource`, `GymClass`, `SearchViewModel` do not), so this is an observed convention for certain shared/cross-cutting types rather than a universal rule.
- **`*ViewModel` suffix** for state-holding types backing a screen or feature, e.g. `HomeViewModel`, `SafetyViewModel`, `EventsViewModel`, `SearchViewModel`, `GuidesViewModel`, `DiningHallsViewModel`, `WeatherDataViewModel`, `NewsDataViewModel`, `GymOccupancyViewModel`, `FeedbackFormViewModel`, `DebugViewModel`, `MapMarkersDropdownViewModel`.
- **`*DataSource` suffix** for types conforming to the `DataSource` protocol and coordinated by `DataManager`: `MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`.
- **`*DataService`/`*NetworkingManager` naming** for Firestore-backed services that are not `DataSource`-conforming: `EventsDataService`, `BMNetworkingManager`.
- **`k`-prefixed constants** for private string literals such as Firestore collection names, e.g. `kGymsEndpoint`, `kLibrariesEndpoint`, `kMapEndpoint`, `kEventsDataServiceEndpoint`, `kNewsDataEndpoint`. 28 `fileprivate`/`private let k...` declarations were found across the codebase, each scoped to the file that uses it rather than centralized (see `docs/api-standards.md`).
- **`Constants` nested type** used in some files to group magic numbers/strings local to that file, e.g. `private struct Constants` inside `MapViewController.swift` (`Constants.kAnnotationIdentifier`, `Constants.kLayoutMarginsInset`).

## File Organization

- One primary type per file, with the filename matching the type name (e.g. `HomeViewModel.swift` defines `HomeViewModel`).
- Feature folders are structured by domain area under `Home/` (`Map`, `Dining`, `Fitness`, `Libraries`, `Guides`, `Search`), each containing its view(s), view model, and — where applicable — its own `*DataSource`/`*DataService` subfolder (e.g. `Home/Map/MapDataSource/`, `Home/Fitness/GymDataSource/`, `Home/Fitness/GymClassDataSource/`). See `docs/structure.md` for the full folder map.
- Framework extensions on system types are grouped under `Utils/` with a `Type+Extension.swift` or `Type+Extensions.swift` naming pattern (e.g. `Date+Extension.swift`, `UIView+Extensions.swift`, `CLLocation+Extension.swift`), and design tokens under `Assets/Colors/` follow the same `Colors+Topic.swift` pattern (`Colors+Resource.swift`, `Colors+Text.swift`, `Colors+Calendar.swift`).
- `// MARK:` comments are used to segment files into logical sections (124 occurrences found across the codebase), e.g. `// MARK: - UNUserNotificationCenterDelegate` in `AppDelegate.swift`, `// MARK: - SafetyViewManager` in `SafetyViewModel.swift`.

## Architectural / State-Management Patterns

Two distinct SwiftUI state-observation patterns coexist in the codebase:

- **`ObservableObject` + `@Published`** (the older pattern) — used by e.g. `HomeViewModel` (`class HomeViewModel: ObservableObject`, `@Published var diningHalls...`) and `SafetyViewModel` (`final class SafetyViewModel: NSObject, ObservableObject`). 5 files use `: ObservableObject`.
- **The `@Observable` macro** (the newer pattern, from the `Observation` framework) — used by e.g. `EventsViewModel` (`@MainActor @Observable class EventsViewModel`) and `SearchViewModel` (`@Observable class SearchViewModel`), with `@ObservationIgnored` marking non-tracked properties (e.g. `SearchViewModel.chooseMapMarker`). 10 files use `@Observable`.

Both patterns are present concurrently; newer files (per header comments, e.g. `EventsViewModel.swift` dated 2025, `WeatherDataViewModel.swift` and `NewsDataViewModel.swift` dated 2026) tend to use `@Observable`, while some older files (e.g. `HomeViewModel.swift`, also dated 2025) still use `ObservableObject`. This is a repository observation, not a documented migration policy — no migration guide or deprecation notice for `ObservableObject` was found in the codebase.

- **Dependency injection via `FactoryKit`.** View models are registered as `Factory<T>` properties on a `Container` extension in the single file `berkeley-mobile/BerkeleyMobile+Injection.swift`, with an explicit scope per registration: `.shared`, `.singleton`, or unscoped (a new instance per resolution). Consuming types obtain instances via the `@Injected(\.propertyName)` (UIKit types, e.g. `MainContainerViewController`, `TabBarController`) or `@InjectedObject(\.propertyName)` (SwiftUI views, e.g. `SafetyMapView`) property wrappers rather than manual initialization.
- **Protocol-based shared behavior via `HasLocation`, `HasImage`, `SearchItem` protocols** (`berkeley-mobile/Data/ItemProtocols/`), each providing a default implementation via a protocol extension (e.g. `HasLocation`'s `distanceToUser` computed property, `HasImage`'s `fetchImage(completion:)`).
- **Delegate protocols** for custom UI systems, e.g. `MainDrawerViewDelegate`/`DrawerViewDelegate` (`berkeley-mobile/Drawer/`) and `FeedbackFormPresenterDelegate` (`berkeley-mobile/FeedbackForm/FeedbackFormPresenter.swift`), following the standard Cocoa delegate pattern (`weak var delegate:`).
- **Singletons via `static let shared`** for cross-cutting managers: `DataManager.shared`, `BMNetworkingManager.shared`, `ImageLoader.shared`, `BMLocationManager.shared`, `EventsDataService.shared`.

## Error Handling

No single repository-wide error-handling convention was found; the following patterns coexist (see also `docs/api-standards.md`):

- A dedicated `BMError` error enum (`berkeley-mobile/Data/BMError.swift`) used by `BMEventManager` (e.g. the `.mayExistedInCalendarAlready` case checked in `EventsViewModel.addAcademicEventToCalendar(_:)`).
- `os.Logger` extension points defined per-subsystem in `berkeley-mobile/Utils/Logger+Ext.swift` (e.g. `Logger.eventsDataService`, `Logger.newsDataViewModel`, `Logger.weatherDataViewModel`), used for `.error`/`.info` logging in newer `async`/`await` Firestore-reading code.
- Plain `print("[Error @ Type.method()]: \(err)")`-style console logging in older `DataSource` implementations (`MapDataSource`, `GymDataSource`, `LibraryDataSource`).
- User-facing alerts modeled by `BMAlert` (constructed and presented via a `presentAlertWithoutAnimation(_:)` helper seen in `EventsViewModel`).
