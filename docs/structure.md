# Repository Structure

## Top-Level Layout

```
berkeley-mobile/          — main app source
BerkeleyMobileWidget/     — WidgetKit extension
Pods/                     — CocoaPods dependencies (generated)
Podfile / Podfile.lock    — dependency declarations
berkeley-mobile.xcodeproj — Xcode project
berkeley-mobile.xcworkspace — CocoaPods workspace
```

## Main App: `berkeley-mobile/`

### Entry Points

| File | Role |
|---|---|
| `AppDelegate.swift` | `@UIApplicationMain`; Firebase init, DataManager bootstrap, push notification setup |
| `AppDelegate+Migration.swift` | Version migration logic; clears caches when the app updates |
| `SceneDelegate.swift` | UIScene lifecycle; calls `DataManager.fetchIfNecessary()` on activation |
| `TabBarController.swift` | Root UITabBarController; owns the four top-level tab view controllers |
| `MainContainerViewController.swift` | UIKit container for the Home tab; hosts `HomeView` (SwiftUI) and implements `MainDrawerViewDelegate` |
| `BerkeleyMobile+Injection.swift` | FactoryKit `Container` extension; registers all ViewModels and service factories |

### `Assets/`

Shared design tokens and asset helpers.

| Subdirectory | Contents |
|---|---|
| `Colors/Colors.swift` | `BMColor` struct — named semantic colors with dark mode variants |
| `Fonts/` | `BMFont` — named font factory |
| `Images/` | Shared image helpers |

### `Common/`

Reusable SwiftUI views and UIKit components used across features.

Notable files:
- `BMDrawerView.swift` — SwiftUI sliding drawer component
- `BMSegmentedControlView.swift` — custom segmented control
- `BMAlert.swift` — alert model and presentation
- `BMCachedAsyncImageView.swift` — async image with caching
- `BMContentUnavailableView.swift` — empty-state view
- `ReviewPrompter.swift` — App Store review prompt logic
- `DetailView/` — Shared detail card views (`OpenTimesCardSwiftUIView`, `OverviewCardView`)

### `Data/`

Cross-cutting data layer components.

| File | Role |
|---|---|
| `DataManager.swift` | Singleton; orchestrates fetches from `DataSource` implementations with deduplication via `DispatchGroup` |
| `DataSource.swift` | Protocol defining `fetchItems` and `fetchDispatch` for Firestore-backed sources |
| `BMNetworkingManager.swift` | `async/await`-based Firestore fetcher for safety logs and resource categories |
| `BMLocationManager.swift` | Singleton `CLLocationManager` wrapper; broadcasts location via `NotificationCenter` |
| `BMConstants.swift` | App-wide constants (Firestore collection names, Berkeley map coordinates) |
| `BMEventManager.swift` | EventKit calendar integration (add/delete events) |
| `BMError.swift` | App-specific error types |
| `SortingFunctions.swift` | Shared sorting utilities |
| `ItemProtocols/` | Protocols describing model capabilities (`HasOpenTimes`, `HasLocation`, `HasName`, `HasImage`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `SearchItem`, `BMCalendarEvent`) |
| `PropertyWrappers/` | Custom property wrappers including `@Display` |

### `Home/`

The Home tab: an interactive map with a bottom drawer for venue categories.

| Subdirectory | Contents |
|---|---|
| `HomeView.swift` / `HomeViewModel.swift` | Root SwiftUI view and `@Observable` ViewModel for the home drawer |
| `Map/` | `MapViewController` (UIKit MKMapView), `MapDataSource`, `MapMarker`, `MapPlacemark` |
| `Dining/` | `DiningHallsView`, `DiningHallsViewModel`, `DiningDataSource/` (models: `BMDiningHall`, `DiningItem`, `DiningRestriction`) |
| `Fitness/` | `FitnessView`, `GymDataSource/` (`BMGym`), `GymClassDataSource/` (`GymClass`), `GymOccupancy/` (`GymOccupancyViewModel`) |
| `Libraries/` | `LibrariesView`, `LibraryDataSource/` (`BMLibrary`) |
| `Guides/` | `GuidesView`, `GuidesViewModel` |
| `Search/` | `SearchViewModel`, `SearchBarView`, `SearchResultsView` |
| `Home Drawer/` | `HomeDrawerPinViewModel` — manages user-pinned row items via `UserDefaults` |
| `OpenClosedStatusManager.swift` | Timer-based open/closed status refresh for venues |
| `RedirectionManager.swift` | Opens Maps or initiates phone calls for venue details |

### `Today/`

The Today tab: a tiled grid ("glance") view.

| File / Directory | Contents |
|---|---|
| `TodayView.swift` | Root SwiftUI view; renders a `TodayTilingLayout` of `TodayTileView` items |
| `TodayTileAttributes.swift` | `TodayTiles` enum (`news`, `weather`) with span and style configuration |
| `TodayTileLayout.swift` | Custom `Layout` implementation (`TodayTilingLayout`) and `TodayTilePlacementEngine` for column/row placement |
| `TodayTileView.swift` | Generic tile container view |
| `Tiles/News Tile/` | `NewsTileView`, `NewsDataViewModel`, `NewsArticle` — fetches from `"Daily Cal News"` Firestore collection |
| `Tiles/Weather Tile/` | `TodayWeatherTileView`, `WeatherDataViewModel` — fetches from Apple WeatherKit |

### `Safety/`

The Safety tab: a map-based crime log viewer.

| File | Contents |
|---|---|
| `SafetyView.swift` | Root SwiftUI view; shows `SafetyMapView` with a bottom `BMDrawerView` |
| `SafetyViewModel.swift` | `ObservableObject` ViewModel; fetches safety logs via `BMNetworkingManager`, applies filter logic |
| `SafetyLogDetailView.swift` | Detail sheet for a selected safety log |
| `SafetyMapView.swift` / `SafetyMapMarker.swift` | MapKit map and annotation rendering |

### `Resources/`

The Resources tab: categorized campus resource directory.

| File | Contents |
|---|---|
| `ResourcesView.swift` | SwiftUI view with `BMSegmentedControlView` tabs per resource category |
| `ResourcesViewModel.swift` | `@Observable` ViewModel; fetches from `"Resource Categories"` via `BMNetworkingManager` |

### `Events/`

Campus events calendar, accessible from the Today tab toolbar.

| File | Contents |
|---|---|
| `EventsView.swift` | SwiftUI view for browsing events |
| `EventsViewModel.swift` | `@Observable` ViewModel; fetches from `"Events"` Firestore collection via `EventsDataService` |
| `CalendarSectionView.swift` | Calendar grid with event entries |
| `BMEventCalendarEntry` | Model for a single calendar event |

### `Drawer/`

UIKit drawer infrastructure for the legacy Home view.

- `DrawerViewController.swift` — draggable drawer with states (`.hidden`, `.collapsed`, `.middle`, `.full`)
- `DrawerViewDelegate.swift` — protocol for pan-gesture-based drawer movement
- `MainDrawerViewDelegate.swift` — extends `DrawerViewDelegate` with a drawer stack for layered drawers
- `SearchDrawerViewDelegate.swift` — drawer variant with search integration

### `FeedbackForm/`

In-app feedback form presenter, rate-limited by app launch count.

### `Debug/`

`DebugView` — only available in `#if DEBUG` builds; accessible via shake gesture from `TabBarController`.

### `Utils/`

Foundation extensions and shared utilities.

- `Date+Extension.swift` — date arithmetic, formatting helpers, weekday utilities
- `UserDefaults+Extension.swift` — typed UserDefaults accessors
- `Logger+Ext.swift` — per-subsystem `Logger` category constants
- `WeeklyHours.swift` — domain model for venue weekly operating hours
- `AtomicDictionary.swift` — thread-safe dictionary wrapper

## Widget Extension: `BerkeleyMobileWidget/`

| File | Role |
|---|---|
| `BerkeleyMobileWidgetBundle.swift` | `@main` widget bundle entry point; configures Firebase if not already configured |
| `GymOccupancyWidget.swift` | `StaticConfiguration` widget; `GymOccupancyProvider: TimelineProvider` fetches occupancy data every 15 minutes |

The widget extension shares `GymOccupancyViewModel` and `BMFont` with the main app target.

## Dependency Injection Boundary

All ViewModel creation is centralized in `BerkeleyMobile+Injection.swift` via FactoryKit's `Container`. ViewModels are injected into views using `@Injected`, `@InjectedObject`, and `@InjectedObservable` property wrappers. No ViewModel is instantiated directly in view `init` bodies except where explicitly overriding with FactoryKit's `.preview` modifier for SwiftUI previews.
