# Technical Overview

## Repository Classification

- **Repository category:** Mobile application (native iOS).
- **Primary language:** Swift. The repository implements 176 `.swift` source files under `berkeley-mobile/` and `BerkeleyMobileWidget/` (excluding the `Pods/` dependency directory).
- **Primary UI frameworks:** The repository implements screens using both UIKit (`UIViewController` subclasses, e.g. `berkeley-mobile/Home/Map/MapViewController.swift`, `berkeley-mobile/TabBarController.swift`, `berkeley-mobile/MainContainerViewController.swift`) and SwiftUI (`View`-conforming structs, e.g. `berkeley-mobile/Home/Dining/DiningHallsView.swift`, `berkeley-mobile/Events/EventsView.swift`, `berkeley-mobile/Today/TodayView.swift`).
- **Build system:** Xcode project (`berkeley-mobile.xcodeproj`) opened via an Xcode workspace (`berkeley-mobile.xcworkspace`) that combines CocoaPods and Swift Package Manager dependencies.

## Repository Purpose

Per `README.md`, the repository implements "Berkeley Mobile," an iOS application distributed on the App Store that provides Bear Transit routes, library and gym information, dining hall menus, and campus resources. The application is developed by the Associated Students of the University of California (ASUC) Office of the Chief Technology Officer (OCTO), as stated in `README.md`.

## Languages and Frameworks

### Repository-implemented (Level 1)
- **Swift 5.0** — the code defines `SWIFT_VERSION = 5.0` in `berkeley-mobile.xcodeproj/project.pbxproj`.
- **UIKit** — imported and used directly in files such as `berkeley-mobile/AppDelegate.swift`, `berkeley-mobile/TabBarController.swift`, `berkeley-mobile/Home/Map/MapViewController.swift`.
- **SwiftUI** — imported and used in files such as `berkeley-mobile/Home/Dining/DiningHallsView.swift`, `berkeley-mobile/Common/DetailView/OpenTimesCardSwiftUIView.swift`, `berkeley-mobile/Today/TodayTileAttributes.swift`.
- **Combine/Observation** — the code uses both the `ObservableObject`/`@Published` pattern (e.g. `berkeley-mobile/Resources/ResourcesViewModel.swift`, `berkeley-mobile/Safety/SafetyViewModel.swift`) and the newer `@Observable` macro from the `Observation` framework (e.g. `berkeley-mobile/Home/Dining/DiningDataSource/DiningHallsViewModel.swift`, `berkeley-mobile/FeedbackForm/FeedbackFormViewModel.swift`).
- **Firebase** (via CocoaPods) — `Podfile` declares `Firebase`, `Firebase/Analytics`, `Firebase/Firestore`, `Firebase/Auth`, `FirebaseMessaging`. The code uses `Firestore.firestore()` directly in `berkeley-mobile/Data/BMNetworkingManager.swift`, `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift`, `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift`, `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift`, `berkeley-mobile/Home/Guides/GuidesViewModel.swift`, `berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift`, and `berkeley-mobile/FeedbackForm/FeedbackFormViewModel.swift`. `Firebase.Analytics.logEvent` is called in `berkeley-mobile/Home/Dining/DiningDataSource/DiningHallsViewModel.swift:94`.
- **FirebaseMessaging** — `berkeley-mobile/AppDelegate.swift` conforms to `MessagingDelegate` and calls `Messaging.messaging().subscribe(toTopic:)`.
- **GoogleSignIn** (via CocoaPods, `Podfile`) — imported in `berkeley-mobile/AppDelegate.swift`; no other repository usage of the `GIDSignIn` API was found in inspected areas.
- **WeatherKit** — imported and used in `berkeley-mobile/Today/Tiles/Weather Tile/WeatherDataViewModel.swift` via `WeatherService.shared`. The corresponding entitlement `com.apple.developer.weatherkit` is declared in `berkeley-mobile/berkeley-mobile.entitlements`.
- **EventKit** — used in `berkeley-mobile/Data/BMEventManager.swift` for calendar integration (`NSCalendarsUsageDescription`/`NSCalendarsFullAccessUsageDescription` are declared in `berkeley-mobile/Info.plist`).
- **MapKit / CoreLocation** — used in `berkeley-mobile/Data/BMConstants.swift`, `berkeley-mobile/Data/BMLocationManager.swift`, and `berkeley-mobile/Home/Map/MapViewController.swift`.
- **Factory / FactoryKit** (Swift Package, resolved via `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`, `hmlongco/Factory` v2.5.3) — used for dependency injection in `berkeley-mobile/BerkeleyMobile+Injection.swift` (`Factory<T>`, `@InjectedObservable`).
- **Glur** (Swift Package, `joogps/Glur` v1.1.0) — resolved in `Package.resolved`; specific repository call sites were not inspected in this pass.
- **WidgetKit** — `BerkeleyMobileWidget/GymOccupancyWidget.swift` implements a `TimelineProvider` and `TimelineEntry` for a home-screen widget extension.

### Framework/platform capability (Level 2)
- SwiftUI and UIKit can be freely interoperated via `UIHostingController`/`UIViewRepresentable`; whether the repository does so beyond the files listed above was not exhaustively verified.
- Firebase Auth is declared as a CocoaPods dependency (`Firebase/Auth`, `Podfile`), but no repository call site using the `FirebaseAuth` `Auth.auth()` API was found in inspected areas.

## Runtime Architecture

- **App entry point:** `berkeley-mobile/AppDelegate.swift`, annotated `@UIApplicationMain`, configures Firebase (`FirebaseApp.configure()`), requests notification/location permissions, and triggers `DataManager.shared.fetchAll()` on launch.
- **Scene lifecycle:** `berkeley-mobile/SceneDelegate.swift` manages the `UIWindowScene` and root view controller (referenced from `AppDelegate` via `UIApplication.shared.connectedScenes`).
- **Root navigation:** `berkeley-mobile/TabBarController.swift` (a `UITabBarController` subclass) is the root view controller; `berkeley-mobile/MainContainerViewController.swift` is used within tabs and is referenced by `SearchDrawerViewDelegate` and `MapViewController`.
- **App extension:** `BerkeleyMobileWidget/` is a separate target (`BerkeleyMobileWidgetExtension`, product type `com.apple.product-type.app-extension` per `berkeley-mobile.xcodeproj/project.pbxproj`) implementing a WidgetKit gym-occupancy widget with its own `Podfile` target requiring `Firebase/Firestore`.
- **Data fetching orchestration:** `berkeley-mobile/Data/DataManager.swift` defines a singleton (`DataManager.shared`) that fetches from a fixed list of `DataSource`-conforming types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) and caches results in an `AtomicDictionary`.
- **Dependency injection:** `berkeley-mobile/BerkeleyMobile+Injection.swift` extends `Factory`'s `Container` to register view-model factories (`.shared`, `.singleton`, and default scopes) consumed via `@InjectedObservable` property wrappers in SwiftUI views.

## Major Technical Components

| Component | Repository Evidence |
|---|---|
| Firestore-backed data sources | `berkeley-mobile/Data/BMNetworkingManager.swift`, `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift`, `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift`, `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift`, `berkeley-mobile/Home/Guides/GuidesViewModel.swift`, `berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift` |
| Drawer-based UI presentation system | `berkeley-mobile/Drawer/` (`DrawerViewController.swift`, `DrawerViewDelegate.swift`, `MainDrawerViewDelegate.swift`, `SearchDrawerViewController.swift`, `SearchDrawerViewDelegate.swift`) |
| Map feature | `berkeley-mobile/Home/Map/` (`MapViewController.swift`, `MapDataSource/`, `MapMarkerDetailView.swift`) |
| Dining feature | `berkeley-mobile/Home/Dining/` |
| Fitness/gym feature, incl. gym occupancy | `berkeley-mobile/Home/Fitness/` and `BerkeleyMobileWidget/GymOccupancyWidget.swift` |
| Events/calendar integration | `berkeley-mobile/Events/`, `berkeley-mobile/Data/BMEventManager.swift`, `berkeley-mobile/Data/BMError.swift` |
| Safety log map/filter feature | `berkeley-mobile/Safety/SafetyViewModel.swift` |
| Feedback form | `berkeley-mobile/FeedbackForm/` |
| "Today" tile dashboard (weather, news) | `berkeley-mobile/Today/` |
| Debug tooling (Debug builds only) | `berkeley-mobile/Debug/DebugView.swift`, `berkeley-mobile/Debug/DebugViewModel.swift`, gated by `#if DEBUG` in `berkeley-mobile/BerkeleyMobile+Injection.swift` |

## Deployment / Runtime Model

- **Platform:** iOS application. `berkeley-mobile.xcodeproj/project.pbxproj` declares `IPHONEOS_DEPLOYMENT_TARGET` values of `13.0` and `18.0` across different build configuration entries; the exact per-target/per-configuration deployment target was not fully disambiguated in this pass.
- **Bundle identifiers:** `org.asuc.ASUC` (main app) and `org.asuc.ASUC.BerkeleyMobileWidget` (widget extension), per `berkeley-mobile.xcodeproj/project.pbxproj`.
- **Backend:** The application uses Google Cloud Firestore as its backend data store, per `README.md` ("The application pulls data from Google Cloud Firestore") and confirmed by direct `Firestore.firestore()` usage throughout the codebase. `README.md` states the production `GoogleService-Info.plist` is not included in the repository; no such file was found in the inspected repository tree.
- **Push notifications:** Configured via Firebase Cloud Messaging (`FirebaseMessaging`) and `UNUserNotificationCenter` in `berkeley-mobile/AppDelegate.swift`. The `aps-environment` entitlement is set to `development` in `berkeley-mobile/berkeley-mobile.entitlements`.
- **Dependency management:** CocoaPods (`Podfile`, `Podfile.lock`) for Firebase/GoogleSignIn, and Swift Package Manager (`berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`) for Factory and Glur.
- **CI/CD:** Not found in codebase. No `.github/workflows`, `Fastfile`, `bitrise.yml`, `.travis.yml`, or `.circleci` directory was found in the inspected repository areas.
