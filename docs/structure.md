# Project Structure

**Last updated:** 2026-07-31

## Overview

Berkeley Mobile iOS is organized as a feature-first iOS application. Each major feature (Dining, Fitness, Libraries, Events, Safety, Resources) has its own directory containing its ViewModel, Views, and DataSource. Shared utilities, common UI components, and protocol definitions live in cross-cutting directories. The project uses a hybrid SwiftUI/UIKit architecture bridged via `UIHostingController` and `UIViewControllerRepresentable`.

## Directory Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/                # Main app target source
│   ├── AppDelegate.swift           # App entry point, Firebase/FCM setup
│   ├── AppDelegate+Migration.swift # Version migration logic
│   ├── SceneDelegate.swift         # Scene lifecycle
│   ├── TabBarController.swift      # Root UITabBarController (4 tabs)
│   ├── MainContainerViewController.swift  # Home tab container
│   ├── BerkeleyMobile+Injection.swift     # FactoryKit DI container registration
│   ├── Assets/                     # Design tokens
│   │   ├── Colors/                # BMColor definitions (dark/light mode)
│   │   ├── Fonts/                 # Apercu font files
│   │   └── Fonts.swift            # BMFont helper struct
│   ├── Assets.xcassets/           # Image/color asset catalog
│   ├── Common/                    # Shared UI components
│   │   ├── BMDrawerView.swift     # Reusable bottom drawer
│   │   ├── BMSegmentedControlView.swift
│   │   ├── CardView.swift
│   │   ├── CollapsibleCardView.swift
│   │   ├── DetailView/            # Generic detail view components
│   │   └── FilterView/            # Generic filter UI components
│   ├── Data/                      # Data layer primitives
│   │   ├── DataManager.swift      # Singleton fetch coordinator
│   │   ├── DataSource.swift       # DataSource protocol definition
│   │   ├── BMNetworkingManager.swift   # Firestore async/await wrapper
│   │   ├── BMConstants.swift      # App-wide constants (map regions, collection names)
│   │   ├── BMError.swift          # Domain error enum
│   │   ├── BMEventManager.swift   # Calendar event management
│   │   ├── BMLocationManager.swift
│   │   ├── SortingFunctions.swift
│   │   ├── ItemProtocols/         # Capability protocols (HasImage, HasLocation, etc.)
│   │   └── PropertyWrappers/      # @Display string wrapper
│   ├── Home/                      # Home tab (map + drawer)
│   │   ├── HomeView.swift         # Root SwiftUI view for Home tab
│   │   ├── HomeViewModel.swift    # ObservableObject for Home state
│   │   ├── Dining/                # Dining Hall feature
│   │   │   ├── DiningDataSource/  # ViewModel, models, data fetching
│   │   │   ├── DiningDetailView.swift
│   │   │   └── DiningHallsView.swift
│   │   ├── Fitness/               # Gym/fitness feature
│   │   │   ├── GymDataSource/
│   │   │   ├── GymClassDataSource/
│   │   │   ├── GymOccupancy/      # Real-time occupancy ViewModel + View
│   │   │   └── GymDetailViewController.swift
│   │   ├── Libraries/             # Library feature
│   │   │   ├── LibraryDataSource/
│   │   │   └── LibraryDetailViewController.swift
│   │   ├── Guides/                # Campus guides feature
│   │   ├── Map/                   # MapKit integration
│   │   │   ├── MapViewController.swift (UIKit + UIViewControllerRepresentable)
│   │   │   ├── MapDataSource/
│   │   │   └── ...
│   │   ├── Home Drawer/           # Drawer pin/state views
│   │   └── Search/                # Search functionality
│   ├── Today/                     # Today tab (tile-based layout)
│   │   └── Tiles/
│   ├── Events/                    # Events/calendar tab
│   │   └── EventDataSource/       # EventsViewModel, BMEventCalendarEntry
│   ├── Safety/                    # Safety tab (crime map + logs)
│   ├── Resources/                 # Resources tab
│   ├── FeedbackForm/              # In-app feedback form
│   ├── Drawer/                    # Shared drawer components
│   ├── Debug/                     # DEBUG-only views and ViewModel
│   └── Utils/                     # Extensions and utilities
│       ├── Date+Extension.swift
│       ├── View+Extension.swift
│       ├── Logger+Ext.swift       # os.Logger category definitions
│       └── ...
├── BerkeleyMobileWidget/          # Widget extension target
│   ├── BerkeleyMobileWidgetBundle.swift
│   └── GymOccupancyWidget.swift
├── berkeley-mobile.xcodeproj/     # Xcode project file
├── berkeley-mobile.xcworkspace/   # CocoaPods workspace (use this to open)
├── Podfile                        # CocoaPods dependency declarations
├── Podfile.lock                   # Locked CocoaPods versions
├── Pods/                          # CocoaPods vendored dependencies
└── docs/                          # Steering documentation
```

## Module Organization

### Feature Modules (under `Home/`, `Events/`, `Safety/`, etc.)

Each feature module follows a consistent pattern:
- **`*ViewModel.swift`** — `@Observable` or `ObservableObject` class holding state and async fetch logic
- **`*View.swift`** — SwiftUI view consuming the ViewModel
- **`*DataSource/`** — Sub-directory with Firestore fetch logic, model types, and legacy `DataSource` protocol implementations

### Data Layer (`Data/`)

- **`DataManager`** — Singleton that coordinates legacy callback-based `DataSource` fetches; uses `DispatchGroup` to prevent duplicate Firestore reads
- **`BMNetworkingManager`** — Modern `async/await` Firestore wrapper for newer features (Safety, Resources)
- **`ItemProtocols/`** — Capability protocols: `HasImage`, `HasLocation`, `HasName`, `HasOpenClosedStatus`, `HasWebsite`, `SearchItem`, `BMCalendarEvent`, etc.

### Dependency Injection (`BerkeleyMobile+Injection.swift`)

All ViewModels registered as `Factory` providers on `Container`. Scopes: `.singleton` (app lifetime), `.shared` (until no strong references), or default (new instance per resolution).

### Common UI (`Common/`)

Reusable SwiftUI components: `BMDrawerView`, `CardView`, `CollapsibleCardView`, `BMSegmentedControlView`, `TagView`, `BMAlert`, `BMCachedAsyncImageView`, etc.

### Design Tokens (`Assets/`)

- **`BMColor`** — static vars returning adaptive `UIColor` (dark/light mode-aware)
- **`BMFont`** — static closures returning `UIFont` with Apercu font family

## File Naming Conventions

- **Swift source files:** `PascalCase.swift` matching the primary type name (e.g., `DiningHallsViewModel.swift`, `BMError.swift`)
- **Extension files:** `TypeName+Extension.swift` or `TypeName+Category.swift` (e.g., `Date+Extension.swift`, `AppDelegate+Migration.swift`, `Colors+TagView.swift`)
- **Assets:** `PascalCase` for asset catalog entries; Apercu font files use their commercial names

## Architectural Patterns

- **Hybrid SwiftUI/UIKit:** SwiftUI is the default for new views. UIKit views are wrapped via `UIViewControllerRepresentable` or hosted via `UIHostingController`. The root is `UITabBarController` hosting `UIHostingController` wrappers.
- **MVVM:** Views own no business logic. ViewModels expose `@Published` or `@Observable` state. Views observe via `@InjectedObject`, `@InjectedObservable`, or `@Injected` (FactoryKit).
- **Dependency Injection:** FactoryKit `Container` is the DI graph. ViewModels use `@Injected`, `@InjectedObject`, or `@InjectedObservable` property wrappers at use site.
- **Singletons:** `DataManager.shared`, `BMNetworkingManager.shared`, `EventsDataService.shared` for shared data access outside DI graph.
