# Code Conventions

## Naming Conventions

### Types

- Classes, structs, enums, and protocols use `UpperCamelCase`.
- App-specific types are prefixed with `BM` (e.g., `BMGym`, `BMLibrary`, `BMAlert`, `BMColor`, `BMFont`, `BMLocationManager`, `BMNetworkingManager`, `BMConstants`).
- UI component types may carry the suffix `View`, `ViewController`, `Cell`, or `Button` (e.g., `FilterView`, `DrawerViewController`, `FilterViewCell`, `BMActionButton`).
- View model types carry the suffix `ViewModel` (e.g., `HomeViewModel`, `EventsViewModel`, `SafetyViewModel`).
- Data source types carry the suffix `DataSource` (e.g., `MapDataSource`, `LibraryDataSource`, `GymDataSource`).
- Protocol names describing capabilities use `Has` prefix (e.g., `HasLocation`, `HasOpenTimes`, `HasImage`, `HasPhoneNumber`, `HasWebsite`) or describe roles directly (e.g., `SearchItem`, `CanFavorite`, `DrawerViewDelegate`).

### Methods and Properties

- Methods and properties use `lowerCamelCase`.
- Firestore collection name constants in data sources are `fileprivate let` with a `k` prefix (e.g., `kLibrariesEndpoint`, `kMapEndpoint`, `kGymsEndpoint`, `kGymClassesEndpoint`, `kEventsDataServiceEndpoint`).
- `UserDefaults` keys are defined as `enum UserDefaultsKeys: String` cases in `camelCase` matching their string values.
- Private static constants within type scopes may be nested in a `Constants` struct (e.g., `TodayWeatherTileView.Constants`, `GymOccupancyEntry.defaultRSFOccupancyPercentages`).

### Files

- Each Swift file contains a single primary type. The file name matches the type name.
- Extensions to standard library or UIKit types are named `TypeName+Extension.swift` (e.g., `Date+Extension.swift`, `UserDefaults+Extension.swift`, `UIImage+Extensions.swift`, `UIScrollView+GestureRecognizer.swift`).
- Extensions grouped by feature domain on `AppDelegate` use `AppDelegate+Topic.swift` (e.g., `AppDelegate+Migration.swift`).
- `BerkeleyMobile+Injection.swift` groups all FactoryKit container registrations.

## Architectural Patterns

### Mixed UIKit + SwiftUI

The codebase uses both UIKit and SwiftUI. SwiftUI views are embedded in UIKit hierarchies via `UIHostingController`. The `TabBarController` wraps each tab's SwiftUI root view in a `UIHostingController`. `MainContainerViewController` wraps `HomeView` similarly.

### Observable View Models

SwiftUI view models use `@Observable` (Swift Observation framework) and are annotated `@MainActor` (e.g., `EventsViewModel`, `WeatherDataViewModel`, `NewsDataViewModel`). They are injected via FactoryKit's `@InjectedObservable` property wrapper.

UIKit-facing view models may not use `@Observable`.

### Singleton Pattern

Shared services are implemented as singletons using `static let shared`:
- `DataManager.shared`
- `BMNetworkingManager.shared`
- `BMLocationManager.shared`
- `ImageLoader.shared` (`static var`)
- `EventsDataService.shared` (`static var`)

### DataSource Protocol

Data pre-loading follows a static-method protocol pattern:

```swift
protocol DataSource {
    static func fetchItems(_ completion: @escaping completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

Concrete implementations (`MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`) provide a static `fetchDispatch` and a static `fetchItems` method.

### Property Wrapper: `@Display`

String fields intended for display use the `@Display` property wrapper (`berkeley-mobile/Data/PropertyWrappers/Display.swift`). It trims whitespace and removes the replacement character (`\u{FFFD}`) on assignment. Applied consistently to user-facing string properties in model types (e.g., `MapMarker.title`, `BMEventCalendarEntry.name`).

### KnownType Enum Wrapper

`KnownType<T>` (`berkeley-mobile/Home/Map/MapDataSource/MapMarker.swift`) wraps an `RawRepresentable` enum to allow both `.known(type: T)` and `.unknown(raw: RawValue)` cases. Used by `MapMarker.type` to tolerate unknown marker types from Firestore without crashing.

### MARK Comments

Files use `// MARK: -` section delimiters for logical groupings (e.g., `// MARK: - UNUserNotificationCenterDelegate`, `// MARK: - BMLocation Manager`, `// MARK: - MapMarker`).

## File Organization

- The main app sources live under `berkeley-mobile/` organized by feature (e.g., `Home/`, `Today/`, `Events/`, `Safety/`, `Resources/`).
- Shared infrastructure lives under `Data/`, `Common/`, `Utils/`, `Drawer/`, `Assets/`.
- Feature directories may contain a `*DataSource/` subdirectory containing the Firestore data source and model files for that feature.
- Debug-only views are gated with `#if DEBUG` (e.g., `DebugView.swift`, `DebugViewModel`).

## Concurrency Model

- Newer async code (primarily view models introduced in 2025–2026) uses Swift `async/await` and `@MainActor`.
- Older data loading code (`DataManager`, legacy `DataSource` implementations) uses `DispatchGroup` and GCD (`DispatchQueue.main.async`).
- `AtomicDictionary` (`berkeley-mobile/Utils/AtomicDictionary.swift`) provides thread-safe dictionary access for `DataManager`'s internal cache.

## Error Handling

- `DataSource.fetchItems` implementations print errors to the console on Firestore failure (e.g., `print("[Error @ MapDataSource.fetchItems()]: \(err)")`).
- `async/await` code in view models uses `try/catch` with `os.Logger` logging (e.g., `Logger.eventsDataService.error(...)`).
- User-facing error surfaces use `BMAlert` presented through view model `alert` properties.
- `BMError` is a custom `Error` type used for domain-specific error cases (e.g., `.mayExistedInCalendarAlready`).

## SwiftUI Preview Support

SwiftUI views include `#Preview` blocks at the bottom of their files for Xcode previews (e.g., `TodayView`, `NewsTileView`, `DebugView`).
