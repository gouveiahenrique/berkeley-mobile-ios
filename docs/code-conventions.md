# Code Conventions

## Naming Conventions

### Types

- Swift types use `UpperCamelCase`.
- App-specific types are prefixed with `BM` (e.g., `BMColor`, `BMFont`, `BMLibrary`, `BMGym`, `BMSafetyLog`, `BMEventManager`, `BMNetworkingManager`, `BMConstants`, `BMError`, `BMAlert`).
- View models follow the `<Feature>ViewModel` pattern (e.g., `HomeViewModel`, `SafetyViewModel`, `DiningHallsViewModel`, `EventsViewModel`).
- Data sources follow the `<Entity>DataSource` pattern (e.g., `GymDataSource`, `LibraryDataSource`, `MapDataSource`).
- Views follow the `<Feature>View` pattern (e.g., `HomeView`, `SafetyView`, `TodayView`, `ResourcesView`).

### Constants

- File-private Firestore endpoint strings use the `k` prefix with camelCase (e.g., `kGymsEndpoint`, `kLibrariesEndpoint`, `kMapEndpoint`, `kEventsDataServiceEndpoint`).
- Struct-scoped constants use a nested `Constants` struct (e.g., `MapViewController.Constants`, `GymOccupancyViewModel.Constants`).

### Enums

- `UserDefaultsKeys` enums use camelCase raw string values matching the key name.
- Filter state enums use `UpperCamelCase` cases with string raw values (e.g., `BMSafetyLogFilterState`).

### Properties and Methods

- Instance methods and properties use `lowerCamelCase`.
- Private methods that handle UI gesture events follow the pattern `handle<EventName>` (e.g., `handlePanGesture`).

## File Organization

- Each Swift file contains a primary type and its extensions.
- `MARK:` comments are used to section files by protocol conformance, lifecycle, and nested types (e.g., `// MARK: - UICollectionViewDelegate`, `// MARK: - FeedbackFormPresenterDelegate`).
- Related color extensions for `BMColor` are split into separate files by domain: `Colors.swift`, `Colors+Calendar.swift`, `Colors+MapMarker.swift`, `Colors+AlertView.swift`, `Colors+Resource.swift`, `Colors+ActionButton.swift`.

## Architectural Patterns

### Dual UIKit / SwiftUI

The application uses both UIKit and SwiftUI. Newer screens are implemented in SwiftUI; the map screen and the drawer system retain UIKit implementations. SwiftUI views are embedded in UIKit via `UIHostingController`.

### UIKit-to-SwiftUI Bridging

The `HomeMapView` struct conforms to `UIViewControllerRepresentable` to wrap `MapViewController` for use inside SwiftUI (`MapViewController.swift:17-31`).

### ViewModel Pattern

View models are classes conforming to `ObservableObject` (UIKit-compatible) or decorated with `@Observable` (Swift Observation, used in newer files). View models are resolved from the `FactoryKit` container via `@Injected`, `@InjectedObject`, or `@InjectedObservable` property wrappers.

### Singleton Pattern

The following types implement the singleton pattern with a `static let shared` property:
- `DataManager.shared`
- `BMLocationManager.shared`
- `BMNetworkingManager.shared`
- `EventsDataService.shared`

### DataSource Protocol

The `DataSource` protocol (`DataSource.swift`) defines a uniform interface for Firestore collection fetching. Conforming types provide `fetchItems(_:)` and a `fetchDispatch: DispatchGroup` for deduplication.

### Drawer System

The legacy drawer pattern uses three protocols: `DrawerViewDelegate`, `MainDrawerViewDelegate`, and `SearchDrawerViewDelegate`. These protocols have default implementations in protocol extensions for UIViewController conformers, handling stacked drawer state (hidden, collapsed, middle, full).

### Dependency Injection

`FactoryKit` is used throughout. The `Container` extension in `BerkeleyMobile+Injection.swift` is the single registration site. Views and view controllers access dependencies via `@Injected`, `@InjectedObject`, and `@InjectedObservable` wrappers.

### Notification-Based Communication

`BMLocationManager` broadcasts location updates using `NotificationCenter` with the `.locationUpdated` notification name rather than protocol delegation, allowing multiple observers.

## SwiftUI Conventions

- Views use computed properties for sub-view composition (named with `var <name>View: some View`).
- Custom `ViewModifier` types are defined for reusable styles (e.g., `Shadowfy`, `PositionAtTopModifier`, `EventsContextMenuModifier`, `AlertPresentationViewModifier`).
- A `modify` extension on `View` is used for conditional or branched view transformations (`View+Extension.swift:227`).
- `#Preview` macros are present in view files.

## Concurrency

- Older data sources use completion-handler-based callbacks with `DispatchQueue.main.async` for main-thread delivery.
- Newer view models use Swift concurrency (`async`/`await`) with `@MainActor` isolation.
- `AtomicDictionary` wraps a dictionary with a dispatch queue for thread-safe access from multiple queues.
- `Task.detached` is used in `WeatherDataViewModel` for background weather fetches.

## Error Handling

- Data source fetch errors are printed to the console with a tagged prefix (e.g., `[Error @ GymDataSource.fetchGyms()]: \(err)`).
- Newer view models use `os.Logger` with `Logger.<category>.error(...)` for structured error logging.
- Firestore decoding failures use `try?` (silent failure) or explicit `do/catch` with logger output, depending on the call site.

## Assets and Resources

- All asset catalog entries are in `berkeley-mobile/Assets.xcassets/`.
- Design system colors are in `berkeley-mobile/Assets/Colors/`.
- Custom fonts (Apercu family) are stored in `berkeley-mobile/Assets/Fonts/` and registered in `Info.plist` under `UIAppFonts`.
