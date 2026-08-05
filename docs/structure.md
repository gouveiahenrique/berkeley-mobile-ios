# Repository Structure

## Top-Level Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/                  # Main application target source
├── BerkeleyMobileWidget/             # WidgetKit extension target source
├── berkeley-mobile.xcodeproj/        # Xcode project file
├── berkeley-mobile.xcworkspace/      # Xcode workspace (CocoaPods + SwiftPM)
├── Pods/                             # CocoaPods vendored dependencies
├── Podfile / Podfile.lock            # CocoaPods dependency manifest
├── app_preview_images/               # Screenshots referenced in README.md
├── README.md, CONTRIBUTING.md, LICENSE.md
```

Counts below are from `find berkeley-mobile -name "*.swift" | sed -E 's#berkeley-mobile/([^/]+)/.*#\1#' | sort | uniq -c`, reflecting Swift file counts per top-level folder inside `berkeley-mobile/`.

## `berkeley-mobile/` (Application Target)

| Folder | Swift file count | Responsibility (evidence-based) |
|---|---|---|
| `Home/` | 51 | Largest module. Contains the map screen (`Home/Map/`), fitness/gym screens (`Home/Fitness/`), library screens (`Home/Libraries/`), dining screens (`Home/Dining/`), guides (`Home/Guides/`), search (`Home/Search/`), and the "Home Drawer" bottom-sheet UI (`Home/Home Drawer/`). Root files `HomeView.swift` and `HomeViewModel.swift` compose these into the main tab. |
| `Common/` | 26 | Shared, cross-feature UI components: `CardView.swift`, `TagView.swift`, `BMAlert.swift`, `BMDrawerView.swift`, `BMFilterButton.swift`, plus `DetailView/`, `FilterView/`, and `Images/` subfolders for reusable detail/filter/image-loading views. |
| `Utils/` | 19 | Extensions on Foundation/UIKit types (`Date+Extension.swift`, `String+Extension.swift`, `UIView+Extensions.swift`, `Collection+Extension.swift`, etc.), plus small standalone utilities (`AtomicDictionary.swift`, `Logger+Ext.swift`, `WeeklyHours.swift`, `DayOfWeek.swift`). |
| `Data/` | 19 | Application data layer: `DataManager.swift`, `DataSource.swift` (protocol), `BMNetworkingManager.swift` (Firestore access), `BMEventManager.swift`, `BMLocationManager.swift`, `BMConstants.swift`, `BMError.swift`, `SortingFunctions.swift`, plus `ItemProtocols/` (shared item capability protocols such as `HasLocation`, `HasImage`, `CanFavorite`, `SearchItem`) and `PropertyWrappers/` (`Display.swift`). |
| `Assets/` | 12 | App-specific design tokens: `Colors/` (a `Colors.swift` base plus per-feature extensions such as `Colors+Event.swift`, `Colors+MapMarker.swift`, `Colors+GymClass.swift`) and `Fonts.swift` / bundled `.otf` font files. |
| `Events/` | 10 | Campus events calendar feature: `CalendarView.swift`, `EventsView.swift`, `EventRowView.swift`, `EventDetailView.swift`, and `EventDataSource/` (`BMEventCalendarEntry.swift`, `EventsViewModel.swift`). |
| `Today/` | 9 | "Today" tab: `TodayView.swift`, `TodayTileView.swift`, `TodayTileLayout.swift`, `TodayTileAttributes.swift`, and per-tile subfolders `Tiles/News Tile/` and `Tiles/Weather Tile/`. |
| `Safety/` | 7 | Safety tab: `SafetyView.swift`, `SafetyViewModel.swift`, `SafetyMapView.swift`, `SafetyMapMarker.swift`, `SafetyLogDetailView.swift`, filter-related views. |
| `Drawer/` | 6 | Generic bottom-drawer/bottom-sheet infrastructure, including `MainDrawerViewDelegate.swift` (protocol + default implementation for managing a stack of drawers) and `SearchDrawerViewDelegate.swift`. |
| `Resources/` | 4 | Resources tab: `ResourcesView.swift`, `ResourcesViewModel.swift`, `ResourcesSectionDropdown.swift`, `SafariWebView.swift`. |
| `FeedbackForm/` | 3 | In-app feedback form: `FeedbackFormPresenter.swift`, `FeedbackFormView.swift`, `FeedbackFormViewModel.swift`. |
| `Debug/` | 2 | Debug-only UI (`DebugView.swift`, `DebugViewModel.swift`), instantiated conditionally under `#if DEBUG` in `TabBarController.swift:34-37`. |

Root-level files directly in `berkeley-mobile/`: `AppDelegate.swift`, `AppDelegate+Migration.swift`, `BerkeleyMobile+Injection.swift` (dependency-injection container extension), `MainContainerViewController.swift`, `SceneDelegate.swift`, `TabBarController.swift`, `Info.plist`, `berkeley-mobile.entitlements`.

Non-Swift resource folders inside `berkeley-mobile/`: `Assets.xcassets` (image/color asset catalog), `Base.lproj` (localization base), `Resources` (see table; note this folder also contains Swift source, distinct from asset resources).

## `BerkeleyMobileWidget/` (Widget Extension Target)

- `BerkeleyMobileWidgetBundle.swift` — widget bundle entry point.
- `GymOccupancyWidget.swift` — the single implemented widget (`GymOccupancyWidget`, `GymOccupancyProvider`, `GymOccupancyEntry`), showing RSF/Stadium gym occupancy.
- `Assets.xcassets/`, `Info.plist` — widget-target resources and configuration.

## Architectural Boundaries

- **Feature-folder organization**: code is grouped primarily by user-facing feature/tab (`Home`, `Safety`, `Events`, `Today`, `Resources`, `FeedbackForm`, `Debug`) rather than by architectural layer, with cross-cutting concerns isolated into `Common/`, `Utils/`, `Assets/`, and `Data/`.
- **Data-source pattern**: each remote-data-backed feature has its own `*DataSource` type conforming to the `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift`), located inside that feature's own folder (e.g. `Home/Map/MapDataSource/`, `Home/Fitness/GymDataSource/`, `Home/Fitness/GymClassDataSource/`, `Home/Libraries/LibraryDataSource/`, `Events/EventDataSource/`). `DataManager` (`Data/DataManager.swift`) is the sole coordinator that knows about a subset of these types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`), fetching and caching their results; other data sources (e.g. `GymClassDataSource`) conform to the same protocol but are not in `DataManager`'s registered list, and their invocation site was not traced in this pass.
- **Dependency injection boundary**: `berkeley-mobile/BerkeleyMobile+Injection.swift` centralizes construction of view models via the `FactoryKit` `Container`, used by view controllers/views via `@Injected` (e.g. `MainContainerViewController.swift:15`, `TabBarController.swift:15`).
- **UIKit/SwiftUI boundary**: the root navigation (`TabBarController`, `MainContainerViewController`) is UIKit-based and wraps SwiftUI feature screens using `UIHostingController` (`TabBarController.swift:17-20`, `MainContainerViewController.swift:35`).
- **Main app vs. widget extension boundary**: the widget extension is a separate Xcode target (`BerkeleyMobileWidgetExtension`) with its own `Info.plist`, asset catalog, and Firebase Firestore pod dependency declared independently in the `Podfile`; it shares Swift types from the main app's dependency-injection container (`GymOccupancyViewModel`) per `GymOccupancyWidget.swift:27`, indicating shared compilation of at least some app sources into the widget target. The exact mechanism (target membership vs. separate module) was not further verified from the project file in this pass.
