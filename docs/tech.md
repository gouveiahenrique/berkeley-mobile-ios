# Technical Overview

## Repository Purpose

The repository (`berkeley-mobile-ios`, Xcode project `berkeley-mobile.xcodeproj` / workspace `berkeley-mobile.xcworkspace`) implements the Berkeley Mobile iOS application. `README.md` states the app provides Bear Transit routes, library and gym information, dining hall menus, and campus resources for UC Berkeley students, and is a product of the ASUC Office of the Chief Technology Officer (OCTO).

## Repository Classification

- **Repository type:** Mobile application (native iOS).
- **Primary language:** Swift (all application source files under `berkeley-mobile/` and `BerkeleyMobileWidget/` use the `.swift` extension).
- **UI frameworks:** The code defines UIKit view controllers (e.g. `berkeley-mobile/Home/Map/MapViewController.swift`, `berkeley-mobile/Drawer/DrawerViewController.swift`, `berkeley-mobile/TabBarController.swift`) and SwiftUI views (e.g. `berkeley-mobile/Safety/SafetyView.swift`, `berkeley-mobile/Common/DetailView/OpenTimesCardSwiftUIView.swift`, `berkeley-mobile/Today/TodayView.swift`), so both UIKit and SwiftUI are used together in the same target.
- **Runtime model:** UIKit application lifecycle (`berkeley-mobile/AppDelegate.swift` marked `@UIApplicationMain`) combined with the Scene lifecycle (`berkeley-mobile/SceneDelegate.swift`, `UIWindowSceneDelegate`).
- **Additional target:** `BerkeleyMobileWidget/` implements a WidgetKit extension (`BerkeleyMobileWidgetBundle.swift`, `GymOccupancyWidget.swift`, conforming to `TimelineProvider`) for a home-screen gym-occupancy widget. The `Podfile` defines this as target `BerkeleyMobileWidgetExtension`.
- **Deployment model:** Not found in codebase — no CI/CD configuration (`.github/`, Fastlane `Fastfile`/`Appfile`) is present in the repository.

## Languages and Frameworks

- **Swift** — sole application language observed (`berkeley-mobile/`, `BerkeleyMobileWidget/`).
- **UIKit** — imported throughout (e.g. `berkeley-mobile/AppDelegate.swift:13`, `berkeley-mobile/Utils/UIView+Extensions.swift:10`).
- **SwiftUI** — imported in files such as `berkeley-mobile/Safety/SafetyViewModel.swift:10`, `berkeley-mobile/Today/TodayView.swift`.
- **WidgetKit** — used by `BerkeleyMobileWidget/GymOccupancyWidget.swift` (`TimelineProvider`, `TimelineEntry`, `Timeline`).
- **MapKit** — imported in `berkeley-mobile/Data/BMConstants.swift:10` and `berkeley-mobile/Safety/SafetyViewModel.swift:9` for map regions/coordinates.
- **Dependency management:** CocoaPods, via `Podfile` at the repository root, and Swift Package Manager, evidenced by `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`.

### Third-party dependencies (from `Podfile`)

For target `berkeley-mobile`:
- `Firebase/Analytics`
- `Firebase`
- `FirebaseMessaging`
- `Firebase/Firestore`
- `Firebase/Auth`
- `GoogleSignIn`

For target `BerkeleyMobileWidgetExtension`:
- `Firebase/Firestore`

## Runtime Architecture

- **App entry / bootstrap:** `berkeley-mobile/AppDelegate.swift` — `application(_:didFinishLaunchingWithOptions:)` calls `FirebaseApp.configure()`, increments an app-launch counter via `UserDefaults.standard.increment(forKey:)`, calls `self.checkForUpdate()` (defined in `berkeley-mobile/AppDelegate+Migration.swift`), triggers `DataManager.shared.fetchAll()`, and calls `BMLocationManager.shared.requestLocation()`. It also configures `Messaging.messaging().delegate` and `UNUserNotificationCenter` for push notifications, and registers for remote notifications.
- **Scene bootstrap:** `berkeley-mobile/SceneDelegate.swift` creates the root `UIWindow`, instantiates `TabBarController` as `rootViewController`.
- **Root navigation:** `berkeley-mobile/TabBarController.swift` and `berkeley-mobile/MainContainerViewController.swift` manage the top-level tab/container navigation.
- **Data layer:** `berkeley-mobile/Data/DataManager.swift` is a singleton (`DataManager.shared`) that fetches from a fixed list of `DataSource`-conforming types (`kDataSources = [MapDataSource.self, LibraryDataSource.self, GymDataSource.self]`, `berkeley-mobile/Data/DataManager.swift:12-16`), caching results in an `AtomicDictionary<String, [Any]>` and using `DispatchGroup` to ensure each source is fetched from Firebase only once (`berkeley-mobile/Data/DataManager.swift:65-87`).
- **Networking to backend:** `berkeley-mobile/Data/BMNetworkingManager.swift` is a singleton (`BMNetworkingManager.shared`) wrapping `Firestore.firestore()` with `async throws` methods `fetchSafetyLogs()` and `fetchResourcesCategories()`, decoding Firestore documents into `BMSafetyLog` / `BMResourceCategory` via `data(as:)`.
- **Location services:** `berkeley-mobile/Data/BMLocationManager.swift` (`BMLocationManager.shared`, `requestLocation()`).
- **Push notifications:** `AppDelegate` conforms to `UNUserNotificationCenterDelegate` and `MessagingDelegate` (Firebase Cloud Messaging); on notification tap it sets `tabBarController?.selectedIndex = 2` (`berkeley-mobile/AppDelegate.swift:64-69`).
- **Widget:** `BerkeleyMobileWidget/GymOccupancyWidget.swift` defines `GymOccupancyProvider: TimelineProvider`, which uses `GymOccupancyViewModel` to fetch RSF/Stadium occupancy percentages and produce a `Timeline<GymOccupancyEntry>` refreshed via `GymOccupancyViewModel.Constants.refreshIntervalSecs`.

## Major Technical Components (by top-level folder under `berkeley-mobile/`)

- `Data/` — data-fetch orchestration (`DataManager`, `DataSource` protocol), Firestore networking (`BMNetworkingManager`), constants (`BMConstants`), error types (`BMError`), location (`BMLocationManager`), event/calendar management (`BMEventManager`), item protocols (`Data/ItemProtocols/`), and property wrappers (`Data/PropertyWrappers/Display.swift`).
- `Home/` — main tab content, with subfolders `Map/`, `Dining/`, `Libraries/`, `Fitness/`, `Guides/`, `Search/`, and `Home Drawer/`; each of `Map`, `Dining`, `Libraries`, `Fitness` has a nested `*DataSource` subfolder (`MapDataSource/`, `DiningDataSource/`, `LibraryDataSource/`, `GymDataSource/`, `GymClassDataSource/`, `GymOccupancy/`).
- `Events/` — calendar/event display, including `EventDataSource/` (e.g. `BMEventCalendarEntry`, `EventsViewModel`).
- `Safety/` — safety-log map feature (`SafetyViewModel`, `SafetyMapView`, `SafetyView`).
- `Resources/` — resource-category listing (`ResourcesViewModel`, `ResourcesView`, `SafariWebView`).
- `Today/` — a tile-based "Today" screen (`TodayView`, `TodayTileView`, `TodayTileAttributes`, `Tiles/`).
- `Drawer/` — a custom bottom-sheet/drawer UI system (`DrawerViewController`, `DrawerViewDelegate`, `MainDrawerViewDelegate`, `SearchDrawerViewController`).
- `Common/` — shared UI components (`CardView`, `BMAlert`, `BMDrawerView`, `DetailView/`, `FilterView/`, etc.).
- `FeedbackForm/` — in-app feedback submission (`FeedbackFormPresenter`, `FeedbackFormView`, `FeedbackFormViewModel`).
- `Debug/` — an in-app debug screen (`DebugView`, `DebugViewModel`).
- `Assets/` — colors (`Assets/Colors/Colors.swift`) and fonts (`Assets/Fonts.swift`).
- `Utils/` — extensions and small utility types (`Date+Extension`, `String+Extension`, `AtomicDictionary`, `WeeklyHours`, `Logger+Ext`, etc.).

## Deployment/Runtime Model

- Not found in codebase: no CI/CD pipeline configuration, no Fastlane configuration, and the checked-in `berkeley-mobile.xcscheme` has an empty `<TestAction><Testables>` block (no test targets configured).
- `README.md` states the app pulls data from Google Cloud Firestore and that the production `GoogleService-Info.plist` and API key are intentionally excluded from the repository.
- `berkeley-mobile/berkeley-mobile.entitlements` declares `aps-environment: development` (push notification entitlement) and `com.apple.developer.weatherkit: true`.
