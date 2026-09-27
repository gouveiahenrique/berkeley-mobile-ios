# Repository Structure

## Top-Level Layout

```
.
├── berkeley-mobile/                 # Main iOS application target source
├── BerkeleyMobileWidget/             # WidgetKit extension target source
├── berkeley-mobile.xcodeproj/        # Xcode project (build configuration, schemes)
├── berkeley-mobile.xcworkspace/      # Xcode workspace (combines CocoaPods + SPM)
├── Pods/                             # CocoaPods-managed dependency sources (generated)
├── Podfile / Podfile.lock            # CocoaPods dependency manifest
├── app_preview_images/               # Screenshots referenced by README.md
├── README.md, CONTRIBUTING.md, LICENSE.md
└── docs/                             # This documentation set
```

## `berkeley-mobile/` (Main App Target)

Discovered top-level subdirectories and their responsibilities, based on file contents:

| Folder | Responsibility (evidence) |
|---|---|
| `AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift` | Application/scene lifecycle entry points. `AppDelegate+Migration.swift` defines `checkForUpdate`/`clearCache`/`Version`, indicating app-version migration handling. |
| `TabBarController.swift`, `MainContainerViewController.swift` | Root navigation (`UITabBarController` and a container view controller referenced by drawer/map code). |
| `Assets/` | Design tokens: `Colors.swift` plus per-feature color extensions (`Colors+ActionButton.swift`, `Colors+AlertView.swift`, `Colors+Calendar.swift`, `Colors+Event.swift`, `Colors+GymClass.swift`, `Colors+MapMarker.swift`, `Colors+Resource.swift`, `Colors+StudyPact.swift`, `Colors+TagView.swift`, `Colors+Text.swift`) and `Fonts.swift`. |
| `Assets.xcassets/` | Image/color/icon asset catalog (App Icon, map icons, food-restriction icons, StudyPact onboarding art, fonts under `Assets/Fonts/`). |
| `Common/` | Shared UI components reused across features: `ActionButton.swift`, `BMActionButton.swift`, `BMAlert.swift`, `BMCachedAsyncImageView.swift`, `BMContentUnavailableView.swift`, `BMDrawerView.swift`, `BMFilterButton.swift`, `BMSegmentedControlView.swift`, `BMTopBlobView.swift`, `CardView.swift`, `CollapsibleCardView.swift`, `TagView.swift`, plus `DetailView/` (generic item detail cards: `DetailView.swift`, `DescriptionCardView.swift`, `LocationDetailView.swift`, `OpenTimesCardView.swift`, `OpenTimesCardSwiftUIView.swift`, `OverviewCardView.swift`) and `FilterView/`, `Images/`. |
| `Data/` | Cross-feature data layer: `DataManager.swift` (fetch orchestration singleton), `DataSource.swift` (protocol), `BMNetworkingManager.swift` (Firestore access for Safety/Resources), `BMConstants.swift`, `BMError.swift`, `BMEventManager.swift` (EventKit calendar integration), `BMLocationManager.swift` (CoreLocation), `ItemProtocols/` (`HasImage`, `HasLocation`, `HasName`, `HasOpenClosedStatus`, `HasOpenTimes`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `SearchItem`, `BMCalendarEvent`), `PropertyWrappers/Display.swift`, `SortingFunctions.swift`. |
| `Debug/` | `DebugView.swift`, `DebugViewModel.swift` — developer-only screen, injected only under `#if DEBUG` (`BerkeleyMobile+Injection.swift`). |
| `Drawer/` | Bottom-sheet/drawer presentation system: `DrawerViewController.swift`, `DrawerViewDelegate.swift`, `MainDrawerViewDelegate.swift`, `BarView.swift`, `SearchDrawerViewController.swift`, `SearchDrawerViewDelegate.swift`. |
| `Events/` | Calendar/events feature: `EventDataSource/` (`BMEventCalendarEntry.swift`, `EventsViewModel.swift`), `EventDetailView.swift`, `EventRowView.swift`, `EventsView.swift`, `CalendarView.swift`, `CalendarSectionView.swift`, `EventsDateSectionView.swift`, `AllDayEventBannerView.swift`, `BMAddedCalendarStatusOverlayView.swift`. |
| `FeedbackForm/` | In-app feedback: `FeedbackFormPresenter.swift`, `FeedbackFormView.swift`, `FeedbackFormViewModel.swift` (writes to Firestore collection `Feedback Responses`, reads config from `Feedback Form Config`). |
| `Home/` | Largest feature area, organized by sub-feature: `Dining/` (incl. `DiningDataSource/`), `Fitness/` (incl. `GymClassDataSource/`, `GymDataSource/`, `GymOccupancy/`), `Guides/`, `Home Drawer/`, `Libraries/` (incl. `LibraryDataSource/`), `Map/` (incl. `MapDataSource/`), `Search/`, plus `HomeView.swift`, `HomeViewModel.swift`, `OpenClosedStatusManager.swift`, `OpenClosedStatusView.swift`, `RedirectionManager.swift`. |
| `Resources/` | `ResourcesViewModel.swift` — campus resources list, backed by Firestore collection `Resource Categories` via `BMNetworkingManager`. |
| `Safety/` | `SafetyViewModel.swift` — safety log map/filter feature, backed by Firestore collection `Safety Logs` via `BMNetworkingManager`. |
| `Today/` | "Today" tile dashboard: `TodayView.swift`, `TodayTileLayout.swift`, `TodayTileAttributes.swift`, `TodayTileView.swift`, `Tiles/Weather Tile/WeatherDataViewModel.swift` (WeatherKit), `Tiles/News Tile/NewsDataViewModel.swift` (Firestore collection `Daily Cal News`). |
| `Utils/` | Extensions and small utilities: `AtomicDictionary.swift`, `CLLocation+Extension.swift`, `Collection+Extension.swift`, `Date+Extension.swift`, `DayOfWeek.swift`, `DepthButtonStyle.swift`, `Logger+Ext.swift`, `NSCoding+Extension.swift`, `String+Extension.swift`, `TimeInterval+Ext.swift`, `UIDevice+Extensions.swift`, `UIImage+Extensions.swift`, `UIScrollView+GestureRecognizer.swift`, `UIStackView+Extensions.swift`, `UIView+Extensions.swift`, `UIViewController+Extensions.swift`, `UserDefaults+Extension.swift`, `View+Extension.swift`, `WeeklyHours.swift`. |
| `Base.lproj/` | `LaunchScreen.storyboard`. |
| `BerkeleyMobile+Injection.swift` | Central Factory (`FactoryKit`) dependency-injection registration point for all view models. |
| `berkeley-mobile.entitlements`, `Info.plist` | App capabilities (push notifications, WeatherKit) and permission usage descriptions (location, calendar). |

## `BerkeleyMobileWidget/` (Widget Extension Target)

| File | Responsibility |
|---|---|
| `BerkeleyMobileWidgetBundle.swift` | WidgetKit bundle entry point for the extension. |
| `GymOccupancyWidget.swift` | Defines `GymOccupancyEntry` (`TimelineEntry`) and `GymOccupancyProvider` (`TimelineProvider`), sourcing data from `GymOccupancyViewModel`. |
| `Assets.xcassets/`, `Info.plist` | Widget-specific assets and extension manifest. |

## Architectural Boundaries and Dependencies

- **Feature folders → `Data/` and `Common/`:** Feature view models (e.g. `DiningHallsViewModel`, `GuidesViewModel`, `SafetyViewModel`) depend on shared protocols in `Data/ItemProtocols/` and shared alert/error types (`BMAlert`, `BMError`) in `Data/` and `Common/`.
- **Dependency injection boundary:** SwiftUI views obtain view models exclusively through `Factory` (`BerkeleyMobile+Injection.swift`) via `@InjectedObservable`, rather than instantiating view models directly — observed in `berkeley-mobile/Home/Dining/DiningHallsView.swift`.
- **Two data-fetch patterns coexist:**
  1. A legacy `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift`) with static `fetchItems` conformances (`MapDataSource`, `LibraryDataSource`, `GymDataSource`), orchestrated by the `DataManager` singleton.
  2. Newer, per-feature `@Observable`/`ObservableObject` view models that call Firestore directly in their own `init()` (e.g. `DiningHallsViewModel`, `GuidesViewModel`, `NewsDataViewModel`, `FeedbackFormViewModel`), without going through `DataManager`.
- **Widget extension boundary:** `BerkeleyMobileWidget/` is a separate build target (`BerkeleyMobileWidgetExtension`) with its own `Podfile` target block requiring only `Firebase/Firestore`; it depends on `GymOccupancyViewModel` (defined under `berkeley-mobile/Home/Fitness/GymOccupancy/`), meaning the widget target shares source with the main app target rather than being fully isolated. Exact shared-source membership was not verified against `project.pbxproj` target membership in this pass.

## Testing-Related Structure

No dedicated test target or test source directory was found in the inspected repository areas. The `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` `TestAction` contains an empty `<Testables>` element, and no files matching `*Tests.swift` or `*Test.swift` were found outside `Pods/`. See `docs/testing-standards.md`.
