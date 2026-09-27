# Repository Structure

## Top-Level Layout

The repository root contains, alongside standard project metadata (`README.md`, `LICENSE.md`, `CONTRIBUTING.md`):

- `berkeley-mobile/` — the main application target's source, assets, and resources.
- `BerkeleyMobileWidget/` — the WidgetKit extension target's source and resources.
- `berkeley-mobile.xcodeproj/`, `berkeley-mobile.xcworkspace/` — Xcode project and workspace files.
- `Podfile`, `Podfile.lock`, `Pods/` — CocoaPods dependency declarations and vendored pod sources.
- `app_preview_images/` — App Store preview screenshots referenced from `README.md`.

## `berkeley-mobile/` Module Organization

The main target organizes source files by feature area, not by architectural layer (i.e. no repository-wide `Views/`, `Models/`, `Controllers/` split):

- **`Home/`** — the main tab's feature area, itself subdivided by domain:
  - `Home/Map/` — map browsing, including `MapDataSource/` (Firestore-backed `MapDataSource`, `MapMarker`) and `MapViewController.swift`.
  - `Home/Libraries/` — library listings and detail views, including `LibraryDataSource/`.
  - `Home/Fitness/` — gym listings, gym classes, and detail views, including `GymDataSource/` and `GymClassDataSource/`.
  - `Home/Dining/` — dining hall listings, including `DiningDataSource/` (`BMDiningLocation`, `DiningItem`, `DiningRestriction`).
  - `Home/Guides/` — `GuidesViewModel` and related guide content.
  - `Home/Search/` — `SearchViewModel`, `RecentSearchManager`.
  - `Home/Home Drawer/` — `HomeDrawerPinViewModel` and pinned-item UI for the home bottom drawer.
  - `HomeViewModel.swift`, `HomeView.swift` — the `Home` tab's top-level view model and SwiftUI view.
- **`Events/`** — academic and campus-wide event calendars, including `EventDataSource/` (`EventsViewModel`, `EventsDataService`), `CalendarView.swift`, `CalendarSectionView.swift`.
- **`Safety/`** — `SafetyView.swift`, backed by `BMNetworkingManager.fetchSafetyLogs()`.
- **`Resources/`** — `ResourcesView.swift`, backed by `BMNetworkingManager.fetchResourcesCategories()`.
- **`Today/`** — `TodayView.swift` and `Today/Tiles/`, a tile-based summary screen.
- **`FeedbackForm/`** — `FeedbackFormPresenter`, `FeedbackFormView`, `FeedbackFormViewModel`, gating in-app feedback prompts.
- **`Drawer/`** — shared bottom-drawer infrastructure (`DrawerViewController`, `DrawerViewDelegate`, `SearchDrawerViewController`, `SearchDrawerViewDelegate`) reused across `Home/Map` and other drawer-presenting screens.
- **`Common/`** — cross-feature reusable UI:
  - `Common/DetailView/` — shared detail-card components (`OverviewCardView`, `LocationDetailView`, `DescriptionCardView`, `OpenTimesCardView`).
  - `Common/FilterView/` — shared filter UI (`FilterView`, `BMFilterButton`).
  - `Common/Images/` — `ImageLoader`, `BMCachedAsyncImageView`.
- **`Data/`** — cross-cutting data-layer infrastructure not specific to a single feature:
  - `DataManager.swift`, `DataSource.swift` — the shared fetch-coordination protocol and singleton described in `docs/tech.md`.
  - `BMNetworkingManager.swift` — the `async`/`await` Firestore access layer for Safety and Resources data.
  - `BMLocationManager.swift`, `BMConstants.swift`, `BMError.swift`, `BMEventManager.swift`, `SortingFunctions.swift`.
  - `ItemProtocols/` — shared model protocols (`HasName`, `HasLocation`, `HasImage`, `HasOpenTimes`, `HasWebsite`, `HasPhoneNumber`, `CanFavorite`, `SearchItem`, `BMCalendarEvent`) that feature-specific models (`BMGym`, `BMLibrary`, `BMDiningHall`) conform to.
  - `PropertyWrappers/` — `Display`, a `@propertyWrapper` that trims and sanitizes string values sourced from Firestore documents.
- **`Utils/`** — general-purpose extensions and helpers with no feature affinity: `Date+Extension.swift`, `String+Extension.swift`, `UIView+Extensions.swift`, `UIViewController+Extensions.swift`, `UserDefaults+Extension.swift`, `AtomicDictionary.swift`, `Logger+Ext.swift`, and others.
- **`Debug/`** — `DebugView.swift`, `DebugViewModel.swift`, referenced from `BerkeleyMobile+Injection.swift` inside a `#if DEBUG` conditional.
- **`Assets/`, `Assets.xcassets/`, `Base.lproj/`** — fonts, colors, images, and localized resources.
- **Root-level files in `berkeley-mobile/`**: `AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`, `TabBarController.swift`, `MainContainerViewController.swift`, `BerkeleyMobile+Injection.swift`, `Info.plist`.

## `BerkeleyMobileWidget/` Module Organization

A flat structure: `BerkeleyMobileWidgetBundle.swift` (entry point), `GymOccupancyWidget.swift` (the single declared widget), `Assets.xcassets/`, `Info.plist`.

## Architectural Boundaries

- The repository implements a **feature-folder** organization: each major tab/screen (`Home`, `Events`, `Safety`, `Resources`, `Today`, `FeedbackForm`) owns its view(s), view model(s), and — where applicable — its own `DataSource`/data-service type, colocated under that feature's directory (e.g. `Home/Map/MapDataSource/`, `Home/Fitness/GymDataSource/`, `Events/EventDataSource/`).
- Cross-feature concerns are centralized under `Data/`, `Common/`, and `Utils/`, rather than duplicated per feature.
- The `BerkeleyMobileWidgetExtension` target is a separate app extension boundary: it links only `Firebase/Firestore` (per `Podfile`) and re-invokes `FirebaseApp.configure()` independently in its own bundle entry point, since it runs as a distinct process from the main app.
- Dependency wiring between feature view models and their collaborators is centralized in a single file, `berkeley-mobile/BerkeleyMobile+Injection.swift`, which extends the `FactoryKit` `Container` type rather than distributing `Factory` declarations per feature folder.
