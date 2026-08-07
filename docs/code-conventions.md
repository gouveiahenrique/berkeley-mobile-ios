# Code Conventions

## Naming Conventions

### Type and Symbol Prefixing

App-specific types use a `BM` prefix to distinguish them from framework and SDK types:

- Models: `BMLibrary`, `BMGym`, `BMSafetyLog`, `BMResourceCategory`, `BMAlert`, `BMEventCalendarEntry`
- Singletons/managers: `BMLocationManager`, `BMNetworkingManager`, `BMEventManager`
- UI utilities: `BMColor`, `BMFont`, `BMDrawerView`, `BMSegmentedControlView`, `BMCachedAsyncImageView`
- Constants struct: `BMConstants`

### Constants and Keys

- App-wide constants are collected in `BMConstants` (`berkeley-mobile/Data/BMConstants.swift`).
- Module-private constants (e.g. Firestore collection name strings) use `fileprivate let` with a `k` prefix: `kMapEndpoint`, `kLibrariesEndpoint`, `kGymsEndpoint`.
- `UserDefaults` keys are typed via the `UserDefaultsKeys` enum (`berkeley-mobile/Utils/UserDefaults+Extension.swift`).

### File Naming

Swift files use `PascalCase` matching the primary type they define. Extension files use `TypeName+Domain.swift` (e.g. `AppDelegate+Migration.swift`, `Date+Extension.swift`, `UIView+Extensions.swift`, `View+Extension.swift`).

---

## File Organization

### MARK Comments

Source files use `// MARK: -` sections to organize code within a file. Observed patterns:

- `// MARK: - ClassName` — primary type section
- `// MARK: - ProtocolName` — protocol conformance extensions
- `// MARK: - Helper/Utility section name`

### Extension-per-Conformance

Protocol conformances are placed in dedicated `extension` blocks, typically at the bottom of the file or in a separate `+Domain` file. Examples: `AppDelegate` conforming to `UNUserNotificationCenterDelegate` and `MessagingDelegate` in `AppDelegate.swift`; `BMLocationManager` conforming to `CLLocationManagerDelegate` as an extension.

---

## Architectural Patterns

### MVVM

The codebase uses MVVM. SwiftUI views declare `@InjectedObject`, `@InjectedObservable`, or `@Injected` property wrappers to obtain view models from the DI container. View models own `@Published` or `@Observable` state. Examples:

- `SafetyViewModel` — `ObservableObject` with `@Published` properties
- `GymOccupancyViewModel` — uses the `@Observable` macro

### Singleton Pattern

Shared services use `static let shared = Self()` with `private init()`. Observed singletons: `DataManager.shared`, `BMLocationManager.shared`, `BMNetworkingManager.shared`, `ImageLoader.shared`.

### Protocol-Oriented Composition

Model capabilities are composed via protocols rather than inheritance. Observed protocols in `berkeley-mobile/Data/ItemProtocols/`:

- `HasOpenTimes` — provides `weeklyHours`, `nextOpenInterval()`
- `HasImage` — provides `imageURL`
- `CanFavorite` — provides `isFavorited`
- `SearchItem` — marks types as searchable

### Dependency Injection via FactoryKit

All view model registrations are in a single file: `BerkeleyMobile+Injection.swift`. Scopes used: `.shared` (creates once per resolution scope), `.singleton` (process-lifetime singleton). The `Container.shared` instance is used explicitly in `MapViewController` to register a view-model instance at runtime.

### UIKit Drawer System

The legacy UIKit drawer system uses a protocol hierarchy:
- `DrawerViewDelegate` — base protocol for any view controller that hosts a drawer
- `MainDrawerViewDelegate` — extends `DrawerViewDelegate` with a stack-based multi-drawer model
- `SearchDrawerViewDelegate` — extends `DrawerViewDelegate` for dismissable detail drawers

`DrawerState` enum values: `hidden`, `collapsed`, `middle`, `full`.

The SwiftUI-native equivalent is `BMDrawerView` with `BMDrawerViewState` enum values: `small` (1), `medium` (2), `large` (3). Both systems coexist in the application.

---

## Recurring Implementation Patterns

### Firestore Decoding

DataSource implementations (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) decode Firestore documents manually by casting `document.data()` to `[String: Any]` and reading fields by string key. Newer fetches (`BMNetworkingManager`, `GymOccupancyViewModel`) use Firestore's `data(as: ModelType.self)` with Swift `Codable` conformance.

### `Codable` CodingKeys Renaming

When Firestore field names differ from Swift property names, `CodingKeys` enums provide the mapping. Example in `BMSafetyLog`: `case date = "date_time"`.

### Async Patterns

- Legacy fetches: callback-based (`completionHandler = (_ resources: [Any]) -> Void`)
- Modern fetches: `async/await` with `Task { }` dispatch
- Both patterns coexist; newer code (2024–2026 copyright) uses async/await

### `DispatchGroup` Coordination

`DataManager.fetchAll()` uses a `DispatchGroup` to coordinate parallel Firestore fetches. Each `DataSource` has its own `DispatchGroup` (`fetchDispatch`) to deduplicate concurrent fetch requests for the same collection.

### UIView Layout Helpers

`UIView+Extensions.swift` defines helpers used throughout UIKit code:
- `addSubViews(_:)` — batch add and disable autoresizing
- `setConstraintsToView(top:tConst:bottom:bConst:left:lConst:right:rConst:)` — anchor-relative constraints
- `setHeightConstraint(_:)` / `setWidthConstraint(_:)` — programmatic size constraints

### SwiftUI ViewModifier Pattern

`View+Extension.swift` wraps reusable layout and behavior into `ViewModifier` structs and exposes them as `View` extension methods:
- `.positionedAtTop()` — centers content in a `ZStack` aligned to top
- `.shadowfy()` — card shadow with rounded rect background
- `.presentAlert(alert:)` — alert binding
- `.addEventsContextMenu(event:)` — calendar context menu
- `.applyHomeDrawerRowAttributesStyle()` — home drawer row pill style

### `#if DEBUG` Guards

Debug-only code is wrapped in `#if DEBUG` / `#endif`. Observed: `DebugView` presentation on shake gesture in `TabBarController`; `debugViewModel` factory in `BerkeleyMobile+Injection.swift`.

---

## Design Tokens

| Token | Type | Location |
|---|---|---|
| `BMColor` | `struct` with `static var` | `berkeley-mobile/Assets/Colors/Colors.swift` |
| `BMFont` | `struct` with `static let` closures | `berkeley-mobile/Assets/Fonts.swift` |

`BMColor` provides adaptive colors (light/dark mode via `UIColor.init { trait in ... }`). `BMFont` wraps the "Apercu" font family with a system font fallback.
