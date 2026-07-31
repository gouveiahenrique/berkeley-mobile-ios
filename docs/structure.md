# Project Structure

**Last updated:** 2026-07-31

## Overview

Berkeley Mobile uses a **feature-first, layered architecture** inside a single Xcode target. Features are grouped into top-level directories (`Home`, `Events`, `Safety`, `Today`, etc.). Shared infrastructure lives in `Data/`, `Common/`, `Utils/`, and `Assets/`. The app has one companion WidgetKit extension (`BerkeleyMobileWidget`).

The UI layer is in transition: newer screens are pure **SwiftUI** + `@Observable` / `ObservableObject` ViewModels, while older screens use **UIKit** `UIViewController` subclasses. Both are bridged via `UIHostingController`.

## Directory Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/              # Main app target
│   ├── AppDelegate.swift         # Firebase init, push notification setup
│   ├── AppDelegate+Migration.swift  # Version migration logic
│   ├── SceneDelegate.swift       # Window setup, foreground/background lifecycle
│   ├── TabBarController.swift    # Root tab bar; hosts 4 tabs
│   ├── MainContainerViewController.swift  # Home tab container
│   ├── BerkeleyMobile+Injection.swift    # Factory DI container registrations
│   │
│   ├── Assets/                   # Design tokens
│   │   ├── Colors/               # BMColor struct + per-feature color extensions
│   │   ├── Fonts.swift           # BMFont struct (Apercu typeface wrappers)
│   │   └── Fonts/                # Bundled .otf font files
│   │
│   ├── Common/                   # Reusable UI components (no feature-specific logic)
│   │   ├── BMDrawerView.swift
│   │   ├── BMSegmentedControlView.swift
│   │   ├── CardView.swift
│   │   ├── CollapsibleCardView.swift
│   │   ├── DetailView/           # Detail card sub-components (location, open times, etc.)
│   │   ├── FilterView/           # Reusable filter UI
│   │   └── Images/               # ImageLoader, ImageViewCell
│   │
│   ├── Data/                     # Data layer (models, data sources, managers)
│   │   ├── BMConstants.swift     # App-wide constants (Firebase collection names, map regions)
│   │   ├── BMError.swift         # Custom error enum (LocalizedError)
│   │   ├── BMEventManager.swift  # EventKit calendar integration
│   │   ├── BMLocationManager.swift  # CoreLocation singleton wrapper
│   │   ├── BMNetworkingManager.swift  # Shared Firestore fetch helpers
│   │   ├── DataManager.swift     # Singleton; orchestrates DataSource fetches with caching
│   │   ├── DataSource.swift      # Protocol: fetchItems + fetchDispatch
│   │   ├── ItemProtocols/        # Capability protocols (HasOpenTimes, CanFavorite, SearchItem, etc.)
│   │   ├── PropertyWrappers/     # @Display property wrapper (string sanitization)
│   │   └── SortingFunctions.swift
│   │
│   ├── Drawer/                   # UIKit drawer/search drawer view controllers
│   │
│   ├── Events/                   # Calendar/Events tab feature
│   │   ├── CalendarView.swift
│   │   ├── EventsView.swift
│   │   └── EventDataSource/      # BMEventCalendarEntry, EventsDataService, EventsViewModel
│   │
│   ├── FeedbackForm/             # In-app feedback feature
│   │   ├── FeedbackFormView.swift
│   │   ├── FeedbackFormViewModel.swift
│   │   └── FeedbackFormPresenter.swift
│   │
│   ├── Home/                     # Home tab (map + drawer)
│   │   ├── HomeView.swift
│   │   ├── HomeViewModel.swift
│   │   ├── OpenClosedStatusManager.swift
│   │   ├── Dining/               # Dining halls feature
│   │   │   ├── DiningDataSource/ # BMDiningHall, DiningHallsViewModel, DiningItem, etc.
│   │   │   ├── DiningDetailView.swift
│   │   │   └── DiningHallsView.swift
│   │   ├── Fitness/              # Gym/fitness feature
│   │   │   ├── GymDataSource/    # BMGym, GymDataSource
│   │   │   ├── GymClassDataSource/
│   │   │   ├── GymOccupancy/     # GymOccupancyViewModel, GymOccupancyView
│   │   │   └── GymDetailViewController.swift
│   │   ├── Guides/               # Campus guides feature
│   │   │   ├── GuidesView.swift
│   │   │   └── GuidesViewModel.swift
│   │   ├── Home Drawer/          # Drawer list views
│   │   │   ├── BMHomeSectionListView.swift
│   │   │   └── HomeDrawerPinViewModel.swift
│   │   ├── Libraries/            # Library feature
│   │   │   ├── LibraryDataSource/ # BMLibrary, LibraryDataSource
│   │   │   └── LibraryDetailViewController.swift
│   │   ├── Map/                  # MapKit integration
│   │   │   ├── MapViewController.swift
│   │   │   ├── MapDataSource/
│   │   │   └── SearchResultCell.swift
│   │   └── Search/               # Search feature
│   │       ├── SearchViewModel.swift
│   │       └── SearchResultsView.swift
│   │
│   ├── Resources/                # Campus resources tab
│   │   ├── ResourcesView.swift
│   │   ├── ResourcesViewModel.swift
│   │   └── SafariWebView.swift
│   │
│   ├── Safety/                   # Safety tab (crime map)
│   │   ├── SafetyView.swift
│   │   ├── SafetyViewModel.swift
│   │   └── SafetyMapView.swift
│   │
│   ├── Today/                    # Today tab (tiles)
│   │   ├── TodayView.swift
│   │   ├── TodayTileLayout.swift
│   │   └── Tiles/
│   │       ├── News Tile/        # NewsDataViewModel, NewsTileView
│   │       └── Weather Tile/     # WeatherDataViewModel, TodayWeatherTileView
│   │
│   ├── Utils/                    # Pure utility extensions (no UI, no domain logic)
│   │   ├── Date+Extension.swift
│   │   ├── Logger+Ext.swift      # os.Logger per-category extensions
│   │   ├── View+Extension.swift  # SwiftUI ViewModifier helpers
│   │   ├── UIView+Extensions.swift
│   │   └── AtomicDictionary.swift
│   │
│   └── Debug/                    # DEBUG-only views (DebugView, DebugViewModel)
│
├── BerkeleyMobileWidget/         # WidgetKit extension target (iOS 17+)
│   ├── GymOccupancyWidget.swift  # Widget entry, provider, views
│   └── BerkeleyMobileWidgetBundle.swift
│
├── berkeley-mobile.xcodeproj/    # Xcode project (do not hand-edit)
├── berkeley-mobile.xcworkspace/  # CocoaPods workspace (open this, not .xcodeproj)
├── Podfile                       # CocoaPods dependency declarations
├── Podfile.lock                  # Locked pod versions (commit this file)
├── Pods/                         # Generated CocoaPods artifacts (do not commit)
└── docs/                         # Steering documentation
```

## Feature Organization Pattern

Each feature directory typically contains:

```
Feature/
├── FeatureView.swift             # SwiftUI View (or UIViewController for UIKit features)
├── FeatureViewModel.swift        # ObservableObject or @Observable ViewModel
└── FeatureDataSource/            # Model types + Firestore fetch logic
    ├── BMModelType.swift         # Data model struct/class (prefixed BM)
    └── FeatureDataSource.swift   # Implements DataSource protocol (legacy pattern)
```

Newer features (post-2024) use the `BMNetworkingManager` or direct `Firestore` calls inside the ViewModel rather than the `DataSource` protocol.

## File Naming Conventions

- **All Swift files:** `PascalCase.swift` (matches the primary type defined in the file)
- **Extensions:** `TypeName+Category.swift` (e.g., `Colors+ActionButton.swift`, `AppDelegate+Migration.swift`)
- **Utility extensions:** `TypeName+Extension.swift` or `TypeName+Ext.swift`
- **App-prefixed types:** Shared/infrastructure types are prefixed `BM` (e.g., `BMLibrary`, `BMError`, `BMFont`, `BMColor`)

## Import Patterns

- **No module aliases** — direct framework names used (`import SwiftUI`, `import Firebase`, `import FactoryKit`)
- **Conditional compilation:** `#if DEBUG` guards `DebugView` presentation and `DebugViewModel` registration
- **Availability checks:** `if #available(iOS 17.0, *)` used for API-gated behavior (e.g., EventKit full-access)

## Configuration Files

- **`Podfile`** — CocoaPods dependency declarations
- **`Podfile.lock`** — Locked pod versions (must be committed)
- **`berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`** — SPM locked versions (must be committed)
- **`berkeley-mobile.entitlements`** — App entitlements (WeatherKit, Push Notifications)
- **`Info.plist`** — App metadata and permission usage descriptions
- **`GoogleService-Info.plist`** — Firebase config (not committed; provisioned per environment)

## Architectural Patterns

- **MVVM:** Views hold a ViewModel; ViewModels own data fetching and state
- **Dependency Injection:** Factory container in `BerkeleyMobile+Injection.swift`; views use `@Injected`, `@InjectedObject`, `@InjectedObservable` property wrappers
- **Singleton Managers:** `DataManager.shared`, `BMLocationManager.shared`, `BMNetworkingManager.shared`
- **Protocol-Oriented Models:** Domain models conform to capability protocols (`HasOpenTimes`, `CanFavorite`, `SearchItem`, etc.) from `Data/ItemProtocols/`
- **UIKit ↔ SwiftUI Bridge:** `UIHostingController` wraps SwiftUI views for UIKit containers; `UIViewControllerRepresentable` wraps `MapViewController` for SwiftUI
