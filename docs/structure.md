# Repository Structure

## Top-Level Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/                 # Main app target source
├── berkeley-mobile.xcodeproj/       # Xcode project file, schemes
├── berkeley-mobile.xcworkspace/     # Workspace (CocoaPods + SwiftPM)
├── BerkeleyMobileWidget/            # Widget extension target
├── Pods/                            # CocoaPods-managed dependencies (checked in)
├── app_preview_images/              # Screenshots used in README.md
├── Podfile / Podfile.lock           # CocoaPods dependency manifest
├── README.md / CONTRIBUTING.md / LICENSE.md
```

## `berkeley-mobile/` (Main App Target)

Top-level files:
- `AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift` — app/scene lifecycle.
- `BerkeleyMobile+Injection.swift` — `FactoryKit` `Container` extension registering all view-model factories used across the app.
- `MainContainerViewController.swift`, `TabBarController.swift` — root UI navigation containers.
- `berkeley-mobile.entitlements` — app entitlements (`aps-environment`, `com.apple.developer.weatherkit`).
- `Info.plist` — usage descriptions (calendar, location) and app configuration.

Subdirectories:

- **`Data/`** — Core data layer.
  - `DataManager.swift` — singleton (`DataManager.shared`) that fetches and caches results from a fixed list of `DataSource` types (`kDataSources`: `MapDataSource`, `LibraryDataSource`, `GymDataSource`), keyed by type name, with a minimum re-fetch interval (`fetchInterval` = 3600s).
  - `DataSource.swift` — protocol defining `fetchItems(_:)` and a shared `fetchDispatch: DispatchGroup`.
  - `BMNetworkingManager.swift` — singleton wrapping direct Firestore queries for Safety Logs and Resource Categories.
  - `BMLocationManager.swift` — singleton (`NSObject`, `CLLocationManagerDelegate`) wrapping `CLLocationManager`, posts `.locationUpdated` notifications.
  - `BMEventManager.swift`, `BMConstants.swift`, `BMError.swift`.
  - `ItemProtocols/` — small protocols describing item capabilities: `CanFavorite`, `HasImage`, `HasLocation`, `HasName`, `HasOpenClosedStatus`, `HasOpenTimes`, `HasPhoneNumber`, `HasWebsite`, `SearchItem`, `BMCalendarEvent`.
  - `PropertyWrappers/Display.swift` — a custom property wrapper.

- **`Home/`** — the main tab's feature area, itself split by sub-feature:
  - `Map/` (+ `MapDataSource/`) — `MapViewController` (UIKit), `MapDataSource` (fetches map markers/MPD rooms).
  - `Dining/` (+ `DiningDataSource/`) — `DiningHallsViewModel` (`@Observable`, Firestore-backed).
  - `Fitness/` (+ `GymClassDataSource/`, `GymDataSource/`, `GymOccupancy/`).
  - `Libraries/` (+ `LibraryDataSource/`).
  - `Guides/` — `GuidesViewModel` (`@Observable`, Firestore-backed), `GuideDetailView`, `GuidePlacesStackedCollageView`.
  - `Search/` — `SearchViewModel`, `SearchBarView`, `SearchResultsView`, `RecentSearchManager`.
  - `Home Drawer/` — home-specific drawer UI.
  - `HomeViewModel.swift`, `OpenClosedStatusManager.swift`, `MenuItemIconCacheManager.swift` (directly under `Home/`).

- **`Safety/`** — `SafetyViewModel.swift` (`@Observable` via `ObservableObject`, SwiftUI), models `BMSafetyLog`, filter state `BMSafetyLogFilterState`; fetches via `BMNetworkingManager.shared.fetchSafetyLogs()`.

- **`Events/`** (+ `EventDataSource/`) — `EventsViewModel.swift` (`@MainActor @Observable`), `EventsDataService` (Firestore-backed), `BMEventCalendarEntry`.

- **`Resources/`** — `ResourcesViewModel.swift`, `ResourcesView.swift`, `ResourcesSectionDropdown.swift`; fetches via `BMNetworkingManager.shared.fetchResourcesCategories()`.

- **`Today/`** (+ `Tiles/News Tile`, `Tiles/Weather Tile`) — `TodayView.swift`, `TodayTileView.swift`, `TodayTileLayout.swift`, `TodayTileAttributes.swift`.

- **`FeedbackForm/`** — `FeedbackFormPresenter.swift`, `FeedbackFormView.swift`, `FeedbackFormViewModel.swift`.

- **`Debug/`** — `DebugView.swift`, `DebugViewModel.swift` (registered only under `#if DEBUG` in `BerkeleyMobile+Injection.swift`).

- **`Drawer/`** — shared drawer UI infrastructure (`DrawerViewController` referenced from `MapViewController`).

- **`Common/`** — shared UI components: `BMActionButton`, `BMAlert`, `BMCachedAsyncImageView`, `BMContentUnavailableView`, `BMDrawerView`, `BMFilterButton`, `BMSegmentedControlView`, `BMTopBlobView`, `CardView`, `CollapsibleCardView`, `TagView`, `IconPairView`, `ScrollingStackView`, plus `DetailView/` (e.g., `OpenTimesCardSwiftUIView.swift`, SwiftUI) and `FilterView/`.

- **`Utils/`** — extensions and small utilities: `AtomicDictionary`, `CLLocation+Extension`, `Collection+Extension`, `Date+Extension`, `DayOfWeek`, `DepthButtonStyle`, `Logger+Ext`, `NSCoding+Extension`, `String+Extension`, `TimeInterval+Ext`, `UIDevice+Extensions`, `UIImage+Extensions`, `UIScrollView+GestureRecognizer`, `UIStackView+Extensions`, `UIView+Extensions`, `UIViewController+Extensions`, `UserDefaults+Extension`, `View+Extension`, `WeeklyHours`.

- **`Assets.xcassets/`, `Assets/`** — image assets, colors, fonts.
- **`Resources/`** (asset directory, distinct from the `Resources/` feature folder above — confirm by path when navigating) — Not fully enumerated; contains non-Swift resource files per `ls` output.
- **`Base.lproj/`** — localization base.

## `BerkeleyMobileWidget/` (Widget Extension Target)

- `BerkeleyMobileWidgetBundle.swift` — widget bundle entry point.
- `GymOccupancyWidget.swift` — the single widget implemented in this target.
- `Info.plist`, `Assets.xcassets/`.

## Architectural Boundaries

- The main app target and the widget extension target are separate build products (per `project.pbxproj` `PBXNativeTarget` entries: `berkeley-mobile` and `BerkeleyMobileWidgetExtension`), each with independent CocoaPods dependencies declared in `Podfile`.
- Dependency injection is centralized in `berkeley-mobile/BerkeleyMobile+Injection.swift` using `FactoryKit`'s `Container` extension pattern; feature view models are resolved via `Container.shared.<name>ViewModel.resolve()` (e.g., in `MapViewController.init()`).
- Data-source implementations (`MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`) conform to the `DataSource` protocol and are registered centrally in `DataManager.swift`'s `kDataSources` array — this list is the single point of coupling between `DataManager` and individual data sources.
- Feature-specific Firestore access is not centralized: `BMNetworkingManager` handles Safety/Resources, while `DiningHallsViewModel`, `EventsDataService`, and `GuidesViewModel` each instantiate their own `Firestore.firestore()` and query collections directly. Not found in codebase: a documented reason for this split.
