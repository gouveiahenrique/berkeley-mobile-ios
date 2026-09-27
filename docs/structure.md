# Repository Structure

## Top-Level Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/                 # Main application source
├── BerkeleyMobileWidget/            # WidgetKit extension target source
├── berkeley-mobile.xcodeproj/       # Xcode project (2 native targets)
├── berkeley-mobile.xcworkspace/     # Xcode workspace (opens CocoaPods + SwiftPM together)
├── Pods/                            # CocoaPods-managed dependencies (checked in)
├── app_preview_images/              # Screenshots referenced by README.md
├── Podfile / Podfile.lock           # CocoaPods dependency manifest/lockfile
├── README.md, CONTRIBUTING.md, LICENSE.md
```

## `berkeley-mobile/` (Main Application Target)

Organized by feature area rather than by architectural layer (a mix of MVC and MVVM directories):

- **`AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`** — application/scene lifecycle entry points.
- **`TabBarController.swift`** — root `UITabBarController`; wires up the four top-level tabs (Home, Today, Safety, Resources).
- **`MainContainerViewController.swift`** — container view controller referenced by `TabBarController` as the "Home" tab; hosts `MapViewController` and drawer stack management (conforms to `MainDrawerViewDelegate`, per `berkeley-mobile/Drawer/MainDrawerViewDelegate.swift`).
- **`BerkeleyMobile+Injection.swift`** — central `Factory` `Container` extension registering the app's view models for dependency injection.

### Feature Directories

- **`Home/`** — the map-centric home tab. Subdirectories:
  - `Home/Map/` and `Home/Map/MapDataSource/` — `MapViewController.swift`, `MapMarker`, `MapMarkerDetailView.swift`, `MapDataSource.swift` (Firestore-backed `DataSource` conformance).
  - `Home/Dining/` and `Home/Dining/DiningDataSource/` — dining hall menu views/data source.
  - `Home/Fitness/`, `Home/Fitness/GymDataSource/`, `Home/Fitness/GymClassDataSource/`, `Home/Fitness/GymOccupancy/` — gym/fitness data and occupancy view model shared with the widget extension.
  - `Home/Libraries/` and `Home/Libraries/LibraryDataSource/` — library resource views/data source.
  - `Home/Guides/` — campus guides feature.
  - `Home/Home Drawer/` — `BMHomeSectionListView.swift` and related home-tab drawer content.
  - `Home/Search/` — `SearchAnnotation.swift` and search-related map annotations.
  - `HomeViewModel.swift` — singleton (`.singleton` scope in `BerkeleyMobile+Injection.swift`) view model coordinating home-tab data and detail presentation.
- **`Today/`** — the "Today" tab (`TodayView`), with `Today/Tiles/News Tile/` and `Today/Tiles/Weather Tile/` subdirectories for individual tile views.
- **`Safety/`** — the "Safety" tab (`SafetyView`), backed by `SafetyViewModel.swift` and `BMNetworkingManager.fetchSafetyLogs()`.
- **`Resources/`** — the "Resources" tab (`ResourcesView`), backed by `ResourcesViewModel.swift` and `BMNetworkingManager.fetchResourcesCategories()`.
- **`Events/`** and **`Events/EventDataSource/`** — academic/campus-wide events calendar feature (`EventsViewModel.swift`, `EventsDataService`, `BMEventCalendarEntry.swift`, `CalendarView.swift`).
- **`FeedbackForm/`** — `FeedbackFormPresenter.swift`, `FeedbackFormViewModel.swift`; presented conditionally from `TabBarController` via `FeedbackFormPresenterDelegate`.
- **`Debug/`** — `DebugView.swift`, `DebugViewModel.swift`; presented only in `#if DEBUG` builds via a shake gesture (`TabBarController.swift:29-38`).

### Shared/Cross-Cutting Directories

- **`Common/`** — shared UI components:
  - `Common/DetailView/` — `DetailView.swift`, `LocationDetailView.swift`, `OverviewCardView.swift`, `OpenTimesCardView.swift`, `OpenTimesCardSwiftUIView.swift`, `DescriptionCardView.swift`.
  - `Common/FilterView/` — `FilterView.swift`, `FilterViewCell.swift`.
  - `Common/Images/` — `ImageLoader.swift` (singleton image cache/loader used by `HasImage` protocol conformers).
  - `Common/BMAlert.swift` — shared alert model type (`BMAlertType`).
- **`Drawer/`** — the sliding-drawer UI framework used across the app: `DrawerViewController.swift`, `DrawerViewDelegate.swift` (protocol + default pan-gesture implementations), `MainDrawerViewDelegate.swift` (drawer-stack management), `SearchDrawerViewDelegate.swift`, `BarView.swift`.
- **`Data/`** — data-layer infrastructure:
  - `DataManager.swift` — singleton fetch coordinator over a fixed list of `DataSource` types.
  - `DataSource.swift` — the `DataSource` protocol each feature's data source conforms to.
  - `BMNetworkingManager.swift` — direct Firestore query methods for Safety and Resources features.
  - `Data/ItemProtocols/` — shared model protocols: `BMCalendarEvent.swift`, `CanFavorite.swift`, `HasImage.swift`, `HasLocation.swift`.
  - `Data/PropertyWrappers/` — custom property wrappers (e.g. `@Display`, used in `BMEventCalendarEntry.swift:25`).
- **`Utils/`** — general-purpose extensions: `Date+Extension.swift`, `UserDefaults+Extension.swift`, `TimeInterval+Ext.swift`, `Logger+Ext.swift`, `UIScrollView+GestureRecognizer.swift`, `View+Extension.swift`.
- **`Assets/`** and **`Assets.xcassets`** — non-code assets. `Assets/Colors/` contains per-feature color extensions (`Colors+Text.swift`, `Colors+MapMarker.swift`, `Colors+Calendar.swift`, `Colors+TagView.swift`, `Colors+GymClass.swift`, `Colors+ActionButton.swift`, `Colors+AlertView.swift`, `Colors+StudyPact.swift`, `Colors+Event.swift`, `Colors+Resource.swift`), and `Assets/Fonts/` contains font definitions (`BMFont`, referenced in `TabBarController.swift:52`). `Assets.xcassets` contains image sets organized into subgroups (`Map Icons/`, `Food Restrictions/`, `Theme/`, `StudyPact/`, `Favorite Icons/`).
- **`Resources/`** (note: distinct from the `Resources/` feature directory above if present at a different path — confirm path before use) and **`Base.lproj/`** — localization/storyboard base resources.

## `BerkeleyMobileWidget/` (Widget Extension Target)

- `BerkeleyMobileWidgetBundle.swift` — the `WidgetBundle` entry point for the extension.
- `GymOccupancyWidget.swift` — implements `TimelineProvider`/`GymOccupancyProvider`, reusing `GymOccupancyViewModel` (from the main app's `Home/Fitness/GymOccupancy/` directory) to fetch gym occupancy data for the home-screen widget.
- `Assets.xcassets` — widget-specific asset catalog (`AppIcon`, `AccentColor`, `WidgetBackground`).
- `Info.plist` — extension bundle configuration.

## Architectural Boundaries

- The main app target and the widget extension target share Swift source that is compiled into both targets (e.g. `GymOccupancyViewModel`, used by `TabBarController`-injected view models in the main app and directly instantiated in `BerkeleyMobileWidget/GymOccupancyWidget.swift:27`). Not found in codebase: a distinct shared framework/module target — sharing appears to happen via multi-target membership of the same source files within the single Xcode project, based on the two-target `project.pbxproj` structure.
- Data flows one direction from Firestore (via `DataManager` or `BMNetworkingManager`) into feature-specific `ViewModel` types, which are exposed to UIKit view controllers and SwiftUI views through the `Factory`-based `Container` registered in `BerkeleyMobile+Injection.swift`.
- The `Drawer/` module is a reusable UI framework consumed by multiple features (`MapViewController` conforms to `SearchDrawerViewDelegate`; `MainContainerViewController` conforms to `MainDrawerViewDelegate`), not a single feature's private implementation.

## Not Found in Codebase

- A dedicated test target directory (see `docs/testing-standards.md` for the full evidence trail).
- A monorepo boundary or additional platform targets beyond the two iOS targets described above.
