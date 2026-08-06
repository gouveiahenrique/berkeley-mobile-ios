# Code Conventions

## Naming Conventions

- **`BM` type prefix.** 20 of 174 Swift files in `berkeley-mobile/` (outside `Pods/`) define a type prefixed `BM` (e.g. `BMConstants`, `BMError`, `BMLocationManager`, `BMNetworkingManager`, `BMGym`, `BMLibrary`, `BMSafetyLog`, `BMDiningLocation`). This prefix is applied to domain models, managers/singletons, and some shared UI components (e.g. `BMActionButton`, `BMAlert`, `BMDrawerView`). Not found in codebase: a written style guide stating when `BM` must be applied; some comparable types (e.g. `CardView`, `TagView`, `ActionButton`) do not use the prefix, so it is not applied universally.
- **`Has*` protocol naming.** Shared capability protocols under `berkeley-mobile/Data/ItemProtocols/` follow a `Has<Capability>` naming pattern: `HasLocation`, `HasImage`, `HasName`, `HasOpenTimes`, `HasPhoneNumber`, `HasWebsite`, `HasOpenClosedStatus`. Domain model conformance is composed from multiple such protocols (e.g. `HomeDrawerSectionRowItemType: HasLocation, SearchItem, HasImage, Identifiable, Equatable` in `berkeley-mobile/Home/HomeViewModel.swift:30-32`).
- **`*ViewModel` suffix.** View-model types are named with a `ViewModel` suffix (e.g. `HomeViewModel`, `SafetyViewModel`, `SearchViewModel`, `ResourcesViewModel`, `DebugViewModel`, `GymOccupancyViewModel`, `DiningHallsViewModel`, `NewsDataViewModel`, `WeatherDataViewModel`). Two different observation mechanisms are used for these types (see "View Model Patterns" below).
- **`*DataSource` suffix for Firestore-backed fetchers.** Types conforming to the `DataSource` protocol are named `<Domain>DataSource` (e.g. `GymDataSource`, `LibraryDataSource`, `MapDataSource`, `GymClassDataSource`), each defined in its own subdirectory of the same name (e.g. `Home/Fitness/GymDataSource/GymDataSource.swift`).
- **`Type+Extension.swift` / `Type+Ext.swift` file naming for extensions.** Extensions on existing types (mostly Foundation/UIKit types) live in `berkeley-mobile/Utils/` with filenames of the form `<ExtendedType>+Extension.swift` (e.g. `Collection+Extension.swift`, `String+Extension.swift`, `Date+Extension.swift`, `CLLocation+Extension.swift`, `UserDefaults+Extension.swift`) or the shorter `<ExtendedType>+Ext.swift` (e.g. `TimeInterval+Ext.swift`, `Logger+Ext.swift`). Both suffix forms are used; no single form is applied exclusively.
- **`fileprivate let k<Name>` for endpoint/constant literals.** Firestore collection-name literals used by `DataSource` Pattern 1 types are declared as `fileprivate let k<Name> = "..."` at file scope, immediately below the imports (e.g. `kGymsEndpoint` in `GymDataSource.swift:12`, `kLibrariesEndpoint` in `LibraryDataSource.swift:12`, `kMapEndpoint` in `MapDataSource.swift:13`, `kGymClassesEndpoint` in `GymClassDataSource.swift:12`).

## View Model Patterns

Two distinct state-observation approaches coexist in the repository:
1. **`ObservableObject` + `@Published`** (Combine-based, older SwiftUI pattern): e.g. `HomeViewModel: ObservableObject` with `@Published var isFetching`, `@Published var diningHalls` (`berkeley-mobile/Home/HomeViewModel.swift:34-42`).
2. **`@Observable` macro** (newer Swift Observation framework, `import Observation`): e.g. `@Observable class SearchViewModel` (`berkeley-mobile/Home/Search/SearchViewModel.swift:11,43`), and also used by `DebugViewModel`, `HomeDrawerPinViewModel`, `GymOccupancyViewModel`, `GuidesViewModel`, `DiningHallsViewModel`, `NewsDataViewModel`, `WeatherDataViewModel`, `EventsViewModel`, `FeedbackFormViewModel`.

Not found in codebase: a stated rule for which pattern to use for new view models; file header comments show `HomeViewModel.swift` was created 2025-06-06 and `SearchViewModel.swift` was created 2025-03-19, both post-dating the introduction of the `Observation` framework, so the split does not appear to be a strict "old files use one, new files use the other" migration in date order.

## Singletons

Several manager/data classes implement the singleton pattern via a `static let shared` property with a `private init()`:
- `DataManager.shared` (`berkeley-mobile/Data/DataManager.swift:21,40`)
- `BMLocationManager.shared` (`berkeley-mobile/Data/BMLocationManager.swift:28`)
- `BMNetworkingManager.shared` (`berkeley-mobile/Data/BMNetworkingManager.swift:13`)

## Dependency Injection

New view models registered after the introduction of `FactoryKit` (see `berkeley-mobile/BerkeleyMobile+Injection.swift`) are exposed as `Factory<T>` computed properties on `Container`, scoped `.shared` or `.singleton`, and consumed via the `@Injected(\.propertyName)` property wrapper (e.g. `berkeley-mobile/TabBarController.swift:15`). This exists alongside the older singleton pattern above; the two are not unified into one mechanism.

## Code Organization Within Files

- **`// MARK: -` section comments** are used to delimit logical sections and extensions within a file (e.g. `berkeley-mobile/AppDelegate.swift:37,54,74`; `berkeley-mobile/TabBarController.swift:74`). The `-` variant is used for section headers that appear as a horizontal divider in Xcode's jump bar; the plain `// MARK:` form (without `-`) is also used for sub-sections (e.g. `AppDelegate.swift:37`).
- **Delegate conformance via file-scoped `extension`.** Protocol conformances are frequently implemented in a separate `extension` block below the main type declaration, each preceded by a `// MARK: -` comment naming the protocol (e.g. `extension AppDelegate: UNUserNotificationCenterDelegate` in `AppDelegate.swift:56`, `extension AppDelegate: MessagingDelegate` in `AppDelegate.swift:75`, `extension TabBarController: FeedbackFormPresenterDelegate` in `TabBarController.swift:76`, `extension BMLocationManager: CLLocationManagerDelegate` in `BMLocationManager.swift:85`).
- **Doc comments (`///` or `/** */`)** are used selectively on public-facing singleton properties and protocol requirements (e.g. `BMLocationManager.swift:24-35`, `HasLocation.swift:16-28`), but are not present on every type or method in the codebase (e.g. `DataManager.swift`, `GymDataSource.swift` have few or no doc comments).

## File Header Comments

Swift files in this repository consistently begin with a standard Xcode-generated header comment block containing the filename, an original project name (`bm-persona` or `berkeley-mobile` or `berkeleyMobileiOS` depending on file age), author name, creation date, and copyright line (e.g. `AppDelegate.swift:1-7`, `DataManager.swift:1-7`, `LibraryDataSource.swift:1-7`). The copyright holder name varies by era: older files attribute copyright to an individual (`RJ Pimentel`), newer files attribute it to `ASUC OCTO`.
