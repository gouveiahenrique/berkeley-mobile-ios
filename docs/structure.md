# Repository Structure

## Top-Level Layout

```
berkeley-mobile.xcworkspace/    # CocoaPods workspace
berkeley-mobile.xcodeproj/     # Xcode project
berkeley-mobile/                # Main application target sources
BerkeleyMobileWidget/           # Widget Extension target sources
Pods/                           # CocoaPods dependencies (generated)
Podfile                         # Pod dependency declarations
Podfile.lock                    # Locked pod versions
```

---

## `berkeley-mobile/` — Main Application Target

### Entry Points and Scene Management

| File | Responsibility |
|---|---|
| `AppDelegate.swift` | `@UIApplicationMain`; Firebase init, DataManager fetch, push notification setup |
| `AppDelegate+Migration.swift` | App-launch migration logic |
| `SceneDelegate.swift` | Window and root view controller setup (`TabBarController`) |
| `TabBarController.swift` | Four-tab navigation root |
| `MainContainerViewController.swift` | Home tab container; embeds `HomeView` + implements `MainDrawerViewDelegate` |
| `BerkeleyMobile+Injection.swift` | FactoryKit `Container` extension; all ViewModel/manager factory registrations |

### `Assets/`

Design tokens.

| File | Responsibility |
|---|---|
| `Assets.xcassets/` | Image and color assets |
| `Fonts.swift` | `BMFont` struct — Apercu font family accessors |
| `Colors/Colors.swift` | `BMColor` struct — adaptive `UIColor` definitions |
| `Colors/Colors+*.swift` | `BMColor` namespace extensions per feature (Calendar, ActionButton, Event, etc.) |

### `Common/`

Shared, reusable UI components used across multiple features.

| File / Folder | Responsibility |
|---|---|
| `BMActionButton.swift` | Full-width action button (iOS 26 glass effect / pre-26 solid style) |
| `BMAlert.swift` | Alert model used with `AlertPresentationViewModifier` |
| `BMCachedAsyncImageView.swift` | SwiftUI image view backed by `ImageLoader` |
| `BMContentUnavailableView.swift` | Empty-state placeholder |
| `BMDrawerView.swift` | SwiftUI bottom-sheet drawer used by `HomeView` and `SafetyView` |
| `BMFilterButton.swift` | Reusable filter toggle button |
| `BMSegmentedControlView.swift` | Custom segmented control |
| `BMTopBlobView.swift` | Decorative background blob shape |
| `CardView.swift` | Card container with rounded corners |
| `CollapsibleCardView.swift` | Expandable card |
| `DetailView/` | Shared detail card components (`OverviewCardView`, `OpenTimesCardView`, `DescriptionCardView`, etc.) |
| `FilterView/` | Filter panel used in dining/gym/library sections |
| `ReviewPrompter.swift` | App Store review prompt logic |
| `ScrollingStackView.swift` | Horizontally scrolling stack |
| `TagView.swift` | Open/closed tag chip |

### `Data/`

Data layer; all Firestore communication and shared data models.

| File | Responsibility |
|---|---|
| `DataSource.swift` | `DataSource` protocol — `fetchItems(_:)` + `fetchDispatch` |
| `DataManager.swift` | Singleton orchestrator for all `DataSource` fetches; in-memory cache with 1-hour re-fetch throttle |
| `BMNetworkingManager.swift` | Singleton for direct Firestore queries (safety logs, resource categories) |
| `BMLocationManager.swift` | Singleton `CLLocationManager` wrapper; broadcasts via `NotificationCenter` |
| `BMConstants.swift` | Shared constants (Berkeley coordinates, Firestore collection names, section titles) |
| `BMError.swift` | App-level error type |
| `BMEventManager.swift` | EventKit integration for adding/deleting calendar events |
| `SortingFunctions.swift` | Shared sorting helpers |
| `ItemProtocols/` | Protocols defining capability contracts (`HasImage`, `HasLocation`, `HasName`, `HasPhoneNumber`, `SearchItem`, `CanFavorite`) |
| `PropertyWrappers/` | Custom Swift property wrappers |

### `Drawer/`

UIKit drawer system.

| File | Responsibility |
|---|---|
| `DrawerViewDelegate.swift` | `DrawerState` enum; `DrawerViewDelegate` protocol with default pan and move implementations |
| `DrawerViewController.swift` | Base `UIViewController` with pan gesture and animated position changes |
| `SearchDrawerViewController.swift` | Subclass for secondary detail drawers (library, gym detail) |
| `MainDrawerViewDelegate.swift` | Extension protocol adding drawer-stack management (`dismissTop`, `coverTop`, `hideTop`, `showTop`, `showMainDrawer`) |
| `SearchDrawerViewDelegate.swift` | Protocol extension for search-context drawers |

### `Events/`

Campus events feature.

| File / Folder | Responsibility |
|---|---|
| `EventsView.swift` | SwiftUI list of events grouped by date |
| `EventRowView.swift` | Single event row |
| `EventDetailView.swift` | Event detail sheet |
| `EventsDateSectionView.swift` | Section header for a date group |
| `CalendarView.swift` | Academic calendar picker view |
| `EventDataSource/EventsViewModel.swift` | `EventsDataService` (Firestore fetch) + `EventsViewModel` (Observable); calendar add/delete logic |

### `FeedbackForm/`

In-app feedback form feature (`FeedbackFormPresenter`, `FeedbackFormViewModel`).

### `Home/`

Home tab content, split into subsections.

| Subfolder | Responsibility |
|---|---|
| `HomeView.swift` | Root SwiftUI view for Home tab; drawer overlay on `HomeMapView` |
| `HomeViewModel.swift` | `HomeViewModel` — fetch state, detail presentation, drawer state |
| `Home Drawer/` | `BMHomeSectionListView` — shared list view used by Dining/Fitness/Study sections |
| `Dining/` | `DiningHallsView`, `DiningHallsViewModel`, `DiningDetailView`, `DiningDataSource/` |
| `Fitness/` | `FitnessView`, gym occupancy gauges, `GymDetailView`, `GymDataSource/`, `GymOccupancy/` |
| `Libraries/` | `LibrariesView`, `LibraryDetailView`, `LibraryDataSource/` |
| `Map/` | `MapViewController` (UIKit + SwiftUI hybrid); `MapDataSource/`; map marker, search, and detail components |
| `Guides/` | `GuidesView`, `GuidesViewModel` |

### `Resources/`

Resources tab (`ResourcesView`, `ResourcesViewModel`, `ResourcesSectionDropdown`).

### `Safety/`

Safety tab.

| File | Responsibility |
|---|---|
| `SafetyView.swift` | Map + drawer layout; safety log list and detail |
| `SafetyViewModel.swift` | Fetches safety logs via `BMNetworkingManager`; filter state |

### `Today/`

Today tab.

| File / Folder | Responsibility |
|---|---|
| `TodayView.swift` | Root view; renders `TodayTiles` in a `TodayTilingLayout` |
| `TodayTileAttributes.swift` | `TodayTile`, `TodayTileAttributes`, `TodayTileSpan`, `TodayTileStyle`, `TodayTiles` enum |
| `TodayTileLayout.swift` | `TodayTilePlacementEngine` + `TodayTilingLayout` (custom SwiftUI `Layout`) |
| `TodayTileView.swift` | Individual tile wrapper view |
| `Tiles/Weather Tile/` | `TodayWeatherTileView`, `WeatherDataViewModel` (WeatherKit) |
| `Tiles/News Tile/` | `NewsTileView`, `NewsDataViewModel` |

### `Utils/`

Swift extensions and utilities.

| File | Responsibility |
|---|---|
| `AtomicDictionary.swift` | Thread-safe dictionary wrapper |
| `Date+Extension.swift` | `Date` convenience methods |
| `UserDefaults+Extension.swift` | `UserDefaultsKeys` enum + typed `UserDefaults` accessors |
| `View+Extension.swift` | SwiftUI `ViewModifier` types and `View` extension helpers |
| `WeeklyHours.swift` | `WeeklyHours` model and open/closed logic |
| `UIView+Extensions.swift`, `UIViewController+Extensions.swift`, etc. | UIKit convenience extensions |

---

## `BerkeleyMobileWidget/` — Widget Extension Target

| File | Responsibility |
|---|---|
| `BerkeleyMobileWidgetBundle.swift` | `@main` WidgetBundle entry; `FirebaseApp.configure()` guard |
| `GymOccupancyWidget.swift` | `GymOccupancyProvider` (TimelineProvider), widget views, `GymOccupancyEntry` |

---

## Architectural Boundaries

```
AppDelegate / SceneDelegate
       │
       └── TabBarController
              ├── MainContainerViewController  (Home tab)
              │      ├── UIHostingController<HomeView>
              │      │      ├── HomeMapView (MKMapView)
              │      │      └── BMDrawerView
              │      │             ├── DiningHallsView
              │      │             ├── FitnessView
              │      │             ├── LibrariesView
              │      │             └── GuidesView
              │      └── Drawer system (DrawerViewController stack)
              │
              ├── UIHostingController<TodayView>   (Today tab)
              ├── UIHostingController<SafetyView>  (Safety tab)
              └── UIHostingController<ResourcesView> (Resources tab)

Data flow:
  Firebase/Firestore ──► DataManager (DataSource protocol)
                    ──► BMNetworkingManager (async/await)
                    ──► EventsDataService (async/await)
                    ──► GymOccupancyViewModel (TaskGroup)
                    ──► WeatherDataViewModel (WeatherKit)
```

Dependencies are injected via FactoryKit `Container` (defined in `BerkeleyMobile+Injection.swift`) using `@Injected`, `@InjectedObject`, and `@InjectedObservable` property wrappers at call sites.
