# Repository Structure

## Top-Level Layout

```
berkeley-mobile.xcodeproj/     Xcode project
berkeley-mobile.xcworkspace/   CocoaPods workspace
berkeley-mobile/               Main application source
BerkeleyMobileWidget/          iOS WidgetKit extension
Podfile / Podfile.lock         CocoaPods dependency specification
Pods/                          Resolved pod sources (not committed)
app_preview_images/            Marketing screenshots
docs/                          Engineering documentation
```

## Main Application: `berkeley-mobile/`

### Root

| File | Responsibility |
|---|---|
| `AppDelegate.swift` | App lifecycle: Firebase init, DataManager prefetch, location start, FCM registration |
| `AppDelegate+Migration.swift` | Version-based migration logic; on version upgrade, clears Firebase persistence cache |
| `SceneDelegate.swift` | Scene lifecycle: creates root `TabBarController`, calls `DataManager.fetchIfNecessary` on foreground |
| `MainContainerViewController.swift` | UIKit root for the Home tab; hosts `HomeView` via `UIHostingController`; implements `MainDrawerViewDelegate` |
| `TabBarController.swift` | Four-tab navigation controller; integrates `FeedbackFormPresenter` |
| `BerkeleyMobile+Injection.swift` | FactoryKit `Container` extensions registering all ViewModels and shared services |
| `Info.plist` | Bundle metadata and permissions declarations |
| `berkeley-mobile.entitlements` | App capabilities configuration |

---

### `Assets/`

| Path | Responsibility |
|---|---|
| `Assets/Fonts.swift` | `BMFont` struct — Apercu typeface with Regular, Bold, Medium, MediumItalic, Light weights; falls back to system font |
| `Assets/Colors/Colors.swift` | `BMColor` struct — base color palette with dark/light mode adaptive colors |
| `Assets/Colors/Colors+*.swift` | `BMColor` extensions grouped by feature: ActionButton, AlertView, Calendar, Event, GymClass, MapMarker, Resource, StudyPact, TagView, Text |
| `Assets.xcassets/` | Image asset catalog: app icon, food restriction icons, map icons, theme blobs, StudyPact imagery |

---

### `Common/`

Reusable UI components and utilities shared across features.

| File | Responsibility |
|---|---|
| `BMActionButton.swift` | SwiftUI primary action button; uses `glassEffect` on iOS 26+ |
| `BMCachedAsyncImageView.swift` | SwiftUI async image view backed by `ImageLoader` |
| `BMContentUnavailableView.swift` | SwiftUI empty-state view with icon, title, subtitle |
| `BMDrawerView.swift` | SwiftUI drawer container used in `HomeView` |
| `BMFilterButton.swift` | SwiftUI pill-shaped toggle filter button |
| `BMSegmentedControlView.swift` | SwiftUI segmented tab control |
| `BMTopBlobView.swift` | Decorative brand blob header |
| `BMAlert.swift` | Alert model used by ViewModels to surface errors |
| `ActionButton.swift` | UIKit action button (legacy) |
| `CardView.swift` | UIKit card container |
| `CollapsibleCardView.swift` | Expandable/collapsible UIKit card |
| `ReviewPrompter.swift` | App Store review prompt logic |
| `TagView.swift` | UIKit pill label for open/closed status tags |
| `ScrollingStackView.swift` | Horizontally scrolling UIKit stack |
| `IconPairView.swift` | Icon + label pair view |
| `DetailTapGestureRecognizer.swift` | Tap gesture recognizer used in detail views |

#### `Common/DetailView/`

Reusable detail cards for items with location, hours, description:
- `DetailView.swift` — base UIKit detail view
- `OverviewCardView.swift` — image + summary card
- `OpenTimesCardView.swift` / `OpenTimesCardSwiftUIView.swift` — hours display
- `DescriptionCardView.swift` — text description card
- `LocationDetailView.swift` — map pin + address card

#### `Common/FilterView/`

- `FilterView.swift` / `FilterViewCell.swift` — UIKit filter chip row

#### `Common/Images/`

- `ImageLoader.swift` — URLSession-based in-memory image cache singleton
- `ImageViewCell.swift` — UITableViewCell subclass with image loading

---

### `Data/`

Data layer: protocols, models, caching, and networking.

| File | Responsibility |
|---|---|
| `DataSource.swift` | `DataSource` protocol defining `fetchItems(_:)` and `fetchDispatch` |
| `DataManager.swift` | Singleton coordinator; caches data in `AtomicDictionary`; enforces 1-hour re-fetch interval |
| `BMNetworkingManager.swift` | Singleton for `async/await` Firestore queries (Safety, Resources features) |
| `BMLocationManager.swift` | Singleton `CLLocationManager` wrapper; broadcasts updates via `NotificationCenter` |
| `BMConstants.swift` | App-wide constants: map region bounds, Firestore collection names, section titles |
| `BMError.swift` | `BMError` enum for domain errors |
| `BMEventManager.swift` | EventKit integration for adding/deleting calendar events |
| `SortingFunctions.swift` | Shared sorting helpers |

#### `Data/ItemProtocols/`

Protocols expressing entity capabilities:
- `SearchItem.swift` — searchable item (name, location coordinates)
- `HasImage.swift` — entity with an image URL and in-memory cache getter
- `HasLocation.swift` — latitude/longitude
- `HasName.swift` — display name
- `HasOpenClosedStatus.swift` — open/closed status based on `hours`
- `HasOpenTimes.swift` — weekly hours intervals
- `HasPhoneNumber.swift` — phone contact
- `HasWebsite.swift` — URL link
- `CanFavorite.swift` — favorites support
- `BMCalendarEvent.swift` — calendar event protocol

#### `Data/PropertyWrappers/`

- `Display.swift` — `@propertyWrapper` that trims whitespace and removes invalid characters from `String` and `String?` values

---

### `Drawer/`

UIKit-based drawer navigation system (used in the older Home tab implementation).

| File | Responsibility |
|---|---|
| `DrawerViewController.swift` | Base sliding drawer UIViewController |
| `DrawerViewDelegate.swift` | Protocol for drawer state management |
| `MainDrawerViewDelegate.swift` | Protocol extension managing a stack of drawers |
| `SearchDrawerViewController.swift` | Drawer variant embedding a search interface |
| `SearchDrawerViewDelegate.swift` | Delegate for search-specific drawer |
| `BarView.swift` | Drag handle bar view |

---

### `Events/`

Campus events calendar feature.

| File | Responsibility |
|---|---|
| `EventDataSource/EventsViewModel.swift` | `EventsDataService` fetches from Firestore `"Events"` collection; `EventsViewModel` exposes data grouped by date, handles add/delete to device Calendar |
| `EventDataSource/BMEventCalendarEntry.swift` | Event model for calendar display |
| `CalendarView.swift` / `CalendarSectionView.swift` | Calendar grid UI |
| `EventsView.swift` / `EventsDateSectionView.swift` / `EventRowView.swift` / `EventDetailView.swift` | Events list and detail views |
| `AllDayEventBannerView.swift` / `BMAddedCalendarStatusOverlayView.swift` | Supplementary event UI elements |

---

### `FeedbackForm/`

In-app feedback flow shown after a configurable number of launches.

| File | Responsibility |
|---|---|
| `FeedbackFormPresenter.swift` | Determines when to surface the form; implements `FeedbackFormPresenterDelegate` |
| `FeedbackFormViewModel.swift` | Form state |
| `FeedbackFormView.swift` | SwiftUI feedback form view |

---

### `Home/`

Home tab: map, dining, fitness, libraries, guides, and drawer UI.

| File | Responsibility |
|---|---|
| `HomeView.swift` | Top-level SwiftUI view composing `HomeMapView` and `BMDrawerView` with tabbed content |
| `HomeViewModel.swift` | Fetches dining halls, gyms, libraries from `DataManager`; manages drawer state |
| `OpenClosedStatusManager.swift` | Schedules `Timer` objects to fire at open/close boundary times for entities with hours |

#### `Home/Map/`

- `MapViewController.swift` — UIKit `MKMapView` controller; handles map annotations, search bar, user location button, dropdown marker filters
- `MapDataSource/MapDataSource.swift` — `DataSource` implementation fetching map markers from Firestore
- `MapDataSource/MapMarker.swift` — map annotation model with type-based color/icon logic
- `MapMarkerDetailView.swift` — UIKit detail callout for selected markers
- `MapMarkersDropdownView.swift` — dropdown to filter visible marker categories
- `MapPlacemark.swift` — `MapPlacemark` (CLLocation + search item) and `CodableMapPlacemark` (Codable for UserDefaults persistence)
- `SearchAnnotation.swift` — MKAnnotation for search result pins

#### `Home/Search/`

- `SearchViewModel.swift` — `@Observable` search state; queries `DataManager.searchable` synchronously on a background queue; manages recent searches via `RecentSearchManager`

#### `Home/Dining/`

- `DiningHallsView.swift` / `DiningDetailView.swift` — dining hall list and detail views
- `DiningDataSource/` — `BMDiningLocation`, `DiningItem`, `DiningLocation`, `DiningRestriction`, `MealType`, `DiningHallsViewModel`

#### `Home/Fitness/`

- `FitnessView.swift` — gym list
- `GymDataSource/` — `BMGym`, `Gym`, `GymDataSource`
- `GymClassDataSource/` — `GymClass`, `GymClassDataSource`, `GymClassType`
- `GymDetailViewController.swift` — UIKit gym detail
- `GymOccupancy/GymOccupancyViewModel.swift` / `GymOccupancyView.swift` — real-time occupancy data from Firestore; shared with the widget extension

#### `Home/Libraries/`

- `LibrariesView.swift` / `LibraryDetailViewController.swift` — library list and detail
- `LibraryDataSource/` — `BMLibrary`, `LibraryDataSource`

#### `Home/Guides/`

- `GuidesView.swift` / `GuideDetailView.swift` — campus guide list and detail
- `GuidesViewModel.swift` / `Guide.swift` — guide data model
- `GuidePlacesStackedCollageView.swift` — image collage display

#### `Home/Home Drawer/`

- `BMHomeSectionListView.swift` — section list displayed in the home drawer
- `HomeSectionListRowView.swift` / `HomeDrawerRowImageView.swift` — row components
- `HomeDrawerPinViewModel.swift` — manages pinned items persisted via `UserDefaults`

---

### `Resources/`

Campus resources directory feature.

| File | Responsibility |
|---|---|
| `ResourcesViewModel.swift` | Fetches `BMResourceCategory` from Firestore `"Resource Categories"` collection via `BMNetworkingManager` |

---

### `Safety/`

Campus safety log map feature.

| File | Responsibility |
|---|---|
| `SafetyViewModel.swift` | Fetches `BMSafetyLog` records from Firestore `"Safety Logs"` via `BMNetworkingManager`; handles time and crime-type filtering |
| `SafetyView.swift` / `SafetyMapView.swift` — map and list views |
| `SafetyLogDetailView.swift` / `SafetyLogFilterButton.swift` / `SafetyViewFilterScrollView.swift` / `SafetyMapMarker.swift` — detail and filter UI |

---

### `Today/`

Today tab with tiled info widgets.

| File | Responsibility |
|---|---|
| `TodayView.swift` | Root SwiftUI view hosting today tiles |
| `TodayTileAttributes.swift` | `TodayTile`, `TodayTileSpan`, `TodayTileStyle`, `TodayTiles` enum (news, weather) |
| `TodayTileLayout.swift` | `TodayTilingLayout` — custom SwiftUI `Layout` placing tiles in a grid using `TodayTilePlacementEngine` |
| `TodayTileView.swift` | Generic tile container view |
| `Tiles/News Tile/` — `NewsDataViewModel` fetches from Firestore `"Daily Cal News"` collection |
| `Tiles/Weather Tile/` — weather data display |

---

### `Utils/`

Extension files and utility classes.

| File | Responsibility |
|---|---|
| `AtomicDictionary.swift` | Thread-safe dictionary backed by `pthread_rwlock_t` |
| `UserDefaults+Extension.swift` | Typed `UserDefaults` API using `UserDefaultsKeys` enum |
| `Date+Extension.swift` | Date math utilities: weekday extraction, interval checks, formatted string output |
| `DayOfWeek.swift` | `DayOfWeek` enum |
| `Collection+Extension.swift` | Collection helpers |
| `String+Extension.swift` | String helpers |
| `NSCoding+Extension.swift` | NSCoding helpers |
| `UIStackView+Extensions.swift` | Convenience `UIStackView` initializer |
| `View+Extension.swift` | SwiftUI `View` helpers including `withoutAnimation` |
| `WeeklyHours.swift` | Weekly hours interval model and containment logic |

---

### `Debug/`

- `DebugView.swift` / `DebugViewModel.swift` — debug panel accessible in `#DEBUG` builds via device shake gesture in `TabBarController.motionEnded`

---

## Widget Extension: `BerkeleyMobileWidget/`

| File | Responsibility |
|---|---|
| `BerkeleyMobileWidgetBundle.swift` | `@main` WidgetBundle; initializes Firebase; registers `GymOccupancyWidget` |
| `GymOccupancyWidget.swift` | `StaticConfiguration` widget displaying RSF and Stadium occupancy; `TimelineProvider` refreshes on a configured interval |
| `Info.plist` | Extension metadata |

The widget extension imports `Firebase/Firestore` and shares `GymOccupancyViewModel` logic with the main app target.

---

## Architectural Boundaries

- **Data layer** (`Data/`) is accessed by feature ViewModels; feature views do not call Firestore directly.
- **Common components** (`Common/`) have no dependencies on feature modules.
- **FactoryKit container** (`BerkeleyMobile+Injection.swift`) is the single place where ViewModels are instantiated and their lifetimes (`.shared`, `.singleton`) are declared.
- **Widget extension** is a separate compile target sharing only `GymOccupancyViewModel` and `BMFont`.
