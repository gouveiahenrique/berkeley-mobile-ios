# Repository Structure

## Top-Level Layout

```
/
├── berkeley-mobile/          Main iOS application target
├── BerkeleyMobileWidget/     WidgetKit extension target
├── Pods/                     CocoaPods-managed dependencies
├── berkeley-mobile.xcodeproj Xcode project file
├── berkeley-mobile.xcworkspace Xcode workspace (CocoaPods)
├── Podfile                   Dependency declarations
└── Podfile.lock              Locked dependency versions
```

## Main Target: `berkeley-mobile/`

### Entry and Lifecycle

| File | Responsibility |
|---|---|
| `AppDelegate.swift` | `@UIApplicationMain`; Firebase init, FCM setup, initial data fetch, notification registration |
| `AppDelegate+Migration.swift` | Version-gated migration logic (`checkForUpdate`, cache clearing) |
| `SceneDelegate.swift` | Window creation, root view controller assignment, foreground data refresh |
| `TabBarController.swift` | Four-tab navigation root; debug shake gesture handling; feedback form presentation |
| `MainContainerViewController.swift` | UIKit container hosting `HomeView` (SwiftUI) + `MapViewController`; drawer stack management |
| `BerkeleyMobile+Injection.swift` | FactoryKit `Container` extension registering all view model factories |

### Feature Modules

#### `Home/`

The Home tab renders a map underlay with a slide-up drawer containing segmented tabs for Dining, Fitness, Study (Libraries), and Guides.

| Sub-path | Responsibility |
|---|---|
| `HomeView.swift` | Top-level SwiftUI view; hosts `HomeMapView` and `BMDrawerView` |
| `HomeViewModel.swift` | Publishes dining hall, library, and gym lists; coordinates drawer presentation |
| `OpenClosedStatusManager.swift` | Timer-based open/closed status updates for items with `HasOpenClosedStatus` |
| `RedirectionManager.swift` | Handles Maps and phone call deep links |
| `Map/MapViewController.swift` | `MKMapView` host; search bar; map marker rendering |
| `Map/MapDataSource/` | `MapMarker`, `MapDataSource`; marker types and data model |
| `Dining/DiningDataSource/` | `DiningHallsViewModel`, `BMDiningHall`, `BMDiningHallDocument`; Firestore fetch from `"Dining Halls V2"` and `"Dining Halls"` |
| `Fitness/GymDataSource/` | `GymDataSource`, `BMGym`; Firestore fetch from `"Gyms"` |
| `Fitness/GymOccupancy/` | `GymOccupancyViewModel`, `GymOccupancyView`; real-time occupancy from `"Gym Occupancy Meters"` with 15-minute auto-refresh |
| `Libraries/LibraryDataSource/` | `LibraryDataSource`, `BMLibrary`; Firestore fetch from `"Libraries"` |
| `Guides/` | `GuidesViewModel`, `GuidesView`, `Guide`; campus guide content |
| `Home Drawer/` | `BMHomeSectionListView` and related drawer list components |
| `Search/` | `SearchViewModel`, `SearchBarView`, `SearchResultsView`, `RecentSearchManager`, `SearchAnnotation` |

#### `Today/`

| Sub-path | Responsibility |
|---|---|
| `TodayView.swift` | Navigation stack with `TodayTilingLayout`; toolbar link to `EventsView` |
| `TodayTileLayout.swift` | Custom `Layout` implementation for tile placement engine |
| `TodayTileView.swift` | Individual tile wrapper |
| `TodayTileAttributes.swift` | Tile span and attribute declarations |
| `Tiles/News Tile/` | `NewsDataViewModel`; news data fetch |
| `Tiles/Weather Tile/` | `WeatherDataViewModel`; weather data fetch |

#### `Safety/`

| File | Responsibility |
|---|---|
| `SafetyView.swift` | ZStack of `SafetyMapView` and `BMDrawerView` |
| `SafetyViewModel.swift` | Fetches `BMSafetyLog` records from Firestore; filters by time and crime type |
| `SafetyMapView.swift` | MapKit map with crime incident markers |
| `SafetyLogDetailView.swift` | Detail drawer for individual safety log entries |
| `SafetyLogFilterButton.swift` | Multi-select filter chip UI |
| `SafetyMapMarker.swift` | `MapMarker` for safety incidents |

#### `Resources/`

| File | Responsibility |
|---|---|
| `ResourcesView.swift` | Segmented tab view per resource category |
| `ResourcesViewModel.swift` | Fetches `BMResourceCategory` from Firestore `"Resource Categories"` |
| `ResourcesSectionDropdown.swift` | Expandable section within a resource page |

#### `Events/`

| Sub-path | Responsibility |
|---|---|
| `EventDataSource/EventsViewModel.swift` | `EventsDataService` fetches from Firestore `"Events"` collection; `EventsViewModel` manages calendar add/delete |
| `CalendarView.swift` | Calendar grid presentation |
| `EventsView.swift` | List view of events |
| `EventDetailView.swift` | Individual event detail |

#### `FeedbackForm/`

| File | Responsibility |
|---|---|
| `FeedbackFormPresenter.swift` | Decides when to present the feedback form based on launch count and remote config |
| `FeedbackFormViewModel.swift` | Fetches feedback form configuration from Firestore |

#### `Debug/`

| File | Responsibility |
|---|---|
| `DebugView.swift` | Debug panel (shake gesture, `#if DEBUG` only): app info, force-present feedback form |
| `DebugViewModel.swift` | Supplies feedback form state to `DebugView` |

### Shared Infrastructure

#### `Data/`

| File | Responsibility |
|---|---|
| `DataSource.swift` | `DataSource` protocol: `fetchItems(_:)`, `fetchDispatch` |
| `DataManager.swift` | Singleton; orchestrates `DataSource` fetches with one-hour interval guard; caches in `AtomicDictionary` |
| `BMNetworkingManager.swift` | Singleton for async Firestore reads (safety logs, resource categories) |
| `BMLocationManager.swift` | `CLLocationManager` singleton wrapper; broadcasts `locationUpdated` via `NotificationCenter` |
| `BMConstants.swift` | App-wide constants: map bounds, Firebase collection names, section titles |
| `BMError.swift` | Shared error types |
| `BMEventManager.swift` | EventKit integration for calendar add/delete |
| `ItemProtocols/` | Protocols: `HasLocation`, `HasImage`, `HasOpenTimes`, `HasPhoneNumber`, `CanFavorite`, `HasOpenClosedStatus`, `HasWebsite`, `HasName`, `SearchItem`, `BMCalendarEvent` |
| `PropertyWrappers/` | Custom property wrappers (`@Display`) |
| `SortingFunctions.swift` | Shared sorting utilities |

#### `Common/`

| File / folder | Responsibility |
|---|---|
| `BMActionButton.swift` | Shared action button (iOS 26 glass effect / fallback rounded rect) |
| `BMAlert.swift` | Shared alert model |
| `BMDrawerView.swift` | SwiftUI drawer component with `BMDrawerViewState` |
| `BMCachedAsyncImageView.swift` | Async image view backed by `ImageLoader` |
| `BMSegmentedControlView.swift` | Shared segmented control |
| `BMFilterButton.swift` | Shared filter chip button |
| `BMContentUnavailableView.swift` | Shared empty state view |
| `BMTopBlobView.swift` | Decorative blob overlay |
| `CardView.swift` / `CollapsibleCardView.swift` | Card wrappers |
| `TagView.swift` | Open/Closed status tag |
| `DetailView/` | Shared detail card views (`OverviewCardView`, `OpenTimesCardView`, etc.) |
| `FilterView/` | Filter panel components |
| `Images/ImageLoader.swift` | In-memory URL image cache; `URLSession`-based loading |
| `ReviewPrompter.swift` | App Store review prompt logic |

#### `Drawer/`

| File | Responsibility |
|---|---|
| `DrawerViewController.swift` | UIKit drawer container with pan gesture handling |
| `DrawerViewDelegate.swift` | Protocol for individual drawer instances |
| `MainDrawerViewDelegate.swift` | Protocol for the top-level drawer stack manager |
| `SearchDrawerViewController.swift` / `SearchDrawerViewDelegate.swift` | Search-specific drawer integration |
| `BarView.swift` | Drag handle visual indicator |

#### `Assets/`

| Sub-path | Responsibility |
|---|---|
| `Colors/Colors.swift` | `BMColor` struct with dynamic dark/light color definitions |
| `Colors/Colors+*.swift` | `BMColor` extensions per UI domain (Calendar, AlertView, ActionButton, etc.) |
| `Fonts/Fonts.swift` | `BMFont` struct providing Apercu font family (Regular, Bold, Medium, Light, MediumItalic) |
| `Fonts/*.otf` | Bundled Apercu font files |
| `Assets.xcassets` | Image assets |

#### `Utils/`

| File | Responsibility |
|---|---|
| `AtomicDictionary.swift` | Generic dictionary with `pthread_rwlock_t` read-write lock |
| `Date+Extension.swift` | Date convenience methods (comparisons, formatting, component access) |
| `UserDefaults+Extension.swift` | Typed `UserDefaults` access via `UserDefaultsKeys` enum |
| `Logger+Ext.swift` | `os.Logger` subsystem instances per view model |
| `WeeklyHours.swift` | Hours-of-operation model and parsing |
| `DayOfWeek.swift` | Day enumeration with string representation |
| `View+Extension.swift` | SwiftUI view helpers |
| Other `*+Extension.swift` | Extensions on `CLLocation`, `Collection`, `String`, `UIDevice`, `UIImage`, `UIScrollView`, `UIStackView`, `UIViewController`, `TimeInterval` |

### `BerkeleyMobileWidget/`

| File | Responsibility |
|---|---|
| `BerkeleyMobileWidgetBundle.swift` | `@main` entry; Firebase init guard; registers `GymOccupancyWidget` |
| `GymOccupancyWidget.swift` | `StaticConfiguration` widget; 15-minute `Timeline` refresh; displays RSF and Stadium occupancy |

## Dependency Boundaries

```
TabBarController
 ├── MainContainerViewController (Home tab)
 │    └── HomeView (SwiftUI, via UIHostingController)
 │         └── MapViewController (UIKit, via UIViewControllerRepresentable)
 ├── TodayView (SwiftUI)
 ├── SafetyView (SwiftUI)
 └── ResourcesView (SwiftUI)

DataManager (singleton)
 ├── MapDataSource   → Firestore
 ├── LibraryDataSource → Firestore
 └── GymDataSource   → Firestore

BMNetworkingManager (singleton) → Firestore

BerkeleyMobile+Injection.swift
 └── FactoryKit Container (all view model factories)
```

All view models are resolved through the FactoryKit `Container`. Shared view models (e.g. `homeViewModel`, `gymOccupancyViewModel`) are registered as `.singleton` or `.shared`; per-use view models are unscoped.
