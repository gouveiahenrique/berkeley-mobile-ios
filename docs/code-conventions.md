# Code Conventions

## Naming

- **`BM` prefix**: A subset of app-specific types are prefixed `BM` (20 files match `BM*.swift`), e.g., `BMAlert`, `BMError`, `BMConstants`, `BMNetworkingManager`, `BMLocationManager`, `BMEventManager`, `BMSafetyLog`, `BMDrawerView`, `BMActionButton`, `BMCachedAsyncImageView`, `BMContentUnavailableView`, `BMFilterButton`, `BMSegmentedControlView`, `BMTopBlobView`. Not all types use this prefix (e.g., `DataManager`, `DataSource`, `HomeViewModel`, `MapViewController` do not) — the repository implements the prefix inconsistently across older and newer files (file header dates show `BM`-prefixed files trending toward 2024–2025 creation dates, e.g., `BMError.swift` created 2025-05-14, `BMAlert.swift` created 2025-09-04, versus unprefixed `DataManager.swift` created 2019-12-05).
- **`ViewModel` suffix**: Feature state/logic types are named `<Feature>ViewModel`, e.g., `HomeViewModel`, `SafetyViewModel`, `EventsViewModel`, `DiningHallsViewModel`, `GuidesViewModel`, `ResourcesViewModel`, `SearchViewModel`, `MapMarkersDropdownViewModel`, `MapUserLocationButtonViewModel`, `DebugViewModel`, `FeedbackFormViewModel`, `GymOccupancyViewModel`, `WeatherDataViewModel`, `NewsDataViewModel`, `CalendarViewModel`, `HomeDrawerPinViewModel`. All are registered in `berkeley-mobile/BerkeleyMobile+Injection.swift`.
- **`DataSource` suffix**: Types conforming to the `DataSource` protocol are named `<Feature>DataSource`, e.g., `MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`, each located in a folder of the same name (e.g., `Home/Map/MapDataSource/`).
- **`Has<Capability>` / `Can<Capability>` protocols**: Item-capability protocols in `berkeley-mobile/Data/ItemProtocols/` follow this pattern: `HasImage`, `HasLocation`, `HasName`, `HasOpenClosedStatus`, `HasOpenTimes`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`.
- **Extension-based namespacing for utilities**: Files under `berkeley-mobile/Utils/` are named `<Type>+Extension.swift` or `<Type>+Ext.swift` (e.g., `Date+Extension.swift`, `CLLocation+Extension.swift`, `Collection+Extension.swift`, `UIView+Extensions.swift`, `Logger+Ext.swift`, `TimeInterval+Ext.swift`), each containing an `extension` on the corresponding type.
- **`k`-prefixed file-private constants**: Firestore collection/endpoint names and similar magic strings are declared as `fileprivate let k<Name> = "..."` at file scope, e.g., `kMapEndpoint` (`MapDataSource.swift`), `kGuidesEndpoint` (`GuidesViewModel.swift`), `kEventsDataServiceEndpoint`, `kDiningHallAdditionalDataEndpoint`, `kDiningHallEndpoint`, `kLibrariesEndpoint` (per codegraph symbol listing for `LibraryDataSource.swift`).

## File Organization

- Each Swift file begins with a standard header comment block (filename, target name, author, creation date, copyright), e.g.:
  ```swift
  //
  //  BMNetworkingManager.swift
  //  berkeley-mobile
  //
  //  Created by Justin Wong on 5/15/25.
  //  Copyright © 2025 ASUC OCTO. All rights reserved.
  //
  ```
  Older files carry `bm-persona` as the project name in this header (the app's original product name) instead of `berkeley-mobile`, e.g., `DataManager.swift`, `BMLocationManager.swift`, `DataSource.swift`.
- Types are grouped into folders by feature, each folder mirroring the type name where a dedicated data source or view model exists (e.g., `Home/Dining/DiningDataSource/`, `Home/Guides/`).
- `// MARK: - <Section>` comments delimit logical sections within a file (property groups, protocol conformance extensions, sample data), e.g., `// MARK: - SafetyViewManager`, `// MARK: - Sample Data`, `// MARK: CLLocationManagerDelegate`.
- Protocol conformance is frequently implemented in a separate `extension <Type>: <Protocol> { ... }` block below the primary type declaration rather than inline in the type's declaration, e.g., `extension BMLocationManager: CLLocationManagerDelegate`, `extension DiningHallsViewModel: OpenClosedStatusManagerDelegate`, `extension AppDelegate: MessagingDelegate`.

## State Management Patterns

- Newer view models (files dated 2025) use the SwiftUI `Observation` framework's `@Observable` macro for state, e.g., `@Observable class GuidesViewModel`, `@Observable class DiningHallsViewModel`, `@MainActor @Observable class EventsViewModel`.
- `SafetyViewModel` instead uses `ObservableObject` with `@Published` properties (Combine-based), rather than `@Observable` — the repository mixes both SwiftUI state-observation patterns rather than using a single one consistently.
- Async data fetches are performed with Swift Concurrency (`async`/`await`, `Task { @MainActor in ... }`) in newer code (`DiningHallsViewModel`, `EventsViewModel`, `GuidesViewModel`, `BMNetworkingManager`), while `MapDataSource.fetchItems(_:)` uses the older completion-handler/closure pattern with `DispatchGroup` coordination via `DataManager`.

## Dependency Injection

- The repository implements dependency injection using the `FactoryKit` Swift package (`hmlongco/Factory`, pinned `2.5.3`). All injectable types are declared as computed properties returning `Factory<T>` on an `extension Container` in `berkeley-mobile/BerkeleyMobile+Injection.swift`, using `.shared` or `.singleton` scope modifiers, e.g.:
  ```swift
  var safetyViewModel: Factory<SafetyViewModel> {
      self { SafetyViewModel() }.shared
  }
  ```
- Consumers resolve dependencies via `Container.shared.<name>.resolve()`, observed in `MapViewController.init()` (`Container.shared.homeViewModel.resolve()`).
- Debug-only dependencies are conditionally compiled with `#if DEBUG` / `#endif` around the `Factory` property (e.g., `debugViewModel`).

## Singletons

Several core managers are implemented as classic Swift singletons with a `static let shared = ...` private-init pattern, rather than through `FactoryKit`: `DataManager.shared`, `BMNetworkingManager.shared`, `BMLocationManager.shared`, `EventsDataService.shared`. This differs from the `FactoryKit`-based injection used for view models — the repository implements two separate mechanisms for shared instance access (manual singletons for data-layer managers, `FactoryKit` for view models) rather than a single unified approach.

## Error/Alert Presentation

- User-facing errors are surfaced via a shared `BMAlert` struct (`berkeley-mobile/Common/BMAlert.swift`), an `Identifiable, Equatable` value type with a `type: BMAlertType` (`.action` or `.notice`) and optional `completion` closure, assigned to a view model's `@Published var alert: BMAlert?` / `var alert: BMAlert?` property for SwiftUI presentation.
- `withoutAnimation { ... }` is used as a wrapper when setting alert state to suppress implicit SwiftUI animation (seen in `SafetyViewModel`, `EventsViewModel`).
