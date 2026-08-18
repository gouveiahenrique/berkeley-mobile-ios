# Repository Structure

## Top-Level Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/                 # Main app target source
├── BerkeleyMobileWidget/            # Widget extension target source
├── berkeley-mobile.xcodeproj/       # Xcode project (targets, schemes, build settings)
├── berkeley-mobile.xcworkspace/     # CocoaPods-generated workspace (build entry point)
├── Podfile / Podfile.lock           # CocoaPods dependency manifest
├── app_preview_images/              # Screenshots used in README.md
├── README.md / CONTRIBUTING.md / LICENSE.md
```

`Pods/` (CocoaPods-managed third-party sources) is present on disk but is dependency-manager-generated content, not first-party repository structure.

## `berkeley-mobile/` (main app target)

Discovered subfolders and their responsibilities, based on the files they contain:

- **`AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`** — application/scene lifecycle entry points at the target root (not inside a subfolder).
- **`MainContainerViewController.swift`, `TabBarController.swift`** — root view controller composition, also at the target root.
- **`BerkeleyMobile+Injection.swift`** — central `FactoryKit` dependency-injection container extension (`Container`), declaring `Factory<...>` accessors for the app's view models.
- **`Data/`** — data access layer. Contains `DataManager.swift` (in-memory cache/coordinator over `DataSource` types), `DataSource.swift` (fetch protocol), `BMNetworkingManager.swift` (direct Firestore access for safety logs/resource categories), `BMEventManager.swift`, `BMError.swift`.
  - **`Data/ItemProtocols/`** — shared protocols implemented by domain model structs, e.g. `HasLocation.swift`, `HasImage.swift`, `SearchItem.swift`.
  - **`Data/PropertyWrappers/`** — custom property wrappers (e.g. the `AtomicDictionary` type used by `DataManager`).
- **`Home/`** — the Home tab and its domain areas, each in its own subfolder: `Home/Map` (campus map, `MapViewController`, `MapDataSource`), `Home/Dining` (dining halls), `Home/Fitness` (gyms and gym classes: `GymDataSource`, `GymClassDataSource`), `Home/Libraries` (`LibraryDataSource`), `Home/Guides`, `Home/Search` (`SearchViewModel`, recent-search persistence), and `Home/Home Drawer`. `Home/HomeViewModel.swift` is the shared view model for this tab.
- **`Today/`** — the Today tab (`TodayView.swift`, `TodayTileView.swift`, `TodayTileLayout.swift`, `TodayTileAttributes.swift`), with `Today/Tiles/` containing individual tile implementations (`News Tile`, `Weather Tile` subfolders observed).
- **`Safety/`** — the Safety tab: `SafetyViewModel.swift` (defines `BMSafetyLog`, `BMSafetyLogFilterState`), `SafetyMapView.swift`, `SafetyMapMarker.swift`, `SafetyLogDetailView.swift`.
- **`Events/`** — academic calendar / campus-wide events, with `Events/EventDataSource/` containing `EventsViewModel.swift` (`EventsDataService`, `EventsViewModel`).
- **`FeedbackForm/`** — in-app feedback form flow (`FeedbackFormPresenter.swift`, `FeedbackFormPresenterDelegate` protocol, `FeedbackFormViewModel`).
- **`Drawer/`** — reusable bottom-sheet/drawer presentation system: `DrawerViewController.swift`, `DrawerViewDelegate.swift`, `MainDrawerViewDelegate.swift`, `SearchDrawerViewController.swift`, `SearchDrawerViewDelegate.swift`, `BarView.swift`.
- **`Common/`** — shared UI components used across domain tabs.
  - **`Common/DetailView/`** — `DetailView.swift`, `OverviewCardView.swift`, `LocationDetailView.swift`, `DescriptionCardView.swift`, `OpenTimesCardView.swift`, `OpenTimesCardSwiftUIView.swift`.
  - **`Common/FilterView/`** — `FilterView.swift`, `FilterViewCell.swift`.
  - **`Common/Images/`** — `ImageLoader.swift` (shared image loading/caching singleton).
- **`Debug/`** — debug-only UI (`DebugView`, `DebugViewModel`), gated behind `#if DEBUG` in `TabBarController.swift`.
- **`Utils/`** — extensions on foundation/UIKit types (`Date+Extension.swift`, `String+Extension.swift`, `Collection+Extension.swift`, `CLLocation+Extension.swift`, `UIView+Extensions.swift`, `UIViewController+Extensions.swift`, `UIImage+Extensions.swift`, `UIDevice+Extensions.swift`, `UIStackView+Extensions.swift`, `UIScrollView+GestureRecognizer.swift`, `NSCoding+Extension.swift`, `UserDefaults+Extension.swift`, `TimeInterval+Ext.swift`, `Logger+Ext.swift`).
- **`Assets/`** — design-token-style Swift sources: `Assets/Colors/` (`Colors+Resource.swift`, `Colors+Text.swift`, `Colors+Calendar.swift`) and `Assets/Fonts/`.
- **`Assets.xcassets`** — Xcode asset catalog (app icon, images, colors) as image sets/color sets rather than Swift source.
- **`Resources/`, `Base.lproj/`** — additional bundled resource files and localization base directory.
- **`Info.plist`, `berkeley-mobile.entitlements`** — target configuration (Info.plist keys, app entitlements).

## `BerkeleyMobileWidget/` (widget extension target)

- `BerkeleyMobileWidgetBundle.swift` — the `WidgetBundle` entry point for the extension.
- `GymOccupancyWidget.swift` — a single widget implementation (gym occupancy).
- `Assets.xcassets`, `Info.plist` — extension-specific resources/configuration.

## Architectural Boundaries (observed)

- The main app target and the widget extension target are separate `PBXNativeTarget`s with independent bundle identifiers and deployment targets (see `docs/tech.md`); both depend on `Firebase/Firestore` per the `Podfile`. `berkeley-mobile/BerkeleyMobile+Injection.swift` (the `FactoryKit` DI container) belongs only to the `berkeley-mobile` app target's `PBXSourcesBuildPhase` in `project.pbxproj`, not to `BerkeleyMobileWidgetExtension`'s — so the widget extension does not share this DI container and must wire any dependencies (including its own Firestore access) independently. The widget extension's own source (`BerkeleyMobileWidget/`) was not deep-dived in this pass beyond confirming its two Swift files and target definition.
- Within the main target, domain features under `Home/`, `Safety/`, `Events/`, `Today/` each define their own `*ViewModel` type and, where Firestore-backed, their own data-fetching type (`*DataSource` conforming to `DataSource`, or a dedicated service such as `EventsDataService`/`BMNetworkingManager`). `DataManager` is the shared coordinator only for the three `DataSource` types it lists explicitly (`MapDataSource`, `LibraryDataSource`, `GymDataSource`); other Firestore reads (safety logs, resource categories, events) bypass `DataManager` and call Firestore directly from their own service type.
- Dependency wiring for view models is centralized in one file, `berkeley-mobile/BerkeleyMobile+Injection.swift`, rather than being distributed across feature folders.
