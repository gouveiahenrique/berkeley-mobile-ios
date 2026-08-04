# Project Structure

**Last updated:** 2026-08-04

## Overview

Berkeley Mobile iOS follows a feature-first modular structure under the main `berkeley-mobile/` target, with a shared `Data/` layer and `Common/` UI component library. UI is a hybrid of SwiftUI (new screens) and UIKit (legacy screens, bridged via `UIViewControllerRepresentable`). MVVM is the dominant pattern.

## Directory Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/                  # Main app target
│   ├── AppDelegate.swift             # App lifecycle, Firebase init, push notifications
│   ├── SceneDelegate.swift           # Scene lifecycle
│   ├── TabBarController.swift        # Root navigation (UITabBarController + SwiftUI hosting)
│   ├── MainContainerViewController.swift  # Home tab container (UIKit)
│   ├── BerkeleyMobile+Injection.swift # FactoryKit DI container extension
│   │
│   ├── Assets/                       # Design tokens
│   │   ├── Colors/                   # BMColor namespace (Colors+Resource, +Text, etc.)
│   │   └── Fonts.swift               # BMFont (Apercu typeface)
│   ├── Assets.xcassets/              # Images and icons
│   │
│   ├── Data/                         # Shared data layer
│   │   ├── BMConstants.swift         # App-wide constants (Firebase collection names, map regions)
│   │   ├── BMError.swift             # Typed error enum (LocalizedError)
│   │   ├── BMEventManager.swift      # EventKit calendar integration
│   │   ├── BMLocationManager.swift   # CoreLocation wrapper
│   │   ├── BMNetworkingManager.swift # Async Firestore fetch helper (singleton)
│   │   ├── DataManager.swift         # Legacy singleton DataSource registry + fetch cache
│   │   ├── DataSource.swift          # Legacy DataSource protocol (closure-based fetch)
│   │   ├── SortingFunctions.swift    # Shared sort utilities
│   │   ├── ItemProtocols/            # Protocol definitions for model capabilities
│   │   │   ├── BMCalendarEvent.swift
│   │   │   ├── CanFavorite.swift
│   │   │   ├── HasImage.swift
│   │   │   ├── HasLocation.swift
│   │   │   ├── HasName.swift
│   │   │   ├── HasOpenClosedStatus.swift  # Successor to HasOpenTimes
│   │   │   ├── HasOpenTimes.swift
│   │   │   ├── HasPhoneNumber.swift
│   │   │   ├── HasWebsite.swift
│   │   │   └── SearchItem.swift
│   │   └── PropertyWrappers/
│   │       └── Display.swift
│   │
│   ├── Common/                       # Shared UI components
│   │   ├── BMAlert.swift             # Alert model struct
│   │   ├── BMActionButton.swift
│   │   ├── BMCachedAsyncImageView.swift
│   │   ├── BMDrawerView.swift        # Bottom drawer (small/medium/large states)
│   │   ├── BMFilterButton.swift
│   │   ├── BMSegmentedControlView.swift
│   │   ├── BMTopBlobView.swift
│   │   ├── CardView.swift
│   │   ├── CollapsibleCardView.swift
│   │   ├── ReviewPrompter.swift
│   │   ├── TagView.swift
│   │   ├── DetailView/               # Protocols + views for detail panels
│   │   │   ├── DetailView.swift      # DetailView protocol (UIKit)
│   │   │   ├── DescriptionCardView.swift
│   │   │   ├── LocationDetailView.swift
│   │   │   ├── OpenTimesCardView.swift
│   │   │   └── OpenTimesCardSwiftUIView.swift
│   │   ├── FilterView/               # Filter UI components
│   │   └── Images/
│   │
│   ├── Home/                         # Home tab (map-centric)
│   │   ├── Map/                      # MKMapView + markers
│   │   │   ├── MapViewController.swift
│   │   │   ├── MapDataSource/        # Legacy DataSource for map pins
│   │   │   └── ...
│   │   ├── Dining/                   # Dining halls feature
│   │   │   ├── DiningDataSource/     # BMDiningHall models + DiningHallsViewModel
│   │   │   ├── DiningHallsView.swift
│   │   │   └── DiningDetailView.swift
│   │   ├── Fitness/                  # Gym & classes feature
│   │   │   ├── GymDataSource/
│   │   │   ├── GymClassDataSource/
│   │   │   └── GymOccupancy/        # GymOccupancyViewModel (real-time Firestore)
│   │   ├── Libraries/                # Library hours feature
│   │   │   └── LibraryDataSource/
│   │   ├── Guides/                   # Campus guides feature
│   │   ├── Search/                   # Search overlay (SearchViewModel)
│   │   └── Home Drawer/              # Drawer pin state management
│   │
│   ├── Events/                       # Events/calendar tab
│   │   ├── EventDataSource/          # EventsViewModel, BMEventCalendarEntry
│   │   ├── CalendarView.swift
│   │   └── EventsView.swift
│   │
│   ├── Safety/                       # Safety alerts tab
│   │   ├── SafetyViewModel.swift     # Async Firestore + filter logic
│   │   ├── SafetyView.swift          # SwiftUI root view
│   │   └── SafetyMapView.swift
│   │
│   ├── Resources/                    # Campus resources tab
│   │   ├── ResourcesViewModel.swift
│   │   └── ResourcesView.swift
│   │
│   ├── Today/                        # Today tab (weather, news tiles)
│   │   └── Tiles/
│   │       ├── News Tile/
│   │       └── Weather Tile/
│   │
│   ├── FeedbackForm/                 # In-app feedback form
│   │   └── FeedbackFormViewModel.swift
│   │
│   ├── Drawer/                       # Drawer navigation delegates
│   ├── Debug/                        # DEBUG-only views (shake to reveal)
│   ├── Utils/                        # Extensions and utilities
│   │   ├── AtomicDictionary.swift
│   │   ├── Logger+Ext.swift          # os.Logger category extensions
│   │   ├── Date+Extension.swift
│   │   ├── UIView+Extensions.swift
│   │   └── ...
│   ├── Base.lproj/                   # Storyboard / Launch screen
│   └── Resources/                    # Fonts, plists
│
├── BerkeleyMobileWidget/             # WidgetKit extension target
│   ├── BerkeleyMobileWidgetBundle.swift
│   └── GymOccupancyWidget.swift
│
├── Pods/                             # CocoaPods generated (do not edit)
├── berkeley-mobile.xcodeproj/
├── berkeley-mobile.xcworkspace/      # Always open this
├── Podfile                           # CocoaPods dependency declaration
├── Podfile.lock                      # Locked CocoaPods versions
└── README.md
```

## Module Organization

### Data Layer (`Data/`)

Two parallel patterns coexist:
- **Legacy:** `DataSource` protocol with `static func fetchItems(_ completion:)` callbacks, managed by `DataManager.shared`. Used by `MapDataSource`, `LibraryDataSource`, `GymDataSource`.
- **Modern:** `@Observable` / `ObservableObject` ViewModels that call `BMNetworkingManager.shared` or Firestore directly via `async/await`. Used by all new features (Dining, Safety, Resources, etc.).

### ViewModels

Each feature has a dedicated ViewModel (`*ViewModel.swift`) co-located with its view files. ViewModels are:
- Registered as Factory singletons or shared instances in `BerkeleyMobile+Injection.swift`
- Injected into views via `@InjectedObject(\.key)` or `@InjectedObservable(\.key)`

### ItemProtocols (`Data/ItemProtocols/`)

Small capability protocols (`CanFavorite`, `HasLocation`, `HasOpenClosedStatus`, etc.) that models conform to. Prefer `HasOpenClosedStatus` over `HasOpenTimes` for new code.

### Common Components (`Common/`)

Reusable SwiftUI and UIKit components shared across features. Naming convention: prefix with `BM` for project-specific components (e.g., `BMDrawerView`, `BMAlert`, `BMFilterButton`).

## File Naming Conventions

- **Swift files:** `PascalCase` matching the primary type name (e.g., `SafetyViewModel.swift`, `BMDrawerView.swift`)
- **Extensions:** `TypeName+Extension.swift` for UIKit extensions; `TypeName+Ext.swift` also used (e.g., `Logger+Ext.swift`, `UIView+Extensions.swift`)
- **Data sources:** `FeatureNameDataSource.swift` in a `*DataSource/` subdirectory
- **Protocols:** Co-located with related functionality; named with capability (e.g., `CanFavorite`, `HasLocation`)

## Configuration Files

| File | Purpose |
|------|---------|
| `Podfile` | CocoaPods dependency declarations |
| `Podfile.lock` | Locked CocoaPods versions (commit this) |
| `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved` | Locked SPM versions (commit this) |
| `berkeley-mobile/GoogleService-Info.plist` | Firebase config — **gitignored**, must be provided separately |
| `berkeley-mobile/Secrets.swift` | API secrets — **gitignored**, must be provided separately |
| `.gitignore` | Standard Swift/Xcode ignores |

## Architectural Patterns

- **MVVM:** Views are thin; all business logic lives in ViewModels
- **Protocol-Oriented:** Model capabilities expressed as small protocols in `ItemProtocols/`
- **Dependency Injection:** Factory 2.5.3 container defined in `BerkeleyMobile+Injection.swift`; inject with `@Injected`, `@InjectedObject`, or `@InjectedObservable`
- **Singleton services:** `DataManager.shared`, `BMNetworkingManager.shared`, `BMLocationManager.shared`
- **UIKit ↔ SwiftUI bridge:** Legacy UIKit VCs are wrapped in `UIViewControllerRepresentable` structs and embedded in SwiftUI hierarchies
