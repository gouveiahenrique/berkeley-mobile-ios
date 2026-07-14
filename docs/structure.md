# Repository Structure

## Top-Level Layout

```
berkeley-mobile/                  Main iOS application target
BerkeleyMobileWidget/             WidgetKit extension target
Podfile / Podfile.lock            CocoaPods dependency configuration
berkeley-mobile.xcodeproj/        Xcode project
berkeley-mobile.xcworkspace/      Xcode workspace (includes CocoaPods)
Pods/                             CocoaPods-generated dependencies
docs/                             Technical documentation
app_preview_images/               App Store preview assets
```

## Main App Target (`berkeley-mobile/`)

### Entry Points

| File | Responsibility |
|------|----------------|
| `AppDelegate.swift` | App lifecycle, Firebase configuration, push notifications |
| `AppDelegate+Migration.swift` | Version migration logic (cache clearing on update) |
| `SceneDelegate.swift` | Window creation, root view controller setup |
| `TabBarController.swift` | Root navigation (Home, Today, Safety, Resources tabs) |
| `MainContainerViewController.swift` | Home tab container; embeds `HomeView` and `MapViewController` |
| `BerkeleyMobile+Injection.swift` | FactoryKit DI container registrations |

### `Data/`

Core data infrastructure shared across features.

| Component | Responsibility |
|-----------|----------------|
| `DataManager.swift` | Singleton orchestrator; fetches all `DataSource` types on launch |
| `DataSource.swift` | Protocol defining `fetchItems(_:)` and `fetchDispatch` |
| `BMNetworkingManager.swift` | Ad-hoc Firestore queries (safety logs, resource categories) |
| `BMLocationManager.swift` | Singleton CLLocation wrapper; broadcasts via NotificationCenter |
| `BMEventManager.swift` | EventKit integration for calendar event read/write |
| `BMConstants.swift` | Global constants (Firestore collection names, map coordinates) |
| `BMError.swift` | App-specific error enum |
| `SortingFunctions.swift` | Shared sorting utilities |
| `ItemProtocols/` | Protocols: `SearchItem`, `CanFavorite`, `HasOpenClosedStatus`, `HasOpenTimes`, `HasLocation`, `HasName`, `HasPhoneNumber`, `HasWebsite`, `HasImage` |
| `PropertyWrappers/` | `Display<T>` property wrapper for sanitizing display strings |

### `Home/`

The Home tab with its map, drawer, and section views.

| Subdirectory | Responsibility |
|--------------|----------------|
| `HomeView.swift` | SwiftUI root for the Home tab; hosts map and drawer |
| `HomeViewModel.swift` | State for the home drawer (sections, pinning, analytics) |
| `Map/` | `MapViewController` (UIKit), `MapDataSource`, `MapMarker` model, search bar, dropdown button |
| `Dining/` | `DiningHallsViewModel`, `DiningDataSource`, `BMDiningHall` model, detail views |
| `Fitness/` | `GymDataSource`, `BMGym`, `GymDetailViewController`, `GymClassDataSource`, `GymOccupancy/` |
| `Libraries/` | `LibraryDataSource`, `BMLibrary`, detail views |
| `Search/` | `SearchViewModel`, search results view |
| `Home Drawer/` | `HomeDrawerPinViewModel`, pinnable item list UI |
| `Guides/` | `GuidesViewModel`, guides listing |
| `OpenClosedStatusManager.swift` | Timer-based open/closed state tracking via `HasOpenClosedStatus` |
| `OpenClosedStatusView.swift` | SwiftUI open/closed indicator pill |
| `RedirectionManager.swift` | Handles deep-link / in-app navigation redirection |

### `Today/`

Today tab with tiled content display.

| Component | Responsibility |
|-----------|----------------|
| `TodayView.swift` | SwiftUI grid layout of tiles; navigates to `EventsView` |
| `TodayTileAttributes.swift` | Tile configuration model (span, style) |
| `TodayTileLayout.swift` | Custom SwiftUI `Layout` implementing grid placement |
| `TodayTileView.swift` | Generic tile wrapper view |
| `Tiles/News Tile/` | `NewsDataViewModel`, `NewsTileView`, `NewsArticle` model; fetches from Firestore `"Daily Cal News"` collection |
| `Tiles/Weather Tile/` | `WeatherDataViewModel`, `TodayWeatherTileView`; uses Apple WeatherKit |

### `Events/`

Campus events calendar.

| Component | Responsibility |
|-----------|----------------|
| `EventsView.swift` | Scrollable list of events grouped by date |
| `EventsViewModel.swift` | `@Observable` state; delegates to `EventsDataService` for Firestore fetch |
| `EventsDataService` (nested in `EventsViewModel.swift`) | Reads Firestore events collection; decodes `BerkeleyEventsDaySnapshot` |
| `CalendarView.swift` | Mini calendar grid showing event-bearing dates |
| `CalendarViewModel.swift` | State for calendar date range and entry existence |
| `CalendarSectionView.swift` | Composable section wrapping `CalendarView` |
| `EventDataSource/` | `BerkeleyEvent`, `BMEventCalendarEntry`, `BMCalendarEvent` models |
| `EventDetailView.swift` | Detail sheet with add-to-calendar support |

### `Safety/`

Campus safety log display.

| Component | Responsibility |
|-----------|----------------|
| `SafetyView.swift` | Map + drawer layout for safety alerts |
| `SafetyViewModel.swift` | `ObservableObject`; fetches from `BMNetworkingManager.shared.fetchSafetyLogs()` |
| `BMSafetyLog` (in `SafetyViewModel.swift`) | `Codable` model for a crime record |
| `SafetyMapView.swift` | MKMapView overlay for safety log pins |
| `SafetyLogDetailView.swift` | Detail sheet for a selected log |

### `Resources/`

Student resource directory.

| Component | Responsibility |
|-----------|----------------|
| `ResourcesView.swift` | Paginated category list using `BMSegmentedControlView` |
| `ResourcesViewModel.swift` | Fetches resource categories via `BMNetworkingManager` |

### `FeedbackForm/`

| Component | Responsibility |
|-----------|----------------|
| `FeedbackFormPresenter.swift` | Logic to conditionally show feedback form based on launch count |
| `FeedbackFormViewModel.swift` | Fetches form configuration from Firestore |

### `Common/`

Reusable UI components shared across features.

| Component | Responsibility |
|-----------|----------------|
| `CardView.swift` / `CollapsibleCardView.swift` | Base card containers |
| `DetailView/` | `OverviewCardView`, `OpenTimesCardSwiftUIView`, `OpenTimesCardView`, `LocationDetailView` |
| `FilterView/` | Filter chip UI components |
| `ScrollingStackView.swift` | Vertical stack in a scroll view with simultaneous gesture support |
| `BMDrawerView.swift` | SwiftUI drawer view with configurable detent states |
| `BMSegmentedControlView.swift` | Custom segmented control |
| `BMCachedAsyncImageView.swift` | Async image loading with `ImageLoader` cache |
| `BMActionButton.swift` / `ActionButton.swift` | Styled primary action buttons |
| `BMContentUnavailableView.swift` | Empty-state placeholder |
| `BMAlert.swift` | Alert model used with `presentAlert(alert:)` view modifier |
| `TagView.swift` | Open/closed tag pill (UIKit) |
| `ReviewPrompter.swift` | App Store review request logic |

### `Drawer/`

UIKit-based drawer gesture system.

| Component | Responsibility |
|-----------|----------------|
| `DrawerViewDelegate.swift` | Protocol + default implementations for pan-driven drawer positioning (`DrawerState`: hidden, collapsed, middle, full) |
| `DrawerViewController.swift` | UIKit view controller managed by drawer delegates |
| `SearchDrawerViewDelegate.swift` | Extends `DrawerViewDelegate` to dismiss on swipe-to-bottom |

### `Assets/`

| Component | Responsibility |
|-----------|----------------|
| `Assets.xcassets` | Image and color assets |
| `Colors/Colors.swift` | `BMColor` struct with semantic color constants supporting dark mode |
| `Colors/Colors+*.swift` | Domain-specific color extensions (Calendar, MapMarker, AlertView, Resource, ActionButton) |
| `Fonts/` | `BMFont` — custom font factory |

### `Utils/`

Swift extensions and utility types.

| File | Responsibility |
|------|----------------|
| `AtomicDictionary.swift` | Thread-safe dictionary using `pthread_rwlock_t` |
| `WeeklyHours.swift` | `WeeklyHours` class mapping `DayOfWeek` to `[HoursInterval]` |
| `DayOfWeek.swift` | Enum for weekday representation |
| `String+Extension.swift` | Time string parsing, `DateInterval` conversion |
| `Date+Extension.swift` | Date comparison utilities |
| `UserDefaults+Extension.swift` | Typed `UserDefaultsKeys` enum extension |
| `View+Extension.swift` | SwiftUI view modifiers (`presentAlert`, `shadowfy`, `addEventsContextMenu`, `todayTileSpan`) |
| `UIView+Extensions.swift` | Constraint helpers |
| `Logger+Ext.swift` | Typed `os.Logger` subsystems per view model |

### `Debug/`

| Component | Responsibility |
|-----------|----------------|
| `DebugView.swift` | DEBUG-only SwiftUI view (app version info, force-show feedback form); presented on shake gesture |
| `DebugViewModel.swift` | Backing state for `DebugView` |

## Widget Extension Target (`BerkeleyMobileWidget/`)

```
BerkeleyMobileWidgetBundle.swift   @main entry; configures Firebase if not already configured
GymOccupancyWidget.swift           StaticConfiguration widget; reads Firestore, refreshes every 15 min
GymOccupancyViewModel.swift        Shared with main app via framework; fetches occupancy data
```

## Dependency Boundaries

- The `Data/` layer has no dependency on any specific feature module.
- Feature modules (`Home/`, `Today/`, `Events/`, `Safety/`, `Resources/`) depend on `Data/` and `Common/`.
- `BerkeleyMobile+Injection.swift` wires view models into the FactoryKit container; individual view models do not import FactoryKit directly.
- The Widget extension shares `GymOccupancyViewModel` with the main app via a shared source reference and configures its own Firebase instance.
