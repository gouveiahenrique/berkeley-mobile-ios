# Repository Structure

## Top-Level Layout

```
berkeley-mobile.xcodeproj/    Xcode project and scheme definitions
berkeley-mobile.xcworkspace/  CocoaPods workspace (used to build)
Podfile                       CocoaPods dependency manifest
Podfile.lock                  Locked dependency graph
Pods/                         Resolved CocoaPods dependencies
berkeley-mobile/              Main application target source
BerkeleyMobileWidget/         WidgetKit extension target source
docs/                         Engineering documentation
```

## Main Application Target: `berkeley-mobile/`

### Entry Points

| File | Responsibility |
|---|---|
| `AppDelegate.swift` | Application lifecycle, Firebase configuration, push notification setup, initial data fetch |
| `AppDelegate+Migration.swift` | Version detection and migration logic |
| `SceneDelegate.swift` | Scene lifecycle, window creation, root view controller installation |
| `TabBarController.swift` | Root tab bar; hosts Home, Today, Safety, and Resources tabs |
| `MainContainerViewController.swift` | Home tab container; hosts map view and drawer stack |
| `BerkeleyMobile+Injection.swift` | FactoryKit `Container` extensions registering all injectable view models |

### `Assets/`

Design tokens and font declarations.

| Path | Content |
|---|---|
| `Assets/Fonts.swift` | `BMFont` struct — Apercu typeface closures (regular, bold, medium, mediumItalic, light) |
| `Assets/Colors/Colors.swift` | `BMColor` struct — base semantic color values with dark-mode adaptations |
| `Assets/Colors/Colors+*.swift` | Per-feature color extensions (Calendar, AlertView, ActionButton, Event, MapMarker, Resource) |

### `Data/`

Cross-feature data infrastructure.

| File | Responsibility |
|---|---|
| `DataManager.swift` | Singleton coordinator; fetches all registered `DataSource` types from Firestore with a 1-hour re-fetch interval |
| `DataSource.swift` | `DataSource` protocol defining `fetchItems(_:)` and a `DispatchGroup` for deduplication |
| `BMNetworkingManager.swift` | Singleton with async/await Firestore fetches for safety logs and resource categories |
| `BMLocationManager.swift` | Singleton `CLLocationManager` wrapper; broadcasts `.locationUpdated` via `NotificationCenter` |
| `BMConstants.swift` | Shared constants: Firestore collection names, Berkeley map region, section title strings |
| `BMError.swift` | App-specific `Error` type |
| `BMEventManager.swift` | EventKit integration for calendar event management |
| `SortingFunctions.swift` | Shared comparator functions (location-based sort) |

#### `Data/ItemProtocols/`

Shared capability protocols for domain model objects.

| Protocol | Capability |
|---|---|
| `SearchItem` | Searchable on the map (name, location, icon) |
| `HasLocation` | Latitude/longitude/address; provides `distanceToUser` computed property |
| `HasImage` | Image URL with in-memory cache integration via `ImageLoader` |
| `CanFavorite` | `isFavorited` flag |
| `HasName` | Display name |
| `HasOpenTimes` | `WeeklyHours` open/close schedule |
| `HasOpenClosedStatus` | Current open/closed state derived from hours |
| `HasPhoneNumber` | Phone number |
| `HasWebsite` | Website URL |
| `BMCalendarEvent` | Calendar event entry used by EventKit integration |

#### `Data/PropertyWrappers/`

Custom property wrapper utilities (not further detailed — no additional queries performed).

### `Common/`

Shared UI components used across multiple features.

| File / Subdirectory | Content |
|---|---|
| `CardView.swift` | Base card container view |
| `CollapsibleCardView.swift` | Expandable card variant |
| `ScrollingStackView.swift` | `UIScrollView` wrapping a vertical `UIStackView` with dynamic height |
| `IconPairView.swift` | Icon + label pairing |
| `TagView.swift` | Tag/badge display |
| `BMFilterButton.swift` | Filterable toggle button |
| `BMSegmentedControlView.swift` | SwiftUI segmented control |
| `BMTopBlobView.swift` | Decorative blob shape |
| `BMDrawerView.swift` | Drawer surface view |
| `BMAlert.swift` | In-app alert model |
| `BMContentUnavailableView.swift` | Empty-state placeholder |
| `BMCachedAsyncImageView.swift` | Async image loading with `ImageLoader` cache |
| `ReviewPrompter.swift` | App Store review prompt logic |
| `DetailView/` | Protocol (`DetailView`, `DetailViewDelegate`) and concrete views (`OverviewCardView`, `LocationDetailView`, open/close times cards) for detail panels |
| `FilterView/` | Filter UI components |
| `Images/ImageLoader.swift` | `ImageLoader` singleton — URL-keyed in-memory image cache using `URLSession` |
| `Images/ImageViewCell.swift` | Collection/table cell with async image loading |

### `Drawer/`

Drawer navigation system used exclusively on the Home tab.

| File | Responsibility |
|---|---|
| `DrawerViewController.swift` | Base drawer with rounded corners and pan gesture recognition |
| `DrawerViewDelegate.swift` | `DrawerViewDelegate` protocol; `DrawerState` enum (hidden, collapsed, middle, full); physics of `moveDrawer` and `computePosition` |
| `MainDrawerViewDelegate.swift` | Extension protocol for the root drawer that manages a stack of overlaid drawers |
| `SearchDrawerViewDelegate.swift` | Extension protocol for search-result detail drawers that dismiss on swipe-to-bottom |
| `SearchDrawerViewController.swift` | Concrete search-result drawer view controller |
| `BarView.swift` | Grab-bar indicator at the top of each drawer |

### `Home/`

The Home tab containing the map and associated data views.

| Subdirectory | Content |
|---|---|
| `Map/` | `MapViewController` (UIKit, `MKMapView`), `HomeMapView` (SwiftUI `UIViewControllerRepresentable` bridge), `MapDataSource`, `MapMarker` model, search annotation, map marker dropdown |
| `Dining/` | Dining hall list and detail views; `DiningDataSource`; `MenuItemIconCacheManager` |
| `Fitness/` | Gym list and detail views; `GymDataSource`; `GymClassDataSource`; gym occupancy |
| `Libraries/` | Library list and detail; `LibraryDataSource` |
| `Search/` | Search bar, search results, `SearchViewModel` |
| `Guides/` | `Guide` model, `GuidesView`, `GuidesViewModel`, collage layout |
| `Home Drawer/` | Pinned-items drawer: `BMHomeSectionListView`, `HomeDrawerPinViewModel`, `HomeDrawerRowImageView` |
| `HomeView.swift` | SwiftUI root of the Home tab combining map and section lists |
| `HomeViewModel.swift` | `@MainActor` observable view model aggregating data for the Home tab |
| `OpenClosedStatusManager.swift` | Manager computing open/closed status for items with hours |
| `OpenClosedStatusView.swift` | UI component showing current open/closed status |
| `RedirectionManager.swift` | Handles deep-link navigation within the Home tab |

### `Today/`

The Today tab presenting a tiled dashboard.

| File / Subdirectory | Content |
|---|---|
| `TodayView.swift` | Root SwiftUI view with `TodayTilingLayout` |
| `TodayTileLayout.swift` | Custom `Layout` implementation (`TodayTilingLayout`, `TodayTilePlacementEngine`) for a grid of variable-span tiles |
| `TodayTileView.swift` | Wrapper view for individual tiles |
| `TodayTileAttributes.swift` | Enum `TodayTiles` defining all available tiles and their layout spans |
| `Tiles/News Tile/` | `NewsTileView`, `NewsArticle` model, `NewsDataViewModel` (fetches from Firestore) |
| `Tiles/Weather Tile/` | `WeatherDataViewModel` using Apple WeatherKit; refreshes on a scheduled `Timer` |

### `Safety/`

The Safety tab showing crime incident logs on a map.

| File | Responsibility |
|---|---|
| `SafetyView.swift` | Root SwiftUI view |
| `SafetyViewModel.swift` | `ObservableObject`; fetches `BMSafetyLog` records from Firestore; filter logic by time period and crime type |
| `SafetyMapView.swift` | Map showing crime location pins |
| `SafetyMapMarker.swift` | SwiftUI `Annotation` for crime locations |
| `SafetyLogDetailView.swift` | Detail sheet for a selected log entry |
| `SafetyLogFilterButton.swift` | Filter toggle button |
| `SafetyViewFilterScrollView.swift` | Horizontal scrolling filter bar |

### `Resources/`

The Resources tab listing campus resource links.

| File | Responsibility |
|---|---|
| `ResourcesView.swift` | Root SwiftUI view with `BMSegmentedControlView` and `TabView` paging |
| `ResourcesViewModel.swift` | `ObservableObject`; fetches `BMResourceCategory` records; models `BMResource` and `BMResourceSection` |
| `ResourcesSectionDropdown.swift` | Expandable section and resource item rows with in-app `SFSafariViewController` web view |

### `Events/`

Campus event calendar (navigated from the Today tab toolbar).

| File | Responsibility |
|---|---|
| `EventsView.swift` | Root SwiftUI view |
| `CalendarView.swift` | Calendar grid; `CalendarViewModel` |
| `EventDataSource/EventsViewModel.swift` | `@Observable` view model; `EventsDataService` fetches from the `"Events"` Firestore collection |
| `EventDetailView.swift` | Detail sheet for a single event |
| `EventsDateSectionView.swift` / `EventRowView.swift` | List grouping and row components |

### `FeedbackForm/`

In-app feedback form presented conditionally based on app launch count.

| File | Responsibility |
|---|---|
| `FeedbackFormPresenter.swift` | Controls when to show the form; reads `FeedbackFormConfig` from Firestore; injected via FactoryKit |
| `FeedbackFormView.swift` | SwiftUI form UI |
| `FeedbackFormViewModel.swift` | Fetches `FeedbackFormConfig` from Firestore |

### `Utils/`

Swift standard library extensions and utility types.

| File | Content |
|---|---|
| `WeeklyHours.swift` | `WeeklyHours`, `HoursInterval`, `DailyHoursType`, `WeeklyHoursType` |
| `Date+Extension.swift` | Date arithmetic, formatting, and comparison helpers |
| `DayOfWeek.swift` | `DayOfWeek` enum with raw integer values |
| `AtomicDictionary.swift` | Thread-safe dictionary wrapper (used by `DataManager`) |
| `UserDefaults+Extension.swift` | Typed `UserDefaultsKeys` enum and `UserDefaults` helpers |
| `UIImage+Extensions.swift` | `resized`, `withRoundedBorder`, `withShadow` |
| `UIView+Extensions.swift` / `UIViewController+Extensions.swift` | Layout and presentation helpers |
| `View+Extension.swift` | SwiftUI `ViewModifier` utilities |
| `Logger+Ext.swift` | `os.Logger` subsystem declarations |
| `CLLocation+Extension.swift` | Distance-from-user helper |
| `String+Extension.swift` | String utilities |
| `Collection+Extension.swift` | Collection utilities |

### `Debug/`

Debug-only views and view models accessible via shake gesture in `DEBUG` builds (`TabBarController.motionEnded`).

## WidgetKit Target: `BerkeleyMobileWidget/`

| File | Responsibility |
|---|---|
| `BerkeleyMobileWidgetBundle.swift` | `@main` entry point; configures Firebase if not already configured; declares `GymOccupancyWidget` |
| `GymOccupancyWidget.swift` | `TimelineProvider` implementation; `GymOccupancyEntry` timeline entry; `GymOccupancyWidgetEntryView` and `GymOccupancyWidgetRowView` SwiftUI views |

## Dependency Graph (major boundaries)

```
AppDelegate / SceneDelegate
    └── TabBarController
            ├── MainContainerViewController (Home)
            │       ├── MapViewController (UIKit)
            │       └── HomeView (SwiftUI via UIHostingController)
            │               └── Drawer system (DrawerViewDelegate hierarchy)
            ├── TodayView (SwiftUI)
            ├── SafetyView (SwiftUI)
            └── ResourcesView (SwiftUI)

Data layer (all features depend on):
    DataManager → DataSource implementations → Firestore
    BMNetworkingManager → Firestore
    BMLocationManager → CLLocationManager

DI container:
    BerkeleyMobile+Injection.swift (Container extension)
        → FactoryKit → all @Injected view models
```
