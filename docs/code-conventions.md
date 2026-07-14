# Code Conventions

## Naming Conventions

### Types and Files

- **Classes, structs, enums, protocols**: `UpperCamelCase` — `DataManager`, `BMNetworkingManager`, `SafetyViewModel`, `DrawerState`.
- **App-specific types** are prefixed with `BM` — `BMGym`, `BMLibrary`, `BMSafetyLog`, `BMDiningHall`, `BMLocationManager`, `BMColor`, `BMFont`, `BMAlert`, `BMError`.
- **Protocol names** use noun or adjective phrases — `DataSource`, `SearchItem`, `CanFavorite`, `HasOpenClosedStatus`, `HasOpenTimes`, `DrawerViewDelegate`.
- **File names** match the primary type they define (e.g., `SafetyViewModel.swift` defines `SafetyViewModel`).
- **Extensions** are placed in files named `TypeName+Purpose.swift` — `AppDelegate+Migration.swift`, `Colors+Calendar.swift`, `UserDefaults+Extension.swift`, `String+Extension.swift`.

### Methods and Properties

- **Methods and properties**: `lowerCamelCase` — `fetchAll()`, `requestLocation()`, `fetchIfNecessary()`.
- **Private file-level constants**: `kCamelCase` prefix — `kDataSources`, `kMapEndpoint`, `kGymsEndpoint`, `kViewMargin`, `kCardPadding`.
- **Static constants** on types use `lowerCamelCase` without prefix — `DataManager.fetchInterval`, `GymOccupancyViewModel.Constants.gymOccupancyCollectionName`.

### Constants Organization

Feature-scoped constants are grouped in a nested `Constants` struct:
```swift
struct Constants {
    static let refreshIntervalSecs: TimeInterval = 15 * 60
    static let gymOccupancyCollectionName = "Gym Occupancy Meters"
}
```

Global app constants live in `BMConstants` (`berkeley-mobile/Data/BMConstants.swift`).

## File Organization

### MARK Comments

Files use `// MARK: -` sections extensively to delineate logical groups within a file:
```swift
// MARK: - UNUserNotificationCenterDelegate
// MARK: - MessagingDelegate
// MARK: CLLocationManagerDelegate
// MARK: - Private Methods
```

### Extensions for Protocol Conformance

Protocol conformances are separated into `extension` blocks within the same file, labeled with MARK comments. This is consistent across both UIKit (`AppDelegate`) and SwiftUI (`SafetyViewModel`) files.

## Architectural Patterns

### Singleton

Core infrastructure objects use the `static let shared = ClassName()` singleton pattern with a private initializer:
- `DataManager.shared`
- `BMNetworkingManager.shared`
- `BMLocationManager.shared`
- `EventsDataService.shared`

### Protocol-Based Abstraction

Shared behaviors are expressed as protocols in `Data/ItemProtocols/`. Concrete types (e.g., `BMGym`, `BMLibrary`, `BMDiningHall`) conform to multiple protocols (`SearchItem`, `HasOpenTimes`, `HasLocation`, `HasPhoneNumber`). Default implementations are provided via protocol extensions.

### ViewModel Pattern

Each feature screen has a corresponding `*ViewModel` class:
- SwiftUI features use `@Observable` with `@MainActor` (newer pattern: `EventsViewModel`, `NewsDataViewModel`, `WeatherDataViewModel`).
- Older feature screens use `ObservableObject` with `@Published` (e.g., `SafetyViewModel`).
- ViewModels are resolved from the FactoryKit container, not instantiated directly in views.

### Dependency Injection via FactoryKit

All view model dependencies are declared in `BerkeleyMobile+Injection.swift` as `Factory<T>` on `Container`. Property wrappers (`@Injected`, `@InjectedObject`, `@InjectedObservable`) resolve them at the injection site. Container-registered view models use `.singleton` or `.shared` scopes; transient objects use the implicit default scope.

### UIKit–SwiftUI Interoperability

SwiftUI is adopted feature-by-feature. The hybrid approach is:
- `UIHostingController(rootView:)` wraps SwiftUI in UIKit contexts (tab children, modal presentation).
- `UIViewControllerRepresentable` wraps UIKit view controllers for embedding in SwiftUI (`HomeMapView` wraps `MapViewController`).

### Drawer System (UIKit)

The `DrawerViewDelegate` protocol and its extensions in `berkeley-mobile/Drawer/` implement a pan-gesture-driven sliding drawer with predefined states (`hidden`, `collapsed`, `middle`, `full`). `DrawerViewDelegate` provides default implementations of `handlePan`, `computePosition`, and `moveDrawer` via protocol extensions. Concrete view controllers adopt the protocol and supply their own position mappings.

### Thread Safety

- `AtomicDictionary` (`berkeley-mobile/Utils/AtomicDictionary.swift`) uses `pthread_rwlock_t` to protect dictionary access from the `DataManager` background queue.
- `DataSource` implementations use `DispatchGroup` (`fetchDispatch`) to serialize concurrent Firebase reads per source type.
- ViewModels using `@Observable` and `@MainActor` handle UI-bound state on the main thread via Swift structured concurrency.

## UI Component Patterns

### Reusable SwiftUI ViewModifiers

Common cross-cutting UI concerns are implemented as `ViewModifier` types in `View+Extension.swift`:
- `AlertPresentationViewModifier` — `presentAlert(alert:)` for binding-based alert presentation.
- `Shadowfy` — adds rounded rectangle shadow background.
- `EventsContextMenuModifier` — context menu for event add/delete.
- `PositionAtTopModifier` — pins content to top of screen with background.

### Color System

`BMColor` is a namespace struct with static computed properties returning `UIColor`. Dark-mode-aware colors use the `UIColor { trait in ... }` closure pattern. Domain-specific colors are in separate `Colors+*.swift` extension files, each extending `BMColor` with a nested struct (e.g., `BMColor.Calendar`, `BMColor.MapMarker`, `BMColor.Resource`).

### Error/Alert Presentation

View models expose a `@Published var alert: BMAlert?` (or `@Observable var alert: BMAlert?`). Views use the `.presentAlert(alert:)` modifier to bind and display it. `BMAlert` carries a title, message, type (`.action` or `.notice`), and optional completion closure.

## Property Wrapper Conventions

- `@propertyWrapper struct Display<T>` — sanitizes display strings by trimming whitespace and removing replacement characters. Applied to model properties that render user-facing text.
- `@Injected`, `@InjectedObject`, `@InjectedObservable` — FactoryKit wrappers for DI resolution.
- `@DocumentID` — Firestore SDK wrapper applied to `id: String?` properties in Codable models decoded from Firestore.

## Concurrency Model

The codebase mixes two concurrency approaches:
- **Legacy**: `DispatchQueue`, `DispatchGroup`, callbacks (used in `DataManager`, `DataSource` implementations).
- **Modern**: Swift structured concurrency (`async/await`, `Task`, `TaskGroup`, `@MainActor`), used in `BMNetworkingManager`, `GymOccupancyViewModel`, `EventsDataService`, `NewsDataViewModel`, `WeatherDataViewModel`.

New code observed in 2025–2026-dated files consistently uses the modern concurrency model.
