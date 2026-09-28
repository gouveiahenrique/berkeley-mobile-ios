# Technical Overview

## Repository Classification

- **Repository type:** Mobile application (iOS), with a companion WidgetKit extension.
- **Primary language:** Swift (`SWIFT_VERSION = 5.0` in `berkeley-mobile.xcodeproj/project.pbxproj`).
- **UI frameworks:** The repository implements screens in both `UIKit` (e.g. `berkeley-mobile/Drawer/DrawerViewController.swift`, `berkeley-mobile/Home/Map/MapViewController.swift`) and `SwiftUI` (e.g. `berkeley-mobile/Home/HomeView.swift`, `berkeley-mobile/Safety/SafetyView.swift`). 68 files import `SwiftUI` and 66 import `UIKit` (counted via `import` statements under `berkeley-mobile/` and `BerkeleyMobileWidget/`).
- **Runtime model:** Native iOS app, not a monorepo/multi-platform or backend/frontend split — single Xcode workspace (`berkeley-mobile.xcworkspace`) containing one app target (`berkeley-mobile`, product name `Berkeley.app`) and one widget extension target (`BerkeleyMobileWidgetExtension`).

## Repository Purpose

Per `README.md`: "Berkeley Mobile ... has Bear Transit routes, library and gym information, dining hall menus, and campus resources." The repository is maintained by ASUC OCTO (Associated Students of the University of California, Office of the Chief Technology Officer). This is a stated project description, not independently verified against runtime behavior beyond what the code below confirms.

## Application Entry Points

- The repository implements `AppDelegate` (`berkeley-mobile/AppDelegate.swift`), annotated `@UIApplicationMain`, which on launch:
  - Calls `FirebaseApp.configure()`.
  - Calls `DataManager.shared.fetchAll()` (see below).
  - Calls `BMLocationManager.shared.requestLocation()`.
  - Registers as `MessagingDelegate` and `UNUserNotificationCenterDelegate` for push notifications.
- The repository implements `SceneDelegate.swift` and `TabBarController.swift` (`berkeley-mobile/`) and `MainContainerViewController.swift` for scene/window and root view controller setup.
- The widget extension entry point is `BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift`.

## Major Technical Components

- **Data layer** (`berkeley-mobile/Data/`):
  - `DataManager.swift` — singleton (`DataManager.shared`) that fetches data from a fixed list of `DataSource` types (`kDataSources`: `MapDataSource`, `LibraryDataSource`, `GymDataSource`), caches per-source results in an `AtomicDictionary`, and exposes `fetchAll()`, `fetchIfNecessary()`, `fetch(source:)`.
  - `DataSource.swift` — protocol requiring `static func fetchItems(_:)` and a `static var fetchDispatch: DispatchGroup`.
  - `BMNetworkingManager.swift` — singleton (`BMNetworkingManager.shared`) wrapping `Firestore.firestore()` calls; implements `fetchSafetyLogs()` and `fetchResourcesCategories()` as `async throws` methods reading from Firestore collections named in `BMConstants` (`safetyLogsCollectionName`, `resourceCategoriesCollectionName`).
  - `BMEventManager.swift` — wraps `EKEventStore` (EventKit) for adding/deleting/querying calendar events, throwing `BMError` cases on failure.
  - `BMLocationManager.swift` — location fetching, posts `Notification.Name.locationUpdated`.
  - `BMError.swift` — an `Error`-conforming enum (`eventAlreadyAddedInCalendar`, `insufficientAccessToCalendar`, `mayExistedInCalendarAlready`, `unableToFindEventInCalendar`) with `LocalizedError` descriptions.
  - `ItemProtocols/` — shared protocols for domain model capabilities: `HasImage`, `HasLocation`, `HasName`, `HasOpenClosedStatus`, `HasOpenTimes`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `SearchItem`, `BMCalendarEvent`.
  - `PropertyWrappers/Display.swift` — `@propertyWrapper struct Display<T>` that trims whitespace/invalid characters from `String`/`String?` fields.

- **Dependency injection** (`berkeley-mobile/BerkeleyMobile+Injection.swift`): the repository uses the third-party `FactoryKit` package (Swift Package `https://github.com/hmlongco/Factory.git`) to register view models on `Container` (e.g. `homeViewModel`, `safetyViewModel`, `eventsViewModel`, `resourcesViewModel`, `diningHallsViewModel`, `guidesViewModel`, `gymOccupancyViewModel`, `feedbackFormViewModel`/`feedbackFormPresenter`, `mapMarkersDropdownViewModel`, `mapUserLocationButtonViewModel`, `menuItemIconCacheManager`, `newsDataViewModel`, `weatherDataViewModel`, `calendarViewModel`, `homeDrawerPinViewModel`, `searchViewModel`, and `debugViewModel` under `#if DEBUG`). Lifetimes used: `.shared` and `.singleton` (plain, non-scoped factories are also present, e.g. `feedbackFormPresenter`, `feedbackFormViewModel`, `debugViewModel`).

- **Feature modules** under `berkeley-mobile/`: `Home/` (with `Dining/`, `Fitness/`, `Guides/`, `Home Drawer/`, `Libraries/`, `Map/`, `Search/` subfolders), `Today/` (with `Tiles/`), `Events/` (with `EventDataSource/`), `Safety/`, `FeedbackForm/`, `Debug/`, `Drawer/`, `Common/` (with `DetailView/`, `FilterView/`, `Images/`), `Assets/` (`Colors/`), `Utils/`, `Resources/`.

- **Widget extension** (`BerkeleyMobileWidget/`): implements `GymOccupancyWidget.swift` using `WidgetKit`'s `TimelineProvider`/`TimelineEntry` (`GymOccupancyProvider`, `GymOccupancyEntry`) to render gym occupancy on the Home Screen; uses `GymOccupancyViewModel.fetchOccupancyPercentages()`.

## External Services and Dependencies

Declared in `Podfile` (CocoaPods) for the `berkeley-mobile` target: `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, `GoogleSignIn`. For the `BerkeleyMobileWidgetExtension` target: `Firebase/Firestore`.

Declared as Swift Package Manager remote packages in `berkeley-mobile.xcodeproj/project.pbxproj`:
- `Factory` (`https://github.com/hmlongco/Factory.git`), product `FactoryKit`.
- `Glur` (`https://github.com/joogps/Glur.git`), product `Glur`.

Other frameworks imported in source (counted from `import` statements): `MapKit` (24 files), `os` (9, structured logging via `Logger`), `Observation` (4), `FirebaseCore` (4), `FirebaseAnalytics` (4), `WidgetKit` (3), `CoreLocation` (3), `FirebaseFirestore` (2), and single-file imports of `WeatherKit`, `UserNotifications`, `StoreKit`, `SafariServices`, `GoogleSignIn`, `EventKit`.

Per `README.md`, the application pulls data from Google Cloud Firestore, and the production `GoogleService-Info.plist` / backend API key are not included in the repository (not found in the inspected working tree).

## Deployment / Runtime Configuration

From `berkeley-mobile.xcodeproj/project.pbxproj` build settings:
- App target (`berkeley-mobile`): `PRODUCT_BUNDLE_IDENTIFIER = org.asuc.ASUC`, `IPHONEOS_DEPLOYMENT_TARGET` values of `18.0` appear in its Debug/Release configurations (an older `13.0` value also appears elsewhere in the file, in a differently-scoped configuration block).
- Widget extension target (`BerkeleyMobileWidgetExtension`): `PRODUCT_BUNDLE_IDENTIFIER = org.asuc.ASUC.BerkeleyMobileWidget`, `IPHONEOS_DEPLOYMENT_TARGET = 17.0`.
- `berkeley-mobile/berkeley-mobile.entitlements` declares `aps-environment = development` (push notifications, development APNs environment) and `com.apple.developer.weatherkit = true`.
- No CI/CD pipeline configuration (e.g. `.github/workflows`, `Fastfile`) was found in the inspected repository areas.
- No automated test target is configured: the shared scheme `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` has an empty `<Testables>` list under `TestAction`, and no `*Tests`/`*UITests` directories or targets were found in the repository or in `project.pbxproj`.

## Build Tooling

- Dependency management: CocoaPods (`Podfile`, `Podfile.lock`) plus Swift Package Manager (`berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`).
- No linter/formatter configuration (e.g. `.swiftlint.yml`, `.swiftformat`) was found in the inspected repository areas.
</content>
