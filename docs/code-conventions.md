# Code Conventions

## Language and Framework Mix

The codebase mixes UIKit and SwiftUI. UIKit is used for the root navigation structure (`TabBarController`, `MainContainerViewController`, `MapViewController`) and for older feature view controllers (e.g., `LibraryDetailViewController`). SwiftUI is used for all feature views introduced more recently. SwiftUI views are embedded into the UIKit hierarchy via `UIHostingController`.

## Naming Conventions

### Types

- Classes, structs, enums, and protocols use `UpperCamelCase`.
- The `BM` prefix is used for app-specific shared types: `BMAlert`, `BMNetworkingManager`, `BMLocationManager`, `BMEventManager`, `BMLibrary`, `BMGym`, `BMDiningHall`, `BMSafetyLog`, `BMDrawerView`, `BMFont`, `BMColor`, `BMConstants`, `BMError`.
- Types not carrying the `BM` prefix are either framework wrappers, utilities, or feature-specific classes.

### Files

- Swift files follow the pattern `TypeName.swift` or `TypeName+Category.swift` for extensions (e.g., `AppDelegate+Migration.swift`, `UserDefaults+Extension.swift`).
- Extensions on system types are placed in `Utils/` using the naming pattern `TypeName+Extension.swift` or `TypeName+Ext.swift`.

### Properties and Methods

- Properties and method names use `lowerCamelCase`.
- Private constants at file scope use `k` prefix (e.g., `kLibrariesEndpoint`, `kDataSources`, `kLatestLaunchedVersionKey`).
- `UserDefaults` keys are managed through the `UserDefaultsKeys` enum (`berkeley-mobile/Utils/UserDefaults+Extension.swift:11`), with typed accessors on `UserDefaults` via extension.

## MVVM Pattern

Feature modules follow an MVVM pattern:

- **View**: SwiftUI `View` struct (e.g., `SafetyView`, `EventsView`, `ResourcesView`)
- **ViewModel**: A class conforming to `ObservableObject` with `@Published` properties (e.g., `HomeViewModel`) or annotated with `@Observable` (e.g., `EventsViewModel`, `DebugViewModel`)
- **Model**: Data structures fetched from Firestore (e.g., `BMSafetyLog`, `BMResourceCategory`, `BMLibrary`)

## State Management

Two state observation approaches are present:

- `ObservableObject` + `@Published`: observed in `HomeViewModel`, `FeedbackFormViewModel`, `ResourcesViewModel`.
- `@Observable` macro: observed in `EventsViewModel`, `DebugViewModel`, `GuidesViewModel`, `DiningHallsViewModel`, `GymOccupancyViewModel`, `SearchViewModel`, `FeedbackFormViewModel`.

Both patterns coexist in the codebase.

## Dependency Injection

Dependencies are registered in `BerkeleyMobile+Injection.swift` as extensions on Factory's `Container` type. Injection at the call site uses:

- `@Injected(\.keyPath)` — for synchronous injection of value or reference types
- `@InjectedObject(\.keyPath)` — for `ObservableObject`-based view models used in SwiftUI
- `@InjectedObservable(\.keyPath)` — for `@Observable`-annotated view models used in SwiftUI

Registered singletons use `.singleton` scope; objects shared within a view lifecycle use `.shared`; transient instances use no scope modifier.

## Protocol-Based Model Capabilities

Model types adopt capability protocols from `berkeley-mobile/Data/ItemProtocols/`:

- `HasLocation` — provides `distanceToUser` and coordinate properties
- `HasOpenTimes` / `HasOpenClosedStatus` — provides weekly hours and open/closed computation
- `HasImage` — provides `imageURL`
- `HasName`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `SearchItem`

This allows shared UI components (e.g., `LocationDetailView`) to operate on protocol types without coupling to concrete models.

## Singleton Pattern

Several shared services are implemented as singletons via a `static let shared` property:

- `DataManager.shared`
- `BMNetworkingManager.shared`
- `BMLocationManager.shared`
- `ImageLoader.shared`

## Async Patterns

Two concurrency styles are present:

- **Callback/DispatchGroup**: used in `DataManager` and `DataSource`-conforming types (older pattern).
- **Swift async/await + `Task {}`**: used in `BMNetworkingManager`, `EventsViewModel`, `FeedbackFormPresenter`, and widget code.

## Extension Organization

Extensions on existing types are co-located in the `Utils/` directory. Extensions specific to a feature or type responsibility are split into separate files using the `+Category` naming convention (e.g., `AppDelegate+Migration.swift`).

## Constants Organization

- Global app constants (map regions, Firestore collection names, UI strings) are in `BMConstants` (`berkeley-mobile/Data/BMConstants.swift`).
- Per-view-model constants are declared as nested `struct Constants` or `enum Constants` within the view model class (e.g., `GymOccupancyViewModel.Constants.refreshIntervalSecs`).

## Debug Tooling

Debug-only code is wrapped in `#if DEBUG` preprocessor blocks. The shake gesture on `TabBarController` presents a `DebugView` only in debug builds. The `debugViewModel` factory registration is also guarded by `#if DEBUG`.

## Comment Style

File headers use the standard Xcode template with file name, project name, creator, and copyright year. Inline code comments are sparse. Non-obvious behaviors use short single-line comments or doc-comment (`///`) blocks (e.g., `AppDelegate+Migration.swift` uses `///` for `checkForUpdate()` and `clearCache(completion:)`).
