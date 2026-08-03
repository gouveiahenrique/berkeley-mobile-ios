# Project Structure

**Last updated:** 2026-08-03

## Overview

The repository implements a feature-first organization for the `berkeley-mobile` app target. Each major app tab (Home, Today, Safety, Resources, Events) has its own top-level directory under `berkeley-mobile/` containing views, view models, and data sources. Shared utilities, protocols, and design-system components live in dedicated cross-cutting directories (`Common/`, `Data/`, `Utils/`).

## Directory Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/                       # Main app target (Swift source)
│   ├── AppDelegate.swift                  # UIApplicationDelegate: Firebase init, push notification registration
│   ├── AppDelegate+Migration.swift        # UserDefaults migration logic
│   ├── SceneDelegate.swift                # UIWindowSceneDelegate
│   ├── TabBarController.swift             # Root UITabBarController (Home, Today, Safety, Resources tabs)
│   ├── MainContainerViewController.swift  # Home tab UIKit host (embeds SwiftUI via UIHostingController)
│   ├── BerkeleyMobile+Injection.swift     # Factory (FactoryKit) Container extension — DI registrations
│   │
│   ├── Assets/                            # Design system tokens (Colors, Fonts subfolders confirmed present)
│   ├── Assets.xcassets/                   # Image assets, app icon
│   │
│   ├── Common/                            # Reusable UI components
│   │   ├── DetailView/                    # OverviewCardView.swift, LocationDetailView and related shared card views
│   │   ├── FilterView/                    # Filter chip views
│   │   └── Images/                        # Image loading/caching (ImageLoader)
│   │
│   ├── Data/                              # Cross-feature data layer
│   │   ├── BMConstants.swift              # App-wide constants (Firestore collection names, etc.)
│   │   ├── BMError.swift                  # LocalizedError enum for domain errors
│   │   ├── BMEventManager.swift           # EventKit calendar integration
│   │   ├── BMLocationManager.swift        # CoreLocation wrapper
│   │   ├── BMNetworkingManager.swift      # Firestore fetch helpers
│   │   ├── DataManager.swift              # Singleton orchestrator for legacy DataSource fetches
│   │   ├── DataSource.swift               # Protocol: fetchItems + fetchDispatch (legacy fetch pattern)
│   │   ├── SortingFunctions.swift         # Generic sort helpers
│   │   ├── ItemProtocols/                 # Domain protocols: HasName, HasLocation, HasImage, HasOpenTimes,
│   │   │                                  #   HasOpenClosedStatus, HasPhoneNumber, HasWebsite, CanFavorite,
│   │   │                                  #   BMCalendarEvent, SearchItem
│   │   └── PropertyWrappers/              # Display.swift (@Display string sanitizer property wrapper)
│   │
│   ├── Debug/                             # Debug-only views (accessed via shake gesture in TabBarController)
│   ├── Drawer/                            # MainDrawerViewDelegate and related drawer-stack delegate logic
│   ├── Events/                            # Events tab
│   │   └── EventDataSource/               # EventsViewModel.swift, BMEventCalendarEntry.swift
│   ├── FeedbackForm/                      # In-app feedback form (FeedbackFormPresenter, FeedbackFormViewModel)
│   ├── Home/                              # Home tab (map + drawer)
│   │   ├── Dining/                        # DiningHallsViewModel + DiningDataSource/
│   │   ├── Fitness/                       # GymDataSource/, GymClassDataSource/, GymOccupancy/
│   │   ├── Guides/                        # Guides feature
│   │   ├── Home Drawer/                   # Pinned locations drawer
│   │   ├── Libraries/                     # LibraryDataSource/, LibraryDetailViewController
│   │   ├── Map/                           # MapViewController, MapDataSource/
│   │   └── Search/                        # Search bar / results views
│   ├── Resources/                         # Resources tab
│   ├── Safety/                            # Safety tab (crime log)
│   ├── Today/                             # Today tab
│   │   └── Tiles/                         # News Tile/, Weather Tile/
│   └── Utils/                             # Extensions and helpers (Date+Extension, Logger+Ext, WeeklyHours, etc.)
│
├── BerkeleyMobileWidget/                   # iOS Widget extension target
│   ├── BerkeleyMobileWidgetBundle.swift
│   ├── GymOccupancyWidget.swift
│   └── Assets.xcassets/
│
├── berkeley-mobile.xcodeproj/              # Xcode project (project.pbxproj, shared schemes)
├── berkeley-mobile.xcworkspace/            # Workspace — open this, not the .xcodeproj
│   └── xcshareddata/swiftpm/Package.resolved  # SPM lockfile (Factory, Glur)
├── Pods/                                    # CocoaPods vendor directory
├── Podfile / Podfile.lock                   # CocoaPods dependency declaration + lockfile
├── specs/                                   # Feature spec documents (e.g. specs/GOP-65/tech-spec.md)
├── CONTRIBUTING.md
├── README.md
└── LICENSE.md
```

## Module Organization

### Data Layer (`berkeley-mobile/Data/`)

Two data-access patterns coexist in the repository:
- **Legacy pattern:** `DataSource` protocol (`Data/DataSource.swift`) implemented by feature-specific data source types, orchestrated by `DataManager.swift`, using completion-handler callbacks and a `DispatchGroup` to guard against duplicate fetches.
- **Modern pattern:** `async throws` Firestore calls made directly from feature ViewModels or through `BMNetworkingManager`.

### Feature Modules (e.g., `Home/Dining/`)

Feature directories observed in the repository follow a recurring shape:
- A ViewModel (e.g. `DiningHallsViewModel`) holding `@Published`/`@Observable` state and performing fetches.
- One or more SwiftUI views consuming the ViewModel via property wrappers from `FactoryKit`.
- An optional `*DataSource` subdirectory for legacy `DataSource` protocol conformance.

### Dependency Injection (`BerkeleyMobile+Injection.swift`)

ViewModels and services are registered as `Factory<T>` properties on a `Container` extension. Confirmed registrations include `calendarViewModel`, `debugViewModel` (guarded by `#if DEBUG`), `diningHallsViewModel`, `eventsViewModel`, `feedbackFormPresenter`, `feedbackFormViewModel`, among others. Scopes observed: `.shared`, `.singleton`, and unscoped (new instance per resolve). 25 files in the repository reference `@InjectedObservable` or `@Injected(`.

## File Naming Conventions

- Swift files: `PascalCase.swift`.
- Extension files: `TypeName+Category.swift` pattern (e.g. `AppDelegate+Migration.swift`, `Date+Extension.swift`, `CLLocation+Extension.swift`).
- No dedicated test target or test files were found in the repository (see `docs/testing-standards.md`).

## Configuration Files

- **CocoaPods:** `Podfile`, `Podfile.lock`
- **SPM:** `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`
- **Build settings:** `berkeley-mobile.xcodeproj/project.pbxproj`
- **Scheme:** `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`
- **Entitlements:** `berkeley-mobile/berkeley-mobile.entitlements`
- **Firebase config:** `berkeley-mobile/GoogleService-Info.plist` — referenced by the README as required for building against production Firestore, but not present in the repository.
- **App Info:** `berkeley-mobile/Info.plist`, `BerkeleyMobileWidget/Info.plist`
