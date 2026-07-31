# Project Structure

**Last updated:** 2026-07-31

## Overview

Berkeley Mobile iOS is organized as a feature-first iOS application. Each major app tab (Home, Today, Safety, Resources, Events) has its own directory containing views, view models, and data sources co-located by feature. Shared utilities, protocols, and design system components live in dedicated cross-cutting directories.

## Directory Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/                # Main app target (Swift source)
│   ├── AppDelegate.swift           # App entry point, Firebase init, push notifications
│   ├── AppDelegate+Migration.swift # UserDefaults migration logic
│   ├── SceneDelegate.swift         # Scene lifecycle
│   ├── TabBarController.swift      # Root UITabBarController (4 tabs)
│   ├── MainContainerViewController.swift # Home tab UIKit host
│   ├── BerkeleyMobile+Injection.swift    # Factory DI container registrations
│   │
│   ├── Assets/                     # Design system tokens
│   │   ├── Colors/                 # BMColor extensions (Colors.swift, Colors+*.swift)
│   │   └── Fonts/                  # Apercu font family (.otf files)
│   ├── Assets.xcassets/            # Image assets, app icon
│   │
│   ├── Common/                     # Reusable UI components
│   │   ├── DetailView/             # Shared detail card views
│   │   ├── FilterView/             # Filter chip views
│   │   └── Images/                 # ImageLoader (URL → UIImage cache)
│   │
│   ├── Data/                       # Cross-feature data layer
│   │   ├── BMConstants.swift       # App-wide constants (Firestore collection names, map config)
│   │   ├── BMError.swift           # Custom error enum (LocalizedError)
│   │   ├── BMEventManager.swift    # EventKit calendar integration
│   │   ├── BMLocationManager.swift # CoreLocation wrapper
│   │   ├── BMNetworkingManager.swift # Firestore fetch helpers (Safety, Resources)
│   │   ├── DataManager.swift       # Singleton data orchestrator for legacy DataSources
│   │   ├── DataSource.swift        # Protocol: fetchItems + fetchDispatch
│   │   ├── SortingFunctions.swift  # Generic sort helpers
│   │   ├── ItemProtocols/          # Domain protocols (HasName, HasLocation, CanFavorite…)
│   │   └── PropertyWrappers/       # @Display string sanitizer
│   │
│   ├── Debug/                      # Debug-only views (shake gesture → DebugView)
│   ├── Drawer/                     # Map drawer delegates
│   ├── Events/                     # Events tab
│   │   ├── EventDataSource/        # EventsViewModel, BMEventCalendarEntry
│   │   └── *.swift                 # CalendarView, EventDetailView, EventRowView…
│   ├── FeedbackForm/               # In-app feedback form (Firestore-configured)
│   ├── Home/                       # Home tab (map + drawer)
│   │   ├── Dining/                 # DiningHallsView + DiningDataSource/
│   │   ├── Fitness/                # FitnessView + GymOccupancy/
│   │   ├── Guides/                 # GuidesView + GuidesViewModel
│   │   ├── Home Drawer/            # Pinned locations drawer
│   │   ├── Libraries/              # LibrariesView
│   │   ├── Map/                    # MapViewController, markers, dropdown
│   │   ├── Search/                 # SearchBarView, SearchResultsView
│   │   ├── HomeView.swift
│   │   ├── HomeViewModel.swift
│   │   ├── OpenClosedStatusManager.swift
│   │   ├── OpenClosedStatusView.swift
│   │   └── RedirectionManager.swift
│   ├── Resources/                  # Resources tab (SafariWebView, links)
│   ├── Safety/                     # Safety tab (crime log map)
│   ├── Today/                      # Today tab
│   │   └── Tiles/                  # News Tile, Weather Tile
│   └── Utils/                      # Extensions and helpers
│       ├── AtomicDictionary.swift  # Thread-safe dictionary
│       ├── Logger+Ext.swift        # os.Logger category constants
│       └── *+Extension.swift       # UIKit/SwiftUI/Foundation extensions
│
├── BerkeleyMobileWidget/           # iOS Widget extension target
│   └── Assets.xcassets/            # Widget-specific assets
│
├── berkeley-mobile.xcodeproj/      # Xcode project
├── berkeley-mobile.xcworkspace/    # Workspace (open this, not .xcodeproj)
│   └── xcshareddata/swiftpm/
│       └── Package.resolved        # SPM lockfile (Factory, Glur)
├── Pods/                           # CocoaPods vendor directory (don't edit)
├── Podfile                         # CocoaPods dependency declaration
├── Podfile.lock                    # CocoaPods lockfile
├── CONTRIBUTING.md
├── README.md
└── LICENSE.md
```

## Module Organization

### Data Layer (`berkeley-mobile/Data/`)

- **Legacy pattern** (`DataSource` protocol + `DataManager`): used for Map, Library, Gym data. Each `DataSource` subclass implements `fetchItems(_:)` and guards against double-fetch using a `DispatchGroup`.
- **Modern pattern** (`BMNetworkingManager`, feature-specific ViewModels): async/await Firestore calls. Used for Safety, Resources, Events, Dining, News.

### Feature Modules (e.g., `Home/Dining/`)

Each feature module typically contains:
- **ViewModel** (`*ViewModel.swift`) — `@Observable` or `ObservableObject`, holds state, performs Firestore fetches
- **View** (`*View.swift`) — SwiftUI views, inject ViewModel via `@InjectedObservable(\.viewModelKey)`
- **DataSource** (optional) — legacy `DataSource` protocol conformance
- **Model types** — `Codable` structs/enums defined alongside the ViewModel

### Dependency Injection (`BerkeleyMobile+Injection.swift`)

All ViewModels and services are registered in the Factory `Container` extension. Injection sites use:
- `@InjectedObservable(\.key)` — for `@Observable`-class ViewModels in SwiftUI
- `@Injected(\.key)` — for services/presenters in UIKit or non-view Swift code
- Scopes: `.singleton` (one instance ever), `.shared` (shared within scope), default (new per resolve)

## File Naming Conventions

- **Swift files:** `PascalCase.swift` (`SafetyViewModel.swift`, `DiningHallsView.swift`)
- **Extension files:** `TypeName+Category.swift` (`Colors+Text.swift`, `AppDelegate+Migration.swift`)
- **Test files:** None present — no dedicated test target
- **XIB/Storyboard:** `Base.lproj/` contains legacy storyboards

## Import Patterns

- Module-level imports at top of file (no re-exports)
- FactoryKit imported in every file that resolves dependencies
- Firebase imported only in files that use Firestore/Auth directly
- No barrel files (`index.swift`) — each file imported by module name

## Configuration Files

- **CocoaPods:** `Podfile`, `Podfile.lock`
- **SPM:** `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`
- **Build settings:** `berkeley-mobile.xcodeproj/project.pbxproj`
- **Scheme:** `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`
- **Entitlements:** `berkeley-mobile/berkeley-mobile.entitlements`
- **Firebase config:** `berkeley-mobile/GoogleService-Info.plist` (excluded from repo)
- **App Info:** `berkeley-mobile/Info.plist`
