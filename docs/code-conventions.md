# Code Conventions

## Naming Conventions

### Types
- Classes, structs, enums, and protocols use `UpperCamelCase`. Example: `DataManager`, `BMLocationManager`, `HomeViewModel`, `DrawerViewDelegate`.
- App-specific types are often prefixed with `BM` (Berkeley Mobile). Example: `BMFont`, `BMColor`, `BMLibrary`, `BMGym`, `BMDiningHall`, `BMNetworkingManager`, `BMLocationManager`, `BMEventManager`.
- View models follow the `<Feature>ViewModel` naming pattern. Example: `HomeViewModel`, `SafetyViewModel`, `ResourcesViewModel`, `EventsViewModel`, `GymOccupancyViewModel`.
- Data source classes follow the `<Feature>DataSource` naming pattern. Example: `MapDataSource`, `LibraryDataSource`, `GymDataSource`.

### Constants
- File-private Firestore endpoint constants use a `k` prefix in camelCase. Example: `kMapEndpoint`, `kLibrariesEndpoint`, `kGymsEndpoint`, `kGymClassesEndpoint`.
- Struct-level constants use `static let` with a `k` prefix. Example: `TagView.kPadding`, `TagView.kFont`.
- Shared app-level constants are in `BMConstants`.

### Properties and Methods
- Instance properties and methods use `lowerCamelCase`. Example: `fetchAll()`, `requestLocation()`, `handleLocationAuthorization()`.
- Singleton instances are exposed as `static let shared`. Example: `DataManager.shared`, `BMLocationManager.shared`, `ImageLoader.shared`.

### Protocols
- Protocols describing capabilities use adjective-noun form or the pattern `Has<Capability>`. Example: `HasName`, `HasImage`, `HasLocation`, `HasHours`, `SearchItem`, `DrawerViewDelegate`, `MainDrawerViewDelegate`.

### Files
- Files are named after their primary type. One type per file is the observed pattern. Example: `DataManager.swift`, `BMLocationManager.swift`.
- Extensions in separate files use `<Type>+<Topic>.swift`. Example: `AppDelegate+Migration.swift`, `UIView+Extensions.swift`, `UIImage+Extensions.swift`, `Date+Extension.swift`, `UserDefaults+Extension.swift`.
- Color extensions use `Colors+<Component>.swift`. Example: `Colors+ActionButton.swift`.

## File Organization

### MARK Comments
`// MARK: -` and `// MARK:` sections are used to organize code within files. Common section markers observed:
- `// MARK: - <Section Name>` for major sections (protocol conformances, initialization, private methods)
- `// MARK: UISceneSession Lifecycle`
- `// MARK: - UNUserNotificationCenterDelegate`
- `// MARK: - MessagingDelegate`
- `// MARK: CLLocationManagerDelegate`

### Extensions for Protocol Conformance
Protocol conformance is commonly placed in `extension` blocks below the primary type declaration. This is consistently used for delegate conformances.

## Architecture Patterns

### Singleton
Core shared services use the singleton pattern with `static let shared`. Examples: `DataManager.shared`, `BMLocationManager.shared`, `ImageLoader.shared`, `BMNetworkingManager.shared`, `EventsDataService.shared`.

### DataSource Protocol
Feature-specific Firestore fetching is encapsulated in classes conforming to an implicit `DataSource` protocol. Each provides:
- `static var fetchDispatch: DispatchGroup` — prevents duplicate concurrent fetches
- `static func fetchItems(_ completion: @escaping DataSource.completionHandler)` — fetches and parses documents
- Private `parse*` static methods for document dictionary mapping

### ObservableObject / @Observable View Models
SwiftUI view models conform to `ObservableObject` (older pattern with `@Published`) or use the Swift `@Observable` macro (newer pattern, e.g., `EventsViewModel`). They are injected via FactoryKit.

### FactoryKit Dependency Injection
All view models are registered in `Container` (`BerkeleyMobile+Injection.swift`) and resolved at call sites via:
- `@Injected(\.key)` — for value types or non-observable objects
- `@InjectedObservable(\.key)` — for `ObservableObject` in SwiftUI (observed via `@StateObject`)
- `@InjectedObject(\.key)` — for `ObservableObject` as `@ObservedObject`

### UIKit / SwiftUI Interop
- SwiftUI views are embedded in UIKit via `UIHostingController`.
- UIKit view controllers are embedded in SwiftUI via `UIViewControllerRepresentable`. Example: `HomeMapView` wraps `MapViewController`.

### Property Wrappers
- `@Display` — sanitizes strings for display (trims whitespace, removes invalid characters). Defined in `berkeley-mobile/Data/PropertyWrappers/Display.swift`.

## Concurrency

### Legacy Pattern (DataManager / DataSource)
`DispatchGroup` is used to coordinate concurrent Firestore fetches. Results are delivered on the main queue via `DispatchQueue.main.async`.

### Modern Pattern (BMNetworkingManager / EventsViewModel)
Swift structured concurrency (`async/await`, `Task`, `withTaskGroup`) is used in newer code. View model initialization typically uses `Task { ... }` to start async work.

### Thread Safety
`AtomicDictionary` uses `pthread_rwlock_t` to protect the shared data cache in `DataManager`. This is the only observed explicit thread-safety mechanism in the inspected source.

## Error Handling

- `DataSource` implementations print errors to console via `print("[Error @ <ClassName>.<method>()]: \(err)")` and return without calling the completion handler, or return an empty result.
- `BMNetworkingManager` uses `async throws`; callers are responsible for error handling.
- `BMEventManager` defines domain errors via `BMError` enum and throws them from async methods.
- User-facing error presentation uses `BMAlert` passed to a view via `@Published var alert: BMAlert?` and displayed with a `.presentAlert(alert:)` view modifier.

## Code Comments

- Doc comments on public APIs and protocols use triple-slash `///` format.
- Inline comments explaining non-obvious behavior use `//`.
- `// TODO:` is present in several locations for deferred work.
- `// MARK:` is used consistently for file organization.
- Block comments `/** ... */` appear in some older files (pre-2024 code).
