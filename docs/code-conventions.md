# Code Conventions

Evidence for this document is drawn from direct inspection of files across `berkeley-mobile/` (see `docs/structure.md` for full file inventory). Patterns below are the observed implementation, not prescribed best practice.

## Naming Conventions (Level 1)

- **`BM` prefix**: many app-specific types use a `BM` prefix, distinguishing them from system types or generic helpers — e.g. `BMColor`, `BMFont`, `BMAlert`, `BMConstants`, `BMNetworkingManager`, `BMEventCalendarEntry`, `BMResourceCategory`, `BMSafetyLog`, `BMActionButton`, `BMDrawerView`, `BMFilterButton`, `BMSegmentedControlView`, `BMTopBlobView`, `BMCachedAsyncImageView`, `BMContentUnavailableView`. Not all types follow this prefix (e.g. `CardView`, `TagView`, `ActionButton`, `DataManager`, `DataSource` do not use it) — the prefix is an observed convention, not an enforced rule.
- **`ViewModel` suffix**: view-model classes are named `<Feature>ViewModel` (e.g. `HomeViewModel`, `SafetyViewModel`, `ResourcesViewModel`, `EventsViewModel`, `GuidesViewModel`, `SearchViewModel`, `WeatherDataViewModel`, `NewsDataViewModel`, `DiningHallsViewModel`, `GymOccupancyViewModel`, `HomeDrawerPinViewModel`, `DebugViewModel`, `FeedbackFormViewModel`), consistently colocated with their corresponding `<Feature>View`.
- **`DataSource` suffix**: types/protocols that fetch a category of data from the backing store are named `<Feature>DataSource` (e.g. `MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`), each conforming to the shared `DataSource` protocol.
- **Type extensions for platform types**: cross-cutting helpers are added as extensions named `<SystemType>+Extension.swift` / `<SystemType>+Ext.swift` (e.g. `Date+Extension.swift`, `String+Extension.swift`, `Collection+Extension.swift`, `TimeInterval+Ext.swift`, `NSCoding+Extension.swift`, `CLLocation+Extension.swift`, `UIView+Extensions.swift`, `View+Extension.swift`, `UserDefaults+Extension.swift`), all under `berkeley-mobile/Utils/`.
- **Feature-scoped color/font extensions**: `berkeley-mobile/Assets/Colors/Colors+<Feature>.swift` files extend `BMColor` per feature area (e.g. `Colors+Calendar.swift`, `Colors+Event.swift`, `Colors+GymClass.swift`, `Colors+MapMarker.swift`).

## Architectural Pattern (Level 1)

- **MVVM with SwiftUI + UIKit interop**: SwiftUI `View` structs are paired with an `ObservableObject`/`@Observable` view-model class per feature (see `docs/tech.md` § State management). SwiftUI screens are embedded into the UIKit navigation hierarchy via `UIHostingController` (`berkeley-mobile/TabBarController.swift`, `berkeley-mobile/MainContainerViewController.swift`), rather than the app being either purely UIKit or purely SwiftUI.
- **Newer view models use `@Observable`/`@ObservationIgnored`/`@MainActor`** (e.g. `WeatherDataViewModel`, `NewsDataViewModel`), while other view models use the older `ObservableObject`/`@Published` pattern (e.g. `ResourcesViewModel`). Both styles coexist in the current codebase.
- **Dependency injection via FactoryKit**: all view models and some managers are registered once in `berkeley-mobile/BerkeleyMobile+Injection.swift` as `extension Container { var x: Factory<X> { ... } }`, with an explicit scope (`.shared`, `.singleton`, or unscoped/new-instance), and consumed via `@Injected(\.x)` (UIKit call sites) or presumably `@InjectedObservable(\.x)` for `@Observable` types (seen in `berkeley-mobile/Utils/View+Extension.swift`'s `EventsContextMenuModifier`).
- **Singletons for cross-cutting managers**: `DataManager.shared`, `BMNetworkingManager.shared`, `BMLocationManager.shared` — plain Swift `static let shared` singletons, separate from the FactoryKit-managed view-model instances.

## Constants and Configuration (Level 1)

- Feature-local constants are grouped into a nested `private struct Constants { static let ... }` inside the type that uses them (e.g. `BMSegmentedControlView.Constants`, `AlertPresentationViewModifier.Constants`), rather than a single global constants file.
- Cross-feature constants (map region, Firestore collection names, section titles) are centralized in `berkeley-mobile/Data/BMConstants.swift` as a single `struct BMConstants` with `// MARK:`-delimited sections. This is not applied universally — e.g. `NewsDataViewModel` defines its own local `kNewsDataEndpoint` constant rather than adding it to `BMConstants`.
- `UserDefaults` keys are centralized in a `UserDefaultsKeys: String` enum (`berkeley-mobile/Utils/UserDefaults+Extension.swift`), accessed through typed `UserDefaults` extension methods (`set(_:forKey: UserDefaultsKeys)`, `integer(forKey:)`, `data(forKey:)`, `increment(forKey:)`) rather than raw string keys at call sites.

## Code Organization Within Files (Level 1)

- `// MARK: - <Section>` comments are used pervasively to divide extensions/sections within a file (observed in `AppDelegate.swift`, `TabBarController.swift`, `Colors.swift`, `BMConstants.swift`, `Date+Extension.swift`, `Utils/View+Extension.swift`, and others).
- Protocol conformances are frequently implemented in a dedicated `extension Type: Protocol { }` block placed after the primary type declaration, rather than inline in the class body (e.g. `extension AppDelegate: UNUserNotificationCenterDelegate`, `extension AppDelegate: MessagingDelegate`, `extension TabBarController: FeedbackFormPresenterDelegate`).
- Doc comments use triple-slash (`///`) or block (`/** ... */`) style on public/static API surface in utility extensions (e.g. `Date+Extension.swift`), though this is not applied uniformly across all files.

## Logging (Level 1)

- `os.Logger` instances are centrally declared per type in `berkeley-mobile/Utils/Logger+Ext.swift` as `extension Logger { static let <viewModelName> = Logger(subsystem: Bundle.main.bundleIdentifier!, category: String(describing: <Type>.self)) }`, then referenced as `Logger.<name>.error(...)` / `.info(...)` at call sites (e.g. `WeatherDataViewModel`, `NewsDataViewModel`). Some older code paths instead use `print(...)` directly (e.g. `berkeley-mobile/AppDelegate+Migration.swift`'s `clearCache`).

## Concurrency (Level 1)

- Newer asynchronous code uses Swift `async`/`await` and `Task { }` / `Task.detached` (e.g. `BMNetworkingManager`, `WeatherDataViewModel`, `NewsDataViewModel`, `ResourcesViewModel`).
- Older asynchronous code uses `DispatchGroup`/`DispatchQueue` with completion handlers (e.g. `DataManager.fetch(source:_:)`, `AppDelegate+Migration.checkForUpdate()`). Both patterns coexist in the current codebase; there is no indication one has fully replaced the other.
