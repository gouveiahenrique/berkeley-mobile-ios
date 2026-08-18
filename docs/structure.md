# Repository Structure

## Top-Level Layout

Evidence: `find` listing of the repository root.

```
.
├── berkeley-mobile/                # Main app target source (174 .swift files)
├── berkeley-mobile.xcodeproj/      # Xcode project (build settings, schemes)
├── berkeley-mobile.xcworkspace/    # CocoaPods-generated workspace (open this, not .xcodeproj)
├── BerkeleyMobileWidget/           # WidgetKit extension target source
├── Pods/                           # CocoaPods-managed third-party dependencies (generated)
├── app_preview_images/             # Screenshots referenced by README.md
├── Podfile / Podfile.lock          # CocoaPods dependency manifest
├── README.md / CONTRIBUTING.md / LICENSE.md
```

`docs/` (this documentation) is generated at the repository root alongside the above.

## `berkeley-mobile/` — Main Application Target

Folder responsibilities below are inferred from the contents observed in each directory (Level 1 evidence — files were read or listed directly).

| Folder | Responsibility (evidence) |
|---|---|
| `AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`, `TabBarController.swift`, `MainContainerViewController.swift`, `BerkeleyMobile+Injection.swift` | App-level entry points, lifecycle, root tab navigation, and the FactoryKit dependency-injection container extension. |
| `Assets/`, `Assets.xcassets/`, `Base.lproj/`, `Resources/` (fonts under `Assets/Fonts`) | Design tokens (`Assets/Colors/*.swift` — per-feature color extensions such as `Colors+MapMarker.swift`, `Colors+GymClass.swift`), fonts (`Assets/Fonts.swift`, custom `Apercu` font family registered in `Info.plist`), and Xcode asset catalogs. |
| `Common/` | Shared, cross-feature UI components: `CardView.swift`, `CollapsibleCardView.swift`, `TagView.swift`, `BMAlert.swift`, `BMActionButton.swift`, `BMCachedAsyncImageView.swift`, plus subfolders `DetailView/` (shared detail-screen card components: `OverviewCardView`, `LocationDetailView`, `OpenTimesCardView`) and `FilterView/` (list-filtering UI: `FilterView.swift`, `FilterViewCell.swift`). Also includes `Images/ImageLoader.swift` (shared image cache) and `ReviewPrompter.swift` (App Store review prompt logic). |
| `Data/` | The shared data layer: `DataManager.swift` (singleton fetch orchestrator), `DataSource.swift` (fetch protocol), `BMNetworkingManager.swift` (async Firestore fetches for Safety/Resources), `BMLocationManager.swift` (CoreLocation wrapper), `BMConstants.swift`, `BMError.swift`, `BMEventManager.swift`, `SortingFunctions.swift`. Subfolders: `ItemProtocols/` (shared model-capability protocols: `SearchItem`, `HasLocation`, `HasImage`, `HasName`, `HasOpenTimes`, `HasOpenClosedStatus`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `BMCalendarEvent`) and `PropertyWrappers/` (`Display.swift`). |
| `Debug/` | `DebugView.swift` / `DebugViewModel.swift` — a `#if DEBUG`-gated debug menu, presented via a shake gesture from `TabBarController.motionEnded`. |
| `Drawer/` | The bottom-sheet/drawer UI framework used to layer content over the map: `DrawerViewController.swift`, `DrawerViewDelegate.swift`, `MainDrawerViewDelegate.swift` (stack management for nested drawers), `SearchDrawerViewController.swift`/`SearchDrawerViewDelegate.swift`, `BarView.swift` (the grabber handle). |
| `Events/` | Campus events feature: `EventsView.swift`, `CalendarView.swift`, `CalendarSectionView.swift`, `EventDetailView.swift`, `EventRowView.swift`, `EventsDateSectionView.swift`, `BMAddedCalendarStatusOverlayView.swift`, plus `EventDataSource/` (`EventsViewModel.swift`, `BMEventCalendarEntry.swift`). |
| `FeedbackForm/` | In-app user feedback: `FeedbackFormView.swift` (SwiftUI form), `FeedbackFormViewModel.swift` (Firestore-backed config fetch + submission), `FeedbackFormPresenter.swift` (presentation-trigger logic). |
| `Home/` | The largest feature area — the Home tab (map-centric) and its sub-features, each in its own subfolder: `Dining/` (`DiningDataSource/`, `DiningHallsView.swift`, `DiningDetailView.swift`), `Fitness/` (`GymDataSource/`, `GymClassDataSource/`, `GymOccupancy/`, `FitnessView.swift`, `GymDetailViewController.swift`), `Guides/` (`GuidesView.swift`, `GuideDetailView.swift`, `GuidesViewModel.swift`), `Home Drawer/` (home-tab drawer list rendering: `BMHomeSectionListView.swift`, `HomeDrawerPinViewModel.swift`), `Libraries/` (`LibraryDataSource/`, `LibrariesView.swift`, `LibraryDetailViewController.swift`), `Map/` (`MapDataSource/`, `MapViewController.swift`, `MapPlacemark.swift`, `MapUserLocationButton.swift`, `MapMarkerDetailView.swift`), `Search/` (`SearchViewModel.swift`, `SearchBarView.swift`, `SearchResultsView.swift`, `RecentSearchManager.swift`). Also contains `HomeView.swift`, `HomeViewModel.swift`, `OpenClosedStatusManager.swift`/`OpenClosedStatusView.swift`, `RedirectionManager.swift`. |
| `Safety/` | Campus safety-log map feature: `SafetyView.swift`, `SafetyViewModel.swift`, `SafetyMapView.swift`, `SafetyMapMarker.swift`, `SafetyLogDetailView.swift`, `SafetyLogFilterButton.swift`, `SafetyViewFilterScrollView.swift`. |
| `Today/` | The Today tab: `TodayView.swift`, `TodayTileView.swift`, `TodayTileLayout.swift`, `TodayTileAttributes.swift`, plus `Tiles/News Tile/` (`NewsArticle.swift`, `NewsDataViewModel.swift`, `NewsTileView.swift`) and `Tiles/Weather Tile/` (`WeatherDataViewModel.swift`, `TodayWeatherTileView.swift`). |
| `Utils/` | General-purpose Swift extensions and helpers, not tied to a single feature: `AtomicDictionary.swift`, `CLLocation+Extension.swift`, `Collection+Extension.swift`, `Date+Extension.swift`, `DayOfWeek.swift`, `DepthButtonStyle.swift`, `Logger+Ext.swift`, `NSCoding+Extension.swift`, `String+Extension.swift`, `TimeInterval+Ext.swift`, `UIDevice+Extensions.swift`, `UIImage+Extensions.swift`, `UIScrollView+GestureRecognizer.swift`, `UIStackView+Extensions.swift`, `UIView+Extensions.swift`, `UIViewController+Extensions.swift`, `UserDefaults+Extension.swift`, `View+Extension.swift`, `WeeklyHours.swift`. |
| `Resources/` | The Resources tab feature (campus resource directory): `ResourcesView.swift`, `ResourcesViewModel.swift`, `ResourcesSectionDropdown.swift`, `SafariWebView.swift`. |

## `BerkeleyMobileWidget/` — Widget Extension Target

Contains `GymOccupancyWidget.swift` and `BerkeleyMobileWidgetBundle.swift` (WidgetKit entry points), its own `Assets.xcassets`, and `Info.plist`. Declared as the `BerkeleyMobileWidgetExtension` target in `Podfile`, depending only on `Firebase/Firestore`.

## Architectural Boundaries and Dependencies

- **Feature folders under `Home/`, `Events/`, `Safety/`, `Resources/`, `Today/`, `FeedbackForm/`** each follow a consistent internal split: a `*DataSource` type (Firestore fetch + parse) or `*ViewModel` type (state/business logic), paired with one or more SwiftUI `View`s or UIKit `UIViewController`s for presentation.
- **`Data/`** is the single shared dependency point for Firestore access patterns and cross-feature model protocols; feature-level data sources (e.g. `MapDataSource`, `LibraryDataSource`, `GymDataSource`) conform to `Data/DataSource.swift`'s `DataSource` protocol and are registered in `Data/DataManager.swift:12-16`'s `kDataSources` list.
- **`Common/`** and `Utils/` are consumed across nearly every feature folder for shared UI components and extensions respectively; they have no dependency back on feature folders (Level 1 evidence from direct inspection of these files; exhaustive dependency-graph verification across all 174 files was not performed).
- **`BerkeleyMobile+Injection.swift`** at the target root is the single registration point for all FactoryKit-managed view models, meaning most feature view models are discoverable from this one file regardless of which folder they live in.
- The **Widget extension** (`BerkeleyMobileWidget/`) is a separate build target/process from the main app target, sharing only the `Firebase/Firestore` pod dependency; no direct code-sharing mechanism (e.g. a shared framework target) was found in the inspected project files.
