# Repository Structure

LEVEL 1 statements below are based on directory listings (`find`) and file contents read via CodeGraph/Read in this session.

## Top-Level Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/              # Main app target source
├── BerkeleyMobileWidget/         # Widget extension target source
├── berkeley-mobile.xcodeproj/    # Xcode project (build settings, schemes)
├── berkeley-mobile.xcworkspace/  # CocoaPods-integrated workspace
├── Pods/                         # Vendored CocoaPods dependencies
├── Podfile / Podfile.lock        # CocoaPods dependency manifest
├── app_preview_images/           # Screenshots used in README.md
├── README.md, CONTRIBUTING.md, LICENSE.md
```

## `berkeley-mobile/` (Main App Target)

- **`AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`** — App/scene lifecycle entry points. `AppDelegate` configures Firebase, notifications, and triggers initial data fetch. `SceneDelegate` sets `TabBarController` as root view controller.
- **`TabBarController.swift`, `MainContainerViewController.swift`** — Root UIKit navigation containers.
- **`BerkeleyMobile+Injection.swift`** — `FactoryKit` `Container` extension registering the app's view-model factories (dependency injection composition root).
- **`Data/`** — Data access layer:
  - `DataManager.swift` — singleton in-memory data cache/fetch coordinator over a fixed list of `DataSource` types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`).
  - `BMNetworkingManager.swift` — singleton wrapping direct Firestore queries (safety logs, resource categories).
  - `DataSource.swift` — the `DataSource` protocol (`fetchItems`, `fetchDispatch`) implemented by per-feature data sources.
  - `BMConstants.swift` — app-wide constants (strings, map regions, Firestore collection names).
  - `BMError.swift` — `BMError` enum (calendar-related errors) conforming to `LocalizedError`.
  - `BMLocationManager.swift`, `BMEventManager.swift`, `SortingFunctions.swift`.
  - `ItemProtocols/` — shared model capability protocols: `HasImage`, `HasLocation`, `HasName`, `HasWebsite`, `CanFavorite`, `HasPhoneNumber`, `HasOpenClosedStatus`, `HasOpenTimes`, `SearchItem`, `BMCalendarEvent`.
  - `PropertyWrappers/Display.swift` — `@Display` property wrapper that trims/sanitizes string values for UI display.
- **`Home/`** — Home tab feature area, organized by sub-feature:
  - `HomeView.swift`, `HomeViewModel.swift` — top-level home screen (SwiftUI `View` + `ObservableObject` view model), composing dining/fitness/library/guide sections.
  - `Map/` — `MapViewController.swift` (UIKit `MKMapView`-based), `MapDataSource/` (`MapDataSource.swift`, `MapMarker.swift`, `MapPlacemark.swift`), `MapMarkerDetailView.swift`, `MapMarkersDropdownView.swift`, `MapUserLocationButton.swift`, `SearchResultCell.swift`.
  - `Dining/` — `DiningHallsView.swift`, `DiningDetailView.swift`, `MenuItemIconCacheManager.swift`, `DiningDataSource/` (referenced from `BMDiningLocation.swift`).
  - `Fitness/` — `FitnessView.swift`, `GymDetailViewController.swift`, `GymDataSource/`, `GymClassDataSource/`, `GymOccupancy/GymOccupancyViewModel.swift`.
  - `Libraries/` — `LibrariesView.swift`, `LibraryDetailViewController.swift`, `LibraryDataSource/LibraryDataSource.swift`.
  - `Guides/` — `GuidesView.swift`, `GuidesViewModel.swift`, `Guide.swift`, `GuideDetailView.swift`, `GuidePlacesStackedCollageView.swift`.
  - `Search/` — `SearchViewModel.swift`, `SearchBarView.swift`, `SearchResultsView.swift`, `SearchResultsListRowView.swift`, `RecentSearchManager.swift`, `SearchAnnotation.swift`.
  - `Home Drawer/` — `HomeDrawerPinViewModel.swift`, `HomeSectionListRowView.swift`, `BMHomeSectionListView.swift`, `HomeDrawerRowImageView.swift`.
  - `OpenClosedStatusManager.swift`, `OpenClosedStatusView.swift`, `RedirectionManager.swift` — cross-cutting home helpers.
- **`Events/`** — Calendar/events feature: `CalendarView.swift`, `CalendarSectionView.swift`, `EventsView.swift`, `EventRowView.swift`, `EventsDateSectionView.swift`, `EventDetailView.swift`, `AllDayEventBannerView.swift`, `BMAddedCalendarStatusOverlayView.swift`, and `EventDataSource/` (contains `BMEventCalendarEntry.swift`, `EventsViewModel.swift`).
- **`Safety/`** — Safety log map feature: `SafetyViewModel.swift` (defines `BMSafetyLog`, `BMSafetyLogFilterState`, `SafetyViewModel`), `SafetyView.swift`, `SafetyMapView.swift`, `SafetyMapMarker.swift`, `SafetyLogDetailView.swift`, `SafetyLogFilterButton.swift`, `SafetyViewFilterScrollView.swift`.
- **`Resources/`** — Campus resources feature: `ResourcesView.swift`, `ResourcesViewModel.swift`, `ResourcesSectionDropdown.swift`, `SafariWebView.swift`.
- **`Today/`** — "Today" tab tiles: `Today/Tiles/Weather Tile/WeatherDataViewModel.swift`, `Today/Tiles/News Tile/`.
- **`FeedbackForm/`** — `FeedbackFormPresenter.swift`, `FeedbackFormView.swift`, `FeedbackFormViewModel.swift` — presenter pattern for a feedback form flow.
- **`Debug/`** — `DebugView.swift`, `DebugViewModel.swift` — debug-only screen (`DebugViewModel` is registered in `BerkeleyMobile+Injection.swift` inside a `#if DEBUG` block).
- **`Drawer/`** — Reusable bottom-drawer UI infrastructure: `DrawerViewController.swift`, `DrawerViewDelegate.swift`, `MainDrawerViewDelegate.swift`, `SearchDrawerViewController.swift`, `SearchDrawerViewDelegate.swift`, `BarView.swift`.
- **`Common/`** — Shared UI components:
  - `DetailView/` — `DetailView.swift`, `DescriptionCardView.swift`, `OverviewCardView.swift`, `OpenTimesCardView.swift`, `OpenTimesCardSwiftUIView.swift`, `LocationDetailView.swift`.
  - `Images/` — `ImageLoader.swift`, `ImageViewCell.swift`.
  - `FilterView/` — `FilterView.swift`, `FilterViewCell.swift`.
  - `BMAlert.swift` — shared alert model (`BMAlert`, `BMAlertType`).
  - `ReviewPrompter.swift` — App Store review prompt logic.
- **`Utils/`** — Extensions and small utilities: `Date+Extension.swift`, `CLLocation+Extension.swift`, `Collection+Extension.swift`, `String+Extension.swift`, `TimeInterval+Ext.swift`, `NSCoding+Extension.swift`, `View+Extension.swift`, `UIView+Extensions.swift`, `UIViewController+Extensions.swift`, `UIImage+Extensions.swift`, `UIDevice+Extensions.swift`, `UIStackView+Extensions.swift`, `UIScrollView+GestureRecognizer.swift`, `UserDefaults+Extension.swift` (defines `UserDefaultsKeys` enum), `Logger+Ext.swift`, `AtomicDictionary.swift`, `DayOfWeek.swift`, `DepthButtonStyle.swift`, `WeeklyHours.swift`.
- **`Assets/`, `Assets.xcassets/`, `Resources/` (asset-only entries), `Base.lproj/`** — Asset catalogs and localization base. `Assets/Colors/Colors.swift` and `Assets/Colors/Colors+AlertView.swift` define `BMColor`.

## `BerkeleyMobileWidget/` (Widget Extension Target)

- `BerkeleyMobileWidgetBundle.swift` — widget bundle entry point.
- `GymOccupancyWidget.swift` — the widget implementation (shares the `Gym Occupancy Meters` Firestore collection naming with `GymOccupancyViewModel` in the main target).
- `Assets.xcassets/`, `Info.plist`.

## Architectural Boundaries

- LEVEL 1 — The main app target and the widget extension target are separate Xcode build targets (`com.apple.product-type.application` vs `com.apple.product-type.app-extension` in `project.pbxproj`), each with its own `Info.plist` and asset catalog, but both depend on `Firebase/Firestore` per the `Podfile`.
- LEVEL 1 — Feature areas under `berkeley-mobile/` (`Home`, `Events`, `Safety`, `Resources`, `Today`, `FeedbackForm`, `Debug`) are organized as sibling top-level folders rather than nested under a single "Features" directory; each owns its View(Model) and, where applicable, its `*DataSource` subfolder.
- LEVEL 1 — Cross-feature composition happens through `BerkeleyMobile+Injection.swift` (FactoryKit container) and shared types in `Data/` (`DataManager`, `DataSource` protocol, `ItemProtocols/`) and `Common/`.
- Not found in codebase: a dedicated test target folder (no `*Tests` directories were found).
