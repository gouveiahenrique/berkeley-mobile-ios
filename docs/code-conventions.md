# Code Conventions

## Naming Conventions

### `BM`-prefixed types

The repository implements a `BM` (Berkeley Mobile) prefix on many domain model, view, and manager types — 49 distinct `BM*` identifiers were found across the codebase. Examples:
- Domain models: `BMGym` (`berkeley-mobile/Home/Fitness/GymDataSource/BMGym.swift`), `BMLibrary` (`berkeley-mobile/Home/Libraries/LibraryDataSource/BMLibrary.swift`), `BMDiningLocation`, `BMEventCalendarEntry`
- Managers/singletons: `BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift:12`), `BMLocationManager` (`berkeley-mobile/Data/BMLocationManager.swift`), `BMEventManager` (`berkeley-mobile/Data/BMEventManager.swift:12`)
- Shared UI/constants: `BMColor` (`berkeley-mobile/Assets/Colors/Colors.swift`), `BMFont` (`berkeley-mobile/Assets/Fonts.swift:12`), `BMConstants` (`berkeley-mobile/Data/BMConstants.swift:12`), `BMAlert` (`berkeley-mobile/Common/BMAlert.swift:12`), `BMActionButton`, `BMDrawerView`, `BMFilterButton`

Not all types follow this convention (e.g. `TabBarController`, `MainContainerViewController`, `TagView`, `DataManager`, `DataSource` do not carry the `BM` prefix) — the prefix is used predominantly for domain/business types and reusable shared components introduced under the "berkeley-mobile" module name, versus earlier types retained from the project's original `bm-persona` naming (see File Header Conventions below).

### Protocol naming: `Has*` / `Can*` capability protocols

The repository implements a set of small, composable capability protocols under `berkeley-mobile/Data/ItemProtocols/`, each named as an assertion about what a conforming type has or can do:
- `HasName` (`berkeley-mobile/Data/ItemProtocols/HasName.swift:11`) — `var name: String { get }`
- `HasLocation`, `HasImage`, `HasOpenTimes`, `HasOpenClosedStatus`, `HasPhoneNumber`, `HasWebsite`
- `CanFavorite`

Domain models compose several of these protocols together (e.g. `SearchItem` extends `HasName`, `berkeley-mobile/Data/ItemProtocols/SearchItem.swift:11`, and provides default `location`/`locationName` implementations when the conformer also conforms to `HasLocation`, `berkeley-mobile/Data/ItemProtocols/SearchItem.swift:22-29`).

### Constant naming: `k`-prefixed file-private constants

The repository implements Hungarian-style `k`-prefixed constants for file-local, fixed values, declared `fileprivate` at file scope (not nested in a type). Examples:
- `fileprivate let kGymsEndpoint = "Gyms"` (`berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift:12`)
- `fileprivate let kMapEndpoint = "Map Marker"` (`berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift:13`)
- `fileprivate let kViewMargin: CGFloat = 16` (repeated across multiple view files, e.g. `berkeley-mobile/Home/Map/MapMarkerDetailView.swift:12`, `berkeley-mobile/Common/CollapsibleCardView.swift:12`)
- `fileprivate let kLatestLaunchedVersionKey = "LatestLaunchedVersion"` (`berkeley-mobile/AppDelegate+Migration.swift:43`)

Some newer SwiftUI files instead nest layout constants in a private `Constants` struct scoped to the view, e.g. `BMSegmentedControlView.Constants` (`berkeley-mobile/Common/BMSegmentedControlView.swift:13-18`).

### `UserDefaults` keys

The repository implements a single `UserDefaultsKeys: String` enum (`berkeley-mobile/Utils/UserDefaults+Extension.swift:11-18`) centralizing all `UserDefaults` key strings, with typed `UserDefaults` extension methods (`set(_:forKey:)`, `integer(forKey:)`, `data(forKey:)`, `increment(forKey:)`) that accept `UserDefaultsKeys` instead of raw strings.

## File Organization

- One primary type per file, with the file named after that type (e.g. `DataManager.swift` defines `DataManager`; `BMAlert.swift` defines `BMAlert`). Small, closely related supporting types are sometimes declared in the same file (e.g. `EventsViewModel.swift` also defines `BerkeleyEventsDaySnapshot`, `BerkeleyEvent`, and `EventsDataService` — `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift:16-74`).
- Feature modules are organized as directories under `berkeley-mobile/` named after the feature/tab (`Home/`, `Safety/`, `Resources/`, `Events/`, `Today/`, `FeedbackForm/`, `Debug/`), each containing that feature's views, view models, and (where applicable) a nested `*DataSource/` subfolder for data-fetching and model types (e.g. `Home/Fitness/GymDataSource/`, `Home/Map/MapDataSource/`, `Home/Libraries/LibraryDataSource/`, `Events/EventDataSource/`).
- Cross-feature shared code lives under `Common/` (shared views), `Data/` (data layer, constants, protocols, property wrappers), `Utils/` (Foundation/UIKit type extensions), and `Assets/` (colors, fonts).
- Extension files follow a `Type+Purpose.swift` naming pattern, e.g. `UserDefaults+Extension.swift`, `Date+Extension.swift`, `CLLocation+Extension.swift`, `AppDelegate+Migration.swift`, `NSCoding+Extension.swift`.
- Color extensions are further split per usage context under `Assets/Colors/`, e.g. `Colors+ActionButton.swift`, `Colors+Resource.swift`, `Colors+MapMarker.swift`, `Colors+TagView.swift`, each extending the shared `BMColor` struct.

## File Header Convention

Most Swift files begin with a standardized header comment block, e.g.:
```swift
//
//  GymDataSource.swift
//  bm-persona
//
//  Created by Kevin Hu on 12/5/19.
//  Copyright © 2019 RJ Pimentel. All rights reserved.
//
```
Newer files use `berkeley-mobile` as the module name and `ASUC OCTO` as the copyright holder, e.g.:
```swift
//
//  BMNetworkingManager.swift
//  berkeley-mobile
//
//  Created by Justin Wong on 5/15/25.
//  Copyright © 2025 ASUC OCTO. All rights reserved.
//
```
This indicates the project was originally named `bm-persona` (owned by "RJ Pimentel") and was later renamed/re-attributed to `berkeley-mobile` (owned by "ASUC OCTO"); both header forms coexist in the current codebase depending on file age.

## Architectural Patterns

### MVVM with SwiftUI + UIKit interop

The repository implements a mix of UIKit view controllers and SwiftUI views within a single navigation hierarchy. UIKit `UIViewController` subclasses (e.g. `TabBarController`, `MainContainerViewController`) embed SwiftUI views via `UIHostingController` (`berkeley-mobile/TabBarController.swift:17,19,20`, `berkeley-mobile/MainContainerViewController.swift:35`). Feature view models pair with SwiftUI views (e.g. `SafetyView` + `SafetyViewModel`, `ResourcesView` + `ResourcesViewModel`).

Two observation patterns coexist:
- Older/some current view models conform to `ObservableObject` with `@Published` properties (6 files use `ObservableObject`, e.g. `SafetyViewModel: NSObject, ObservableObject` — `berkeley-mobile/Safety/SafetyViewModel.swift:57`, with `@Published var region`, `@Published var safetyLogs`, etc., `berkeley-mobile/Safety/SafetyViewModel.swift:63-69`).
- Newer view models use the Swift `Observation` framework's `@Observable` macro (10 files use `@Observable`, e.g. `NewsDataViewModel` — `berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift:15`, `WeatherDataViewModel` — `berkeley-mobile/Today/Tiles/Weather Tile/WeatherDataViewModel.swift:15`, `EventsViewModel` — `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift:77`), several also marked `@MainActor`.

### Dependency injection via `FactoryKit`

View models are not instantiated directly at each call site but resolved through a central DI container. `berkeley-mobile/BerkeleyMobile+Injection.swift` extends `Container` with `Factory<T>`-returning computed properties, each specifying a lifetime (`.shared` or `.singleton`); consuming types declare an `@Injected(\.<property>)` (UIKit/`ObservableObject` contexts) or `@InjectedObservable(\.<property>)` (SwiftUI + `@Observable` contexts, e.g. `berkeley-mobile/Events/EventDetailView.swift:10`) property.

### Protocol-oriented domain modeling

Domain models compose small capability protocols (see `Has*`/`Can*` above) rather than relying on class inheritance hierarchies. `SearchItem` (`berkeley-mobile/Data/ItemProtocols/SearchItem.swift:11`) and `BMCalendarEvent` (`berkeley-mobile/Data/ItemProtocols/BMCalendarEvent.swift:13`) both provide protocol-extension default implementations for shared computed properties (e.g. `BMCalendarEvent.dateString`, `berkeley-mobile/Data/ItemProtocols/BMCalendarEvent.swift:38-65`).

### Custom property wrappers for data sanitization

`Display` (`berkeley-mobile/Data/PropertyWrappers/Display.swift:13`) is a repository-defined `@propertyWrapper` that trims whitespace and strips a specific invalid-character byte sequence (`"\u{FFFD}"`-like replacement character) from `String`/`String?` values assigned to it, used on fields populated from Firestore parsing (e.g. `DiningItem.name`, `berkeley-mobile/Home/Dining/DiningDataSource/DiningItem.swift:17`).

### Singletons for cross-cutting services

Several services are implemented as singletons exposing a `static let/var shared` instance: `DataManager.shared` (`berkeley-mobile/Data/DataManager.swift:21`), `BMNetworkingManager.shared` (`berkeley-mobile/Data/BMNetworkingManager.swift:13`), `ImageLoader.shared` (`berkeley-mobile/Common/Images/ImageLoader.swift:14`), `EventsDataService.shared` (`berkeley-mobile/Events/EventDataSource/EventsViewModel.swift:36`).

## Comment Conventions

- Doc comments (`///`) are used on public protocol requirements and utility APIs to describe intent, e.g. `SearchItem.icon` (`berkeley-mobile/Data/ItemProtocols/SearchItem.swift:17-18`), `Display` (`berkeley-mobile/Data/PropertyWrappers/Display.swift:11-12`).
- `// MARK:` comments are used pervasively to divide files into logical sections (e.g. `// MARK: - Sample Data`, `berkeley-mobile/Safety/SafetyViewModel.swift:155`; `// MARK: - MessagingDelegate`, `berkeley-mobile/AppDelegate.swift:74`).
- `// TODO:` comments mark known incomplete work directly in source, e.g. `// TODO: Make this O(1).` (`berkeley-mobile/Data/DataManager.swift:27`), `// TODO: Get distance to marker` (`berkeley-mobile/Home/Map/MapMarkerDetailView.swift:276`).
