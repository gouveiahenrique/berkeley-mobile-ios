# Repository Structure

## Top-Level Layout

```
berkeley-mobile.xcworkspace   — Xcode workspace (app + CocoaPods)
berkeley-mobile.xcodeproj     — Main app Xcode project
Podfile / Podfile.lock        — CocoaPods dependency declarations
berkeley-mobile/              — Main app target source
BerkeleyMobileWidget/         — WidgetKit extension target
Pods/                         — CocoaPods-managed dependencies
```

## `berkeley-mobile/` — Main App Target

### Entry Points and Navigation

| File | Responsibility |
|------|----------------|
| `AppDelegate.swift` | `@UIApplicationMain`; Firebase init, push notification setup, initial data fetch, location start |
| `AppDelegate+Migration.swift` | Version-gated migration logic (Firestore cache clear, etc.) |
| `SceneDelegate.swift` | UIWindow creation; installs `TabBarController` as root; triggers `DataManager.fetchIfNecessary()` on foreground |
| `TabBarController.swift` | Four-tab navigation (Home, Today, Safety, Resources); shake gesture opens `DebugView` in `#DEBUG` builds |
| `MainContainerViewController.swift` | Home tab host; embeds `HomeView` (SwiftUI) and `MapViewController` (UIKit); implements `MainDrawerViewDelegate` |
| `BerkeleyMobile+Injection.swift` | Registers all `Factory`-backed view models into the FactoryKit `Container` |

### `Data/`

Core data infrastructure shared across features.

| File / Directory | Responsibility |
|-----------------|----------------|
| `DataManager.swift` | Singleton orchestrator; manages a rate-limited (1 h) per-source fetch using `DispatchGroup`; stores results in an `AtomicDictionary` |
| `DataSource.swift` | Protocol defining `fetchItems(_:)` and `fetchDispatch`; implemented by feature data sources |
| `BMNetworkingManager.swift` | Async/await Firestore queries for Safety Logs (`"Safety Logs"` collection) and Resource Categories (`"Resource Categories"` collection) |
| `BMLocationManager.swift` | Singleton `CLLocationManager` wrapper; broadcasts `locationUpdated` via `NotificationCenter` |
| `BMConstants.swift` | App-wide constants: Firebase collection names, map coordinates, section title strings |
| `BMError.swift` | App-wide error types |
| `BMEventManager.swift` | EventKit integration for adding/deleting calendar events |
| `SortingFunctions.swift` | Shared sorting helpers |
| `ItemProtocols/` | Data model protocols: `BMCalendarEvent`, `CanFavorite`, `HasImage`, `HasLocation`, `HasName`, `HasOpenClosedStatus`, `HasOpenTimes`, `HasPhoneNumber`, `HasWebsite`, `SearchItem` |
| `PropertyWrappers/Display.swift` | `@Display` property wrapper that trims whitespace and removes replacement characters from display strings |

### `Assets/`

| Directory / File | Responsibility |
|-----------------|----------------|
| `Fonts.swift` | `BMFont` struct; provides Apercu font family (Regular, Bold, Medium, MediumItalic, Light) with system font fallback |
| `Colors/Colors.swift` | `BMColor` struct; defines adaptive (dark-mode aware) colors via `UIColor.init { trait in ... }` |
| `Colors/Colors+*.swift` | Per-feature color namespaces: `ActionButton`, `AlertView`, `Calendar`, `Event`, `GymClass`, `MapMarker`, etc. |

### `Common/`

Reusable UI components shared across features.

| File | Responsibility |
|------|----------------|
| `BMActionButton.swift` / `ActionButton.swift` | Styled button components |
| `BMAlert.swift` | Alert model and presentation helpers |
| `BMCachedAsyncImageView.swift` | Async image loading with caching |
| `BMContentUnavailableView.swift` | Empty-state view |
| `BMDrawerView.swift` | Core drawer panel component |
| `BMFilterButton.swift` | Filter toggle button |
| `BMSegmentedControlView.swift` | Segmented control |
| `TagView.swift` | Pill-shaped label (used for Open/Closed status) |
| `CardView.swift` / `CollapsibleCardView.swift` | Card layout wrappers |
| `ReviewPrompter.swift` | App Store review prompt logic |
| `DetailView/` | Reusable detail-screen subviews (open times, overview, etc.) |
| `FilterView/` | Reusable filter UI components |

### `Drawer/`

Drawer panel infrastructure used on the Home tab.

| File | Responsibility |
|------|----------------|
| `DrawerViewController.swift` | Core pan-gesture-driven drawer view controller |
| `DrawerViewDelegate.swift` | Protocol for views that host a drawer |
| `MainDrawerViewDelegate.swift` | Protocol extension adding a stack-based multi-drawer management system; implemented by `MainContainerViewController` |
| `SearchDrawerViewDelegate.swift` | Protocol extension for drawers that host the search UI |

### `Home/`

Home tab feature modules.

| Directory | Responsibility |
|-----------|----------------|
| `Dining/` | Dining hall listing (`DiningHallsView`), detail (`DiningDetailView`), data source (`DiningHallsViewModel` via Firestore `"Dining Halls V2"` collection) |
| `Fitness/` | Gym listing (`FitnessView`), detail (`GymDetailViewController`), class data source, occupancy (`GymOccupancy/`) |
| `Libraries/` | Library listing (`LibrariesView`), detail (`LibraryDetailViewController`), data source (`LibraryDataSource` via Firestore `"Libraries"`) |
| `Map/` | `MapViewController` (UIKit MKMapView); map marker data source (`MapDataSource` via `"Map Marker"`); search annotation; dropdown for marker type filter; map user-location button |
| `Search/` | Search bar, search results view, search view model |
| `Home Drawer/` | Home drawer pin feature (`HomeDrawerPinViewModel`) |
| `Tiles/` | Tile layout for Home tab sections |
| `HomeView.swift` | SwiftUI root view for the Home tab |
| `HomeViewModel.swift` | Aggregates dining, gym, library data for the home drawer |
| `OpenClosedStatusManager.swift` | Timer-based open/closed status transitions for items with `HasOpenClosedStatus` |
| `RedirectionManager.swift` | Opens Maps app and initiates phone calls |

### `Today/`

Today tab feature.

| File | Responsibility |
|------|----------------|
| `TodayView.swift` | Root SwiftUI view for the Today tab |
| `TodayTileView.swift` | Individual tile rendering |
| `TodayTileLayout.swift` | Custom `Layout` protocol implementation (`TodayTilingLayout`) for a variable-span grid |
| `TodayTileAttributes.swift` | Tile span / attribute definitions |

### `Events/`

Events feature, surfaced within the Today tab.

| File | Responsibility |
|------|----------------|
| `EventDataSource/EventsViewModel.swift` | Fetches campus events from Firestore `"Events"` collection; maps to `BMEventCalendarEntry`; wraps `BMEventManager` |
| `EventDataSource/BMEventCalendarEntry.swift` | Event model; conforms to `NSCoding`, `BMCalendarEvent`, `HasImage`, `CanFavorite` |
| `CalendarView.swift` | Week-range calendar grid with entry indicators |

### `Safety/`

Safety tab feature.

| File | Responsibility |
|------|----------------|
| `SafetyView.swift` | Root SwiftUI view; hosts map and log list |
| `SafetyViewModel.swift` | Fetches safety logs via `BMNetworkingManager`; `@Published` filter state |
| `SafetyLogDetailView.swift` | Detail view for a single safety log entry with embedded map |
| `SafetyMapView.swift` | MKMapView integration for safety markers |
| `SafetyMapMarker.swift` | Map annotation for a safety log |

### `Resources/`

Resources tab feature.

| File | Responsibility |
|------|----------------|
| `ResourcesView.swift` | Root SwiftUI view |
| `ResourcesViewModel.swift` | Fetches resource categories via `BMNetworkingManager` |
| `ResourcesSectionDropdown.swift` | Expandable section component |
| `SafariWebView.swift` | `SFSafariViewController` SwiftUI wrapper |

### `FeedbackForm/`

In-app feedback form shown conditionally based on app launch count.

| File | Responsibility |
|------|----------------|
| `FeedbackFormPresenter.swift` | Coordinates launch-count gate; delegates presentation to `FeedbackFormPresenterDelegate` |
| `FeedbackFormViewModel.swift` | Fetches feedback form configuration from Firestore |

### `Utils/`

Swift standard library and UIKit extensions.

| File | Extension target |
|------|-----------------|
| `AtomicDictionary.swift` | Thread-safe dictionary using `pthread_rwlock_t` |
| `Date+Extension.swift` | `Date` — comparison, formatting, component access |
| `String+Extension.swift` | `String` — time string parsing, `DateInterval` parsing |
| `WeeklyHours.swift` | Operating hours model and containment logic |
| `DayOfWeek.swift` | Day-of-week enum with string and integer representations |
| `UserDefaults+Extension.swift` | Typed `UserDefaults` access via `UserDefaultsKeys` enum |
| `View+Extension.swift` | SwiftUI `View` modifiers: `positionedAtTop()`, `shadowfy()`, `presentAlert()`, `addEventsContextMenu()`, etc. |
| Other `UI*.swift` files | UIKit view/controller extension helpers |

### `Debug/`

Debug-only utilities; gated by `#if DEBUG`. Includes `DebugView` (accessible via shake gesture) and `DebugViewModel`.

## `BerkeleyMobileWidget/` — Widget Extension Target

| File | Responsibility |
|------|----------------|
| `BerkeleyMobileWidgetBundle.swift` | `@main` WidgetBundle; configures Firebase if needed; registers `GymOccupancyWidget` |
| `GymOccupancyWidget.swift` | `systemSmall` widget showing RSF and Stadium gym occupancy percentages; uses `GymOccupancyProvider` (WidgetKit `TimelineProvider`) |

## Dependency Graph (Key Relationships)

```
AppDelegate
  └── DataManager.shared.fetchAll()
        ├── MapDataSource    → Firestore "Map Marker"
        ├── LibraryDataSource → Firestore "Libraries"
        └── GymDataSource    → Firestore "Gyms"

SceneDelegate
  └── TabBarController
        ├── [0] MainContainerViewController
        │     └── HomeView (SwiftUI) + MapViewController (UIKit)
        ├── [1] TodayView (SwiftUI)
        │     └── EventsViewModel → Firestore "Events"
        ├── [2] SafetyView (SwiftUI)
        │     └── SafetyViewModel → BMNetworkingManager → Firestore "Safety Logs"
        └── [3] ResourcesView (SwiftUI)
              └── ResourcesViewModel → BMNetworkingManager → Firestore "Resource Categories"

BerkeleyMobile+Injection (FactoryKit Container)
  └── Provides: CalendarViewModel, DiningHallsViewModel, EventsViewModel,
      FeedbackFormPresenter, GymOccupancyViewModel, HomeViewModel,
      NewsDataViewModel, ResourcesViewModel, SafetyViewModel,
      SearchViewModel, WeatherDataViewModel, and others
```
