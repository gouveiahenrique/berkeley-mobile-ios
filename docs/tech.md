# Technical Overview

## Repository Classification

- **Repository type:** Mobile application (iOS).
- **Primary language:** Swift (`SWIFT_VERSION = 5.0`, set in `berkeley-mobile.xcodeproj/project.pbxproj`).
- **UI frameworks:** The repository implements views using both UIKit (`UIViewController`, `UITabBarController` subclasses such as `berkeley-mobile/TabBarController.swift`) and SwiftUI (`View` structs such as `berkeley-mobile/Home/HomeView.swift`, `berkeley-mobile/Safety/SafetyView.swift`). UIKit view controllers embed SwiftUI views via `UIHostingController` (e.g. `berkeley-mobile/TabBarController.swift:17-20`).
- **Runtime model:** Native iOS application with two build targets:
  - `berkeley-mobile` (application target, product `Berkeley.app`, `berkeley-mobile.xcodeproj/project.pbxproj:1011-1012`)
  - `BerkeleyMobileWidgetExtension` (WidgetKit extension target, `berkeley-mobile.xcodeproj/project.pbxproj:1036-1037`, source at `BerkeleyMobileWidget/`)
- **Deployment targets:** `IPHONEOS_DEPLOYMENT_TARGET = 18.0` for the app target and `17.0` for the widget extension target (`berkeley-mobile.xcodeproj/project.pbxproj:1519,1544,1576,1613`). One configuration block also lists `13.0` (`project.pbxproj:1445,1499`) — both values are directly present in the project file; which applies to which exact build configuration was not further disambiguated.
- **App version:** `MARKETING_VERSION = 11.14.1` for the app target, `MARKETING_VERSION = 1.0` for the widget extension (`project.pbxproj:1524,1549,1583,1620`).
- **Bundle identifiers:** `org.asuc.ASUC` (app target) and `org.asuc.ASUC.BerkeleyMobileWidget` (widget extension), per `project.pbxproj:1525,1550,1584,1621`.

## Repository Purpose

Per `README.md`, this is the official repository for the Berkeley Mobile iOS application, described there as providing Bear Transit routes, library and gym information, dining hall menus, and campus resources. This is documentation-of-record from the repository's own README, not independently verified against runtime behavior beyond what is described below.

## Package Management

- **CocoaPods** — `Podfile` defines two targets:
  - `berkeley-mobile`: `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, `GoogleSignIn`.
  - `BerkeleyMobileWidgetExtension`: `Firebase/Firestore`.
  - Resolved versions are locked in `Podfile.lock`; vendored pod sources are present under `Pods/` (e.g. `Pods/Firebase`, `Pods/FirebaseFirestore`, `Pods/FirebaseAuth`, `Pods/GoogleSignIn`, `Pods/FirebaseMessaging`, `Pods/FirebaseAnalytics`).
- **Swift Package Manager** — `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved` and `project.pbxproj:1662-1690` record two remote Swift packages:
  - `Factory` (`https://github.com/hmlongco/Factory.git`, resolved version `2.5.3`) — used in the repository for dependency injection (see below).
  - `Glur` (`https://github.com/joogps/Glur.git`, resolved version `1.1.0`).

## Backend / Data Platform

- **Google Cloud Firestore** is the application's data backend. `berkeley-mobile/Data/BMNetworkingManager.swift` instantiates `Firestore.firestore()` and defines `fetchSafetyLogs()` and `fetchResourcesCategories()`, querying named collections (`BMConstants.safetyLogsCollectionName = "Safety Logs"`, `BMConstants.resourceCategoriesCollectionName = "Resource Categories"`, `berkeley-mobile/Data/BMConstants.swift`).
- Other data types are fetched directly from Firestore inside individual `DataSource`-conforming classes rather than through `BMNetworkingManager`: `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift`, `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift`, `berkeley-mobile/Home/Fitness/GymClassDataSource/GymClassDataSource.swift`, and `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift` each call `Firestore.firestore()` and query a named collection (`"Map Marker"`, `"Gyms"`, `"Gym Classes"`, `"Libraries"` respectively).
- `README.md` states that the production Firebase API key and `GoogleService-Info.plist` are not included in this repository; `find` over the repository confirms no `GoogleService-Info.plist` file is present outside `Pods/`.
- **Firebase Authentication** and **Google Sign-In**: the `Podfile` includes `Firebase/Auth` and `GoogleSignIn`, and `berkeley-mobile/AppDelegate.swift` imports `GoogleSignIn`. No repository source file was found that calls a Firebase Auth or Google Sign-In sign-in API directly (searched with `grep -rl "FirebaseAuth\|GIDSignIn\|GoogleSignIn"` over `berkeley-mobile/`, which matched only the import in `AppDelegate.swift`). Beyond the dependency and this import, authentication call-site usage was not found in inspected repository areas.
- **Firebase Cloud Messaging**: `berkeley-mobile/AppDelegate.swift` configures `Messaging.messaging().delegate`, requests notification authorization, registers for remote notifications, and implements `MessagingDelegate.messaging(_:didReceiveRegistrationToken:)`, posting an `FCMToken` notification and subscribing to the `"all"` topic.
- **Firebase Analytics**: `berkeley-mobile/Home/HomeViewModel.swift` imports `FirebaseAnalytics` and calls `Analytics.logEvent("opened_food_screen", parameters: nil)` in `logOpenedDiningHomeSectionAnalytics()`.

## Major Technical Components

- **`DataManager`** (`berkeley-mobile/Data/DataManager.swift`) — singleton that owns a fixed list of `DataSource`-conforming types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`, declared at `DataManager.swift:12-16`), fetches them on `fetchAll()`, caches results in an `AtomicDictionary<String, [Any]>`, and de-duplicates concurrent fetches per source via a `DispatchGroup` (`DataSource.fetchDispatch`).
- **`BMNetworkingManager`** (`berkeley-mobile/Data/BMNetworkingManager.swift`) — singleton wrapping direct Firestore queries for safety logs and resource categories, using Swift `async`/`await` and `Codable` decoding (`Firestore.Decodable` via `data(as:)`).
- **Dependency injection** via the `FactoryKit` Swift package: `berkeley-mobile/BerkeleyMobile+Injection.swift` defines `Container` extension properties (`Factory<T>`) for the app's view models (e.g. `homeViewModel`, `safetyViewModel`, `eventsViewModel`, `feedbackFormPresenter`), with lifetimes declared as `.shared` or `.singleton`. Consumers use the `@Injected` property wrapper (e.g. `berkeley-mobile/MainContainerViewController.swift:15`, `berkeley-mobile/TabBarController.swift:15`).
- **App entry point / lifecycle**: `berkeley-mobile/AppDelegate.swift` configures Firebase, triggers an initial `DataManager.shared.fetchAll()` and `BMLocationManager.shared.requestLocation()` on launch. `berkeley-mobile/SceneDelegate.swift` and `berkeley-mobile/TabBarController.swift` set up the root `UITabBarController` with four tabs: Home (`MainContainerViewController`), Today (`TodayView`), Safety (`SafetyView`), Resources (`ResourcesView`) — see `TabBarController.swift:17-69`.
- **`BMLocationManager`** (`berkeley-mobile/Data/BMLocationManager.swift`) — referenced from `AppDelegate.swift` for requesting device location; file exists in the repository but was not read in full for this document.
- **WidgetKit extension** (`BerkeleyMobileWidget/GymOccupancyWidget.swift`) — implements a `TimelineProvider` (`GymOccupancyProvider`) and a `StaticConfiguration`-based `Widget` (`GymOccupancyWidget`) that displays RSF and Stadium gym occupancy percentages, supporting the `.systemSmall` widget family. It uses `GymOccupancyViewModel` (declared in the main app's DI container, `BerkeleyMobile+Injection.swift`) to fetch occupancy data.

## Runtime / Deployment Model

- Standard Xcode build via `berkeley-mobile.xcodeproj` / `berkeley-mobile.xcworkspace`, with CocoaPods integration (Pods-based build phases at `project.pbxproj:1156` for embedding frameworks and `project.pbxproj:1178` for a Podfile.lock/Manifest.lock sync check).
- No CI/CD configuration (e.g. `.github/workflows`, Fastlane `Fastfile`) was found in the repository (searched `.github/`, and for `Fastfile`/`fastlane` directories/files at the repository root and two levels deep).
- No automated test target sources were found: the shared scheme `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` defines a `TestAction` with an empty `<Testables>` list, and no `XCTest` import or `*Tests` directory was found anywhere in the repository outside `Pods/`.
