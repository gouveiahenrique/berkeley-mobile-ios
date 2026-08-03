# Repository Structure

## Top-Level Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/               # Main application target source
├── BerkeleyMobileWidget/          # WidgetKit extension target source
├── berkeley-mobile.xcodeproj/     # Xcode project definition
├── berkeley-mobile.xcworkspace/   # Xcode workspace (CocoaPods + SwiftPM)
├── Pods/                          # CocoaPods-managed dependencies (generated)
├── Podfile / Podfile.lock         # CocoaPods dependency manifest
├── app_preview_images/            # Marketing screenshots referenced in README.md
├── README.md, CONTRIBUTING.md, LICENSE.md
```

## `berkeley-mobile/` (Main Application Target)

Top-level entry point files, directly under `berkeley-mobile/`:
- `AppDelegate.swift`, `AppDelegate+Migration.swift` — application lifecycle, Firebase/notification setup.
- `SceneDelegate.swift` — UIKit scene lifecycle.
- `MainContainerViewController.swift` — container view controller referenced by `TabBarController.swift`.
- `TabBarController.swift` — root `UITabBarController`, wires the four top-level sections (Today, Map/Home, Safety, Resources).
- `BerkeleyMobile+Injection.swift` — `FactoryKit` container extension registering view-model factories.
- `Info.plist`, `berkeley-mobile.entitlements` — app configuration and entitlements.

### Feature Folders

Each folder groups a screen/feature area's views, view models, and (where applicable) data sources:

- **`Home/`** — the main map/home experience.
  - `HomeViewModel.swift` — `ObservableObject` aggregating dining, library, and gym data fetched via `DataManager`.
  - `Map/` and `Map/MapDataSource/` — `MapViewController.swift` (UIKit `MKMapViewDelegate`), `MapDataSource.swift` (Firestore-backed `DataSource` implementation for map markers).
  - `Dining/`, `Fitness/` (+ `GymClassDataSource/`, `GymDataSource/`, `GymOccupancy/`), `Libraries/` (+ `LibraryDataSource/`) — dining, gym, and library sub-features, each with their own `DataSource` implementation and detail views.
  - `Guides/`, `Home Drawer/`, `Search/` — supporting UI (drawer rows, guides content, in-app search).
- **`Events/`** — `EventDataSource/` (`BMEventCalendarEntry.swift`, `EventsViewModel.swift`), plus calendar/event UI (`CalendarView.swift`, `EventsView.swift`, `EventDetailView.swift`, etc.).
- **`Safety/`** — `SafetyView.swift`, `SafetyViewModel.swift`, `SafetyMapView.swift`, log/detail views; data is fetched via `BMNetworkingManager.fetchSafetyLogs()`.
- **`Resources/`** — `ResourcesView.swift`, `ResourcesViewModel.swift`; data is fetched via `BMNetworkingManager.fetchResourcesCategories()`.
- **`Today/`** — `TodayView.swift` and tile-based sub-features under `Today/Tiles/` (`News Tile/`, `Weather Tile/`).
- **`FeedbackForm/`** — `FeedbackFormPresenter.swift`, `FeedbackFormView.swift`, `FeedbackFormViewModel.swift`.
- **`Drawer/`** — `DrawerViewController.swift`, `DrawerViewDelegate.swift` (protocol defining pan-gesture-driven drawer positioning), `MainDrawerViewDelegate.swift`, `SearchDrawerViewController.swift`/`SearchDrawerViewDelegate.swift`.
- **`Debug/`** — `DebugView.swift`, `DebugViewModel.swift`; presented via a shake gesture inside `#if DEBUG` in `TabBarController.swift`.

### Shared/Cross-Cutting Folders

- **`Data/`** — core data-layer infrastructure shared across features.
  - `DataSource.swift` — protocol implemented by per-feature data sources (`fetchItems`, `fetchDispatch`).
  - `DataManager.swift` — singleton orchestrating fetches across `kDataSources` (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) and caching results.
  - `BMNetworkingManager.swift` — singleton for Firestore reads not routed through `DataSource`/`DataManager` (Safety logs, Resource categories).
  - `BMLocationManager.swift` — singleton wrapper around `CLLocationManager`.
  - `BMEventManager.swift`, `BMError.swift`, `BMConstants.swift`, `SortingFunctions.swift`.
  - `ItemProtocols/` — shared model protocols: `SearchItem.swift`, `HasLocation.swift`, `HasImage.swift`, `HasName.swift`, `HasOpenClosedStatus.swift`, `HasOpenTimes.swift`, `HasPhoneNumber.swift`, `HasWebsite.swift`, `CanFavorite.swift`, `BMCalendarEvent.swift`.
  - `PropertyWrappers/` — `Display.swift` (a `@propertyWrapper` that trims/sanitizes displayed strings).
- **`Common/`** — reusable UI components used across features: `CardView.swift`, `CollapsibleCardView.swift`, `BMActionButton.swift`, `BMAlert.swift`, `BMCachedAsyncImageView.swift`, `BMContentUnavailableView.swift`, `BMDrawerView.swift`, `BMFilterButton.swift`, `BMSegmentedControlView.swift`, `BMTopBlobView.swift`, `TagView.swift`, `IconPairView.swift`, `ScrollingStackView.swift`, `ReviewPrompter.swift`, plus `DetailView/` (generic detail-screen components) and `FilterView/`, `Images/` subfolders.
- **`Utils/`** — extensions and small utility types: `AtomicDictionary.swift`, `Date+Extension.swift`, `String+Extension.swift`, `Collection+Extension.swift`, `NSCoding+Extension.swift`, `UIView+Extensions.swift`, `UIViewController+Extensions.swift`, `UIImage+Extensions.swift`, `UIStackView+Extensions.swift`, `UIScrollView+GestureRecognizer.swift`, `UserDefaults+Extension.swift`, `UIDevice+Extensions.swift`, `CLLocation+Extension.swift`, `TimeInterval+Ext.swift`, `Logger+Ext.swift`, `DayOfWeek.swift`, `WeeklyHours.swift`, `DepthButtonStyle.swift`, `View+Extension.swift` (SwiftUI `ViewModifier`s such as `PositionAtTopModifier`, `Shadowfy`, `AlertPresentationViewModifier`).
- **`Assets/`, `Assets.xcassets/`, `Base.lproj/`, `Resources/`** — fonts, colors, images, storyboards/localization, and other non-code resources.

## `BerkeleyMobileWidget/` (Widget Extension Target)

- `BerkeleyMobileWidgetBundle.swift` — widget bundle entry point.
- `GymOccupancyWidget.swift` — `TimelineProvider`-based WidgetKit widget (`GymOccupancyProvider`, `GymOccupancyEntry`) displaying gym occupancy.
- `Assets.xcassets/`, `Info.plist` — extension-specific resources and configuration.

## Architectural Boundaries

- The main app target (`berkeley-mobile`) and the widget extension target (`BerkeleyMobileWidgetExtension`) are separate `PBXNativeTarget`s in `project.pbxproj`, each with its own `buildConfigurationList` and dependency set. The widget target depends only on `Firebase/Firestore` (`Podfile:17-20`), a narrower dependency set than the main app.
- Each feature folder under `Home/` pairs a `*DataSource` (Firestore access + parsing) with a `*ViewModel`/`*ViewController` (presentation), consistent with the `DataSource` protocol contract in `Data/DataSource.swift`.
- Cross-feature shared state and singletons live in `Data/` (`DataManager`, `BMNetworkingManager`, `BMLocationManager`); cross-feature shared UI lives in `Common/` and `Utils/`.

## Not Found in Codebase

- No dedicated test target/directory was found (see `docs/testing-standards.md`).
- No monorepo boundary or additional platform-specific source trees (e.g. Android, backend service code) were found in this repository.
