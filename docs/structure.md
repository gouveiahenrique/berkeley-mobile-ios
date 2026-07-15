# Repository Structure

## Top-Level Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/          # Main application target source code
├── BerkeleyMobileWidget/     # iOS Widget Extension target
├── Pods/                     # CocoaPods-managed dependencies
├── berkeley-mobile.xcodeproj # Xcode project
├── berkeley-mobile.xcworkspace # Xcode workspace (opens with CocoaPods)
├── Podfile                   # CocoaPods dependency declaration
├── Podfile.lock              # CocoaPods lock file
├── app_preview_images/       # App Store preview image assets
├── README.md
├── CONTRIBUTING.md
└── LICENSE.md
```

## Main Application Target: `berkeley-mobile/`

```
berkeley-mobile/
├── AppDelegate.swift                  # Application lifecycle, Firebase init, push notifications
├── AppDelegate+Migration.swift        # Version migration logic
├── SceneDelegate.swift                # UIScene session management
├── TabBarController.swift             # Root UITabBarController with four tabs
├── MainContainerViewController.swift  # UIKit container embedding map + home SwiftUI view
├── BerkeleyMobile+Injection.swift     # Factory DI container registrations
│
├── Common/                            # Shared UI components
│   ├── DetailView/                    # Reusable location/detail views
│   ├── FilterView/                    # Shared filter UI components
│   ├── Images/                        # ImageLoader singleton (URLSession-based image cache)
│   ├── ActionButton.swift
│   ├── BMActionButton.swift
│   ├── BMAlert.swift                  # Alert data model and presentation helpers
│   ├── BMCachedAsyncImageView.swift
│   ├── BMContentUnavailableView.swift
│   ├── BMDrawerView.swift
│   ├── BMFilterButton.swift
│   ├── BMSegmentedControlView.swift
│   ├── BMTopBlobView.swift
│   ├── CardView.swift
│   ├── CollapsibleCardView.swift
│   ├── ReviewPrompter.swift
│   ├── ScrollingStackView.swift
│   ├── TagView.swift
│   └── IconPairView.swift
│
├── Data/                              # Data layer
│   ├── DataSource.swift               # DataSource protocol definition
│   ├── DataManager.swift              # Singleton cache + fetch coordinator
│   ├── BMNetworkingManager.swift      # Async Firestore client (Safety, Resources)
│   ├── BMLocationManager.swift        # Core Location wrapper singleton
│   ├── BMEventManager.swift           # EventKit calendar operations
│   ├── BMError.swift                  # Error types
│   ├── BMConstants.swift              # App-wide constants (Firestore collection names, map regions)
│   ├── SortingFunctions.swift
│   ├── ItemProtocols/                 # Protocols for model capabilities
│   │   ├── SearchItem.swift
│   │   ├── HasLocation.swift
│   │   ├── HasOpenClosedStatus.swift
│   │   ├── HasOpenTimes.swift
│   │   ├── HasImage.swift
│   │   ├── HasName.swift
│   │   ├── HasPhoneNumber.swift
│   │   ├── HasWebsite.swift
│   │   ├── CanFavorite.swift
│   │   └── BMCalendarEvent.swift
│   └── PropertyWrappers/
│       └── Display.swift              # Property wrapper(s) for view display logic
│
├── Drawer/                            # Sliding drawer UI system
│   ├── DrawerViewDelegate.swift       # Pan gesture + animation protocol
│   ├── MainDrawerViewDelegate.swift   # Main drawer position computation
│   ├── BarView.swift
│   └── ...
│
├── Home/                              # Home/Map feature module
│   ├── HomeView.swift
│   ├── HomeViewModel.swift            # ObservableObject; coordinates dining/library/gym data
│   ├── OpenClosedStatusManager.swift
│   ├── OpenClosedStatusView.swift
│   ├── RedirectionManager.swift
│   ├── Dining/                        # Dining halls feature
│   │   └── DiningDataSource/
│   ├── Fitness/                       # Gyms and fitness feature
│   │   ├── GymDataSource/
│   │   ├── GymClassDataSource/
│   │   └── GymOccupancy/
│   ├── Guides/                        # Campus guides feature
│   ├── Libraries/                     # Library locations feature
│   │   └── LibraryDataSource/
│   ├── Map/                           # MapKit-based map view
│   │   ├── MapViewController.swift
│   │   ├── MapDataSource/
│   │   └── ...
│   ├── Search/                        # Home search feature
│   └── Home Drawer/                   # Drawer UI for home tab
│
├── Today/                             # Today tab feature module
│   ├── TodayView.swift                # Root SwiftUI view for Today tab
│   ├── TodayTileView.swift
│   ├── TodayTileLayout.swift          # Custom SwiftUI Layout for tile grid
│   ├── TodayTileAttributes.swift
│   └── Tiles/                         # Individual tile views
│
├── Events/                            # Campus events feature module
│   ├── EventsView.swift
│   ├── CalendarView.swift
│   ├── EventDetailView.swift
│   ├── EventDataSource/
│   │   ├── EventsViewModel.swift      # @Observable; fetches events, manages calendar ops
│   │   ├── EventsDataService.swift
│   │   └── BMEventCalendarEntry.swift
│   └── ...
│
├── Safety/                            # Safety logs feature module
│   ├── SafetyView.swift
│   ├── SafetyViewModel.swift
│   ├── SafetyMapView.swift
│   ├── SafetyLogDetailView.swift
│   └── ...
│
├── Resources/                         # Campus resources feature module
│   ├── ResourcesView.swift
│   ├── ResourcesViewModel.swift
│   └── SafariWebView.swift
│
├── FeedbackForm/                      # In-app feedback form
│   ├── FeedbackFormPresenter.swift    # Orchestrates form presentation logic
│   ├── FeedbackFormViewModel.swift
│   └── ...
│
├── Debug/                             # Debug-only feature (compiled with #if DEBUG)
│   ├── DebugView.swift
│   └── DebugViewModel.swift
│
├── Utils/                             # Extensions and shared utilities
│   ├── AtomicDictionary.swift         # Thread-safe dictionary wrapper
│   ├── UserDefaults+Extension.swift   # Typed UserDefaults access with UserDefaultsKeys enum
│   ├── Date+Extension.swift
│   ├── DayOfWeek.swift
│   ├── CLLocation+Extension.swift
│   ├── Collection+Extension.swift
│   ├── String+Extension.swift
│   ├── TimeInterval+Ext.swift
│   ├── Logger+Ext.swift
│   ├── NSCoding+Extension.swift
│   ├── UIDevice+Extensions.swift
│   ├── UIImage+Extensions.swift
│   ├── UIScrollView+GestureRecognizer.swift
│   ├── UIStackView+Extensions.swift
│   ├── UIView+Extensions.swift
│   ├── UIViewController+Extensions.swift
│   ├── View+Extension.swift
│   ├── WeeklyHours.swift
│   ├── DepthButtonStyle.swift
│   └── BMControlButtonStyle (in View+Extension)
│
├── Assets/                            # Non-Xcode asset files
├── Assets.xcassets                    # Xcode asset catalog
├── Base.lproj/                        # Main storyboard or launch screen
├── Info.plist
└── berkeley-mobile.entitlements
```

## Widget Extension Target: `BerkeleyMobileWidget/`

```
BerkeleyMobileWidget/
├── BerkeleyMobileWidgetBundle.swift   # WidgetBundle entry point
├── GymOccupancyWidget.swift           # Widget implementation (provider, views, configuration)
├── Assets.xcassets
└── Info.plist
```

## Architectural Boundaries

### Feature Module Pattern

Each feature is organized into a dedicated folder under `berkeley-mobile/`. A typical feature folder contains:

- A root SwiftUI `View` (e.g., `SafetyView.swift`)
- A `ViewModel` (either `ObservableObject` or `@Observable`)
- A `DataSource` subfolder (where applicable) implementing the `DataSource` protocol or a dedicated service

### Data Layer Separation

The `Data/` folder contains cross-feature infrastructure:

- `DataSource.swift` — protocol shared by `LibraryDataSource`, `GymDataSource`, `MapDataSource`
- `DataManager.swift` — coordinates fetching and in-memory caching
- `BMNetworkingManager.swift` — handles async Firestore calls not covered by the `DataSource` protocol
- `ItemProtocols/` — capability protocols (e.g., `HasLocation`, `HasOpenTimes`) that multiple model types adopt

### Shared UI Components

`Common/` contains reusable UI components referenced across feature modules. These include alert handling (`BMAlert`), filter buttons, card views, image loading, and drawer views.

### Dependency Injection Boundary

`BerkeleyMobile+Injection.swift` is the single location where all Factory container registrations are declared. View models registered here include: `CalendarViewModel`, `DiningHallsViewModel`, `EventsViewModel`, `FeedbackFormPresenter`, `FeedbackFormViewModel`, `GuidesViewModel`, `GymOccupancyViewModel`, `HomeDrawerPinViewModel`, `HomeViewModel`, `MapMarkersDropdownViewModel`, `MapUserLocationButtonViewModel`, `MenuItemIconCacheManager`, `NewsDataViewModel`, `ResourcesViewModel`, `SafetyViewModel`, `SearchViewModel`, `WeatherDataViewModel`.
