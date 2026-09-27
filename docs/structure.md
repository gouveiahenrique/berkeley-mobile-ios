# Repository Structure

## Top-Level Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/              # Main application target source
├── BerkeleyMobileWidget/         # WidgetKit extension target source
├── berkeley-mobile.xcodeproj/    # Xcode project (targets, build settings, schemes)
├── berkeley-mobile.xcworkspace/  # CocoaPods-integrated workspace (open this in Xcode)
├── Pods/                         # Vendored CocoaPods dependencies (checked in)
├── Podfile / Podfile.lock        # CocoaPods dependency manifest
├── app_preview_images/           # Screenshots referenced by README.md
├── README.md, CONTRIBUTING.md, LICENSE.md
```

This layout was confirmed directly (`find . -maxdepth 2`). `berkeley-mobile.xcodeproj/project.pbxproj` defines exactly two native targets: `berkeley-mobile` (`com.apple.product-type.application`) and `BerkeleyMobileWidgetExtension` (`com.apple.product-type.app-extension`). No other target types (e.g. unit test bundles, UI test bundles) are declared.

## `berkeley-mobile/` (Main Application Target)

Top-level files:
- `AppDelegate.swift`, `AppDelegate+Migration.swift` — app delegate and a separate extension file for migration-related logic.
- `SceneDelegate.swift` — scene lifecycle, creates the root `TabBarController`.
- `MainContainerViewController.swift` — hosts the SwiftUI `HomeView` inside the Home/Map tab.
- `TabBarController.swift` — root `UITabBarController` wiring the four tabs (Home, Today, Safety, Resources).
- `BerkeleyMobile+Injection.swift` — `Factory` `Container` extension declaring all `Factory<ViewModel>` definitions used for dependency injection app-wide.
- `Info.plist`, `berkeley-mobile.entitlements` — target configuration and capabilities.

### Feature folders (each is a UI feature module, generally paired with a `ViewModel` and/or a Firestore-backed `DataSource`)

- **`Home/`** — the Home/Map tab. Contains `HomeView.swift` (SwiftUI), `HomeViewModel.swift` (`ObservableObject`, aggregates dining/library/gym data via `DataManager`), `OpenClosedStatusManager.swift`/`OpenClosedStatusView.swift`, `RedirectionManager.swift`. Sub-folders:
  - `Dining/` — `DiningHallsView.swift`, `DiningDetailView.swift`, `MenuItemIconCacheManager.swift`, plus a `DiningDataSource/` sub-folder with Firestore-backed models (`BMDiningLocation.swift`, etc.).
  - `Fitness/` — `FitnessView.swift`, `GymDetailViewController.swift` (UIKit, wrapped for SwiftUI). Sub-folders `GymDataSource/` (`GymDataSource.swift`, `Gym.swift`, `BMGym.swift`), `GymClassDataSource/` (`GymClassDataSource.swift`), `GymOccupancy/` (`GymOccupancyViewModel.swift`, `GymOccupancyView.swift` — the same view model is reused by the widget extension; see `docs/tech.md`).
  - `Guides/` — `Guide.swift` (model), `GuidesView.swift` + `GuidesViewModel.swift` (Firestore-backed), `GuideDetailView.swift`, `GuidePlacesStackedCollageView.swift`.
  - `Home Drawer/` — `BMHomeSectionListView.swift`, `HomeSectionListRowView.swift`, `HomeDrawerRowImageView.swift` (Views), `HomeDrawerPinViewModel.swift` (view model); reuses models from other Home sub-folders rather than defining its own.
  - `Libraries/` — `LibrariesView.swift`, `LibraryDetailViewController.swift` (UIKit); `LibraryDataSource/` sub-folder with `LibraryDataSource.swift` (Firestore) and `BMLibrary.swift` (model).
  - `Map/` — `MapViewController.swift` (UIKit, MapKit-based), `MapMarkerDetailView.swift`, `MapMarkersDropdownView.swift`, `MapUserLocationButton.swift`, `SearchResultCell.swift`, `MapPlacemark.swift`; `MapDataSource/` sub-folder with `MapDataSource.swift` (Firestore) and `MapMarker.swift` (model).
  - `Search/` — `SearchViewModel.swift` (defines `SearchResultsViewDelegate`), `SearchResultsView.swift`, `SearchResultsListRowView.swift`, `SearchBarView.swift`, `RecentSearchManager.swift`, `SearchAnnotation.swift`.
- **`Safety/`** — the Safety tab. `SafetyView.swift` (SwiftUI), `SafetyViewModel.swift` (defines `BMSafetyLog: Identifiable, Codable, Hashable` and fetches via `BMNetworkingManager.shared.fetchSafetyLogs()`, an `async`/`await` Firestore call — distinct from the `DataSource` protocol pattern used elsewhere), `SafetyMapView.swift`, `SafetyMapMarker.swift`, `SafetyLogDetailView.swift`, `SafetyLogFilterButton.swift`, `SafetyViewFilterScrollView.swift`.
- **`Today/`** — the Today tab. `TodayView.swift`, `TodayTileView.swift`, `TodayTileLayout.swift`, `TodayTileAttributes.swift`. Sub-folder `Tiles/` contains per-tile MVVM pairs: `News Tile/` (`NewsArticle.swift`, `NewsDataViewModel.swift` — Firestore, `NewsTileView.swift`) and `Weather Tile/` (`WeatherDataViewModel.swift`, `TodayWeatherTileView.swift`).
- **`Events/`** — calendar/event views: `EventsView.swift`, `CalendarView.swift`, `CalendarSectionView.swift`, `EventsDateSectionView.swift`, `EventRowView.swift`, `EventDetailView.swift`, `AllDayEventBannerView.swift`, `BMAddedCalendarStatusOverlayView.swift`. Sub-folder `EventDataSource/` contains `EventsViewModel.swift` (Firestore) and `BMEventCalendarEntry.swift` (a model conforming to the shared `BMCalendarEvent` protocol from `Data/ItemProtocols/`).
- **`FeedbackForm/`** — `FeedbackFormView.swift`, `FeedbackFormViewModel.swift` (Firestore), `FeedbackFormPresenter.swift` (defines `FeedbackFormPresenterDelegate`, used by `TabBarController` to decide when/how to present the feedback form modally).
- **`Common/`** — shared, reusable SwiftUI components with no view-model or data-source counterparts: `ActionButton.swift`, `BMActionButton.swift`, `BMAlert.swift`, `BMCachedAsyncImageView.swift`, `BMContentUnavailableView.swift`, `BMDrawerView.swift`, `BMFilterButton.swift`, `BMSegmentedControlView.swift`, `BMTopBlobView.swift`, `CardView.swift`, `CollapsibleCardView.swift`, `DetailTapGestureRecognizer.swift`, `IconPairView.swift`, `ReviewPrompter.swift`, `ScrollingStackView.swift`, `TagView.swift`. Sub-folders:
  - `DetailView/` — reusable "detail page" building blocks (`DetailView.swift` defines `protocol DetailView`/`DetailViewDelegate`; `DescriptionCardView.swift`, `LocationDetailView.swift`, `OverviewCardView.swift`, `OpenTimesCardView.swift` (UIKit) and `OpenTimesCardSwiftUIView.swift` (SwiftUI counterpart)) driven by the `HasOpenTimes`/`HasLocation` protocols.
  - `FilterView/` — `FilterView.swift` (defines `FilterViewDelegate`), `FilterViewCell.swift`.
  - `Images/` — `ImageLoader.swift`, `ImageViewCell.swift` (defines `protocol ImageViewCell`).
- **`Drawer/`** — the custom bottom-sheet ("drawer") interaction system: `DrawerViewController.swift`, `SearchDrawerViewController.swift` (UIKit), `BarView.swift`, and delegate protocols `DrawerViewDelegate.swift`, `MainDrawerViewDelegate.swift`, `SearchDrawerViewDelegate.swift`. File header comments (`bm-persona`, "RJ Pimentel") indicate this is part of the app's original codebase, predating the SwiftUI-based feature modules.
- **`Debug/`** — internal debug menu, reachable via a shake gesture in `DEBUG` builds only (`TabBarController.motionEnded`, guarded by `#if DEBUG`): `DebugView.swift` (SwiftUI), `DebugViewModel.swift` (declared as an `@Observable` class rather than `ObservableObject` — the only view model in the survey using the newer Observation-framework style).
- **`Utils/`** — pure extensions and small standalone helpers with no view/view-model/data-source structure: `AtomicDictionary.swift`, `CLLocation+Extension.swift`, `Collection+Extension.swift`, `Date+Extension.swift`, `DayOfWeek.swift`, `DepthButtonStyle.swift`, `Logger+Ext.swift`, `NSCoding+Extension.swift`, `String+Extension.swift`, `TimeInterval+Ext.swift`, `UIDevice+Extensions.swift`, `UIImage+Extensions.swift`, `UIScrollView+GestureRecognizer.swift`, `UIStackView+Extensions.swift`, `UIView+Extensions.swift`, `UIViewController+Extensions.swift`, `UserDefaults+Extension.swift`, `View+Extension.swift`, `WeeklyHours.swift`.

### `Data/` — Shared Data Layer

- `DataManager.swift` — singleton fetch coordinator/cache (see `docs/tech.md` for behavior).
- `DataSource.swift` — the `DataSource` protocol implemented by feature data sources.
- `BMConstants.swift` — app-wide constants: display strings, map region/zoom constants, and Firestore collection names (`safetyLogsCollectionName`, `resourceCategoriesCollectionName`).
- `BMError.swift` — a `LocalizedError`-conforming `enum BMError` for calendar-related error cases.
- `BMEventManager.swift`, `BMLocationManager.swift`, `BMNetworkingManager.swift` — singletons for calendar-event handling, location services, and direct async Firestore access, respectively.
- `SortingFunctions.swift` — shared sorting helpers.
- `ItemProtocols/` — shared model-capability protocols composed by feature model structs: `BMCalendarEvent.swift`, `CanFavorite.swift`, `HasImage.swift`, `HasLocation.swift`, `HasName.swift`, `HasOpenClosedStatus.swift`, `HasOpenTimes.swift`, `HasPhoneNumber.swift`, `HasWebsite.swift`, `SearchItem.swift`.
- `PropertyWrappers/Display.swift` — a `@propertyWrapper struct Display<T>` that trims whitespace/invalid characters from `String`/`String?` values, used on model display fields (e.g. `@Display var name: String` in `BMLibrary`).

### Other top-level folders

- `Assets.xcassets/`, `Assets/Colors/`, `Assets/Fonts/`, `Resources/`, `Base.lproj/` — asset catalogs, custom color/font definitions, and localization resources.

## `BerkeleyMobileWidget/` (Widget Extension Target)

- `BerkeleyMobileWidgetBundle.swift` — `@main` `WidgetBundle` entry point; configures Firebase independently of the host app process.
- `GymOccupancyWidget.swift` — the single declared widget (`GymOccupancyWidget`), its `TimelineProvider` (`GymOccupancyProvider`), timeline entry type (`GymOccupancyEntry`), and its SwiftUI entry views.
- `Assets.xcassets/`, `Info.plist` — extension-specific assets and the `NSExtensionPointIdentifier: com.apple.widgetkit-extension` declaration.

Both targets share source files across process boundaries at the Xcode project level: `project.pbxproj` shows `GymOccupancyViewModel.swift` compiled into the `Sources` build phase of both the `berkeley-mobile` and `BerkeleyMobileWidgetExtension` targets, rather than the widget maintaining its own copy.

## Architectural Boundaries

- Feature folders under `Home/` each own their own Firestore-backed `*DataSource` and model files in a nested folder named after the data source (e.g. `LibraryDataSource/`, `GymDataSource/`, `MapDataSource/`), separate from the folder's `View`/`ViewModel` files at the parent level.
- The `Common/` folder is a one-way dependency: feature folders (`Home/`, `Safety/`, `Today/`, `Events/`, `FeedbackForm/`) reference shared components from `Common/`, but `Common/` files were not observed importing feature-specific types.
- `Data/` is the lowest-level shared layer: `DataManager`, `DataSource`, and `ItemProtocols/` are consumed by feature data sources and models across `Home/`, `Events/`, and `Today/`'s News tile — not found to be reciprocally dependent on any feature folder.
- `Drawer/` is a UIKit-only interaction layer consumed by `MainContainerViewController` (via `MainDrawerViewDelegate`) and `Home/Search` (via `SearchDrawerViewDelegate`).
