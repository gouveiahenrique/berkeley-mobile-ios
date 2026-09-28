# Repository Structure

## Top-Level Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/              # Main app target source
├── BerkeleyMobileWidget/         # WidgetKit extension target source
├── berkeley-mobile.xcodeproj/    # Xcode project (build settings, schemes)
├── berkeley-mobile.xcworkspace/  # Xcode workspace (app + Pods + SPM)
├── Pods/                         # CocoaPods-managed dependencies (generated)
├── app_preview_images/           # Screenshots referenced by README.md
├── Podfile / Podfile.lock        # CocoaPods dependency manifest
├── README.md / CONTRIBUTING.md / LICENSE.md
```

Two Xcode targets exist, per `berkeley-mobile.xcodeproj/project.pbxproj`:
1. `berkeley-mobile` (product `Berkeley.app`) — the main application, sourced from `berkeley-mobile/`.
2. `BerkeleyMobileWidgetExtension` — a WidgetKit extension, sourced from `BerkeleyMobileWidget/`.

No test target is declared (see `docs/testing-standards.md`).

## `berkeley-mobile/` — App Target Module Map

| Folder | Responsibility (evidence) |
|---|---|
| `AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`, `TabBarController.swift`, `MainContainerViewController.swift` | App lifecycle, root window/scene setup, root tab navigation. |
| `BerkeleyMobile+Injection.swift` | `FactoryKit` `Container` extension registering the app's view models for dependency injection. |
| `Data/` | Cross-feature data layer: `DataManager` (fetch orchestration/caching), `DataSource` protocol, `BMNetworkingManager` (Firestore access for Safety/Resources), `BMEventManager` (EventKit calendar integration), `BMLocationManager`, `BMError`, `BMConstants`; subfolders `ItemProtocols/` (shared model capability protocols: `HasImage`, `HasLocation`, `HasName`, `HasOpenClosedStatus`, `HasOpenTimes`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `SearchItem`, `BMCalendarEvent`) and `PropertyWrappers/` (`Display`). |
| `Home/` | Home tab feature, with per-domain subfolders each pairing a data source with its view(s): `Dining/` (+ `DiningDataSource/`, `MenuItemIconCacheManager.swift`), `Fitness/` (+ `GymDataSource/`, `GymClassDataSource/`, `GymOccupancy/`), `Libraries/` (+ `LibraryDataSource/`), `Map/` (+ `MapDataSource/`), `Guides/`, `Home Drawer/`, `Search/`. Root files: `HomeView.swift`, `HomeViewModel.swift`, `OpenClosedStatusManager.swift`, `OpenClosedStatusView.swift`, `RedirectionManager.swift`. |
| `Today/` | "Today" tab: `TodayView.swift`, `TodayTileAttributes.swift`, `TodayTileLayout.swift`, `TodayTileView.swift`, and `Tiles/` containing `News Tile/` and `Weather Tile/` subfolders. |
| `Events/` | Campus events feature: `EventsView.swift`, `CalendarView.swift`, `CalendarSectionView.swift`, `EventDetailView.swift`, `EventRowView.swift`, `EventsDateSectionView.swift`, `AllDayEventBannerView.swift`, `BMAddedCalendarStatusOverlayView.swift`, and `EventDataSource/` containing `BMEventCalendarEntry.swift` and `EventsViewModel.swift`. |
| `Safety/` | Safety log feature: `SafetyView.swift`, `SafetyViewModel.swift`, `SafetyMapView.swift`, `SafetyMapMarker.swift`, `SafetyLogDetailView.swift`, `SafetyLogFilterButton.swift`, `SafetyViewFilterScrollView.swift`. Uses `BMNetworkingManager.fetchSafetyLogs()`. |
| `Resources/` | Campus resources feature: `ResourcesView.swift`, `ResourcesViewModel.swift`, `ResourcesSectionDropdown.swift`, `SafariWebView.swift`. Uses `BMNetworkingManager.fetchResourcesCategories()`. |
| `FeedbackForm/` | `FeedbackFormView.swift`, `FeedbackFormViewModel.swift`, `FeedbackFormPresenter.swift`. |
| `Debug/` | `DebugView.swift`, `DebugViewModel.swift` — registered in DI only under `#if DEBUG`. |
| `Drawer/` | Shared bottom-drawer UI mechanism: `DrawerViewController.swift`, `DrawerViewDelegate.swift`, `MainDrawerViewDelegate.swift`, `SearchDrawerViewController.swift`, `SearchDrawerViewDelegate.swift`, `BarView.swift`. |
| `Common/` | Shared UI components used across features: `CardView.swift`, `CollapsibleCardView.swift`, `BMActionButton.swift`/`ActionButton.swift`, `BMAlert.swift`, `BMCachedAsyncImageView.swift`, `BMContentUnavailableView.swift`, `BMDrawerView.swift`, `BMFilterButton.swift`, `BMSegmentedControlView.swift`, `BMTopBlobView.swift`, `TagView.swift`, `IconPairView.swift`, `ScrollingStackView.swift`, `ReviewPrompter.swift`, `DetailTapGestureRecognizer.swift`; subfolders `DetailView/` (generic detail-screen components: `DetailView.swift`, `LocationDetailView.swift`, `OverviewCardView.swift`, `DescriptionCardView.swift`, `OpenTimesCardView.swift`/`OpenTimesCardSwiftUIView.swift`), `FilterView/`, `Images/` (`ImageLoader.swift`, `ImageViewCell.swift`). |
| `Assets/Colors/` | `BMColor` base struct (`Colors.swift`) plus per-feature color extensions (`Colors+ActionButton.swift`, `Colors+AlertView.swift`, `Colors+Calendar.swift`, `Colors+Event.swift`, `Colors+GymClass.swift`, `Colors+MapMarker.swift`, `Colors+Resource.swift`, `Colors+StudyPact.swift`, `Colors+TagView.swift`, `Colors+Text.swift`). |
| `Assets/Fonts` | Font assets. |
| `Assets.xcassets` | Image/icon/color asset catalog (app icons, map icons, food-restriction icons, theme illustrations). |
| `Utils/` | General-purpose extensions and helpers with no feature affiliation: `Date+Extension.swift`, `CLLocation+Extension.swift`, `Collection+Extension.swift`, `String+Extension.swift`, `TimeInterval+Ext.swift`, `NSCoding+Extension.swift`, `UIDevice+Extensions.swift`, `UIImage+Extensions.swift`, `UIScrollView+GestureRecognizer.swift`, `UIStackView+Extensions.swift`, `UIView+Extensions.swift`, `UIViewController+Extensions.swift`, `View+Extension.swift`, `UserDefaults+Extension.swift` (`UserDefaultsKeys` enum + typed accessors), `Logger+Ext.swift` (per-view-model `os.Logger` instances), `AtomicDictionary.swift`, `DayOfWeek.swift`, `DepthButtonStyle.swift`, `WeeklyHours.swift`. |
| `Resources` (Info.plist, entitlements) | `Info.plist`, `berkeley-mobile.entitlements` (push notifications dev environment, WeatherKit capability), `Base.lproj` (localization base), `Resources/` folder (asset/text resources, distinct from the `Resources/` *feature* folder listed above — both exist at different path depths). |

## `BerkeleyMobileWidget/` — Widget Extension Module

- `BerkeleyMobileWidgetBundle.swift` — `@main` widget bundle entry point.
- `GymOccupancyWidget.swift` — implements `GymOccupancyProvider: TimelineProvider` and `GymOccupancyEntry: TimelineEntry`, sourcing data via `GymOccupancyViewModel.fetchOccupancyPercentages()` (shared with the main app's DI container).
- `Assets.xcassets`, `Info.plist`.

## Architectural Boundaries and Dependency Relationships

- **Data source → DataManager → ViewModel**: Feature-specific `*DataSource` types (e.g. `MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`) each implement the `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift`) with a `static func fetchItems(_:)` that queries a single Firestore collection directly (e.g. `MapDataSource` queries collection `"Map Marker"`, `LibraryDataSource` queries `"Libraries"`, `GymDataSource` queries `"Gyms"`, `GymClassDataSource` queries `"Gym Classes"`) and a `static var fetchDispatch: DispatchGroup` used to deduplicate concurrent fetches. `DataManager.shared` (singleton) is the sole point that invokes these `fetchItems` calls and caches results by type name; only `MapDataSource`, `LibraryDataSource`, `GymDataSource` are listed in `DataManager`'s `kDataSources` array, meaning `GymClassDataSource` is fetched through a different path than `DataManager.fetchAll()`/`fetch(source:)` (not found registered in `kDataSources`).
- **Firestore access split**: some data (map markers, libraries, gyms, gym classes) is fetched directly from Firestore by each `*DataSource` type; other data (Safety logs, Resource categories) is fetched through the shared `BMNetworkingManager` singleton (`berkeley-mobile/Data/BMNetworkingManager.swift`) using `async throws` methods. Both patterns coexist in the repository.
- **Dependency injection boundary**: View models are constructed exclusively through `Container` factories in `berkeley-mobile/BerkeleyMobile+Injection.swift` (`FactoryKit`), rather than being instantiated ad hoc at call sites (evidenced by call sites like `MapViewController.swift` referencing `HomeViewModel` via injection rather than direct init — confirmed for `HomeViewModel`, `SafetyViewModel`, `EventsViewModel`, and others listed in `docs/tech.md`).
- **UIKit/SwiftUI boundary**: Older/structural navigation (`Drawer/`, `MapViewController`, `GymDetailViewController`, `LibraryDetailViewController`, `TabBarController`) is implemented in UIKit; feature screen content (`HomeView`, `SafetyView`, `EventsView`, `ResourcesView`, `FeedbackFormView`, `TodayView`, `GuidesView`) is implemented in SwiftUI. Both coexist within the same target, with UIKit view controllers hosting SwiftUI views in places (not exhaustively traced beyond files inspected).
- **Widget/app code sharing**: `BerkeleyMobileWidget/GymOccupancyWidget.swift` references `GymOccupancyViewModel`, which is also registered in the main app's `Container` (`berkeley-mobile/BerkeleyMobile+Injection.swift`), indicating shared Swift source/module usage between the two targets. The exact mechanism (shared target membership vs. separate widget-local copy) was not confirmed beyond this reference — not found further verified in inspected areas.
</content>
