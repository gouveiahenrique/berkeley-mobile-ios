# Repository Structure

## Top-Level Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/            # Main application target
├── BerkeleyMobileWidget/       # iOS Widget Extension target
├── Pods/                       # CocoaPods dependencies (auto-generated)
├── berkeley-mobile.xcodeproj/  # Xcode project file
├── berkeley-mobile.xcworkspace/ # Xcode workspace (used for building)
├── Podfile                     # CocoaPods dependency declarations
├── Podfile.lock                # Locked CocoaPods versions
└── app_preview_images/         # App Store preview screenshots
```

## Main Application Target: `berkeley-mobile/`

```
berkeley-mobile/
├── AppDelegate.swift                   # App lifecycle, Firebase init, push notification setup
├── AppDelegate+Migration.swift         # Version migration logic
├── SceneDelegate.swift                 # UIScene lifecycle
├── TabBarController.swift              # Root tab bar (Home, Today, Safety, Resources)
├── MainContainerViewController.swift   # Home tab container; implements MainDrawerViewDelegate
├── BerkeleyMobile+Injection.swift      # FactoryKit Container extension (DI registrations)
├── Info.plist                          # Bundle configuration, permissions, fonts, background modes
├── Assets/                             # Design system assets
│   ├── Colors/                         # BMColor definitions and extensions by domain
│   └── Fonts/                          # BMFont struct
├── Assets.xcassets/                    # Image assets (app icon, food restriction icons, map icons, etc.)
├── Base.lproj/                         # Launch screen storyboard
├── Common/                             # Shared UI components
│   ├── DetailView/                     # Reusable detail card views (open times, overview, etc.)
│   ├── FilterView/                     # FilterView (UICollectionView-based chip filter)
│   ├── Images/                         # Shared image components
│   ├── ActionButton.swift              # Button component
│   ├── BMActionButton.swift            # BM-branded action button
│   ├── BMAlert.swift                   # Alert model
│   ├── BMCachedAsyncImageView.swift    # Async image loading with cache
│   ├── BMContentUnavailableView.swift  # Empty/unavailable state view
│   ├── BMDrawerView.swift              # SwiftUI drawer container component
│   ├── BMFilterButton.swift            # Filter button component
│   ├── BMSegmentedControlView.swift    # Segmented control (Dining/Fitness/Study/Guides)
│   ├── BMTopBlobView.swift             # Decorative blob header view
│   ├── CardView.swift                  # Generic card container
│   ├── CollapsibleCardView.swift       # Expandable/collapsible card
│   ├── DetailTapGestureRecognizer.swift
│   ├── IconPairView.swift
│   ├── ReviewPrompter.swift            # App Store review prompt logic
│   ├── ScrollingStackView.swift
│   └── TagView.swift                   # Open/Closed tag view
├── Data/                               # Data layer
│   ├── ItemProtocols/                  # Protocols for data model items (SearchItem, BMCalendarEvent, etc.)
│   ├── PropertyWrappers/               # Swift property wrappers
│   ├── BMConstants.swift               # App-wide constants (Firestore collection names, map regions)
│   ├── BMError.swift                   # App error enum
│   ├── BMEventManager.swift            # EventKit (calendar) integration
│   ├── BMLocationManager.swift         # CLLocationManager singleton wrapper
│   ├── BMNetworkingManager.swift       # Firestore fetch methods for safety logs and resources
│   ├── DataManager.swift               # Singleton orchestrator for DataSource fetches
│   ├── DataSource.swift                # DataSource protocol
│   └── SortingFunctions.swift          # Sorting utilities
├── Debug/                              # Debug-only views and view models
│   ├── DebugView.swift
│   └── DebugViewModel.swift
├── Drawer/                             # Legacy UIKit drawer system
│   ├── BarView.swift
│   ├── DrawerViewController.swift
│   ├── DrawerViewDelegate.swift
│   ├── MainDrawerViewDelegate.swift
│   ├── SearchDrawerViewController.swift
│   └── SearchDrawerViewDelegate.swift
├── Events/                             # Events feature
│   ├── EventDataSource/
│   │   └── EventsViewModel.swift       # Fetches events from Firestore "Events" collection
│   ├── AllDayEventBannerView.swift
│   ├── BMAddedCalendarStatusOverlayView.swift
│   ├── CalendarSectionView.swift
│   ├── CalendarView.swift
│   ├── EventDetailView.swift
│   ├── EventRowView.swift
│   ├── EventsDateSectionView.swift
│   └── EventsView.swift
├── FeedbackForm/                       # In-app feedback form
│   ├── FeedbackFormPresenter.swift
│   ├── FeedbackFormView.swift
│   └── FeedbackFormViewModel.swift
├── Home/                               # Home tab feature (map + drawer)
│   ├── Dining/
│   │   └── DiningDataSource/          # Dining hall data fetching and models
│   ├── Fitness/
│   │   ├── GymClassDataSource/        # Gym class data
│   │   ├── GymDataSource/             # GymDataSource: Firestore "Gyms" collection
│   │   └── GymOccupancy/              # GymOccupancyViewModel (shared with widget)
│   ├── Guides/
│   │   ├── GuidesView.swift
│   │   └── GuidesViewModel.swift
│   ├── Home Drawer/                   # Home drawer pin management
│   ├── Libraries/
│   │   └── LibraryDataSource/         # LibraryDataSource: Firestore "Libraries" collection
│   ├── Map/
│   │   ├── MapDataSource/             # MapDataSource: Firestore "Map Marker" collection
│   │   ├── HomeMapView.swift           # UIViewControllerRepresentable wrapping MapViewController
│   │   ├── MapMarkerDetailView.swift
│   │   ├── MapUserLocationButton.swift
│   │   └── MapViewController.swift    # MKMapView-based map controller
│   ├── Search/                        # Map/home search functionality
│   ├── HomeView.swift                  # Root SwiftUI view for Home tab
│   ├── HomeViewModel.swift
│   ├── OpenClosedStatusManager.swift
│   ├── OpenClosedStatusView.swift
│   └── RedirectionManager.swift
├── Resources/                          # Resources tab feature
│   ├── ResourcesSectionDropdown.swift
│   ├── ResourcesView.swift
│   ├── ResourcesViewModel.swift
│   └── SafariWebView.swift             # SFSafariViewController wrapper
├── Safety/                             # Safety tab feature
│   ├── SafetyLogDetailView.swift
│   ├── SafetyLogFilterButton.swift
│   ├── SafetyMapMarker.swift           # MapKit MapContent marker
│   ├── SafetyMapView.swift             # Map view for safety logs
│   ├── SafetyView.swift               # Root SwiftUI view for Safety tab
│   ├── SafetyViewFilterScrollView.swift
│   └── SafetyViewModel.swift           # BMSafetyLog model, fetch and filter logic
├── Today/                              # Today tab feature
│   ├── Tiles/
│   │   ├── News Tile/
│   │   │   └── NewsDataViewModel.swift # Fetches from Firestore "Daily Cal News" collection
│   │   └── Weather Tile/
│   │       └── WeatherDataViewModel.swift # Fetches via Apple WeatherKit
│   ├── TodayTileAttributes.swift
│   ├── TodayTileLayout.swift           # Custom SwiftUI Layout for tile grid
│   ├── TodayTileView.swift
│   └── TodayView.swift                 # Root SwiftUI view for Today tab
└── Utils/                              # Utilities and extensions
    ├── AtomicDictionary.swift          # Thread-safe dictionary wrapper
    ├── CLLocation+Extension.swift
    ├── Collection+Extension.swift
    ├── Date+Extension.swift
    ├── DayOfWeek.swift
    ├── DepthButtonStyle.swift
    ├── Logger+Ext.swift                # os.Logger category extensions
    ├── NSCoding+Extension.swift
    ├── String+Extension.swift
    ├── TimeInterval+Ext.swift
    ├── UIDevice+Extensions.swift
    ├── UIImage+Extensions.swift
    ├── UIScrollView+GestureRecognizer.swift
    ├── UIStackView+Extensions.swift
    ├── UIView+Extensions.swift
    ├── UIViewController+Extensions.swift
    ├── UserDefaults+Extension.swift    # Typed UserDefaults access via UserDefaultsKeys enum
    ├── View+Extension.swift            # SwiftUI view modifiers and extensions
    └── WeeklyHours.swift               # Weekly schedule model and open/closed logic
```

## Widget Extension Target: `BerkeleyMobileWidget/`

```
BerkeleyMobileWidget/
├── BerkeleyMobileWidgetBundle.swift    # @main entry; registers GymOccupancyWidget
├── GymOccupancyWidget.swift            # Widget implementation (TimelineProvider, views)
└── Info.plist
```

## Key Architectural Boundaries

| Boundary | Description |
|---|---|
| `AppDelegate` / `SceneDelegate` | Application and scene lifecycle entry points |
| `TabBarController` | Hosts and separates the four feature tabs |
| `DataManager` | Single orchestration point for `DataSource`-based Firestore fetches |
| `BMNetworkingManager` | Ad-hoc Firestore queries for safety logs and resources |
| `Container` (FactoryKit) | Dependency injection for view models and services |
| `BMLocationManager` | Singleton location service; communicates via `NotificationCenter` |
| Feature modules (`Home/`, `Safety/`, `Events/`, `Today/`, `Resources/`) | Self-contained feature groups with their own views and view models |

## Design System

The design system is defined in `berkeley-mobile/Assets/`:

- `BMColor` struct in `Assets/Colors/Colors.swift` with domain-specific extensions in `Colors+Calendar.swift`, `Colors+MapMarker.swift`, `Colors+AlertView.swift`, `Colors+Resource.swift`, and others.
- `BMFont` struct in `Assets/Fonts.swift` providing access to the Apercu typeface variants.
