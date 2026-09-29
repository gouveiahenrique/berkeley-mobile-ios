# Repository Structure

## Top-Level Layout

Direct evidence from directory listing at repository root:

| Path | Contents |
|---|---|
| `berkeley-mobile/` | Main application source (Swift). Primary app target. |
| `BerkeleyMobileWidget/` | WidgetKit Home Screen widget extension source. |
| `berkeley-mobile.xcodeproj/` | Xcode project file, shared scheme (`berkeley-mobile.xcscheme`). |
| `berkeley-mobile.xcworkspace/` | Xcode workspace (used because CocoaPods is present), including `swiftpm/Package.resolved` for Swift Package Manager dependencies. |
| `Podfile`, `Podfile.lock` | CocoaPods dependency manifest and lockfile. |
| `Pods/` | Vendored CocoaPods dependency sources (Firebase, GoogleSignIn, gRPC, etc.). Not application code. |
| `app_preview_images/` | Static marketing screenshots referenced by `README.md`. |
| `README.md`, `CONTRIBUTING.md`, `LICENSE.md` | Project documentation. |

## `berkeley-mobile/` Module Organization

Direct evidence from the top-level subdirectories of `berkeley-mobile/`:

- **`AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`, `TabBarController.swift`, `MainContainerViewController.swift`, `BerkeleyMobile+Injection.swift`** — root-level application bootstrap and dependency-injection wiring files (not in a subfolder).
- **`Assets/`** — `Colors/Colors.swift` (`BMColor` namespace of static colors), `Fonts.swift`, `Fonts/`.
- **`Common/`** — cross-feature reusable SwiftUI/UIKit view components: `CardView.swift`, `CollapsibleCardView.swift`, `BMAlert.swift`, `BMActionButton.swift`, `BMCachedAsyncImageView.swift`, `BMDrawerView.swift`, `BMFilterButton.swift`, `BMSegmentedControlView.swift`, `TagView.swift`, `IconPairView.swift`, `ScrollingStackView.swift`, `ReviewPrompter.swift`, `ActionButton.swift`, `DetailTapGestureRecognizer.swift`, `BMContentUnavailableView.swift`, `BMTopBlobView.swift`, plus subfolders `DetailView/` and `FilterView/`, and `Images/` (`ImageLoader.swift`, `ImageViewCell.swift`).
- **`Data/`** — data layer: `DataManager.swift` (singleton fetch orchestrator, hardcodes the list of `DataSource` types to fetch: `MapDataSource`, `LibraryDataSource`, `GymDataSource`), `DataSource.swift` (protocol contract implemented by feature-specific data sources), `BMNetworkingManager.swift` (Firestore async queries for Safety Logs and Resource Categories), `BMLocationManager.swift`, `BMConstants.swift`, `BMEventManager.swift`, `SortingFunctions.swift`, `BMError.swift`, and subfolders `ItemProtocols/` (shared model capability protocols: `HasImage`, `HasLocation`, `HasName`, `HasWebsite`, `HasPhoneNumber`, `HasOpenClosedStatus`, `HasOpenTimes`, `CanFavorite`, `SearchItem`, `BMCalendarEvent`) and `PropertyWrappers/` (`Display.swift`).
- **`Debug/`** — `DebugView.swift`, `DebugViewModel.swift`; reachable only in `DEBUG` builds via device shake (`TabBarController.swift`).
- **`Drawer/`** — bottom-sheet drawer UIKit infrastructure: `DrawerViewController.swift`, `DrawerViewDelegate.swift`, `MainDrawerViewDelegate.swift`, `SearchDrawerViewController.swift`, `SearchDrawerViewDelegate.swift`, `BarView.swift`.
- **`Events/`** — campus events feature: `CalendarView.swift` (+`CalendarViewModel`), `CalendarSectionView.swift`, `EventsView.swift`, `EventsDateSectionView.swift`, `EventRowView.swift`, `EventDetailView.swift`, `AllDayEventBannerView.swift`, `BMAddedCalendarStatusOverlayView.swift`, and `EventDataSource/` (`EventsViewModel.swift`, `BMEventCalendarEntry.swift`).
- **`FeedbackForm/`** — `FeedbackFormPresenter.swift`, `FeedbackFormView.swift`, `FeedbackFormViewModel.swift`.
- **`Home/`** — the largest feature area, organized as a tab root (`HomeView.swift`, `HomeViewModel.swift`) with sub-features each following a `<Feature>DataSource/` + view(s) + optional view-model pattern:
  - `Map/` — `MapViewController.swift`, `MapDataSource/` (`MapDataSource.swift`), `MapMarkerDetailView.swift`, `MapMarkersDropdownView.swift`, `MapPlacemark.swift`, `MapUserLocationButton.swift`, `SearchResultCell.swift`.
  - `Libraries/` — `LibrariesView.swift`, `LibraryDetailViewController.swift`, `LibraryDataSource/` (`LibraryDataSource.swift`).
  - `Dining/` — `DiningHallsView.swift`, `DiningDetailView.swift`, `MenuItemIconCacheManager.swift`, `DiningDataSource/`.
  - `Fitness/` — `FitnessView.swift`, `GymDetailViewController.swift`, `GymDataSource/` (`GymDataSource.swift`), `GymClassDataSource/`, `GymOccupancy/` (`GymOccupancyViewModel.swift`, shared with the widget extension).
  - `Guides/` — `GuidesView.swift`, `GuideDetailView.swift`, `Guide.swift`, `GuidesViewModel.swift`, `GuidePlacesStackedCollageView.swift`.
  - `Search/` — `SearchViewModel.swift`, `SearchBarView.swift`, `SearchAnnotation.swift`, `SearchResultsView.swift`, `SearchResultsListRowView.swift`, `RecentSearchManager.swift`.
  - `Home Drawer/` (folder name contains a space) — `HomeDrawerPinViewModel.swift`, `HomeSectionListRowView.swift`, `BMHomeSectionListView.swift`, `HomeDrawerRowImageView.swift`.
  - `OpenClosedStatusManager.swift`, `OpenClosedStatusView.swift`, `RedirectionManager.swift` — root-level Home helpers.
- **`Resources/`** — `ResourcesView.swift`, `ResourcesViewModel.swift`, `ResourcesSectionDropdown.swift`, `SafariWebView.swift`.
- **`Safety/`** — `SafetyView.swift`, `SafetyViewModel.swift`, `SafetyMapView.swift`, `SafetyMapMarker.swift`, `SafetyLogDetailView.swift`, `SafetyLogFilterButton.swift`, `SafetyViewFilterScrollView.swift`.
- **`Today/`** — `TodayView.swift`, `TodayTileView.swift`, `TodayTileLayout.swift`, `TodayTileAttributes.swift`, and `Tiles/` containing `Weather Tile/` and `News Tile/` (`NewsDataViewModel.swift`).
- **`Utils/`** — Foundation/UIKit type extensions and small utilities: `Date+Extension.swift`, `String+Extension.swift`, `Collection+Extension.swift`, `CLLocation+Extension.swift`, `TimeInterval+Ext.swift`, `NSCoding+Extension.swift`, `View+Extension.swift`, `UIView+Extensions.swift`, `UIViewController+Extensions.swift`, `UIStackView+Extensions.swift`, `UIScrollView+GestureRecognizer.swift`, `UIImage+Extensions.swift`, `UIDevice+Extensions.swift`, `UserDefaults+Extension.swift` (typed `UserDefaultsKeys` enum), `Logger+Ext.swift` (centralizes `os.Logger` instances per view model), `AtomicDictionary.swift`, `DayOfWeek.swift`, `WeeklyHours.swift`, `DepthButtonStyle.swift`.

## `BerkeleyMobileWidget/` Module Organization

- `BerkeleyMobileWidgetBundle.swift` — widget bundle entry point.
- `GymOccupancyWidget.swift` — `GymOccupancyEntry`, `GymOccupancyProvider` (`TimelineProvider`), `GymOccupancyWidgetRowView`.
- `Assets.xcassets/` — `AppIcon.appiconset`, `AccentColor.colorset`, `WidgetBackground.colorset`.
- `Info.plist` — extension configuration.

This target reuses `GymOccupancyViewModel` from `berkeley-mobile/Home/Fitness/GymOccupancy/`, per the `Podfile` target `BerkeleyMobileWidgetExtension` also depending on `Firebase/Firestore`.

## Architectural Boundaries

- **Feature-folder organization**: each top-level folder under `berkeley-mobile/` corresponds to one product feature/tab (Home, Events, Safety, Resources, Today) or one cross-cutting concern (Data, Common, Utils, Assets, Drawer, Debug, FeedbackForm).
- **Data-source pattern**: features that fetch Firestore-backed collections implement the `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift`) and are centrally registered in `DataManager`'s `kDataSources` array (`berkeley-mobile/Data/DataManager.swift:12-16`) — currently `MapDataSource`, `LibraryDataSource`, `GymDataSource`. Other features (Safety, Resources, Today's News tile) call Firestore directly through their own view model or through `BMNetworkingManager`, rather than through `DataManager`/`DataSource`.
- **Dependency injection boundary**: `BerkeleyMobile+Injection.swift` centralizes `FactoryKit` `Container` extensions for view models consumed via SwiftUI's `@InjectedObject`/`@Injected` property wrappers (e.g. `berkeley-mobile/Events/CalendarView.swift:63`, `berkeley-mobile/TabBarController.swift:15`).
- **UIKit/SwiftUI boundary**: `TabBarController` (UIKit) hosts SwiftUI root views via `UIHostingController` for the Today, Safety, and Resources tabs, while the Home tab uses a UIKit `MainContainerViewController`.
