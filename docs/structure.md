# Repository Structure

## Top-Level Layout

```
berkeley-mobile.xcworkspace/    # Xcode workspace (CocoaPods integration)
berkeley-mobile.xcodeproj/      # Xcode project file
berkeley-mobile/                # Main app target sources
BerkeleyMobileWidget/           # Widget extension target sources
Pods/                           # CocoaPods-managed dependencies
Podfile / Podfile.lock          # Dependency declarations
```

## Main App Target: `berkeley-mobile/`

### Entry Points

| File | Responsibility |
|---|---|
| `AppDelegate.swift` | `@UIApplicationMain`; Firebase init, data prefetch, push notification setup |
| `AppDelegate+Migration.swift` | Version-based migration logic (e.g., cache clearing) |
| `SceneDelegate.swift` | Sets `TabBarController` as root; triggers data refresh on foreground |
| `TabBarController.swift` | Root tab bar; wires four tabs (Home, Today, Safety, Resources) |
| `MainContainerViewController.swift` | Home tab host; embeds `HomeView` and `MapViewController`; implements `MainDrawerViewDelegate` |
| `BerkeleyMobile+Injection.swift` | FactoryKit `Container` extension registering all injectable view models |

### `Data/`

Core data infrastructure shared across features.

| Path | Responsibility |
|---|---|
| `DataManager.swift` | Singleton orchestrator for `DataSource` pre-loading; deduplicates Firestore fetches |
| `BMNetworkingManager.swift` | `async/await` Firestore access for safety logs and resource categories |
| `BMLocationManager.swift` | Singleton `CLLocationManager` wrapper; broadcasts updates via `NotificationCenter` |
| `BMConstants.swift` | App-wide constants: Firestore collection names, map coordinates, section titles |
| `BMError.swift` | Custom `Error` type used across the app |
| `DataSource.swift` | `DataSource` protocol defining `fetchItems` and `fetchDispatch` requirements |
| `ItemProtocols/` | Capability protocols: `SearchItem`, `HasLocation`, `HasOpenTimes`, `HasOpenClosedStatus`, `HasImage`, `HasPhoneNumber`, `HasName`, `HasWebsite`, `CanFavorite`, `BMCalendarEvent` |
| `PropertyWrappers/Display.swift` | `@Display` property wrapper — strips whitespace/invalid chars from displayed strings |
| `SortingFunctions.swift` | Shared sort comparators (e.g., sort by distance to user) |

### `Common/`

Reusable UI components shared across features.

| Path | Responsibility |
|---|---|
| `Images/ImageLoader.swift` | In-memory image cache with `URLSession`-based loading and cancellation |
| `BMCachedAsyncImageView.swift` | SwiftUI async image view with caching |
| `DetailView/` | Reusable detail card views: open times, location distance, overview, phone |
| `FilterView/` | Horizontal scroll filter chip component (`UICollectionView`-based) |
| `BMAlert.swift` | Alert model used with SwiftUI |
| `BMContentUnavailableView.swift` | Shared empty/error state SwiftUI view |
| `BMDrawerView.swift` | SwiftUI representation of drawer content |
| `CardView.swift`, `CollapsibleCardView.swift` | Reusable UIKit card containers |
| `TagView.swift` | Label tag component |
| `BMActionButton.swift`, `ActionButton.swift` | Styled button components |
| `BMFilterButton.swift` | Filter toggle button |
| `BMSegmentedControlView.swift` | Segmented control |
| `ReviewPrompter.swift` | App Store review prompt trigger |
| `SafariWebView.swift` | In-app `SFSafariViewController` wrapper |
| `ScrollingStackView.swift` | Scrollable stack view |
| `IconPairView.swift` | Icon + label pair layout |
| `BMTopBlobView.swift` | Decorative gradient blob header |

### `Drawer/`

Custom bottom-sheet drawer system.

| File | Responsibility |
|---|---|
| `DrawerViewController.swift` | Pan-gesture-driven bottom sheet with configurable states |
| `DrawerViewDelegate.swift` | Protocol + default extension providing pan handling, position computation, animated movement |
| `MainDrawerViewDelegate.swift` | Protocol + extension for stacked-drawer management on the Home tab |
| `SearchDrawerViewDelegate.swift` | Drawer delegate variant for search interactions |
| `BarView.swift` | Gray drag indicator bar rendered at drawer top |

### Feature Modules

#### `Home/`

| Subdirectory | Responsibility |
|---|---|
| `Map/` | `MapViewController` (MKMapView), `MapDataSource` (Firestore `"Map Marker"` collection), `MapMarker` model, dropdown and user-location button views |
| `Dining/` | `DiningHallsViewModel`, `BMDiningHall`/`BMDiningHallDocument` models (Firestore), `DiningDetailView`, `DiningHallsView`, `DiningRestriction` |
| `Libraries/` | `LibraryDataSource` (Firestore `"Libraries"` collection), `BMLibrary` model, library list and detail views |
| `Fitness/` | `GymDataSource` (Firestore `"Gyms"` collection), `GymClassDataSource` (Firestore `"Gym Classes"`), `BMGym` model, fitness views |
| `Search/` | `SearchViewModel`, search result cell, `SearchAnnotation`, `MapPlacemark` |
| `Home Drawer/` | `BMHomeSectionListView`, `HomeDrawerPinViewModel`, `HomeDrawerRowImageView`, `HomeSectionListRowView` |
| `Guides/` | `GuidesViewModel`, `Guide` model, `GuidesView`, `GuideDetailView` |
| `Tiles/` | `TodayTileView`, `TodayTileLayout`, `TodayTileAttributes` layout primitives used by the Today screen |
| `HomeView.swift` | Root SwiftUI view for the Home tab |
| `HomeViewModel.swift` | Aggregates home-screen data from `DataManager` |
| `OpenClosedStatusManager.swift` | Computes open/closed status for locations |
| `RedirectionManager.swift` | Handles deep-link–style navigation from the Home tab |

#### `Today/`

| File | Responsibility |
|---|---|
| `TodayView.swift` | Root SwiftUI view; renders a tile grid using `TodayTilingLayout` |
| `TodayTileAttributes.swift` | `TodayTiles` enum (`.news`, `.weather`), tile span and style configuration |
| `TodayTileLayout.swift` | Custom SwiftUI `Layout` for tile grid |
| `TodayTileView.swift` | Individual tile container with gradient background |
| `Tiles/Weather Tile/` | `WeatherDataViewModel` (WeatherKit), `TodayWeatherTileView` |
| `Tiles/News Tile/` | `NewsDataViewModel` (Firestore `"Daily Cal News"`), `NewsTileView` |

#### `Events/`

| File | Responsibility |
|---|---|
| `EventDataSource/EventsViewModel.swift` | `EventsDataService` (Firestore `"Events"`), `EventsViewModel` (`@Observable`) |
| `EventDataSource/BMEventCalendarEntry.swift` | Event model; `NSCoding`-conformant for calendar persistence |
| `CalendarView.swift` | Academic calendar date picker view |
| `EventsView.swift` | Events list view |
| `EventDetailView.swift` | Event detail sheet |
| `BMEventManager.swift` | Calendar read/write operations via `EventKit` |

#### `Safety/`

| File | Responsibility |
|---|---|
| `SafetyViewModel.swift` | Fetches `BMSafetyLog` objects from Firestore via `BMNetworkingManager` |
| `SafetyView.swift` | Root SwiftUI safety view with map and log list |
| `SafetyMapView.swift` | Map showing `SafetyMapMarker` annotations |
| `SafetyLogDetailView.swift` | Individual log detail |
| `SafetyLogFilterButton.swift`, `SafetyViewFilterScrollView.swift` | Filter controls |

#### `Resources/`

| File | Responsibility |
|---|---|
| `ResourcesViewModel.swift` | Fetches `BMResourceCategory` objects from Firestore via `BMNetworkingManager` |
| `ResourcesView.swift` | Root SwiftUI resource listing |
| `ResourcesSectionDropdown.swift` | Collapsible category section |

#### `FeedbackForm/`

| File | Responsibility |
|---|---|
| `FeedbackFormPresenter.swift` | Controls when the feedback form appears (based on launch count vs. remote config) |
| `FeedbackFormViewModel.swift` | Fetches `FeedbackFormConfig` from Firebase |
| `FeedbackFormView.swift` | SwiftUI feedback form |

#### `Debug/`

| File | Responsibility |
|---|---|
| `DebugView.swift` | SwiftUI debug panel (only in `#if DEBUG`); accessible via device shake |
| `DebugViewModel.swift` | Debug state, app info, ability to force-present feedback form |

### `Assets/`

| Path | Responsibility |
|---|---|
| `Colors/Colors.swift` | `BMColor` struct with all color tokens; UIKit colors with dark-mode adaptive variants |
| `Fonts.swift` | `BMFont` struct with Apercu font family closures (regular, bold, medium, mediumItalic, light) |
| `Assets.xcassets` | Image assets catalog |

### `Utils/`

Swift extensions and utilities:

| File | Responsibility |
|---|---|
| `Date+Extension.swift` | Date arithmetic, comparison, and formatting helpers |
| `UserDefaults+Extension.swift` | Typed `UserDefaultsKeys` enum and typed `get`/`set` overloads |
| `AtomicDictionary.swift` | Thread-safe dictionary wrapper |
| `WeeklyHours.swift` | Weekly hours model and `contains` time-range logic |
| `DayOfWeek.swift` | `DayOfWeek` enum |
| `UIScrollView+GestureRecognizer.swift` | `SimultaneousGestureScrollView` for drawer/scroll coordination |
| `UIImage+Extensions.swift` | Image resizing, shadow, rounded border helpers |
| `UIView+Extensions.swift` | View layout helpers |
| `UIViewController+Extensions.swift` | View controller helpers |
| `Logger+Ext.swift` | `os.Logger` category extensions |
| `TimeInterval+Ext.swift` | `TimeInterval` convenience initializers |
| Various other `+Extension.swift` | String, Collection, NSCoding, CLLocation, UIDevice, UIStackView extensions |

## Widget Extension Target: `BerkeleyMobileWidget/`

| File | Responsibility |
|---|---|
| `BerkeleyMobileWidgetBundle.swift` | `@main` `WidgetBundle`; initializes Firebase if not already configured |
| `GymOccupancyWidget.swift` | `GymOccupancyProvider` (`TimelineProvider`), `GymOccupancyEntry` (`TimelineEntry`), `GymOccupancyWidgetEntryView` and `GymOccupancyWidgetRowView` (SwiftUI) |

## Architectural Boundaries

- **DataManager + DataSource protocol**: The data pre-loading boundary. Only `MapDataSource`, `LibraryDataSource`, and `GymDataSource` are registered in `DataManager`'s source list. Other data (safety, resources, events, news, dining, weather) is fetched directly by individual view models.
- **FactoryKit Container**: All injectable view models cross feature boundaries via `Container`. This is the sole DI registration point (`BerkeleyMobile+Injection.swift`).
- **Drawer System**: The drawer abstraction is contained entirely within `berkeley-mobile/Drawer/`. Callers interact via `DrawerViewDelegate` and `MainDrawerViewDelegate` protocols.
- **Widget Extension**: Runs in a separate process. Shares Firebase configuration but no Swift types with the main app target.
