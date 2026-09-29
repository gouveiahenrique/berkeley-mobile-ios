# Technical Overview

## Repository Classification

- **Repository type:** Mobile application (iOS), with a companion iOS Home Screen Widget extension.
- **Primary language:** Swift (174 `.swift` files found under `berkeley-mobile/`; the `BerkeleyMobileWidget/` extension is also Swift).
- **UI frameworks:** The repository implements screens using both `UIKit` (e.g. `berkeley-mobile/TabBarController.swift`, `berkeley-mobile/Drawer/DrawerViewController.swift`) and `SwiftUI` (e.g. `berkeley-mobile/Today/TodayView.swift`, `berkeley-mobile/Safety/SafetyView.swift`), with `UIHostingController` used to embed SwiftUI views inside UIKit view controllers (`berkeley-mobile/TabBarController.swift:17-20`).
- **Backend:** The repository implements data fetching against Google Cloud Firestore via the Firebase iOS SDK (`berkeley-mobile/Data/BMNetworkingManager.swift`, `berkeley-mobile/Data/DataSource.swift` implementations). This is confirmed directly in `README.md`: "The application pulls data from Google Cloud Firestore."
- **Runtime architecture:** Single-target iOS application (`berkeley-mobile`) plus a `BerkeleyMobileWidgetExtension` target and `BerkeleyMobileWidget` WidgetKit extension for a Home Screen widget (`BerkeleyMobileWidget/GymOccupancyWidget.swift`, `BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift`).

## Repository Purpose

Per `README.md`: "Berkeley Mobile has accumulated over 20,000 downloads on iOS and Android... It has Bear Transit routes, library and gym information, dining hall menus, and campus resources, all in one place for the busy Berkeley student." The application is a product of the ASUC Office of the Chief Technology Officer (OCTO).

## Languages / Frameworks / Dependencies

Direct evidence from `Podfile` (CocoaPods) and `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved` (Swift Package Manager):

- **CocoaPods dependencies** (`Podfile`):
  - `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth` — target `berkeley-mobile`
  - `GoogleSignIn` — target `berkeley-mobile`
  - `Firebase/Firestore` — target `BerkeleyMobileWidgetExtension`
- **Swift Package Manager dependencies** (`Package.resolved`):
  - `factory` (`https://github.com/hmlongco/Factory.git`) — imported throughout as `FactoryKit` for dependency injection (e.g. `berkeley-mobile/BerkeleyMobile+Injection.swift`)
  - `glur` (`https://github.com/joogps/Glur.git`)

Framework/platform capability, not repository-specific: SwiftUI, UIKit, WidgetKit, `os.Logger`, `Observation` (`@Observable`, `@concurrent`) are Apple frameworks used by the code (e.g. `berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift` imports `Observation` and `os`).

## Build Configuration

Direct evidence from `berkeley-mobile.xcodeproj/project.pbxproj`:

- `IPHONEOS_DEPLOYMENT_TARGET` values found: `13.0`, `17.0`, `18.0` (varies by build configuration/target).
- `SWIFT_VERSION = 5.0` for at least two build configurations.
- Product name: `Berkeley` (`PRODUCT_NAME = Berkeley;`); the original/legacy product name recorded for the main target is `bm-persona` (`productName = "bm-persona";`), and the widget extension's product name is `BerkeleyMobileWidgetExtension`.
- Xcode workspace: `berkeley-mobile.xcworkspace`, scheme: `berkeley-mobile.xcscheme` (builds `Berkeley.app` from blueprint `berkeley-mobile`).

## Major Technical Components

Based on direct repository evidence (top-level folders under `berkeley-mobile/`):

- `AppDelegate.swift` / `AppDelegate+Migration.swift` / `SceneDelegate.swift` — application entry point. `AppDelegate` configures Firebase (`FirebaseApp.configure()`), triggers an initial `DataManager.shared.fetchAll()`, requests location via `BMLocationManager.shared.requestLocation()`, and registers for push notifications through `FirebaseMessaging`. `SceneDelegate` installs `TabBarController` as the root view controller.
- `TabBarController.swift` — root `UITabBarController` wiring four tabs: Home (`MainContainerViewController`), Today (`TodayView`, SwiftUI), Safety (`SafetyView`, SwiftUI), Resources (`ResourcesView`, SwiftUI). Also presents a `DebugView` on a shake gesture in `#if DEBUG` builds.
- `Data/` — data-layer components: `DataManager` (fetch orchestration/cache), `DataSource` protocol (per-domain fetchers), `BMNetworkingManager` (async/await Firestore queries for Safety Logs and Resource Categories), `BMLocationManager`, `BMConstants`, `BMEventManager`, `ItemProtocols/` (shared model capability protocols such as `HasLocation`, `HasImage`, `CanFavorite`, `HasOpenTimes`), `PropertyWrappers/Display.swift` (string-trimming property wrapper).
- `Home/` — Map, Libraries, Dining, Fitness (including a `GymOccupancy` sub-feature and `GymClassDataSource`), Guides, Search, and the "Home Drawer" UI, each generally organized as `<Feature>DataSource/`, `<Feature>ViewModel.swift`, and view files.
- `Events/` — campus events feature including `CalendarView.swift`/`CalendarViewModel`, `EventsView.swift`, `EventDataSource/` (`EventsViewModel`, `BMEventCalendarEntry`).
- `Safety/` — safety log feature (`SafetyViewModel`, `SafetyMapView`, `SafetyLogDetailView`) fetching from Firestore via `BMNetworkingManager.fetchSafetyLogs()`.
- `Resources/` — campus resources list (`ResourcesViewModel.fetchResourceCategories()`) fetching from Firestore via `BMNetworkingManager.fetchResourcesCategories()`.
- `Today/` — a tile-based dashboard (`TodayView`, `TodayTileLayout`, `TodayTileAttributes`) with `Tiles/Weather Tile` and `Tiles/News Tile` (`NewsDataViewModel` queries the Firestore collection `"Daily Cal News"`).
- `Drawer/` — a custom bottom-sheet/drawer UIKit component system (`DrawerViewController`, `DrawerViewDelegate`, `MainDrawerViewDelegate`, `SearchDrawerViewController`).
- `FeedbackForm/` — in-app feedback form presenter/view/view model (`FeedbackFormPresenter`, `FeedbackFormView`, `FeedbackFormViewModel`).
- `Debug/` — a debug-only screen (`DebugView`, `DebugViewModel`), reachable via device shake in `DEBUG` builds only (`TabBarController.swift:34-37`).
- `Assets/` — `Colors/Colors.swift` (`BMColor`, a namespaced set of static `UIColor`/dark-mode-aware colors) and `Fonts.swift`/`Fonts/`.
- `Common/` — shared, reusable UI components (`CardView`, `CollapsibleCardView`, `BMAlert`, `BMCachedAsyncImageView`, `FilterView/`, `DetailView/`, etc.) used across features.
- `Utils/` — extensions on Foundation/UIKit types (`Date+Extension.swift`, `String+Extension.swift`, `UIView+Extensions.swift`, etc.), `UserDefaults+Extension.swift` (typed `UserDefaultsKeys` enum), `Logger+Ext.swift` (per-view-model `os.Logger` instances), `AtomicDictionary.swift`.
- `BerkeleyMobile+Injection.swift` — `FactoryKit` `Container` extension registering app-wide view-model factories (e.g. `calendarViewModel`, `diningHallsViewModel`, `eventsViewModel`, `feedbackFormPresenter`, `guidesViewModel`, `gymOccupancyViewModel`, `homeDrawerPinViewModel`, `homeViewModel`), each with an explicit scope (`.shared` or `.singleton`).

## Widget Extension

`BerkeleyMobileWidget/` implements a WidgetKit Home Screen widget:
- `GymOccupancyWidget.swift` defines `GymOccupancyEntry: TimelineEntry`, `GymOccupancyProvider: TimelineProvider` (fetches occupancy via `GymOccupancyViewModel.fetchOccupancyPercentages()` and produces a `Timeline` that refreshes on an interval defined by `GymOccupancyViewModel.Constants.refreshIntervalSecs`), and `GymOccupancyWidgetRowView`.
- `BerkeleyMobileWidgetBundle.swift` is the widget's `@main` bundle entry point (file present; not read in full during this analysis — not found in inspected excerpt).

## Deployment / Runtime Model

Direct evidence: this is a native iOS application distributed via the App Store, per `README.md` ("You can download Berkeley Mobile on the Google Play Store or the App Store"). No CI/CD configuration files (e.g. `.github/workflows`, `Fastfile`, `Makefile`) were found in the inspected repository areas. Production Firebase configuration (`GoogleService-Info.plist`) is explicitly excluded from the repository per `README.md`.

## Testing Infrastructure

No test target was found: `grep -rl "import XCTest"` returned no matches, no directories matching `*Test*` were found (outside `Pods/`), and the shared Xcode scheme's `<TestAction><Testables>` block is empty (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme:30-31`). See `docs/testing-standards.md`.
