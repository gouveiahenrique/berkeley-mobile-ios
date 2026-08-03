# Repository Structure

## Top-Level Organization

Evidence: directory listing of the repository root (excluding `Pods/`, `.git/`, `.codegraph/`).

| Path | Contents |
|---|---|
| `berkeley-mobile/` | Main application target source code |
| `berkeley-mobile.xcodeproj/` | Xcode project file (`project.pbxproj`) |
| `berkeley-mobile.xcworkspace/` | Xcode workspace (aggregates the project and CocoaPods), includes `swiftpm/Package.resolved` for Swift Package Manager dependencies |
| `BerkeleyMobileWidget/` | WidgetKit extension target source code |
| `Pods/` | CocoaPods-managed third-party dependencies (Firebase, GoogleSignIn, etc.) |
| `Podfile`, `Podfile.lock` | CocoaPods dependency manifest and lockfile |
| `app_preview_images/` | Static preview screenshots referenced in `README.md` |
| `README.md`, `CONTRIBUTING.md`, `LICENSE.md` | Project documentation |

There is a single Xcode project containing two native targets, per `berkeley-mobile.xcodeproj/project.pbxproj`:
- `com.apple.product-type.application` — product `Berkeley.app` (the main app, module `berkeley-mobile`)
- `com.apple.product-type.app-extension` — product `BerkeleyMobileWidgetExtension.appex` (module `BerkeleyMobileWidget`)

Not found in codebase: a unit or UI test target in the Xcode project.

## `berkeley-mobile/` Module Breakdown

Evidence: directory listing under `berkeley-mobile/` and `.swift` file counts per subdirectory.

| Directory | Swift files | Responsibility (from contained code) |
|---|---|---|
| `Home/` | 51 | Largest feature module. Home tab: map, dining, fitness/gyms, libraries, guides, search. Contains its own subfolders per feature (see below). |
| `Common/` | 26 | Shared UI components used across features: `DetailView/`, `FilterView/`, `Images/`, plus shared views (`CardView`, `TagView`, `BMAlert`, `BMActionButton`, `BMDrawerView`, etc.) |
| `Data/` | 19 | Data-fetching layer: `DataManager`, `DataSource` protocol, `BMNetworkingManager`, `BMConstants`, `BMError`, `BMLocationManager`, `BMEventManager`, plus `ItemProtocols/` and `PropertyWrappers/` subfolders |
| `Utils/` | 19 | Foundation/UIKit type extensions (e.g. `Date+Extension.swift`, `UIView+Extensions.swift`, `UserDefaults+Extension.swift`), plus small standalone utility types (`AtomicDictionary`, `WeeklyHours`, `DayOfWeek`) |
| `Events/` | 10 | Calendar/events feature: `EventsView`, `CalendarView`, `EventRowView`, `EventDetailView`, and `EventDataSource/` subfolder |
| `Today/` | 9 | "Today" tab: `TodayView`, `TodayTileAttributes`, `TodayTileLayout`, and per-tile subfolders `Tiles/News Tile/`, `Tiles/Weather Tile/` |
| `Assets/` | 12 | Non-catalog asset code: `Colors/` (many `Colors+*.swift` extensions on `BMColor`) and `Fonts.swift` |
| `Safety/` | 7 | Safety tab: `SafetyView`, `SafetyViewModel`, `SafetyMapView`, `SafetyMapMarker`, filter UI |
| `Drawer/` | 6 | Custom draggable bottom-sheet/drawer framework: `DrawerViewDelegate`, `MainDrawerViewDelegate`, `DrawerViewController`, `SearchDrawerViewDelegate`, `SearchDrawerViewController`, `BarView` |
| `Resources/` | 4 | Resources tab: `ResourcesView`, `ResourcesViewModel`, `ResourcesSectionDropdown`, `SafariWebView` |
| `FeedbackForm/` | 3 | In-app feedback form: `FeedbackFormPresenter`, `FeedbackFormView`, `FeedbackFormViewModel` |
| `Debug/` | 2 | Debug-only UI (`DebugView`, `DebugViewModel`), gated with `#if DEBUG` at the call site (`berkeley-mobile/TabBarController.swift:34-37`) |
| `Assets.xcassets/` | — | Image/color asset catalog (icons, map icons, theme illustrations, food restriction icons) |
| `Base.lproj/` | — | Localization base (e.g. launch screen storyboard) |

Root-level files directly under `berkeley-mobile/`: `AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`, `TabBarController.swift`, `MainContainerViewController.swift`, `BerkeleyMobile+Injection.swift`, `Info.plist`, `berkeley-mobile.entitlements`.

### `Home/` Subdirectories

- `Home/Map/` (+ `Home/Map/MapDataSource/`) — map view, markers, placemarks
- `Home/Dining/` (+ `Home/Dining/DiningDataSource/`) — dining halls, menu items
- `Home/Fitness/` (+ `Home/Fitness/GymDataSource/`, `Home/Fitness/GymClassDataSource/`, `Home/Fitness/GymOccupancy/`) — gyms, gym classes, gym occupancy
- `Home/Guides/` — campus guides
- `Home/Home Drawer/` — the drawer content list shown on the Home tab
- `Home/Libraries/` (+ `Home/Libraries/LibraryDataSource/`) — library info
- `Home/Search/` — search bar, search results, recent search tracking

### `Data/` Subdirectories

- `Data/ItemProtocols/` — shared protocols implemented by domain models: `SearchItem`, `HasName`, `HasLocation`, `HasImage`, `HasOpenTimes`, `HasOpenClosedStatus`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `BMCalendarEvent`
- `Data/PropertyWrappers/` — `Display.swift` (whitespace/invalid-character-trimming property wrapper for display strings)

## `BerkeleyMobileWidget/` Structure

| File | Purpose |
|---|---|
| `BerkeleyMobileWidgetBundle.swift` | `@main` `WidgetBundle` entry point; configures Firebase independently if not already configured (`configureFirebaseIfNeeded()`) |
| `GymOccupancyWidget.swift` | The widget's timeline provider/view implementation |
| `Assets.xcassets/` | Widget-specific asset catalog (`AccentColor`, `AppIcon`, `WidgetBackground`) |
| `Info.plist` | Widget extension's Info.plist |

## Architectural Boundaries

- The widget extension (`BerkeleyMobileWidget`) is a separate build target from the main app and configures Firebase independently (`BerkeleyMobileWidgetBundle.swift:23-28`), rather than depending on `AppDelegate`'s configuration.
- The main app's data layer (`Data/`) is the sole integration point with Firebase/Firestore for the main app; feature modules (`Home/*`, `Safety/`, `Resources/`) call into `DataManager` or `BMNetworkingManager` rather than invoking Firestore directly (with the exception of the `*DataSource` types themselves, which live under `Data/`-adjacent feature folders — e.g. `Home/Fitness/GymDataSource/GymDataSource.swift`, `Home/Map/MapDataSource/MapDataSource.swift`, `Home/Libraries/LibraryDataSource/LibraryDataSource.swift` — and call `Firestore.firestore()` directly).
- Dependency injection registrations for view models are centralized in a single file, `berkeley-mobile/BerkeleyMobile+Injection.swift`, rather than being distributed per-feature.
- Not found in codebase: a dedicated networking/API-client abstraction layer separate from direct Firestore SDK calls (beyond `BMNetworkingManager`, which itself wraps `Firestore.firestore()` calls for two features — Safety and Resources).
