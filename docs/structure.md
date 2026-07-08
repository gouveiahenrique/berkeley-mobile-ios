# Repository Structure

## Top-Level Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/          # Main application source
├── BerkeleyMobileWidget/     # WidgetKit extension
├── Pods/                     # CocoaPods-managed dependencies
├── berkeley-mobile.xcodeproj/
├── berkeley-mobile.xcworkspace/
├── Podfile
├── Podfile.lock
└── README.md
```

## Main Application: `berkeley-mobile/`

```
berkeley-mobile/
├── AppDelegate.swift                  # Application entry point; Firebase init, notifications, data prefetch
├── AppDelegate+Migration.swift        # Version migration logic; cache clearing
├── SceneDelegate.swift                # Scene lifecycle; root window setup; foreground data refresh
├── TabBarController.swift             # Root tab bar: Home, Today, Safety, Resources
├── MainContainerViewController.swift  # Host for HomeView + MapViewController; drawer delegate
├── BerkeleyMobile+Injection.swift     # FactoryKit Container extension; all VM registrations
│
├── Assets/                            # Design tokens
│   ├── Fonts.swift                    # BMFont struct; Apercu font family wrappers
│   ├── Colors/                        # BMColor struct and extensions (dark mode adaptive)
│   │   ├── Colors.swift
│   │   ├── Colors+ActionButton.swift
│   │   ├── Colors+AlertView.swift
│   │   ├── Colors+Event.swift
│   │   └── Colors+GymClass.swift
│   └── Assets.xcassets/
│
├── Common/                            # Shared UI components and utilities
│   ├── DetailView/                    # Protocol-oriented detail views
│   │   ├── DetailView.swift           # DetailView and DetailViewDelegate protocols
│   │   ├── LocationDetailView.swift   # Displays distance from user; subscribes to location updates
│   │   ├── OverviewCardView.swift     # Card summarizing a SearchItem (address, phone, hours, favorite)
│   │   └── OpenTimesCardView.swift
│   ├── Images/
│   │   ├── ImageLoader.swift          # In-memory image cache + URLSession loader
│   │   └── ImageViewCell.swift        # Protocol for cells loading images via ImageLoader
│   ├── FilterView/
│   ├── BMDrawerView.swift             # SwiftUI drawer component
│   ├── BMSegmentedControlView.swift
│   ├── BMCachedAsyncImageView.swift
│   ├── CardView.swift
│   ├── CollapsibleCardView.swift
│   └── ...
│
├── Data/                              # Data layer
│   ├── DataManager.swift              # Singleton; coordinates DataSource fetches; caches results
│   ├── DataSource.swift               # DataSource protocol
│   ├── BMLocationManager.swift        # CLLocationManager wrapper; NotificationCenter broadcaster
│   ├── BMNetworkingManager.swift      # async/await Firestore fetcher for safety logs and resources
│   ├── BMEventManager.swift
│   ├── BMConstants.swift              # App-wide string constants (Firestore collection names etc.)
│   ├── BMError.swift
│   ├── SortingFunctions.swift
│   └── ItemProtocols/                 # Capability protocols for model objects
│       ├── SearchItem.swift           # SearchItem protocol (searchName, location, icon)
│       ├── HasLocation.swift          # HasLocation protocol; distance-to-user computation
│       ├── CanFavorite.swift          # CanFavorite protocol (isFavorited: Bool)
│       ├── HasImage.swift             # HasImage protocol; image caching via ImageLoader
│       ├── HasName.swift
│       ├── HasOpenTimes.swift
│       ├── HasPhoneNumber.swift
│       └── BMCalendarEvent.swift
│
├── Drawer/                            # Drawer navigation layer
│   ├── DrawerViewController.swift
│   ├── DrawerViewDelegate.swift       # Protocol for a single pannable drawer
│   ├── MainDrawerViewDelegate.swift   # Protocol extending DrawerViewDelegate for stacked drawers
│   ├── SearchDrawerViewController.swift
│   └── SearchDrawerViewDelegate.swift
│
├── Home/                              # Home tab feature
│   ├── HomeView.swift                 # SwiftUI root of Home tab; segmented tabs: Dining/Fitness/Study/Guides
│   ├── HomeViewModel.swift            # Observable state for Home screen
│   ├── OpenClosedStatusManager.swift
│   ├── RedirectionManager.swift
│   ├── Dining/
│   │   ├── DiningDataSource/
│   │   │   ├── BMDiningLocation.swift  # BMDiningHall, BMMeal, BMMealCategory, BMMenuItem structs
│   │   │   └── DiningHallsViewModel.swift  # @Observable VM; fetches from "Dining Halls V2" and "Dining Halls" Firestore collections
│   │   ├── DiningHallsView.swift
│   │   └── DiningDetailView.swift
│   ├── Fitness/
│   │   ├── GymDataSource/
│   │   │   ├── GymDataSource.swift    # DataSource; fetches from "Gyms" Firestore collection
│   │   │   └── BMGym.swift
│   │   ├── GymClassDataSource/
│   │   │   ├── GymClassDataSource.swift  # DataSource; fetches from "Gym Classes" Firestore collection
│   │   │   └── GymClass.swift
│   │   ├── GymOccupancy/
│   │   │   └── GymOccupancyViewModel.swift  # @Observable VM; fetches from "Gym Occupancy Meters" collection
│   │   ├── FitnessView.swift
│   │   └── GymDetailViewController.swift
│   ├── Libraries/
│   │   ├── LibraryDataSource/
│   │   │   ├── LibraryDataSource.swift
│   │   │   └── BMLibrary.swift
│   │   ├── LibrariesView.swift
│   │   └── LibraryDetailViewController.swift
│   ├── Map/
│   │   ├── MapViewController.swift    # UIKit MKMapView controller; search integration; marker display
│   │   ├── MapDataSource/
│   │   │   └── MapDataSource.swift    # DataSource; fetches from "Map Marker" Firestore collection
│   │   ├── MapMarker.swift
│   │   └── MapMarkerDetailView.swift
│   ├── Home Drawer/
│   │   └── BMHomeSectionListView.swift
│   ├── Guides/
│   └── Search/
│       └── SearchViewModel.swift      # @Observable VM; filters DataManager.searchable by keyword
│
├── Today/                             # Today tab
│   ├── TodayView.swift                # SwiftUI; tiling grid of Today tiles
│   ├── TodayTileLayout.swift          # Custom SwiftUI Layout engine for tile grid
│   ├── TodayTileView.swift
│   ├── TodayTileAttributes.swift
│   └── Tiles/                         # Individual tile implementations
│
├── Events/                            # Events feature (accessible from Today tab toolbar)
│   ├── EventDataSource/
│   │   └── BMEventCalendarEntry.swift # NSCoding-serializable event model
│   ├── EventsView.swift
│   ├── CalendarView.swift
│   └── ...
│
├── Safety/                            # Safety tab
│   ├── SafetyView.swift               # SwiftUI; map + drawer of crime logs
│   ├── SafetyViewModel.swift          # NSObject ObservableObject; fetches via BMNetworkingManager
│   ├── SafetyMapView.swift
│   └── SafetyLogDetailView.swift
│
├── Resources/                         # Resources tab
│   ├── ResourcesView.swift            # SwiftUI; category tabs; ResourcePageView per category
│   └── ResourcesViewModel.swift
│
├── FeedbackForm/                      # Feedback form feature
│   ├── FeedbackFormPresenter.swift    # Manages conditional display of feedback form
│   └── FeedbackFormViewModel.swift
│
├── Debug/                             # DEBUG-only views
│   ├── DebugView.swift
│   └── DebugViewModel.swift
│
└── Utils/                             # Utility extensions and helpers
    ├── WeeklyHours.swift              # WeeklyHours, HoursInterval types
    ├── Date+Extension.swift           # Date utility extensions
    ├── UserDefaults+Extension.swift   # Typed UserDefaultsKeys enum + extensions
    ├── Logger+Ext.swift               # os.Logger category constants per ViewModel
    ├── UIImage+Extensions.swift       # Image manipulation helpers
    └── ...
```

## WidgetKit Extension: `BerkeleyMobileWidget/`

```
BerkeleyMobileWidget/
├── BerkeleyMobileWidgetBundle.swift   # @main WidgetBundle; registers GymOccupancyWidget; initializes Firebase
└── GymOccupancyWidget.swift          # StaticConfiguration widget; GymOccupancyProvider, GymOccupancyEntry, views
```

## Architectural Boundaries

| Boundary | Description |
|----------|-------------|
| **Data layer** | `Data/` — `DataManager`, `DataSource` implementations, `BMNetworkingManager`, `BMLocationManager`. All Firestore access originates here. |
| **Model protocols** | `Data/ItemProtocols/` — capability protocols (`SearchItem`, `HasLocation`, `CanFavorite`, `HasImage`, `HasOpenTimes`) that model objects conform to. |
| **Feature modules** | `Home/`, `Today/`, `Events/`, `Safety/`, `Resources/`, `FeedbackForm/` — each contains its view model(s), data source(s), and views. |
| **Shared UI** | `Common/` — reusable components consumed across feature modules. |
| **Design tokens** | `Assets/` — `BMColor` and `BMFont` consumed throughout the codebase. |
| **DI container** | `BerkeleyMobile+Injection.swift` — single registration file for all FactoryKit factories. |
| **Widget target** | `BerkeleyMobileWidget/` — separate Xcode target; shares `GymOccupancyViewModel` with the main app. |
