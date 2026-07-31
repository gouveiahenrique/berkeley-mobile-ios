# Project Structure

**Last updated:** 2026-07-31

## Overview

Berkeley Mobile follows a **feature-first, layered architecture** within the `berkeley-mobile/` source tree. Each top-level folder maps to a distinct app feature or cross-cutting concern. ViewModels own business logic and Firestore calls; Views are passive SwiftUI/UIKit rendering layers. A single `DataManager` singleton (legacy) manages Firestore reads for older data sources; newer ViewModels call Firestore directly via async/await.

## Directory Layout

```
berkeley-mobile-ios/              # Repo root
├── berkeley-mobile/              # Main app source
│   ├── AppDelegate.swift         # App entry point (Firebase init, push notifications)
│   ├── SceneDelegate.swift       # UIScene lifecycle; triggers DataManager.fetchIfNecessary()
│   ├── TabBarController.swift    # Root UITabBarController (Home, Today, Safety, Resources)
│   ├── MainContainerViewController.swift  # Container for map + drawer
│   ├── BerkeleyMobile+Injection.swift     # FactoryKit DI container (all ViewModels)
│   ├── AppDelegate+Migration.swift        # UserDefaults migration logic
│   │
│   ├── Assets/                   # Non-xcasset resources
│   │   ├── Colors/               # BMColor + BMFont definitions (Swift files)
│   │   └── Fonts/                # Apercu font family (.otf files)
│   ├── Assets.xcassets/          # Image assets (xcasset catalog)
│   ├── Base.lproj/               # Storyboard (Launch Screen only)
│   ├── Resources/                # GoogleService-Info.plist placeholder + resource strings
│   │
│   ├── Data/                     # Cross-feature data layer
│   │   ├── DataManager.swift     # Singleton that orchestrates DataSource fetches
│   │   ├── DataSource.swift      # Protocol for legacy Firestore data sources
│   │   ├── BMNetworkingManager.swift  # Shared async Firestore fetcher (newer endpoints)
│   │   ├── BMConstants.swift     # App-wide constants (collection names, map region)
│   │   ├── BMError.swift         # Typed error enum with LocalizedError descriptions
│   │   ├── BMEventManager.swift  # Calendar event integration (EKEventStore)
│   │   ├── BMLocationManager.swift    # CLLocationManager wrapper
│   │   ├── SortingFunctions.swift     # Generic sort helpers
│   │   ├── ItemProtocols/        # Protocols items can conform to (HasName, HasLocation…)
│   │   └── PropertyWrappers/     # @Display property wrapper (trims strings for display)
│   │
│   ├── Common/                   # Reusable UI components
│   │   ├── DetailView/           # DetailView protocol + card views (OpenTimes, Location…)
│   │   ├── FilterView/           # FilterViewCell (chip-style filter UI)
│   │   ├── Images/               # ImageLoader (async image fetch) + ImageViewCell
│   │   ├── IconPairView.swift    # Label + icon pair component
│   │   ├── ReviewPrompter.swift  # SKStoreReviewController trigger logic
│   │   ├── ScrollingStackView.swift  # Horizontally scrolling stack
│   │   └── TagView.swift         # Pill tag UI component
│   │
│   ├── Home/                     # "Home" tab — map + drawer
│   │   ├── HomeView.swift        # Root SwiftUI view (map + BMDrawerView)
│   │   ├── HomeViewModel.swift   # Coordinates dining/gym/library data for drawer
│   │   ├── OpenClosedStatusManager.swift  # Timer-based open/closed status updates
│   │   ├── OpenClosedStatusView.swift     # Open/closed badge UI
│   │   ├── RedirectionManager.swift       # Deep-link to Maps.app / Phone
│   │   ├── Dining/               # Dining halls feature
│   │   │   ├── DiningDataSource/ # BMDiningHall, DiningItem, MealType models + ViewModel
│   │   │   ├── DiningHallsView.swift
│   │   │   └── DiningDetailView.swift
│   │   ├── Fitness/              # Gyms feature
│   │   │   ├── GymDataSource/    # BMGym model + GymDataSource (legacy DataSource)
│   │   │   ├── GymClassDataSource/  # GymClass, GymClassType models
│   │   │   ├── GymOccupancy/     # GymOccupancyViewModel (also used by Widget)
│   │   │   ├── FitnessView.swift
│   │   │   └── GymDetailViewController.swift
│   │   ├── Libraries/            # Libraries feature
│   │   │   ├── LibraryDataSource/  # BMLibrary model + LibraryDataSource (legacy)
│   │   │   ├── LibrariesView.swift
│   │   │   └── LibraryDetailViewController.swift
│   │   ├── Guides/               # Campus guides feature
│   │   │   ├── Guide.swift, GuidesViewModel.swift
│   │   │   ├── GuidesView.swift, GuideDetailView.swift
│   │   │   └── GuidePlacesStackedCollageView.swift
│   │   ├── Map/                  # Interactive map
│   │   │   ├── MapDataSource/    # MapDataSource (legacy) + MapMarker model
│   │   │   ├── MapViewController.swift   # UIKit map controller + UIViewControllerRepresentable
│   │   │   ├── MapMarkerDetailView.swift
│   │   │   ├── MapMarkersDropdownView.swift
│   │   │   ├── MapPlacemark.swift
│   │   │   └── MapUserLocationButton.swift
│   │   ├── Home Drawer/          # Drawer UI and pin management
│   │   │   ├── BMHomeSectionListView.swift
│   │   │   ├── HomeDrawerPinViewModel.swift
│   │   │   ├── HomeDrawerRowImageView.swift
│   │   │   └── HomeSectionListRowView.swift
│   │   └── Search/               # In-app search
│   │       ├── SearchViewModel.swift
│   │       ├── SearchBarView.swift
│   │       ├── SearchResultsView.swift
│   │       ├── SearchResultsListRowView.swift
│   │       ├── SearchAnnotation.swift
│   │       └── RecentSearchManager.swift
│   │
│   ├── Today/                    # "Today" tab — tiles dashboard
│   │   ├── TodayView.swift       # Root tile grid (TodayTilingLayout)
│   │   ├── TodayTileView.swift   # Tile wrapper with span support
│   │   ├── TodayTileAttributes.swift
│   │   ├── TodayTileLayout.swift # Custom SwiftUI Layout for tile grid
│   │   └── Tiles/
│   │       ├── News Tile/        # NewsArticle model + NewsDataViewModel + NewsTileView
│   │       └── Weather Tile/     # WeatherDataViewModel + TodayWeatherTileView
│   │
│   ├── Events/                   # Events / calendar tab (accessible via Today)
│   │   ├── EventsView.swift
│   │   ├── CalendarView.swift, CalendarSectionView.swift
│   │   ├── EventDetailView.swift, EventRowView.swift
│   │   ├── AllDayEventBannerView.swift
│   │   ├── BMAddedCalendarStatusOverlayView.swift
│   │   └── EventDataSource/      # BerkeleyEvent, BMEventCalendarEntry, EventsViewModel
│   │
│   ├── Safety/                   # "Safety" tab — crime log + map
│   │   ├── SafetyView.swift
│   │   ├── SafetyViewModel.swift  # Async Firestore fetch, filter state
│   │   ├── SafetyMapView.swift, SafetyMapMarker.swift
│   │   ├── SafetyLogDetailView.swift
│   │   ├── SafetyLogFilterButton.swift
│   │   └── SafetyViewFilterScrollView.swift
│   │
│   ├── Resources/                # "Resources" tab — campus resource links
│   │   ├── ResourcesView.swift
│   │   ├── ResourcesViewModel.swift
│   │   ├── ResourcesSectionDropdown.swift
│   │   └── SafariWebView.swift   # SFSafariViewController wrapper
│   │
│   ├── FeedbackForm/             # In-app feedback form
│   │   ├── FeedbackFormView.swift
│   │   ├── FeedbackFormViewModel.swift
│   │   └── FeedbackFormPresenter.swift
│   │
│   ├── Drawer/                   # Bottom-sheet drawer infrastructure
│   │   ├── DrawerViewController.swift
│   │   ├── DrawerViewDelegate.swift
│   │   ├── MainDrawerViewDelegate.swift
│   │   ├── SearchDrawerViewController.swift
│   │   ├── SearchDrawerViewDelegate.swift
│   │   └── BarView.swift
│   │
│   ├── Debug/                    # Debug-only views (#if DEBUG)
│   │   ├── DebugView.swift
│   │   └── DebugViewModel.swift
│   │
│   └── Utils/                    # Swift extensions and utilities
│       ├── AtomicDictionary.swift       # Thread-safe dictionary wrapper
│       ├── WeeklyHours.swift            # Hours-of-operation model
│       ├── DayOfWeek.swift              # Day enum
│       ├── Logger+Ext.swift             # os.Logger category constants
│       ├── Date+Extension.swift
│       ├── String+Extension.swift
│       ├── CLLocation+Extension.swift
│       ├── Collection+Extension.swift
│       ├── NSCoding+Extension.swift
│       ├── TimeInterval+Ext.swift
│       ├── UserDefaults+Extension.swift
│       ├── View+Extension.swift         # SwiftUI View helpers
│       ├── DepthButtonStyle.swift       # Custom ButtonStyle
│       ├── UIDevice+Extensions.swift
│       ├── UIImage+Extensions.swift
│       ├── UIScrollView+GestureRecognizer.swift
│       ├── UIStackView+Extensions.swift
│       ├── UIView+Extensions.swift
│       └── UIViewController+Extensions.swift
│
├── BerkeleyMobileWidget/         # iOS Widget Extension (WidgetKit)
│   ├── BerkeleyMobileWidgetBundle.swift
│   ├── GymOccupancyWidget.swift  # Gym occupancy home-screen widget
│   └── Assets.xcassets/
│
├── Pods/                         # CocoaPods managed (do not edit)
├── berkeley-mobile.xcodeproj/    # Xcode project (open via .xcworkspace)
├── berkeley-mobile.xcworkspace/  # Xcode workspace (always use this to open)
├── Podfile                       # CocoaPods dependency declaration
├── Podfile.lock                  # CocoaPods locked versions (commit this)
├── CONTRIBUTING.md
├── README.md
└── LICENSE.md
```

## Module Organization

### Data Layer (`Data/`)

- **Models** — defined adjacent to the feature that owns them (e.g., `BMDiningHall` in `Home/Dining/DiningDataSource/`)
- **Protocols** — `ItemProtocols/` holds capability protocols (`HasName`, `HasLocation`, `CanFavorite`, `HasImage`, `HasOpenTimes`, `HasPhoneNumber`, `HasWebsite`, `SearchItem`). Models compose by conforming to multiple protocols.
- **DataSource** (legacy) — classes conforming to `DataSource` protocol implement `fetchItems(_:)` using old callback-style Firestore calls. Managed by `DataManager` singleton.
- **ViewModels** (modern) — `@Observable` or `ObservableObject` classes call Firestore directly with `async/await`.

### ViewModel Pattern

- **Legacy:** `ObservableObject` + `@Published` properties, callbacks via `DispatchGroup`
- **Modern:** `@Observable` macro (Swift 5.9+), `async/await` + `Task { @MainActor in ... }`
- **Injection:** All ViewModels are registered in `BerkeleyMobile+Injection.swift` via FactoryKit; views inject with `@InjectedObject`, `@InjectedObservable`, or `@Injected`.

### UI Layer

- SwiftUI views are stateless rendering layers; they observe ViewModel changes via `@ObservedObject` / `@Bindable`.
- UIKit views remain for: the `MKMapView`-based map, the custom bottom-drawer infrastructure, and older detail views that predate SwiftUI adoption.
- UIKit ↔ SwiftUI boundaries: SwiftUI wraps UIKit via `UIViewControllerRepresentable` (e.g., `HomeMapView`); UIKit embeds SwiftUI via `UIHostingController` (e.g., tab views in `TabBarController`).

## File Naming Conventions

- **Swift files:** `PascalCase` matching the primary type (`DiningHallsViewModel.swift`, `BMDiningHall.swift`)
- **Extensions:** `Type+Category.swift` (`Date+Extension.swift`, `Logger+Ext.swift`)
- **Prefixes:** `BM` prefix on domain model types (`BMLibrary`, `BMGym`, `BMDiningHall`, `BMError`)
- **Test files:** Not present in the repository (no test target configured)

## Configuration Files

- **Root:** `Podfile` / `Podfile.lock` (CocoaPods), `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved` (SPM)
- **Excluded from repo:** `berkeley-mobile/GoogleService-Info.plist` (Firebase credentials)
- **Entitlements:** `berkeley-mobile/berkeley-mobile.entitlements`
- **Info.plist:** `berkeley-mobile/Info.plist`, `BerkeleyMobileWidget/Info.plist`
