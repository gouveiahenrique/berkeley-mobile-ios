# Repository Structure

## Top-Level Layout

Directory listing at repository root (excluding `.git/`, `Pods/`, `.codegraph/`):

```
berkeley-mobile.xcworkspace/       Xcode workspace referencing the main project and Pods project
berkeley-mobile.xcodeproj/         Xcode project (targets: berkeley-mobile, BerkeleyMobileWidgetExtension)
berkeley-mobile/                   Main application source (target "berkeley-mobile")
BerkeleyMobileWidget/               Widget extension source (target "BerkeleyMobileWidgetExtension")
Pods/                               CocoaPods-managed third-party dependencies
Podfile / Podfile.lock              CocoaPods dependency manifest
app_preview_images/                 Static screenshot images referenced from README.md
README.md, CONTRIBUTING.md, LICENSE.md   Project-level documentation
```

## `berkeley-mobile/` (main application target)

Subdirectories observed directly under `berkeley-mobile/`:

- `AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`, `TabBarController.swift`, `MainContainerViewController.swift`, `BerkeleyMobile+Injection.swift` — application entry points and app-wide wiring (see `docs/tech.md`).
- `Assets/`, `Assets.xcassets/` — image and color asset catalogs, including `berkeley-mobile/Assets/Colors/Colors.swift` (`BMColor` struct defining app color palette).
- `Base.lproj/` — localization resources.
- `Common/` — shared UI components reused across features, e.g. `CardView.swift`, `CollapsibleCardView.swift`, `BMActionButton.swift`, `BMAlert.swift`, `BMDrawerView.swift`, `TagView.swift`, and subfolders `DetailView/` (e.g. `DetailView.swift`, `OverviewCardView.swift`, `OpenTimesCardView.swift`), `FilterView/` (`FilterView.swift`, `FilterViewCell.swift`), and `Images/` (`ImageLoader.swift`, `ImageViewCell.swift`).
- `Data/` — data layer: `DataManager.swift`, `DataSource.swift`, `BMNetworkingManager.swift`, `BMLocationManager.swift`, `BMConstants.swift`, `BMError.swift`, `SortingFunctions.swift`, plus `ItemProtocols/` (shared model protocols: `HasImage`, `HasLocation`, `HasName`, `HasOpenTimes`, `HasOpenClosedStatus`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `SearchItem`, `BMCalendarEvent`) and `PropertyWrappers/` (`Display.swift`).
- `Debug/` — `DebugView.swift`, `DebugViewModel.swift` (registered only under `#if DEBUG` in `BerkeleyMobile+Injection.swift`).
- `Drawer/` — bottom-drawer UI infrastructure, e.g. `MainDrawerViewDelegate.swift` (protocol + extension implementing drawer-stack management: `dismissTop`, `coverTop`, `hideTop`, `showTop`, `moveCurrentDrawer`, `showMainDrawer`).
- `Events/` — calendar/events feature: `CalendarView.swift`, `CalendarViewModel`, `EventsViewModel.swift`, `EventDataSource/` (`BMEventCalendarEntry.swift`), plus supporting views (`AllDayEventBannerView.swift`, `BMAddedCalendarStatusOverlayView.swift`, per codegraph blast-radius results).
- `FeedbackForm/` — `FeedbackFormPresenter.swift`, `FeedbackFormView.swift`, `FeedbackFormViewModel.swift`.
- `Home/` — the largest feature area, organized into per-feature subfolders:
  - `Dining/DiningDataSource/` — `DiningHallsViewModel.swift`.
  - `Fitness/GymDataSource/`, `Fitness/GymClassDataSource/`, `Fitness/GymOccupancy/` — gym/fitness data sources and `GymOccupancyViewModel.swift`.
  - `Guides/` — `GuidesViewModel.swift`.
  - `Home Drawer/` — home screen drawer components (directory name contains a space).
  - `Libraries/LibraryDataSource/` — `LibraryDataSource.swift`.
  - `Map/`, `Map/MapDataSource/` — `MapViewController.swift`, `MapDataSource.swift`, `MapPlacemark.swift`.
  - `Search/` — `SearchViewModel.swift`.
  - `HomeViewModel.swift` — top-level home screen view model.
- `Resources/` — `ResourcesViewModel.swift`, `ResourcesView.swift`, `ResourcesSectionDropdown.swift`, `SafariWebView.swift`.
- `Safety/` — `SafetyViewModel.swift`, `SafetyView.swift`, `SafetyMapView.swift`, `SafetyMapMarker.swift`, `SafetyViewFilterScrollView.swift`, `SafetyLogFilterButton.swift`, `SafetyLogDetailView.swift`.
- `Today/` — `TodayView.swift`, `TodayTileView.swift`, `TodayTileLayout.swift`, `TodayTileAttributes.swift`, and `Tiles/` subfolder containing `News Tile/` and `Weather Tile/` (directory names contain spaces).
- `Utils/` — shared utility/extension code, e.g. `UserDefaults+Extension.swift` (referenced in the `DataManager`/`GymClassDataSource` call flow).
- `Info.plist`, `berkeley-mobile.entitlements` — app configuration/entitlements.

## `BerkeleyMobileWidget/` (widget extension target)

- `BerkeleyMobileWidgetBundle.swift` — widget bundle entry point.
- `GymOccupancyWidget.swift` — the single widget implementation (`GymOccupancyWidget: Widget`), reusing `GymOccupancyViewModel` from the main app target.
- `Assets.xcassets/` — widget-specific asset catalog (`AccentColor.colorset`, `AppIcon.appiconset`, `WidgetBackground.colorset`).
- `Info.plist` — extension configuration.

## Architectural Boundaries

- The main app target (`berkeley-mobile`) and the widget extension target (`BerkeleyMobileWidgetExtension`) are declared as separate `PBXNativeTarget` entries in `berkeley-mobile.xcodeproj/project.pbxproj`, each with its own `Podfile` target block. `GymOccupancyViewModel` is shared source between them (evidenced by its use in both `berkeley-mobile/Home/Fitness/GymOccupancy/GymOccupancyViewModel.swift` and `BerkeleyMobileWidget/GymOccupancyWidget.swift`).
- Within `berkeley-mobile/`, feature areas (`Home/Dining`, `Home/Fitness`, `Home/Libraries`, `Home/Map`, `Events`, `Safety`, `Resources`, `FeedbackForm`, `Today`, `Debug`) are organized as sibling folders, each generally containing a view, a view model, and (where backed by Firestore) a data-source or direct-Firestore-access type.
- `Data/` centralizes cross-feature data access contracts (`DataSource` protocol, `DataManager` cache/singleton, `BMNetworkingManager`) and shared model protocols (`ItemProtocols/`), consumed by the `Home/*` and `Safety`/`Resources` feature modules.
- `Common/` centralizes reusable UI components consumed across multiple feature folders (not confirmed exhaustively; observed usage includes detail/filter/image view components).
- No separate test target directories were found in the inspected repository areas (see `docs/testing-standards.md`).
