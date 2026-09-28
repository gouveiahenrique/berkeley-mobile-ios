# Code Conventions

## Naming Conventions

- **App-specific type prefix `BM`**: Many app-defined (non-SwiftUI-View, non-ViewModel) types use a `BM` prefix, e.g. `BMNetworkingManager`, `BMEventManager`, `BMError`, `BMConstants`, `BMAlert`, `BMColor`, `BMFont`, `BMLocationManager`, `BMDrawerView`, `BMFilterButton`, `BMActionButton`, `BMCachedAsyncImageView`, `BMContentUnavailableView`, `BMSegmentedControlView`, `BMTopBlobView`. This follows the historical `bm-persona` project name visible in older file headers (e.g. `berkeley-mobile/Data/DataManager.swift:2`, `berkeley-mobile/SceneDelegate.swift:2`).
- **View / ViewModel pairing**: SwiftUI feature screens follow a `<Feature>View.swift` + `<Feature>ViewModel.swift` naming and file pairing, e.g. `HomeView.swift`/`HomeViewModel.swift`, `SafetyView.swift`/`SafetyViewModel.swift`, `ResourcesView.swift`/`ResourcesViewModel.swift`, `GuidesViewModel.swift`, `DiningHallsViewModel.swift`, `GymOccupancyViewModel.swift`, `FeedbackFormViewModel.swift`, `EventsViewModel.swift`, `WeatherDataViewModel.swift`, `NewsDataViewModel.swift`, `DebugViewModel.swift`. 58 files match `*View.swift` and 13 match `*ViewModel.swift` under `berkeley-mobile/`.
- **Data source suffix**: legacy Firestore-backed fetchers are named `<Type>DataSource`, e.g. `LibraryDataSource`, `GymClassDataSource` (see `berkeley-mobile/Data/DataSource.swift` protocol they conform to).
- **File-private constants for endpoint names**: Firestore collection-name string constants are declared `fileprivate let k<Name>Endpoint = "..."` immediately above the type that uses them (e.g. `kLibrariesEndpoint`, `kGymClassesEndpoint`, `kEventsDataServiceEndpoint`).
- **Extension-based organization**: Cross-cutting behavior is added via extensions on system types, named `<Type>+<Purpose>.swift` under `berkeley-mobile/Utils/` (e.g. `Date+Extension.swift`, `String+Extension.swift`, `UIView+Extensions.swift`, `View+Extension.swift`, `CLLocation+Extension.swift`) and at the app level (e.g. `AppDelegate+Migration.swift`, `BerkeleyMobile+Injection.swift`).

## Architectural Patterns

- **Hybrid UIKit/SwiftUI**: Root navigation (`AppDelegate`, `SceneDelegate`, `TabBarController`, `MainContainerViewController`, `DrawerViewController`) is UIKit; individual feature screens are SwiftUI views hosted via `UIHostingController` (see `docs/tech.md`).
- **Dependency injection via FactoryKit**: All view models are registered centrally in one file, `berkeley-mobile/BerkeleyMobile+Injection.swift`, as `Factory<T>` computed properties on `Container`, each explicitly scoped (`.shared`, `.singleton`, or unscoped/new-instance-per-resolution). Consumers inject via the `@Injected(\.xViewModel)` (UIKit/class contexts) or `@InjectedObservable(\.xViewModel)` (SwiftUI observation contexts) property wrappers rather than constructing dependencies directly.
- **Delegate protocols for cross-component coordination**: `DrawerViewDelegate` (`berkeley-mobile/Drawer/DrawerViewDelegate.swift`) and `FeedbackFormPresenterDelegate` are protocol-based coordination points between otherwise-independent view controllers, following the Cocoa delegate pattern.
- **`ViewModifier`-based SwiftUI reuse**: Reusable SwiftUI behavior is packaged as `ViewModifier` structs with a corresponding `View` extension method, e.g. `AlertPresentationViewModifier` / `.presentAlert(alert:)`, `EventsContextMenuModifier` / `.addEventsContextMenu(event:)`, `BMBadgeStyleViewModifer` / `.addBadgeStyle(...)` (all in `berkeley-mobile/Utils/View+Extension.swift`).
- **Availability-gated UI branching**: Multiple call sites branch on `#available(iOS 26.0, *)` to adopt newer APIs (e.g. `.glassEffect`, `Button(role: .confirm)`) with a UIKit-material fallback for older iOS versions (`berkeley-mobile/Utils/View+Extension.swift:44-55`, `:163-183`).
- **Typed error enums conforming to `LocalizedError`**: `BMError` (`berkeley-mobile/Data/BMError.swift`) is a `enum ... : Error` with a `LocalizedError` extension supplying user-facing `errorDescription` strings per case, then surfaced through `BMAlert`.

## State Management

- The repository uses both `@Observable` (Swift Observation framework, found in 10 files) and `ObservableObject` (Combine-based, found in 6 files) for SwiftUI-observable state — not a single, exclusively-enforced pattern across the codebase.
- `@MainActor` isolation is applied to specific view models and factory closures (found in 12 files), e.g. `homeViewModel`, `eventsViewModel`, `gymOccupancyViewModel`, `newsDataViewModel`, `weatherDataViewModel` factories in `berkeley-mobile/BerkeleyMobile+Injection.swift`.

## Documentation Comments

- Doc comments (`///`) are used inconsistently: present on most methods in `berkeley-mobile/Utils/Date+Extension.swift` and `berkeley-mobile/Drawer/DrawerViewDelegate.swift`, largely absent in newer files like `berkeley-mobile/Data/BMNetworkingManager.swift` and `berkeley-mobile/BerkeleyMobile+Injection.swift`.

## Not Found in Codebase

- No SwiftLint or SwiftFormat configuration file was found, so no enforced/documented style-linting ruleset exists in the repository.
