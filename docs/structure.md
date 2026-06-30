# Repository Structure

## Top-Level Layout

```
berkeley-mobile.xcworkspace/   Xcode workspace (CocoaPods integration)
berkeley-mobile.xcodeproj/    Xcode project file
berkeley-mobile/               Main app target source
BerkeleyMobileWidget/          Widget extension target source
Pods/                          CocoaPods-managed dependencies
Podfile / Podfile.lock         Dependency declarations and lock file
```

## Main App Target (`berkeley-mobile/`)

### Root-Level Application Files

| File | Responsibility |
|------|----------------|
| `AppDelegate.swift` | Application launch: Firebase init, data pre-fetch, push notification setup |
| `AppDelegate+Migration.swift` | Version migration logic; clears Firebase/Analytics cache on upgrade |
| `SceneDelegate.swift` | Scene session lifecycle management |
| `TabBarController.swift` | Root tab bar; assembles the four top-level tabs |
| `MainContainerViewController.swift` | Host for the Home tab; bridges UIKit drawer system with SwiftUI `HomeView` |
| `BerkeleyMobile+Injection.swift` | FactoryKit `Container` extension registering all view model factories |

### `Assets/`
Design tokens and static assets.
- `Colors/` — `BMColor` extensions (per-component color definitions, e.g., `Colors+ActionButton.swift`)
- `Fonts/` — `BMFont` struct (Apercu font family: Regular, Bold, Medium, MediumItalic, Light) with UIFont fallbacks
- `Assets.xcassets/` — Image assets including app icon, map icons, food restriction icons, theme blobs

### `Common/`
Reusable UI components shared across features.
- `DetailView/` — `OverviewCardView`, `OpenTimesCardView`, `OpenTimesCardSwiftUIView` for displaying resource details
- `FilterView/` — Filter UI components
- `Images/` — `ImageLoader` (URLSession-backed, in-memory URL→UIImage cache) and related views
- `BMDrawerView.swift` — SwiftUI draggable bottom drawer (three states: `.small`, `.medium`, `.large`)
- `ScrollingStackView.swift` — UIKit vertical stack in a scroll view
- `TagView.swift` — Pill-shaped label (e.g., "Open" / "Closed" tags)
- `ReviewPrompter.swift` — App Store review prompt logic

### `Data/`
Data layer: protocols, managers, and utilities.
- `DataManager.swift` — Singleton cache and orchestrator for `DataSource` fetches
- `BMNetworkingManager.swift` — Async Firestore fetcher for safety logs and resource categories
- `BMLocationManager.swift` — Singleton `CLLocationManager` wrapper; broadcasts `locationUpdated` via `NotificationCenter`
- `BMEventManager.swift` — `EventKit` integration for adding/deleting calendar events
- `ItemProtocols/` — Shared model protocols: `HasName`, `HasImage`, `HasLocation`, `HasHours`, `SearchItem`
- `PropertyWrappers/` — `Display` property wrapper (string sanitization for display)

### `Drawer/`
UIKit-based bottom drawer system (legacy, used by the Home map flow).
- `DrawerViewController.swift` — Base drawer view controller with pan gesture handling
- `DrawerViewDelegate.swift` / `MainDrawerViewDelegate.swift` / `SearchDrawerViewDelegate.swift` — Protocol hierarchy for drawer state management
- Stack-based approach: `MainDrawerViewDelegate` maintains a `drawerStack: [DrawerViewDelegate]` for layered drawers

### `Home/`
Home tab content: map, and sectioned resource lists.
- `HomeView.swift` — SwiftUI root of the Home tab; hosts `HomeMapView` and `BMDrawerView`
- `HomeViewModel.swift` — `ObservableObject` fetching libraries and gyms via `DataManager`
- `Map/` — `MapViewController` (UIKit, `MKMapView`), `MapDataSource`, `MapMarker`, marker detail views, search annotation
- `Dining/` — `DiningHallsView`, `DiningDataSource`, `BMDiningHall`, `DiningItem`, `DiningMenu`
- `Fitness/` — `FitnessView`, `GymDataSource`, `GymClassDataSource`, `GymOccupancy/` (shared with widget)
- `Libraries/` — `LibrariesView`, `LibraryDataSource`, `BMLibrary`
- `Guides/` — `GuidesView`, `GuidesViewModel`
- `Search/` — `SearchViewModel`, search results and bar views
- `Home Drawer/` — `BMHomeSectionListView` and home drawer pin functionality

### `Today/`
SwiftUI Today tab: tiled layout of news and weather tiles.
- `TodayView.swift` — Navigation stack with `TodayTilingLayout` and a calendar toolbar link
- `TodayTileLayout.swift` — Custom `Layout` implementation (`TodayTilingLayout`, `TodayTilePlacementEngine`)
- `TodayTileAttributes.swift` — `TodayTiles` enum enumerating `news` and `weather` tiles
- `Tiles/News Tile/` — `NewsTileView`, `NewsDataViewModel`
- `Tiles/Weather Tile/` — `TodayWeatherTileView`, `WeatherDataViewModel`

### `Safety/`
SwiftUI Safety tab: map of safety incidents and alert list.
- `SafetyView.swift` — Map + `BMDrawerView` showing `BMSafetyLog` items
- `SafetyViewModel.swift` — Async fetches from `BMNetworkingManager.fetchSafetyLogs()`
- `SafetyLogDetailView.swift` — Full-screen detail for a single safety log entry

### `Resources/`
SwiftUI Resources tab: categorized campus resources.
- `ResourcesView.swift` — Segmented control with `TabView` paging across `BMResourceCategory` items
- `ResourcesViewModel.swift` — Async fetches from `BMNetworkingManager.fetchResourcesCategories()`

### `Events/`
SwiftUI Events view (accessible via Today tab toolbar).
- `EventsView.swift` — Calendar and campus-wide event listings
- `EventsViewModel.swift` — Async Firestore fetch + `EventKit` calendar integration
- `EventDataSource/` — `BMEventCalendarEntry`, `BerkeleyEvent`, `BerkeleyEventsDaySnapshot` model types

### `FeedbackForm/`
In-app feedback collection.
- `FeedbackFormPresenter.swift` — Coordinates when to show the form (threshold logic via `UserDefaults`)
- `FeedbackFormViewModel.swift` — Form state

### `Debug/`
Debug-only tooling.
- `DebugView.swift` / `DebugViewModel.swift` — Accessible via device shake gesture in `#DEBUG` builds

### `Utils/`
Swift extensions and general utilities.
- `AtomicDictionary.swift` — Thread-safe dictionary using `pthread_rwlock_t`
- `WeeklyHours.swift` — `WeeklyHours`, `HoursInterval`, `DailyHoursType`, `WeeklyHoursType` types
- `Date+Extension.swift` — Extensive `Date` extension (comparison, string formatting, calendar arithmetic)
- `UserDefaults+Extension.swift` — `UserDefaultsKeys` enum and typed `UserDefaults` accessors
- `UIView+Extensions.swift`, `UIViewController+Extensions.swift`, `UIImage+Extensions.swift` — UIKit helpers
- `BMConstants.swift` — Shared string constants

## Widget Extension (`BerkeleyMobileWidget/`)

| File | Responsibility |
|------|----------------|
| `BerkeleyMobileWidgetBundle.swift` | `@main` widget bundle entry point |
| `GymOccupancyWidget.swift` | `StaticConfiguration` widget; provider, entry, and views |

The widget accesses `GymOccupancyViewModel` (shared via FactoryKit) to fetch occupancy data from Firestore. It is registered for the `.systemSmall` widget family.

## Architectural Boundaries

- **App target ↔ Widget target**: Share `GymOccupancyViewModel` and Firebase/Firestore pod. No other direct code sharing is visible; the widget target has its own `Info.plist`.
- **UIKit ↔ SwiftUI boundary**: `MainContainerViewController` wraps `HomeView` in a `UIHostingController`. `MapViewController` is exposed to SwiftUI via `HomeMapView : UIViewControllerRepresentable`. All other tabs use `UIHostingController` directly from `TabBarController`.
- **Data layer ↔ View layer**: View models receive data either via `DataManager` (Firestore batch fetch with caching) or `BMNetworkingManager` (direct async Firestore calls). Views never call Firestore directly.
