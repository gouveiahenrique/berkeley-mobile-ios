# Code Conventions

## Naming Conventions

### Types

- **App-specific types** are prefixed with `BM` (e.g., `BMDiningHall`, `BMGym`, `BMLibrary`, `BMSafetyLog`, `BMFont`, `BMColor`, `BMAlert`, `BMError`, `BMLocationManager`, `BMNetworkingManager`).
- **Protocol names** describe capability and are not prefixed (e.g., `DataSource`, `HasImage`, `HasOpenClosedStatus`, `CanFavorite`, `SearchItem`, `MainDrawerViewDelegate`).
- **View models** are named `<Feature>ViewModel` (e.g., `SafetyViewModel`, `EventsViewModel`, `DiningHallsViewModel`, `HomeViewModel`).
- **Data source classes** are named `<Feature>DataSource` (e.g., `MapDataSource`, `LibraryDataSource`, `GymDataSource`).
- **SwiftUI views** are named `<Feature>View` or `<Feature><Component>View` (e.g., `SafetyView`, `DiningDetailView`, `GymOccupancyWidgetRowView`).

### Constants

- **File-private Firestore endpoint strings** use a `k` prefix and `Endpoint` suffix (e.g., `kMapEndpoint`, `kLibrariesEndpoint`, `kGymsEndpoint`, `kDiningHallEndpoint`).
- **App-wide constants** are collected in `BMConstants` as static properties.
- **UserDefaults keys** are typed using the `UserDefaultsKeys` enum with `String` raw values.

### Private Constant Structs

Several classes and structs define a private nested `Constants` struct for magic values (e.g., `OpenClosedStatusManager.Constants`, `MapViewController.Constants`, `FeedbackFormPresenter`).

## File Organization

- **MARK comments** are used consistently to separate logical sections within files (e.g., `// MARK: - FeatureName`, `// MARK: UISceneSession Lifecycle`, `// MARK: CLLocationManagerDelegate`).
- **Protocol conformances** are placed in separate `extension` blocks after the primary type declaration, each introduced by a `// MARK: - ProtocolName` comment.
- Files with mixed UIKit/SwiftUI are common on the Home tab; UIKit view controllers are wrapped in `UIViewControllerRepresentable` for embedding in SwiftUI hosts.

## Architectural Patterns

### Singleton

Used for shared stateful services:
- `DataManager.shared` — data cache
- `BMLocationManager.shared` — location
- `BMNetworkingManager.shared` — Firestore networking
- `EventsDataService.shared` — events data

### Dependency Injection (FactoryKit)

ViewModels are registered in `BerkeleyMobile+Injection.swift` as `Factory` instances on `Container`:
- `.shared` scope — shared across a session but not a true singleton
- `.singleton` scope — single instance for app lifetime

Views access injected dependencies via `@Injected`, `@InjectedObject`, or `@InjectedObservable` property wrappers.

### Delegate Pattern

Used extensively for UIKit inter-component communication:
- `DrawerViewDelegate` / `MainDrawerViewDelegate` — drawer panel state management
- `OpenClosedStatusManagerDelegate` — timer-based open/closed status callbacks
- `FeedbackFormPresenterDelegate` — presents feedback form view controller
- `CLLocationManagerDelegate` — location events in `BMLocationManager`

### Protocol-Oriented Data Modeling

Data models conform to capability protocols rather than inheriting from base classes:
- `HasOpenClosedStatus` — items with scheduled hours
- `HasImage` — items with an image URL
- `CanFavorite` — items that can be favorited
- `HasLocation`, `HasName`, `HasPhoneNumber`, `HasWebsite`, `SearchItem`

### `@Observable` and `@Published`

Newer ViewModels use the Swift Observation framework (`@Observable`, `@MainActor`). Older ViewModels (e.g., `SafetyViewModel`, `CalendarViewModel`) use `ObservableObject` with `@Published` properties.

### Dual UIKit / SwiftUI

The codebase mixes both UI frameworks:
- UIKit screens use programmatic Auto Layout (`translatesAutoresizingMaskIntoConstraints = false`, `NSLayoutConstraint.activate`)
- SwiftUI screens are embedded in UIKit using `UIHostingController`
- UIKit view controllers are exposed to SwiftUI via `UIViewControllerRepresentable` (e.g., `HomeMapView` wrapping `MapViewController`)

## Concurrency

- The `DataSource` callback pattern uses `DispatchGroup` and `DispatchQueue.main.async` for main-thread delivery.
- Newer ViewModels use Swift's `async/await` with `Task { @MainActor in ... }` for UI updates.
- `AtomicDictionary` (`berkeley-mobile/Utils/AtomicDictionary.swift`) wraps `Dictionary` with a `pthread_rwlock_t` read-write lock for thread-safe access in `DataManager`.

## Property Wrappers

| Wrapper | Purpose |
|---------|---------|
| `@Display` | Trims whitespace and removes invalid replacement characters from display strings |
| `@Injected` | FactoryKit — injects a value-type dependency |
| `@InjectedObject` | FactoryKit — injects an `ObservableObject` dependency |
| `@InjectedObservable` | FactoryKit — injects an `@Observable` dependency |

## UI Design Tokens

- **Colors**: All app colors go through `BMColor` static properties (`berkeley-mobile/Assets/Colors/`). Adaptive dark-mode colors are constructed with `UIColor.init { trait in ... }`.
- **Typography**: All fonts go through `BMFont` closures (`berkeley-mobile/Assets/Fonts.swift`) which provide the Apercu font family with system font fallback.

## Error Handling

- Callback-based data sources log errors with `print(...)` on fetch failure and call the completion handler without data.
- Async ViewModels use `try?` (silent discard) or `do/catch` with `Logger` (`os.Logger`) for errors.
- User-facing errors are surfaced via `BMAlert` and the `presentAlert(alert:)` SwiftUI view modifier.

## Reachability and Refresh Policy

- `DataManager.fetchIfNecessary()` skips a re-fetch if the last fetch was within 60 minutes.
- `SceneDelegate.sceneWillEnterForeground` calls `fetchIfNecessary()` to refresh data on app resume.
