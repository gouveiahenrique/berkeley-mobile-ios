# Repository Structure

LEVEL 1 statements throughout unless marked otherwise. Paths are relative to the repository root.

## Top-Level Layout

- `berkeley-mobile/` — main application target source (product name `bm-persona`, bundle id `org.asuc.ASUC`).
- `BerkeleyMobileWidget/` — source for the `BerkeleyMobileWidgetExtension` WidgetKit extension target.
- `berkeley-mobile.xcodeproj/`, `berkeley-mobile.xcworkspace/` — Xcode project and workspace files, including the shared scheme `berkeley-mobile.xcscheme`.
- `Pods/` — CocoaPods-managed third-party source, generated from `Podfile`/`Podfile.lock`.
- `app_preview_images/` — screenshots referenced by `README.md`.
- `README.md`, `CONTRIBUTING.md`, `LICENSE.md` — project documentation.
- `Podfile`, `Podfile.lock` — CocoaPods dependency manifest and lockfile.

## `berkeley-mobile/` Module Breakdown

Folder responsibilities below are inferred from the files each folder contains (file counts are `.swift` files only, from `find berkeley-mobile/<dir> -name '*.swift'`).

- **`Data/`** (19 files) — data-access layer: `DataManager.swift` (fetch orchestration/cache), `DataSource.swift` (fetch protocol), `BMNetworkingManager.swift` (direct Firestore queries for safety logs and resource categories), `BMLocationManager.swift` (`CLLocationManager` wrapper), `BMConstants.swift` (shared constants). Subfolders: `ItemProtocols/` (e.g. `HasImage.swift`), `PropertyWrappers/`.
- **`Home/`** (51 files) — the largest module; hosts the map/home tab and its sub-features. Subfolders: `Map/` (`MapViewController.swift`, `MapDataSource/`), `Libraries/` (`LibraryDataSource/`), `Fitness/` (`GymDataSource/`, `GymClassDataSource/`, `GymOccupancy/`), `Dining/` (`DiningDataSource/`), `Guides/`, `Search/` (e.g. `RecentSearchManager.swift`), `Home Drawer/`.
- **`Common/`** (26 files) — shared UI components used across modules, e.g. `BMSegmentedControlView.swift`. Subfolders: `DetailView/` (e.g. `OverviewCardView.swift`), `FilterView/`, `Images/` (`ImageLoader.swift`, `ImageViewCell.swift`).
- **`Utils/`** (19 files) — general-purpose helpers, e.g. `AtomicDictionary.swift`, `UserDefaults+Extension.swift`.
- **`Events/`** (10 files) — calendar/event functionality, e.g. `BMEventCalendarEntry.swift`, `EventsViewModel.swift`. Subfolder: `EventDataSource/`.
- **`Today/`** (9 files) — the "Today" SwiftUI tab (`TodayView`, referenced from `TabBarController.swift`). Subfolders: `Tiles/News Tile/`, `Tiles/Weather Tile/`.
- **`Safety/`** (7 files) — the "Safety" SwiftUI tab; `SafetyViewModel.swift` defines `BMSafetyLog`, `SafetyView` (referenced from `TabBarController.swift`), and crime-filtering logic.
- **`Drawer/`** (6 files) — bottom-drawer UI protocol/implementation: `MainDrawerViewDelegate.swift`, `DrawerViewController.swift`.
- **`Assets/`** (12 `.swift` files, distinct from the `Assets.xcassets` image catalog) — includes `Colors/Colors.swift` (`BMColor`).
- **`Resources/`** (4 files) — the "Resources" SwiftUI tab (`ResourcesView`, referenced from `TabBarController.swift`) and `BMResourceCategory` model (referenced from `BMNetworkingManager.swift`).
- **`FeedbackForm/`** (3 files) — in-app feedback form, presented via `FeedbackFormPresenter` (`TabBarController.swift` conforms to `FeedbackFormPresenterDelegate`).
- **`Debug/`** (2 files) — `DebugView`, shown only in `#if DEBUG` builds via a shake gesture (`TabBarController.swift:motionEnded`).
- **`Assets.xcassets/`**, **`Base.lproj/`** — image catalog and base localization resources (not `.swift` source).
- Root-level files directly in `berkeley-mobile/`: `AppDelegate.swift`, `AppDelegate+Migration.swift`, `BerkeleyMobile+Injection.swift`, `SceneDelegate.swift`, `MainContainerViewController.swift`, `TabBarController.swift`, `Info.plist`, `berkeley-mobile.entitlements`.

## `BerkeleyMobileWidget/` Breakdown

- `BerkeleyMobileWidgetBundle.swift` — widget bundle entry point (not read in full during this analysis).
- `GymOccupancyWidget.swift` — defines `GymOccupancyEntry`, `GymOccupancyProvider` (`TimelineProvider`), `GymOccupancyWidgetEntryView`/`GymOccupancyWidgetRowView` (SwiftUI views), and the `GymOccupancyWidget` (`Widget`) itself. Depends on `GymOccupancyViewModel` (defined in the main app module, per `GymOccupancyLocation`/`.rsf`/`.stadium` usage).
- `Assets.xcassets`, `Info.plist` — widget-extension resources and extension-point declaration (`com.apple.widgetkit-extension`).

## Architectural Boundaries

LEVEL 1:
- The main app target and the widget extension target are separate Xcode targets (confirmed via `productType = "com.apple.product-type.application"` vs. `"com.apple.product-type.app-extension"` in `project.pbxproj`) with independent `Info.plist`, entitlements, and deployment targets (`18.0` vs. `17.0`).
- Data fetching is centralized behind the `DataSource` protocol and `DataManager` singleton for the sources it lists (`MapDataSource`, `LibraryDataSource`, `GymDataSource`); other consumers (`BMNetworkingManager`, `GymOccupancyViewModel`, `GymClassDataSource`) query Firestore independently of `DataManager`.
- UIKit and SwiftUI are interleaved rather than strictly separated: SwiftUI views are embedded in UIKit containers via `UIHostingController` (`TabBarController.swift`, `MainContainerViewController.swift`), and a UIKit `MapViewController` is embedded inside a SwiftUI `HomeView`.

## Not found in codebase

- A dedicated test target/folder (no directory or file matching `*Tests*` was found outside `Pods/`).
- A `Package.swift` (Swift Package Manager is used only for dependency declarations inside the `.xcodeproj`, not to define this repository as a package).
