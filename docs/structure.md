# Repository Structure

## Top-Level Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/          # Main app source
├── BerkeleyMobileWidget/     # Widget extension source
├── berkeley-mobile.xcodeproj/
├── berkeley-mobile.xcworkspace/
├── Podfile                   # CocoaPods dependency declarations
├── Podfile.lock
├── Pods/                     # CocoaPods resolved dependencies
├── specs/                    # Product/epic specification documents
├── app_preview_images/       # App Store preview screenshots
├── docs/                     # Technical documentation (this directory)
└── .codegraph/               # CodeGraph index
```

## `berkeley-mobile/` Source Tree

```
berkeley-mobile/
├── AppDelegate.swift              # UIApplication entry point
├── AppDelegate+Migration.swift    # Version migration logic
├── SceneDelegate.swift            # UIScene lifecycle
├── TabBarController.swift         # Root tab bar controller
├── MainContainerViewController.swift  # Home tab UIKit container + drawer host
├── BerkeleyMobile+Injection.swift # FactoryKit DI registrations
├── berkeley-mobile.entitlements
├── Info.plist
│
├── Assets/                        # App-wide design tokens
│   ├── Colors/Colors.swift        # BMColor struct (UIKit + SwiftUI colors)
│   └── Fonts.swift                # BMFont struct (Apercu font family)
│
├── Data/                          # Shared data layer
│   ├── DataManager.swift          # Singleton prefetch coordinator
│   ├── DataSource.swift           # DataSource protocol
│   ├── BMNetworkingManager.swift  # Async Firestore fetch manager
│   ├── BMLocationManager.swift    # CLLocationManager singleton wrapper
│   ├── BMConstants.swift          # App-wide constants (coordinates, collection names)
│   ├── BMError.swift              # BMAlert and error types
│   ├── BMEventManager.swift       # Academic/campus event persistence
│   ├── SortingFunctions.swift     # Shared sorting helpers
│   ├── ItemProtocols/             # Shared model protocols (HasImage, HasOpenTimes, CanFavorite, etc.)
│   └── PropertyWrappers/          # Custom Swift property wrappers (@Display, etc.)
│
├── Home/                          # Home tab feature
│   ├── HomeView.swift             # SwiftUI root for the Home tab
│   ├── HomeViewModel.swift        # Home tab observable state
│   ├── Home Drawer/               # Drawer pin/content views
│   ├── Map/                       # Interactive MKMapView + search
│   │   ├── MapViewController.swift
│   │   ├── MapDataSource/         # Firestore "Map Marker" data source
│   │   ├── Search/                # Search bar, results, placemark views
│   │   └── ...
│   ├── Dining/                    # Dining halls listing and detail
│   ├── Fitness/                   # Gym listing, detail, and occupancy
│   │   ├── GymDataSource/
│   │   ├── GymOccupancy/          # Real-time occupancy view model
│   │   └── ...
│   ├── Libraries/                 # Library listing and detail
│   │   ├── LibraryDataSource/
│   │   └── ...
│   ├── Guides/                    # Campus guides feature
│   └── OpenClosedStatusManager.swift
│
├── Today/                         # Today tab feature
│   ├── TodayView.swift
│   ├── TodayTileAttributes.swift  # Tile metadata (span, style)
│   ├── TodayTileLayout.swift      # Custom tiling layout
│   └── Tiles/                     # Individual tile views (news, weather)
│
├── Safety/                        # Safety tab feature
│   ├── SafetyView.swift
│   ├── SafetyViewModel.swift      # Firestore fetch + filter state
│   ├── SafetyMapView.swift        # Map with crime markers
│   └── ...
│
├── Resources/                     # Resources tab feature
│   ├── ResourcesView.swift
│   └── ...
│
├── Events/                        # Academic and campus-wide events
│   ├── EventsView.swift
│   ├── CalendarView.swift
│   ├── EventDataSource/
│   └── ...
│
├── FeedbackForm/                  # In-app feedback form
│   ├── FeedbackFormPresenter.swift
│   └── ...
│
├── Drawer/                        # UIKit drawer system
│   ├── DrawerState (enum)         # hidden / collapsed / middle / full
│   ├── DrawerViewDelegate.swift   # Protocol + default pan-gesture implementation
│   ├── DrawerViewController.swift # Base UIViewController for drawer panels
│   ├── MainDrawerViewDelegate.swift  # Protocol for stacked-drawer host
│   └── SearchDrawerViewDelegate.swift
│
├── Common/                        # Reusable UI components
│   ├── BMDrawerView.swift         # SwiftUI-native drawer (small/medium/large states)
│   ├── BMAlert.swift
│   ├── BMSegmentedControlView.swift
│   ├── BMCachedAsyncImageView.swift
│   ├── CollapsibleCardView.swift
│   ├── DetailView/                # Shared detail cards (open times, overview)
│   ├── FilterView/
│   ├── Images/                    # ImageLoader + image view cells
│   ├── ReviewPrompter.swift
│   └── ...
│
├── Utils/                         # Low-level utilities and extensions
│   ├── AtomicDictionary.swift     # pthread_rwlock-based thread-safe dictionary
│   ├── WeeklyHours.swift          # WeeklyHours / HoursInterval model
│   ├── Date+Extension.swift       # Date manipulation helpers
│   ├── UserDefaults+Extension.swift  # Typed UserDefaultsKeys enum
│   ├── UIView+Extensions.swift    # Layout constraint helpers
│   ├── View+Extension.swift       # SwiftUI ViewModifier helpers
│   └── ...
│
└── Debug/                         # Debug-only views (DebugView, DebugViewModel)
```

## `BerkeleyMobileWidget/` Source Tree

```
BerkeleyMobileWidget/
├── BerkeleyMobileWidgetBundle.swift  # @main WidgetBundle entry
├── GymOccupancyWidget.swift          # GymOccupancyProvider (TimelineProvider)
│                                     # + GymOccupancyWidgetEntryView (SwiftUI)
└── Info.plist
```

The widget extension re-uses `GymOccupancyViewModel` from the main app and declares a separate CocoaPods target with `Firebase/Firestore`.

## Architectural Boundaries

| Boundary | Description |
|---|---|
| Data layer | `berkeley-mobile/Data/` — all Firestore access, location, persistence |
| Feature modules | Each subdirectory under `berkeley-mobile/Home/`, plus `Today/`, `Safety/`, `Resources/`, `Events/` — self-contained feature code |
| Shared UI | `berkeley-mobile/Common/` — components used across features |
| Utilities | `berkeley-mobile/Utils/` — stateless extensions and helpers |
| Dependency wiring | `BerkeleyMobile+Injection.swift` — single file where all DI factories are registered |
| Design tokens | `berkeley-mobile/Assets/` — `BMColor` and `BMFont` centralize all visual constants |

## Key Dependencies Between Modules

- `TabBarController` instantiates all four tab root views.
- `MainContainerViewController` hosts `HomeView` (SwiftUI) and owns the UIKit drawer stack.
- `HomeView` receives `MapViewController` as a dependency at construction time.
- `DataManager` is the sole consumer of `DataSource` implementations; features retrieve data only through `DataManager.shared.fetch(source:_:)`.
- `BMNetworkingManager` is used directly by `SafetyViewModel` and `ResourcesViewModel` for async fetches not covered by `DataManager`.
- `FactoryKit` `Container` wires view models to views via `@Injected`/`@InjectedObject`/`@InjectedObservable` at every feature boundary.
