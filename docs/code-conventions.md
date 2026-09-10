# Code Conventions

All statements below are LEVEL 1 (directly observed) unless marked otherwise, drawn from files inspected via CodeGraph across `berkeley-mobile/` and `BerkeleyMobileWidget/`.

## Naming Conventions

- **`BM` prefix** on app-specific types that could otherwise collide with system or third-party types: `BMColor`, `BMConstants`, `BMLocationManager`, `BMNetworkingManager`, `BMAlert`, `BMSafetyLog`, `BMEventCalendarEntry`, `BMSegmentedControlView`, `BMFont`, `BMGym`, `BMLibrary`, `BMMPDRoomInfo`.
- **`k`-prefixed `fileprivate`/private constants** for fixed string literals used as Firestore collection names or identifiers: `kGymsEndpoint`, `kGymClassesEndpoint`, `kLibrariesEndpoint`, `kMapEndpoint`, `kAnnotationIdentifier`, `kLatestLaunchedVersionKey`, `kDataSources`.
- **Nested `Constants` (or `ArgumentNames`) structs** scoping magic numbers/strings to the type that uses them, e.g. `MapViewController.Constants`, `BMSegmentedControlView.Constants`, `BMEventCalendarEntry.ArgumentNames`.
- **`shared` static property** for singleton access, consistently named `shared` rather than `sharedInstance` or similar: `DataManager.shared`, `BMLocationManager.shared`, `BMNetworkingManager.shared`, `ImageLoader.shared`.
- View model types are suffixed `ViewModel` (e.g. `SafetyViewModel`, `HomeViewModel`, `EventsViewModel`, `GymOccupancyViewModel`); SwiftUI screen types are suffixed `View` (e.g. `TodayView`, `SafetyView`, `ResourcesView`, `HomeView`); data-fetching types are suffixed `DataSource` (e.g. `GymDataSource`, `LibraryDataSource`, `MapDataSource`, `GymClassDataSource`, `EventDataSource`).

## File Organization

- One primary type per file, with the filename matching the type name (e.g. `DataManager.swift` → `DataManager`, `AtomicDictionary.swift` → `AtomicDictionary`).
- Every inspected source file opens with a standard header comment block: filename, project name, author, and copyright line (e.g. `berkeley-mobile/AppDelegate.swift:1-7`).
- `// MARK: -` comments are used pervasively to delineate sections within a file (protocol conformances, logical groups of methods), e.g. `AppDelegate.swift` (`// MARK: UISceneSession Lifecycle`, `// MARK: - UNUserNotificationCenterDelegate`, `// MARK: - MessagingDelegate`).
- Protocol conformances are frequently split into separate `extension Type: Protocol { ... }` blocks rather than declared inline on the primary type declaration, e.g. `AppDelegate: UNUserNotificationCenterDelegate`, `AppDelegate: MessagingDelegate`, `BMLocationManager: CLLocationManagerDelegate` (`berkeley-mobile/Data/BMLocationManager.swift`).
- Feature folders group a screen's view, view model, and data source together (e.g. `Home/Fitness/GymDataSource/`, `Home/Map/MapDataSource/`, `Events/EventDataSource/`) rather than grouping by architectural layer across the whole app.

## Architectural Patterns

- **Protocol-oriented data fetching**: the `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift`) defines a static `fetchItems(_:)` contract implemented by each concrete data source type, orchestrated centrally by the `DataManager` singleton for the sources it tracks.
- **MVVM for SwiftUI screens**: `ObservableObject` view models expose `@Published` state consumed by SwiftUI views, e.g. `SafetyViewModel` (`berkeley-mobile/Safety/SafetyViewModel.swift`) backing `SafetyView`.
- **UIKit/SwiftUI interop via `UIHostingController`**: SwiftUI views are embedded into the UIKit tab-bar/container hierarchy (`TabBarController.swift`, `MainContainerViewController.swift`), and conversely a UIKit `MapViewController` is embedded inside the SwiftUI `HomeView`.
- **Dependency injection via `Factory`/`FactoryKit`**: shared dependencies are resolved with the `@Injected(\.keyPath)` property wrapper rather than direct singleton access in newer code (e.g. `@Injected(\.feedbackFormPresenter)`, `@Injected(\.homeViewModel)`), coexisting with older direct-singleton usage (`DataManager.shared`, `BMLocationManager.shared`).
- **Delegate protocols with default implementations via protocol extensions**: e.g. `MainDrawerViewDelegate` (`berkeley-mobile/Drawer/MainDrawerViewDelegate.swift`) supplies default method bodies (`dismissTop`, `coverTop`, `hideTop`, `showTop`, `moveCurrentDrawer`, `showMainDrawer`) in a `where Self: UIViewController` extension rather than requiring each conformer to reimplement them.
- **Thread-safety wrapper types**: `AtomicDictionary` (`berkeley-mobile/Utils/AtomicDictionary.swift`) wraps a `Dictionary` with a `pthread_rwlock_t` to guard concurrent access from `DataManager`.
- **Typed `UserDefaults` keys**: a `UserDefaultsKeys` enum plus generic extension methods (`set<T>(_:forKey:)`, `integer(forKey:)`, `data(forKey:)`, `increment(forKey:)`) is used instead of raw string keys (`berkeley-mobile/Utils/UserDefaults+Extension.swift`).
- **Version-gated migrations**: `AppDelegate+Migration.swift` defines a `Version` struct (`Comparable`) and a `checkForUpdate()` method that runs migrations keyed to specific past version numbers (e.g. `if last < Version(version: "10.0.1")`), with an explicit code comment: "This function should not be trimmed of old migrations."

## Error Handling

- Firestore fetch errors in `DataSource` implementations are logged to the console with a `[Error @ Type.method()]:` prefix and, in most cases, silently drop the request (completion handler not called), e.g. `GymDataSource.fetchItems`, `MapDataSource.fetchItems`.
- Newer `async`/`await` code (`BMNetworkingManager`, `SafetyViewModel.listenForSafetyLogs`) uses Swift's `throws`/`try await` and surfaces failures to the user through a `BMAlert` published property rather than only logging.

## Documentation Comments

- Doc comments (`///`) are used inconsistently: present on some newer/utility types (`BMLocationManager`, `ImageLoader`, `Version`) and absent on many older files (e.g. `DataManager`, `GymDataSource`), which instead use plain `//` comments.

## Not found in codebase

- A committed linter configuration (e.g. `.swiftlint.yml`) enforcing any of the above conventions — the patterns above were derived from observed usage, not a documented style guide.
