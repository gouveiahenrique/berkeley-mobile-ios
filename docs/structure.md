# Repository Structure

## Top-Level Layout

```
berkeley-mobile/           # Main app source
BerkeleyMobileWidget/      # Widget extension source
Pods/                      # CocoaPods-managed dependencies
berkeley-mobile.xcodeproj  # Xcode project
berkeley-mobile.xcworkspace
Podfile / Podfile.lock
docs/                      # Generated documentation
```

## Main App Source (`berkeley-mobile/`)

### Application Entry Points

| File | Responsibility |
|---|---|
| `AppDelegate.swift` | Firebase setup, push notification registration, location start, migration check |
| `AppDelegate+Migration.swift` | Version comparison logic and Firestore/Analytics cache clearing on upgrade |
| `SceneDelegate.swift` | Window creation, `TabBarController` as root; triggers `DataManager.fetchIfNecessary` on foreground |
| `TabBarController.swift` | Hosts four top-level tabs: Home, Today, Safety, Resources; manages feedback form presentation |
| `MainContainerViewController.swift` | UIKit container hosting `HomeView` via `UIHostingController`; implements `MainDrawerViewDelegate` |
| `BerkeleyMobile+Injection.swift` | FactoryKit `Container` extension registering all view models and services |

### Feature Modules

#### `Home/`
The map-centric home tab. Sub-folders:

| Subfolder | Contents |
|---|---|
| `Home/Map/` | `MapViewController` (UIKit, MKMapView), `MapDataSource`, `MapMarker`, `MapPlacemark`, `MapMarkerDetailView`, search UI |
| `Home/Dining/` | `DiningHallsView`, `DiningDetailView`, `DiningDataSource`, `MenuItemIconCacheManager` |
| `Home/Fitness/` | `FitnessView`, `GymDetailView`, `GymDataSource`, `GymClassDataSource`, `GymOccupancyViewModel` |
| `Home/Libraries/` | `LibrariesView`, `LibraryDetailView`, `LibraryDataSource` |
| `Home/Guides/` | `GuidesView`, `GuidesViewModel` |
| `Home/Home Drawer/` | Drawer pinning UI and `HomeDrawerPinViewModel` |
| `HomeView.swift` | Root SwiftUI view composing map and segmented drawer |
| `HomeViewModel.swift` | Observable state for the home tab (drawer visibility, fetch state) |
| `OpenClosedStatusManager.swift` | Timer-based open/closed status updates for `HasOpenClosedStatus` items |

#### `Today/`
A tiled dashboard view showing daily highlights.

| File | Contents |
|---|---|
| `TodayView.swift` | Root SwiftUI view; `NavigationStack` with `TodayTilingLayout` |
| `TodayTileLayout.swift` | Custom SwiftUI `Layout` implementing a column-based grid placement engine |
| `TodayTileAttributes.swift` | `TodayTile`, `TodayTileSpan`, `TodayTileStyle`, and `TodayTiles` enum (news, weather) |

#### `Safety/`
Campus safety log display with map view and filter controls.

| File | Contents |
|---|---|
| `SafetyView.swift` | Root SwiftUI view composing `SafetyMapView` and an alert drawer |
| `SafetyViewModel.swift` | Fetches `BMSafetyLog` from Firestore; filters by time and crime type; `BMSafetyLogFilterState` enum |

#### `Resources/`
Categorized campus resource directory.

| File | Contents |
|---|---|
| `ResourcesView.swift` | SwiftUI paged view (`TabView`) over `BMResourceCategory` sections |
| `ResourcesViewModel.swift` | Fetches `BMResourceCategory` via `BMNetworkingManager` |

#### `Events/`
Academic and campus-wide event browser with EventKit calendar integration.

Key files: `EventsView`, `EventsViewModel`, `BMEventCalendarEntry`, `BMEventManager`.

#### `FeedbackForm/`
In-app feedback form shown conditionally based on a Firestore-configured launch count threshold.

Key files: `FeedbackFormPresenter`, `FeedbackFormViewModel`, `FeedbackFormView`.

#### `Drawer/`
Reusable bottom-drawer UIKit infrastructure: `DrawerViewController`, `DrawerViewDelegate`, `BMDrawerView` (SwiftUI), `SearchDrawerViewDelegate`.

#### `Debug/`
`DebugView` (SwiftUI), accessible only in `DEBUG` builds via shake gesture.

### Shared Infrastructure

#### `Data/`

| File/Folder | Responsibility |
|---|---|
| `DataSource.swift` | Protocol defining `fetchItems` and `fetchDispatch` |
| `DataManager.swift` | Singleton coordinating `DataSource` fetches; 1-hour fetch interval guard |
| `BMNetworkingManager.swift` | Async/await Firestore access for safety logs and resource categories |
| `BMLocationManager.swift` | Singleton `CLLocationManager` wrapper; broadcasts via `NotificationCenter` |
| `BMEventManager.swift` | EventKit integration for calendar writes |
| `BMConstants.swift` | App-wide constants (e.g., Berkeley map region, Firestore collection names) |
| `BMError.swift` | Error type definitions |
| `ItemProtocols/` | Capability protocols: `BMCalendarEvent`, `CanFavorite`, `HasImage`, `HasLocation`, `HasName`, `HasOpenClosedStatus`, `HasOpenTimes`, `HasPhoneNumber`, `HasWebsite`, `SearchItem` |
| `PropertyWrappers/` | `Display<T>` — trims whitespace and strips invalid characters from displayable strings |

#### `Common/`
Reusable UI components used across features.

| Component | Type | Description |
|---|---|---|
| `BMActionButton` | SwiftUI | Primary action button; adapts to iOS 26 glass effect |
| `BMDrawerView` | SwiftUI | Bottom sheet drawer wrapper |
| `BMSegmentedControlView` | SwiftUI | Custom segmented control |
| `BMFilterButton` | SwiftUI | Filter toggle button |
| `BMCachedAsyncImageView` | SwiftUI | Async image loader with caching |
| `BMContentUnavailableView` | SwiftUI | Empty/error state placeholder |
| `BMTopBlobView` | SwiftUI | Decorative blob image overlay |
| `BMAlert` | Swift | Alert model for `presentAlert` view modifier |
| `CardView` | UIKit | Rounded shadow card base view |
| `CollapsibleCardView` | UIKit | Expandable card |
| `FilterView` / `FilterViewCell` | UIKit | Horizontal filter chip collection view |
| `TagView` | UIKit | Open/Closed status tag |
| `ReviewPrompter` | Swift | Triggers App Store review request |
| `DetailView/` | Mixed | Detail card views for map markers |

#### `Assets/`

| Subfolder | Contents |
|---|---|
| `Assets.xcassets` | Image assets |
| `Colors/` | `BMColor` struct and extensions per domain (Calendar, Event, GymClass, MapMarker, Resource, TagView, etc.) |
| `Fonts/` | `BMFont` (inferred from usage; provides `bold`, `medium`, `regular`, `light` weight helpers) |

#### `Utils/`
Swift extensions and utilities.

| File | Responsibility |
|---|---|
| `AtomicDictionary.swift` | `pthread_rwlock_t`-backed thread-safe dictionary |
| `Date+Extension.swift` | Date arithmetic, formatting, and comparison helpers |
| `UserDefaults+Extension.swift` | Typed `UserDefaults` accessors keyed by `UserDefaultsKeys` enum |
| `View+Extension.swift` | SwiftUI `ViewModifier` helpers: `shadowfy`, `positionedAtTop`, `presentAlert`, `addEventsContextMenu` |
| `WeeklyHours.swift` | `WeeklyHours`, `HoursInterval`, and `DailyHoursType` models for operating hours |
| `SortingFunctions.swift` | Sorting utilities for data items |

## Widget Extension (`BerkeleyMobileWidget/`)

| File | Responsibility |
|---|---|
| `BerkeleyMobileWidgetBundle.swift` | `@main` entry; configures Firebase if not already done |
| `GymOccupancyWidget.swift` | `GymOccupancyProvider` (TimelineProvider), `GymOccupancyWidgetEntryView`, `GymOccupancyWidget` (systemSmall) |

The widget shares `GymOccupancyViewModel` and `BMFont` with the main app via the shared Pods and source file access granted in the Xcode project.

## Architectural Boundaries

- Feature modules (Home, Today, Safety, Resources, Events, FeedbackForm) are organized by directory and contain their own view models.
- The `Data/` directory is a shared infrastructure layer; feature view models hold references to `DataManager`, `BMNetworkingManager`, or feature-specific data sources.
- UIKit and SwiftUI coexist: UIKit controllers host SwiftUI views via `UIHostingController`; SwiftUI views wrap UIKit view controllers via `UIViewControllerRepresentable` (e.g., `HomeMapView` wrapping `MapViewController`).
- `FactoryKit` provides the dependency injection boundary; all registered factories are defined in `BerkeleyMobile+Injection.swift`.
