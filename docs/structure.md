# Repository Structure

## Root Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/          # Main iOS application target
├── BerkeleyMobileWidget/     # iOS widget extension target
├── berkeley-mobile.xcodeproj/
├── berkeley-mobile.xcworkspace/
├── Pods/                     # CocoaPods dependencies (generated)
├── Podfile
├── Podfile.lock
├── CONTRIBUTING.md
├── LICENSE.md
└── README.md
```

## Main App Target: `berkeley-mobile/`

```
berkeley-mobile/
├── AppDelegate.swift                  # App lifecycle, Firebase init, push notifications
├── AppDelegate+Migration.swift        # Version migration logic (cache clearing)
├── SceneDelegate.swift                # Scene lifecycle, sets TabBarController as root
├── TabBarController.swift             # Root tab bar: Home, Today, Safety, Resources
├── MainContainerViewController.swift  # UIKit container hosting HomeView (SwiftUI)
├── BerkeleyMobile+Injection.swift     # FactoryKit Container registrations for all view models
│
├── Assets/
│   └── Colors/                        # BMColor struct and per-feature color extensions
│
├── Common/                            # Reusable UI components
│   ├── BMActionButton.swift
│   ├── BMAlert.swift
│   ├── BMCachedAsyncImageView.swift
│   ├── BMContentUnavailableView.swift
│   ├── BMDrawerView.swift             # SwiftUI drawer (BMDrawerViewState: small/medium/large)
│   ├── BMFilterButton.swift
│   ├── BMSegmentedControlView.swift
│   ├── BMTopBlobView.swift
│   ├── CardView.swift
│   ├── CollapsibleCardView.swift
│   ├── FilterView/                    # Horizontal filter pill collection view (UIKit)
│   ├── DetailView/                    # Reusable detail card views (OpenTimesCard, OverviewCard)
│   ├── ReviewPrompter.swift
│   ├── ScrollingStackView.swift       # UIScrollView+UIStackView composite
│   └── TagView.swift
│
├── Data/                              # Data layer: singletons and protocols
│   ├── DataManager.swift              # Singleton; fetches from registered DataSource types; rate-limited to 1h
│   ├── DataSource.swift               # Protocol: fetchItems + fetchDispatch
│   ├── BMNetworkingManager.swift      # Singleton; direct async Firestore reads for safety/resources
│   ├── BMLocationManager.swift        # CLLocationManager singleton; broadcasts via NotificationCenter
│   ├── BMConstants.swift
│   ├── BMError.swift
│   ├── BMEventManager.swift
│   ├── SortingFunctions.swift
│   ├── ItemProtocols/                 # Protocols: CanFavorite, HasImage, HasLocation, HasOpenTimes, etc.
│   └── PropertyWrappers/              # @Display and related property wrappers
│
├── Drawer/                            # UIKit drawer system
│   ├── DrawerViewController.swift     # Base UIViewController with pan gesture and bar
│   ├── DrawerViewDelegate.swift       # Protocol + extensions for state management (hidden/collapsed/middle/full)
│   ├── MainDrawerViewDelegate.swift   # Stack-based drawer management for the home screen
│   └── SearchDrawerViewDelegate.swift # Drawer delegate for search result detail presentation
│
├── Events/                            # Events and calendar feature
│   ├── CalendarView.swift             # CalendarViewModel + CalendarView (SwiftUI)
│   ├── CalendarSectionView.swift
│   ├── EventDataSource/
│   │   └── EventsViewModel.swift      # Fetches events from Firestore "Events" collection
│   └── EventsView.swift
│
├── FeedbackForm/                      # In-app feedback form feature
│   ├── FeedbackFormPresenter.swift    # Controls when/how to present the feedback form
│   └── FeedbackFormViewModel.swift
│
├── Home/                              # Home tab and its sub-features
│   ├── HomeView.swift                 # SwiftUI root of the Home tab (map + drawer)
│   ├── HomeViewModel.swift            # ObservableObject; fetches libraries and gyms via DataManager
│   ├── OpenClosedStatusManager.swift  # Timer-based open/closed status updates
│   ├── RedirectionManager.swift       # Opens Maps app or phone dialer
│   │
│   ├── Dining/
│   │   ├── DiningDataSource/
│   │   │   ├── BMDiningLocation.swift  # BMDiningHall, BMMeal, BMMenuItem models
│   │   │   ├── DiningHallsViewModel.swift  # @Observable; fetches from "Dining Halls V2" collection
│   │   │   └── DiningRestriction.swift
│   │   ├── DiningHallsView.swift
│   │   └── DiningDetailView.swift
│   │
│   ├── Fitness/
│   │   ├── GymDataSource/
│   │   │   ├── BMGym.swift
│   │   │   └── GymDataSource.swift     # DataSource implementation; reads "Gyms" collection
│   │   ├── GymClassDataSource/
│   │   │   └── GymClass.swift
│   │   ├── FitnessView.swift
│   │   └── GymDetailView.swift
│   │
│   ├── Libraries/
│   │   ├── LibraryDataSource/
│   │   │   ├── BMLibrary.swift
│   │   │   └── LibraryDataSource.swift  # DataSource implementation; reads "Libraries" collection
│   │   ├── LibrariesView.swift
│   │   └── LibraryDetailViewController.swift
│   │
│   ├── Map/
│   │   ├── MapViewController.swift     # MKMapView controller; implements SearchDrawerViewDelegate
│   │   ├── MapDataSource/
│   │   │   └── MapDataSource.swift     # DataSource; reads "Map Marker" collection
│   │   └── (search, annotation views)
│   │
│   ├── Guides/
│   │   ├── GuidesViewModel.swift
│   │   └── GuidesView.swift
│   │
│   ├── Home Drawer/
│   │   ├── BMHomeSectionListView.swift
│   │   └── HomeDrawerPinViewModel.swift  # Persists pinned item IDs to UserDefaults
│   │
│   └── Search/
│       └── SearchViewModel.swift
│
├── Resources/                         # Resources tab
│   ├── ResourcesView.swift            # SwiftUI; reads from ResourcesViewModel
│   └── ResourcesViewModel.swift       # Fetches from BMNetworkingManager (resource categories)
│
├── Safety/                            # Safety tab
│   ├── SafetyView.swift               # SwiftUI; shows map + drawer of safety logs
│   ├── SafetyViewModel.swift          # ObservableObject; fetches BMSafetyLog from BMNetworkingManager
│   ├── SafetyMapView.swift
│   ├── SafetyLogDetailView.swift
│   └── SafetyMapMarker.swift
│
├── Today/                             # Today tab
│   ├── TodayView.swift                # SwiftUI; tile-based daily summary layout
│   ├── TodayTileLayout.swift          # Custom SwiftUI Layout for tiling
│   ├── Tiles/
│   │   └── News Tile/
│   │       └── NewsDataViewModel.swift
│   └── (other tile views)
│
├── Debug/                             # Debug-only views (guarded by #if DEBUG)
│   └── DebugView.swift
│
└── Utils/                             # Shared utilities
    ├── AtomicDictionary.swift         # Thread-safe dictionary with POSIX rwlock
    ├── Date+Extension.swift           # Date helper methods
    ├── UserDefaults+Extension.swift   # Typed UserDefaults access via UserDefaultsKeys enum
    ├── WeeklyHours.swift              # WeeklyHours and HoursInterval models
    ├── Logger+Ext.swift               # os.Logger category extensions
    └── (other extensions)
```

## Widget Extension Target: `BerkeleyMobileWidget/`

```
BerkeleyMobileWidget/
├── BerkeleyMobileWidgetBundle.swift   # @main WidgetBundle; configures Firebase if needed
└── GymOccupancyWidget.swift           # StaticConfiguration widget; GymOccupancyEntry, GymOccupancyProvider
```

## Architectural Boundaries

### Data layer (`Data/`)
- `DataManager` is the single point of entry for `DataSource`-based data (gyms, libraries, map markers). It caches results and deduplicates concurrent fetches using `DispatchGroup`.
- `BMNetworkingManager` handles direct async Firestore queries for resources not managed by `DataSource` (safety logs, resource categories).
- Both managers are singletons.

### Feature modules (`Home/`, `Safety/`, `Resources/`, `Today/`, `Events/`)
- Each feature owns its own view model(s), model types, and views.
- View models are registered in `BerkeleyMobile+Injection.swift` and resolved via `@Injected`, `@InjectedObject`, or `@InjectedObservable` property wrappers from FactoryKit.

### Common (`Common/`)
- Reusable UI components shared across multiple feature screens.
- Does not depend on any specific feature module.

### Drawer system (`Drawer/`)
- UIKit-based drawer (`DrawerViewController` + `DrawerViewDelegate`) used by the Home tab's map and search interactions.
- SwiftUI-based drawer (`BMDrawerView` in `Common/`) used by `HomeView` and `SafetyView`.

## Firebase Firestore Collections (Observed)

| Collection name | Used by |
|---|---|
| `Libraries` | `LibraryDataSource` |
| `Gyms` | `GymDataSource` |
| `Map Marker` | `MapDataSource` |
| `Dining Halls V2` | `DiningHallsViewModel` |
| `Dining Halls` | `DiningHallsViewModel` (additional static data) |
| `Events` | `EventsDataService` |
| `safetyLogsCollectionName` (constant) | `BMNetworkingManager` |
| `resourceCategoriesCollectionName` (constant) | `BMNetworkingManager` |
