# Code Conventions

## Naming Conventions

### Types

- **`BM` prefix** is used for application-specific model and utility types: `BMLibrary`, `BMGym`, `BMDiningHall`, `BMSafetyLog`, `BMColor`, `BMFont`, `BMAlert`, `BMConstants`, `BMLocationManager`, `BMNetworkingManager`, `BMEventManager`, `BMError`, `BMDrawerView`, `BMSegmentedControlView`, `BMContentUnavailableView`.
- **`k` prefix** on `fileprivate let` constants identifies Firestore endpoint strings (e.g., `kLibrariesEndpoint`, `kGymsEndpoint`, `kDiningHallEndpoint`).
- ViewModel classes follow the `*ViewModel` suffix pattern: `SafetyViewModel`, `HomeViewModel`, `DiningHallsViewModel`, `GymOccupancyViewModel`, `WeatherDataViewModel`, `NewsDataViewModel`, `EventsViewModel`.
- DataSource classes follow the `*DataSource` suffix: `LibraryDataSource`, `GymDataSource`, `MapDataSource`, `GymClassDataSource`.
- View structs follow the `*View` suffix: `SafetyView`, `TodayView`, `ResourcesView`, `HomeView`, `FitnessView`, `DiningHallsView`.

### Files

- Swift file names match the primary type defined within them.
- Protocol extensions are placed in the same file as the protocol definition (`HasOpenTimes.swift` contains both the protocol and its extension).
- UIKit class extensions for protocol conformance are placed in `// MARK: - ProtocolName` sections in the same file.
- Type-specific extensions on Foundation types are placed in `Utils/` with the naming pattern `TypeName+Extension.swift` (e.g., `Date+Extension.swift`).
- Logger category constants are centralized in `Utils/Logger+Ext.swift`.

### MARK Comments

`// MARK: - SectionName` comments are used consistently throughout the codebase to organize class/struct sections. Observed patterns:
- `// MARK: - UIDelegate` for delegate conformance
- `// MARK: - ViewModel/Logic`
- `// MARK: - Sample Data` for preview helpers
- `// MARK: UISceneSession Lifecycle`

## Architectural Patterns

### MVVM with Dependency Injection

The application uses an MVVM architecture. Views do not construct ViewModels directly; all ViewModel lifecycle is managed by FactoryKit's `Container`. Views access ViewModels exclusively through FactoryKit property wrappers:

- `@Injected(\.keyPath)` — for non-observable injected values
- `@InjectedObject(\.keyPath)` — for `ObservableObject` ViewModels
- `@InjectedObservable(\.keyPath)` — for `@Observable` ViewModels

### SwiftUI + UIKit Bridge

Feature screens are written in SwiftUI. They are embedded into UIKit navigation using `UIHostingController`. The inverse bridge (UIKit views within SwiftUI) is used in `HomeView` via a custom `HomeMapView` that wraps `MapViewController`.

### `@Observable` vs `ObservableObject`

Newer ViewModels use the `@Observable` macro (Swift 5.9+): `GymOccupancyViewModel`, `DiningHallsViewModel`, `HomeViewModel`, `EventsViewModel`, `WeatherDataViewModel`, `NewsDataViewModel`, `HomeDrawerPinViewModel`.

Older ViewModels use `ObservableObject` with `@Published`: `SafetyViewModel`.

### Data Source Protocol

Firestore-backed data sources that feed `DataManager` conform to `DataSource`:
- Must implement `static func fetchItems(_ completion: @escaping DataSource.completionHandler)`
- Must expose `static var fetchDispatch: DispatchGroup`
- Parse logic is implemented as `private static func parse*(_ dict:, docID:) -> ModelType`

### Protocol-Based Model Capabilities

Model types advertise capabilities through protocol conformance rather than inheritance:
- `HasOpenTimes` — provides `weeklyHours`, `isOpen`, `nextOpenInterval()`; includes a default `parseWeeklyHours(dict:)` implementation
- `HasLocation` — provides `latitude`, `longitude`
- `HasName` — provides `name`
- `HasPhoneNumber` — provides `phoneNumber`
- `HasImage` — provides `imageLink`
- `HasWebsite` — provides a URL
- `CanFavorite` — provides favoriting state
- `SearchItem` — marks a type as appearing in search results

### Error Presentation

Errors are surfaced to the user via a `BMAlert` model carried on the ViewModel as `var alert: BMAlert?`. Views observe this property and present alerts using a `.presentAlert(alert:)` view modifier. This pattern is used by `SafetyViewModel`, `EventsViewModel`, and `ResourcesViewModel`.

### Analytics

Firebase Analytics events are logged inline inside ViewModel methods using `Analytics.logEvent("event_name", parameters: [...])`. Observed event names: `"map_icon_clicked"`, `"opened_food"`, `"opened_academic_calendar"`, `"opened_campus_wide_events"`.

### `UserDefaults` Persistence

Persistent user preferences are accessed through typed keys defined in a `UserDefaultsKeys` constants type. Observed keys:
- `UserDefaultsKeys.numAppLaunchForAppStoreReview` — tracks launch count for App Store review prompting
- `UserDefaultsKeys.homeDrawerPinnedItemIDs` — stores serialized pinned item IDs

### Concurrency

- `DataManager` uses `DispatchGroup` and `DispatchQueue` for legacy callback-based concurrency.
- All newer ViewModels use Swift Concurrency (`async/await`, `Task`, `@MainActor`).
- `@MainActor` isolation is applied to `@Observable` ViewModels and specific `async` methods that update UI state.
- `Task.detached(priority: .userInitiated)` is used in `WeatherDataViewModel` for background data fetch tasks.

## File Organization within Features

Each feature module follows a consistent structure:
1. A root `*View.swift` (SwiftUI view)
2. A `*ViewModel.swift` (state and logic)
3. A `*DataSource/` subdirectory (Firestore fetch + parse, where applicable)
4. Supporting subviews (detail views, row views, etc.)

## Code Style Notes

- Computed properties for view sub-components are declared as `private var` or `@ViewBuilder private var`/`private func` within SwiftUI views, prefixed with descriptive names (e.g., `headerView`, `drawerContentView`, `alertsDrawerHeaderView`).
- `guard let` is preferred over forced optional unwrapping in production paths. Forced unwrapping (`!`) is present in legacy data-parsing code and in cases where the author considers the failure impossible (e.g., `Date.getTodayShiftDate`).
- `fileprivate` is used for file-scoped constants; `private` for type-scoped members.
