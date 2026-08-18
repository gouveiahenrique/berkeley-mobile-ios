# Code Conventions

Conventions below are derived directly from repository source; none are prescriptive recommendations.

## Naming Conventions

- **`BM` prefix** is used for shared, cross-feature types: `BMConstants`, `BMError`, `BMLocationManager`, `BMNetworkingManager`, `BMLibrary`, `BMGym`, `BMDiningLocation`, `BMSafetyLog`, `BMResourceCategory`, `BMCalendarEvent`, `BMEventCalendarEntry`, `BMAlert`, `BMActionButton`, `BMCachedAsyncImageView`, `BMDrawerView`, `BMFilterButton`, `BMSegmentedControlView`, `BMTopBlobView`. This distinguishes app-defined shared types from feature-local types (e.g. `Gym`, `DiningLocation`, `GuidesViewModel` have no `BM` prefix when they are feature-scoped).
- **`k`-prefixed constants** for endpoint/collection names and other fixed strings, declared `fileprivate` at the top of the file that uses them, e.g. `kMapEndpoint` (`berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift:13`), `kLibrariesEndpoint` (`berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift:12`), `kGymsEndpoint` (`berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift:12`), `kLatestLaunchedVersionKey` (`berkeley-mobile/AppDelegate+Migration.swift:43`), `kFeedbackFormConfigEndpoint`/`kFeedbackFormConfigDocName`/`kFeedbackResponsesCollection` (`berkeley-mobile/FeedbackForm/FeedbackFormViewModel.swift:14-16`).
- **`*DataSource`** suffix names types conforming to the `DataSource` protocol (`MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`).
- **`*ViewModel`** suffix names state/business-logic types backing a screen (`HomeViewModel`, `SafetyViewModel`, `SearchViewModel`, `EventsViewModel`, `FeedbackFormViewModel`, `DebugViewModel`, `GuidesViewModel`, `NewsDataViewModel`, `WeatherDataViewModel`, `MapUserLocationButtonViewModel`, `MapMarkersDropdownViewModel`).
- **`Has*` / `Can*`** protocol naming for composable model capabilities: `HasLocation`, `HasImage`, `HasName`, `HasOpenTimes`, `HasOpenClosedStatus`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite` (all in `berkeley-mobile/Data/ItemProtocols/`).
- **`*+Extension.swift` / `*+Ext.swift`** filename pattern for Swift extensions on framework types, one file per extended type: `UserDefaults+Extension.swift`, `CLLocation+Extension.swift`, `Collection+Extension.swift`, `Date+Extension.swift`, `String+Extension.swift`, `NSCoding+Extension.swift`, `UIDevice+Extensions.swift`, `UIImage+Extensions.swift`, `UIStackView+Extensions.swift`, `UIView+Extensions.swift`, `UIViewController+Extensions.swift`, `View+Extension.swift`, `TimeInterval+Ext.swift`, `Logger+Ext.swift`. Colors follow the same pattern per-feature: `Colors+ActionButton.swift`, `Colors+AlertView.swift`, `Colors+MapMarker.swift`, etc., all under `berkeley-mobile/Assets/Colors/`.
- File header comments follow a consistent Xcode-generated template (`//  <Filename>.swift`, `//  <project>`, `//  Created by <author> on <date>.`, `//  Copyright © <year> ASUC OCTO. All rights reserved.` — or `RJ Pimentel`/`bm-persona` in older files predating the ASUC OCTO team), observed at the top of every file read during this audit.
- `// MARK: -` comments are used consistently to delimit logical sections within a file (e.g. `berkeley-mobile/AppDelegate.swift:54,74`, `berkeley-mobile/Home/Map/MapViewController.swift:309,339`).

## Singleton Pattern

Shared, app-lifetime services are implemented as classes with a `static let shared` instance and a `private init()`:
- `DataManager.shared` (`berkeley-mobile/Data/DataManager.swift:21,40`)
- `BMLocationManager.shared` (`berkeley-mobile/Data/BMLocationManager.swift:28`)
- `BMNetworkingManager.shared` (`berkeley-mobile/Data/BMNetworkingManager.swift:13`)
- `ImageLoader.shared` (referenced in `berkeley-mobile/Data/ItemProtocols/HasImage.swift:25,34`)

This coexists with FactoryKit-managed dependency injection (`.shared`/`.singleton` scoped `Factory<T>` registrations in `berkeley-mobile/BerkeleyMobile+Injection.swift`) for view models — the repository uses hand-rolled singletons for lower-level managers/services and FactoryKit for view-model-layer objects.

## View Model State Management: Two Coexisting Patterns

The repository implements view models with two different Swift observation mechanisms, both present concurrently:
1. **`ObservableObject` + `@Published`** (older pattern) — e.g. `HomeViewModel: ObservableObject` (`berkeley-mobile/Home/HomeViewModel.swift:34-42`), `MapUserLocationButtonViewModel: ObservableObject` (`berkeley-mobile/Home/Map/MapUserLocationButton.swift:12-14`). Consumed via `@InjectedObject` in SwiftUI views (e.g. `berkeley-mobile/Home/Map/MapUserLocationButton.swift:34`).
2. **`@Observable` macro** (newer pattern, Swift Observation framework) — e.g. `SearchViewModel` (`berkeley-mobile/Home/Search/SearchViewModel.swift:43`), `FeedbackFormViewModel` (`berkeley-mobile/FeedbackForm/FeedbackFormViewModel.swift:32-33`), `DebugViewModel` (`berkeley-mobile/Debug/DebugViewModel.swift:11-12`), `NewsDataViewModel` (`berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift:15-16`). Fields not meant to trigger UI updates are marked `@ObservationIgnored` (e.g. `berkeley-mobile/Home/Search/SearchViewModel.swift:49-50`, `berkeley-mobile/Today/Tiles/Weather Tile/WeatherDataViewModel.swift:22-29`). Consumed via `@InjectedObservable` (e.g. `berkeley-mobile/FeedbackForm/FeedbackFormView.swift:14`).

Author/date comments (`Created by ... on ...`) indicate the `@Observable` pattern appears in files created later (2025–2026) than most `ObservableObject` files, consistent with a gradual migration, though both patterns are actively used side by side at present.

## Data Fetching: Two Coexisting Patterns

1. **Completion-handler based**, routed through `DataManager`/`DataSource` (`berkeley-mobile/Data/DataSource.swift`), with manual `[String: Any]` dictionary parsing into model structs (e.g. `MapDataSource.parseMarker(_:)`, `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift:38-64`).
2. **`async`/`await` based**, calling Firestore directly and using `Codable` (`try await docRef.getDocument(as: T.self)` / `try doc.data(as: T.self)`), e.g. `berkeley-mobile/Data/BMNetworkingManager.swift:20-26`, `berkeley-mobile/FeedbackForm/FeedbackFormViewModel.swift:40-50`, `berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift:33-48`.

Newer feature code (Safety, Resources, Feedback Form, News, Weather) uses pattern 2; the original three `DataManager`-registered sources (Map, Library, Gym) use pattern 1.

## Property Wrappers

Custom `@propertyWrapper` types are used for cross-cutting model concerns, e.g. `Display<T>` (`berkeley-mobile/Data/PropertyWrappers/Display.swift`), which trims whitespace and strips invalid characters (`�`) from `String`/`String?` fields at the point of assignment.

## Logging

`os.Logger` instances are declared as static members in a single extension file, one per consuming type, named `<lowerCamelCaseTypeName>`: `Logger.diningHallsViewModel`, `Logger.eventsDataService`, `Logger.guidesViewModel`, `Logger.openClosedStatusManager`, `Logger.feedbackFormConfig`, `Logger.homeDrawerPinViewModel`, `Logger.newsDataViewModel`, `Logger.weatherDataViewModel` (all in `berkeley-mobile/Utils/Logger+Ext.swift`). Each uses `subsystem: Bundle.main.bundleIdentifier!` and `category: String(describing: <Type>.self)`. This coexists with older `print("[Error @ <Type>.<method>()]: \(err)")`-style error logging still present in some data sources (e.g. `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift:25`, `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift:23`) — newer code favors `Logger`, older code favors `print`.

## Error Handling

- Domain-specific errors are modeled as a `LocalizedError`-conforming `enum` — `berkeley-mobile/Data/BMError.swift` (`enum BMError: Error`), used for calendar-integration failures with `NSLocalizedString`-wrapped user-facing messages.
- Elsewhere, Firestore fetch failures are handled ad hoc per call site: some log via `print` and silently `return` (dropping the request, e.g. `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift:22-25`), others log via `Logger` and return an empty/`nil` result (e.g. `berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift:34-36`, `berkeley-mobile/FeedbackForm/FeedbackFormViewModel.swift:43-49`). There is no single repository-wide error-propagation convention across data sources — see also `docs/api-standards.md`.

## Dependency Injection

FactoryKit's `Container` extension pattern is used exclusively for registering injectable view models/managers, in one file: `berkeley-mobile/BerkeleyMobile+Injection.swift`. Each registration follows the form:

```swift
var <name>ViewModel: Factory<XViewModel> {
    self { XViewModel() }.<scope>
}
```

where `<scope>` is `.shared`, `.singleton`, or omitted (new instance per resolution), and some registrations require `@MainActor` closures (e.g. `homeViewModel`, `eventsViewModel`, `gymOccupancyViewModel`, `weatherDataViewModel`, `newsDataViewModel`). Consumers use `@Injected(\.<name>)` for non-observable dependencies, `@InjectedObject(\.<name>)` for `ObservableObject`s, and `@InjectedObservable(\.<name>)` for `@Observable` classes.

## Concurrency

The repository mixes `DispatchGroup`/`DispatchQueue`-based concurrency (e.g. `DataManager.fetchAll()`, `berkeley-mobile/Data/DataManager.swift:56-63`; `HomeViewModel.fetchHomeSectionsData()`, `berkeley-mobile/Home/HomeViewModel.swift:67-87`) with Swift structured concurrency (`async`/`await`, `Task { }`, `@MainActor`, `@concurrent` — e.g. `berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift:14,32`, `berkeley-mobile/Today/Tiles/Weather Tile/WeatherDataViewModel.swift:14,38,56`). `AtomicDictionary` (`berkeley-mobile/Utils/AtomicDictionary.swift`) is used where the `DataManager` cache is accessed from multiple queues concurrently.

## Documentation Comments

Public-facing types/methods in some files use `///` doc comments describing behavior (e.g. `berkeley-mobile/Data/BMLocationManager.swift:24-25,34-35,51`, `berkeley-mobile/Data/PropertyWrappers/Display.swift:11-12`), while many other files (particularly older ones, e.g. `berkeley-mobile/Data/DataSource.swift`) have no doc comments at all. This is inconsistent across the codebase rather than a uniformly applied convention.
