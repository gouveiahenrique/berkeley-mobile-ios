# Repository Structure

## Top-Level Layout

Directly observed at repository root:

- `berkeley-mobile/` — main application target source directory.
- `berkeley-mobile.xcodeproj/` — Xcode project definition (`project.pbxproj`).
- `berkeley-mobile.xcworkspace/` — CocoaPods-generated workspace used to build the project.
- `BerkeleyMobileWidget/` — source for a second build target, `BerkeleyMobileWidgetExtension` (an iOS widget extension; `productType = "com.apple.product-type.app-extension"` in `project.pbxproj`).
- `Pods/` — CocoaPods-managed third-party dependency sources (generated; not hand-maintained).
- `Podfile` / `Podfile.lock` — CocoaPods dependency manifest and lockfile.
- `app_preview_images/` — screenshot images referenced from `README.md`.
- `README.md`, `CONTRIBUTING.md`, `LICENSE.md` — project documentation.

Not found in codebase: a dedicated test target directory (no directory named `Tests`, `*Tests`, or `*UITests` was found under the repository root outside of `Pods/`).

## `berkeley-mobile/` — Application Target

### Root files

- `AppDelegate.swift` — `UIApplicationDelegate` implementation; app launch sequence (Firebase configuration, data prefetch, location/notification setup). See `docs/tech.md`.
- `AppDelegate+Migration.swift` — version-based migration logic run on app update.
- `SceneDelegate.swift` — scene lifecycle handling (referenced from `AppDelegate.swift`; not read in full during this analysis).
- `TabBarController.swift` — root `UITabBarController` composing the four main tabs (Home/Map, Today, Safety, Resources).
- `BerkeleyMobile+Injection.swift` — `FactoryKit` `Container` extension registering view models for dependency injection.
- `Info.plist` — app bundle configuration (usage descriptions for calendar/location, URL schemes for Google Sign-In, scene manifest).
- `berkeley-mobile.entitlements` — app capability entitlements file.
- `GoogleService-Info.plist` — Firebase configuration file reference (contents not inspected).

### `Assets/` and `Assets.xcassets/`
Font files (`Assets/Fonts`), color definitions (`Assets/Colors`), and the Xcode asset catalog (`Assets.xcassets`) containing app icons and image sets organized into subfolders: `Favorite Icons`, `Food Restrictions`, `Map Icons`, `StudyPact`, `Theme`, plus standalone image sets.

### `Common/`
Shared, reusable UI components used across feature modules. Directly observed files include `BMActionButton.swift`, `BMAlert.swift`, `BMCachedAsyncImageView.swift`, `BMContentUnavailableView.swift`, `BMDrawerView.swift`, `BMFilterButton.swift`, `BMSegmentedControlView.swift`, `BMTopBlobView.swift`, `CardView.swift`, `CollapsibleCardView.swift`, `IconPairView.swift`, `ScrollingStackView.swift`, `TagView.swift`, `ReviewPrompter.swift`, `DetailTapGestureRecognizer.swift`, `ActionButton.swift`. Subdirectories `Common/DetailView`, `Common/FilterView`, `Common/Images` hold related detail-view and filter-view components (e.g. `Common/DetailView/OverviewCardView.swift`, `Common/DetailView/LocationDetailView.swift`).

### `Data/`
Core data-layer infrastructure, not feature-specific:
- `DataManager.swift` — singleton coordinator that fetches and caches data from registered `DataSource` types.
- `DataSource.swift` — the `DataSource` protocol (`fetchItems`, `fetchDispatch`) implemented by feature-specific data sources.
- `BMNetworkingManager.swift` — singleton wrapping additional Firestore queries (safety logs, resource categories) using `async`/`await` and `Codable` decoding (`data(as:)`).
- `BMLocationManager.swift` — singleton wrapping `CLLocationManager`.
- `BMEventManager.swift` — event-related data handling (not read in full).
- `SortingFunctions.swift` — shared sorting comparators (e.g. `SortingFunctions.sortClose` used by `HasLocation.locationComparator()`).
- `BMError.swift` — shared `Error` enum (`BMError`) with `LocalizedError` conformance for calendar-related errors.
- `BMConstants.swift` — shared constants (e.g. `BMConstants.mapBoundsRegion`, `BMConstants.diningSectionTitle`, Firestore collection name constants).
- `Data/ItemProtocols/` — shared protocols implemented by domain model types, including `SearchItem.swift`, `HasLocation.swift` (location + distance-to-user logic), `HasImage` (referenced from `HomeDrawerSectionRowItemType` in `Home/HomeViewModel.swift`), `BMCalendarEvent.swift`.
- `Data/PropertyWrappers/` — custom Swift property wrappers (contents not enumerated in this analysis).

### `Debug/`
`DebugView.swift` and `DebugViewModel.swift` — a debug-only UI, presented via device-shake gesture in `TabBarController.motionEnded(_:with:)`, gated behind `#if DEBUG`.

### `Drawer/`
Generic bottom-drawer UI infrastructure shared across screens: `DrawerViewController.swift`, `DrawerViewDelegate.swift`, `SearchDrawerViewController.swift`, `SearchDrawerViewDelegate.swift`, `MainDrawerViewDelegate.swift`, `BarView.swift`.

### `Events/`
Calendar/events feature: `CalendarView.swift`, `EventDetailView.swift`, `EventRowView.swift`, `EventsView.swift`, `EventsDateSectionView.swift`, `EventsDateSectionView.swift`, `CalendarSectionView.swift`, `AllDayEventBannerView.swift`, `BMAddedCalendarStatusOverlayView.swift`. Subdirectory `Events/EventDataSource/` includes `BMEventCalendarEntry.swift`.

### `FeedbackForm/`
`FeedbackFormPresenter.swift`, `FeedbackFormView.swift`, `FeedbackFormViewModel.swift` — presents a feedback form; `FeedbackFormPresenter` is injected into `TabBarController` via `@Injected(\.feedbackFormPresenter)` and its delegate callback (`feedbackFormDidPresent`) is implemented by `TabBarController` (`TabBarController.swift:76-82`).

### `Home/`
The primary tab, containing the map/home experience and several sub-features:
- `HomeViewModel.swift` — `ObservableObject` aggregating dining halls, libraries, and gyms for the home drawer.
- `Home/Dining/`, `Home/Dining/DiningDataSource/` — dining feature and its `DataSource` implementation (`BMDiningLocation.swift` observed).
- `Home/Fitness/`, `Home/Fitness/GymDataSource/`, `Home/Fitness/GymClassDataSource/`, `Home/Fitness/GymOccupancy/` — gym feature, including `GymDataSource.swift`, `GymClassDataSource.swift`, and gym occupancy-specific code (`GymOccupancyViewModel` referenced in `BerkeleyMobile+Injection.swift`).
- `Home/Guides/` — guides feature (contents not enumerated in this analysis).
- `Home/Home Drawer/` — `BMHomeSectionListView.swift` and related home-drawer list UI.
- `Home/Libraries/`, `Home/Libraries/LibraryDataSource/` — library feature, including `LibraryDataSource.swift` and `BMLibrary.swift`.
- `Home/Map/`, `Home/Map/MapDataSource/` — map feature: `MapViewController.swift` (a `UIViewController` hosting `MKMapView`, search bar, marker detail view), `MapDataSource.swift` (fetches map markers from Firestore), `MapMarkerDetailView.swift`, `MapPlacemark.swift`.
- `Home/Search/` — `SearchViewModel.swift` (an `@Observable` class managing search state, recent searches, and search-result selection).

### `Resources/`
Campus resources feature: `ResourcesView.swift`, `ResourcesViewModel.swift`, `ResourcesSectionDropdown.swift`, `SafariWebView.swift` (in-app web view, likely for external resource links).

### `Safety/`
Safety feature: `SafetyView.swift`, `SafetyViewModel.swift`, `SafetyMapView.swift`, `SafetyMapMarker.swift`, `SafetyViewFilterScrollView.swift`, `SafetyLogFilterButton.swift`, `SafetyLogDetailView.swift`. Backed by `BMNetworkingManager.fetchSafetyLogs()` (`Data/BMNetworkingManager.swift:20-26`), which decodes into `BMSafetyLog`.

### `Today/`
"Today" tab feature composed of a tile layout system: `TodayView.swift`, `TodayTileLayout.swift`, `TodayTileView.swift`, `TodayTileAttributes.swift`. Subdirectories `Today/Tiles/News Tile` and `Today/Tiles/Weather Tile` hold individual tile implementations (`NewsDataViewModel`, `WeatherDataViewModel` referenced in `BerkeleyMobile+Injection.swift`).

### `Utils/`
General-purpose Swift extensions and utility types, not specific to any feature: `AtomicDictionary.swift` (thread-safe dictionary used by `DataManager`), `Collection+Extension.swift`, `View+Extension.swift`, `DayOfWeek.swift`, `NSCoding+Extension.swift`, `UIStackView+Extensions.swift`, `String+Extension.swift`, `CLLocation+Extension.swift` (implements `distanceFromUser()` used by `HasLocation`), `UIDevice+Extensions.swift`, `UIScrollView+GestureRecognizer.swift`, `Date+Extension.swift`, `UserDefaults+Extension.swift` (typed `UserDefaultsKeys` enum + accessor extension), `WeeklyHours.swift`, `UIViewController+Extensions.swift`, `UIView+Extensions.swift`, `TimeInterval+Ext.swift`, `UIImage+Extensions.swift`, `DepthButtonStyle.swift`, `Logger+Ext.swift`.

### `Base.lproj/`
Localization resources (base language `.lproj` directory).

## `BerkeleyMobileWidget/` — Widget Extension Target

- `BerkeleyMobileWidgetBundle.swift` — widget bundle entry point.
- `GymOccupancyWidget.swift` — a WidgetKit widget showing gym occupancy data.
- `Assets.xcassets` — widget-specific asset catalog.
- `Info.plist` — widget extension bundle configuration.

## Architectural Boundaries

- **Data layer vs. feature layer:** `berkeley-mobile/Data/` holds cross-cutting data infrastructure (the `DataSource` protocol, `DataManager`, shared item protocols in `Data/ItemProtocols/`), while feature-specific `DataSource` implementations (e.g. `GymDataSource`, `LibraryDataSource`, `MapDataSource`) live inside their respective feature directories under `Home/`.
- **Dependency direction:** Feature `DataSource` types conform to the `DataSource` protocol defined in `Data/DataSource.swift` and are registered centrally in `Data/DataManager.swift:12-16`; `DataManager` is the single point through which feature view models (e.g. `HomeViewModel`, `MapViewController`) request data (`DataManager.shared.fetch(source:)`).
- **Dependency injection boundary:** View model construction and lifetime (`.shared`, `.singleton`) is centralized in `BerkeleyMobile+Injection.swift` using `FactoryKit`, rather than each view/view-controller constructing its own view model directly (`MapViewController.swift:168-170` shows a view controller both constructing a `SearchViewModel` and separately registering it into the `Container`).
- **UIKit/SwiftUI boundary:** `TabBarController` (UIKit) hosts SwiftUI views via `UIHostingController` (`TabBarController.swift:17-20`), and `MapViewController` (UIKit) embeds SwiftUI views (`SearchBarView`, `SearchResultsView`) the same way (`MapViewController.swift:180-189`). Not found in codebase: an exhaustive inventory of every UIKit/SwiftUI boundary point across all features.
