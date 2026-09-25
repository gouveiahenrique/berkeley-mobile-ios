# Technical Overview

## Repository Classification

- **Repository type**: Mobile application (iOS).
- **Primary language**: Swift (`SWIFT_VERSION = 5.0`, set in `berkeley-mobile.xcodeproj/project.pbxproj`).
- **Frameworks/platforms**: Apple UIKit and SwiftUI (mixed usage — see below), Firebase (Firestore, Analytics, Auth, Messaging), GoogleSignIn.
- **Runtime model**: Native iOS application process, launched via `UIApplicationMain` (`berkeley-mobile/AppDelegate.swift:17`), plus a separate WidgetKit extension process (`BerkeleyMobileWidget/`).
- **Deployment model**: Compiled as an Xcode project/workspace and distributed via the App Store (referenced in `README.md`). No CI/CD configuration files (e.g. `.github/workflows`, Fastlane, Bitrise config) were found in the repository root.
- **Architectural style**: Single iOS app target (`berkeley-mobile`, product name `Berkeley.app`) plus a WidgetKit app extension target (`BerkeleyMobileWidgetExtension`), organized by feature folder with MVVM-style view models.

## Repository Purpose

The repository implements the official Berkeley Mobile iOS application, per `README.md:3`. `README.md:7` states the application provides Bear Transit routes, library and gym information, dining hall menus, and campus resources for UC Berkeley students.

## Languages & Frameworks

- The repository implements its application logic in Swift (`.swift` source files throughout `berkeley-mobile/` and `BerkeleyMobileWidget/`).
- The repository imports and uses `UIKit`, `SwiftUI`, `MapKit`, `CoreLocation`, `UserNotifications`, and `os` (unified logging), evidenced by import statements in files such as `berkeley-mobile/AppDelegate.swift:9-14`, `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift:9-11`, `berkeley-mobile/Data/BMLocationManager.swift:9-10`, and `berkeley-mobile/Utils/Logger+Ext.swift:9-10`.
- The repository depends on Firebase via CocoaPods, declared in `Podfile:9-14`: `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, and `GoogleSignIn`. The `BerkeleyMobileWidgetExtension` target also depends on `Firebase/Firestore` (`Podfile:17-21`).
- The repository depends on two Swift Package Manager packages, per `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`: `Factory` (v2.5.3, dependency-injection library imported as `FactoryKit`) and `Glur` (v1.1.0).
- The application uses Firebase Firestore as its backend data store: `BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift:15`) and multiple `DataSource` implementations instantiate `Firestore.firestore()` directly and query named collections (e.g. `"Gyms"` in `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift:12`, `"Libraries"` in `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift:12`, `"Map Marker"` in `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift:13`).
- Per `README.md:28`, the production Firestore backend API key and `GoogleService-Info.plist` are not included in the repository; contributors must obtain their own.

## Runtime Architecture

- The repository implements two runtime entry points:
  - The main app target, bootstrapped by `AppDelegate` (`berkeley-mobile/AppDelegate.swift:18`, `@UIApplicationMain`) and `SceneDelegate` (`berkeley-mobile/SceneDelegate.swift:11`). `SceneDelegate.scene(_:willConnectTo:options:)` (`berkeley-mobile/SceneDelegate.swift:15`) constructs the root view controller, `TabBarController` (`berkeley-mobile/TabBarController.swift:13`).
  - The `BerkeleyMobileWidget` target/extension, which implements a `TimelineProvider` (`GymOccupancyProvider`, `BerkeleyMobileWidget/GymOccupancyWidget.swift:26`) for a WidgetKit home-screen widget showing gym occupancy.
- On launch, `AppDelegate.application(_:didFinishLaunchingWithOptions:)` (`berkeley-mobile/AppDelegate.swift:20-35`) configures Firebase (`FirebaseApp.configure()`), increments an app-launch counter, calls `checkForUpdate()`, triggers `DataManager.shared.fetchAll()`, requests location via `BMLocationManager.shared.requestLocation()`, and registers for push notifications.
- The repository implements a tab-based navigation UI: `TabBarController.setupTabbar()` (`berkeley-mobile/TabBarController.swift:46-70`) assigns four tabs — Home (`MainContainerViewController`, UIKit), Today (`TodayView`, SwiftUI via `UIHostingController`), Safety (`SafetyView`, SwiftUI), and Resources (`ResourcesView`, SwiftUI).
- The repository mixes UIKit and SwiftUI: UIKit view controllers (e.g. `MapViewController`, `berkeley-mobile/Home/Map/MapViewController.swift:36`) are embedded in SwiftUI via `UIViewControllerRepresentable` (`HomeMapView`, `berkeley-mobile/Home/Map/MapViewController.swift:17`), and SwiftUI views are embedded in UIKit via `UIHostingController` (`berkeley-mobile/TabBarController.swift:17-20`).
- The repository implements a centralized data-fetch coordinator, `DataManager` (`berkeley-mobile/Data/DataManager.swift:18`), a singleton (`static let shared`, line 21) that fetches from a fixed list of `DataSource` types (`kDataSources`, lines 12-16: `MapDataSource`, `LibraryDataSource`, `GymDataSource`) and caches results in an `AtomicDictionary` (line 26).
- Some feature areas bypass `DataManager` and fetch directly from Firestore inside their own view models/services using Swift concurrency (`async`/`await`), e.g. `EventsDataService.fetchEventsGroupedByDate()` (`berkeley-mobile/Events/EventDataSource/EventsViewModel.swift:40`), `DiningHallsViewModel` (`berkeley-mobile/Home/Dining/DiningDataSource/DiningHallsViewModel.swift:38,71`), and `BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift:20,31`).
- The repository implements dependency injection using the `FactoryKit` package: `BerkeleyMobile+Injection.swift` extends `Container` with `Factory<...>` definitions for view models (e.g. `homeViewModel`, `safetyViewModel`, `eventsViewModel`), each scoped `.shared` or `.singleton` (`berkeley-mobile/BerkeleyMobile+Injection.swift:12-96`). View controllers/views resolve dependencies via `Container.shared.<name>.resolve()` (e.g. `berkeley-mobile/Home/Map/MapViewController.swift:81`) or the `@Injected` property wrapper (e.g. `berkeley-mobile/TabBarController.swift:15`).

## Major Technical Components

- The repository implements `berkeley-mobile/Data/DataManager.swift` as the app-wide fetch/cache layer for `Map`, `Library`, and `Gym` data sources.
- The repository implements `berkeley-mobile/Data/BMNetworkingManager.swift` as a singleton Firestore client for safety logs and resource categories.
- The repository implements `berkeley-mobile/Data/BMLocationManager.swift`, a singleton `CLLocationManager` wrapper that posts `Notification.Name.locationUpdated` on location change (lines 14-19, 76-77, 94-96).
- The repository implements a custom drawer UI system (`berkeley-mobile/Drawer/`) with `DrawerViewController`, `DrawerViewDelegate`, and `MainDrawerViewDelegate` managing stacked, pannable bottom-sheet-style drawers.
- The repository implements feature modules under `berkeley-mobile/Home/` (Map, Dining, Fitness, Libraries, Guides, Search, Home Drawer), `berkeley-mobile/Safety/`, `berkeley-mobile/Events/`, `berkeley-mobile/Today/`, and `berkeley-mobile/FeedbackForm/`.
- The repository implements a debug-only in-app tool, `DebugView`/`DebugViewModel` (`berkeley-mobile/Debug/`), triggered by a shake gesture and gated by `#if DEBUG` (`berkeley-mobile/TabBarController.swift:34-37`).

## Deployment/Runtime Model

- The application's marketing version is `11.14.1` and `IPHONEOS_DEPLOYMENT_TARGET` is `18.0` for the main app target (per `berkeley-mobile.xcodeproj/project.pbxproj`); the widget extension target's `IPHONEOS_DEPLOYMENT_TARGET` is `17.0`.
- Not found in codebase: automated CI/CD pipeline configuration (no `.github/workflows`, Fastlane, or similar files exist in the repository).
