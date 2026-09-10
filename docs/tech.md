# Technical Overview

## Repository Classification

LEVEL 1: The repository contains an Xcode project (`berkeley-mobile.xcodeproj`, `berkeley-mobile.xcworkspace`) with a primary application target (`berkeley-mobile`, product name `bm-persona`) and a WidgetKit app-extension target (`BerkeleyMobileWidgetExtension`).

Classification: **Mobile application (native iOS)**.

## Purpose

LEVEL 1: `README.md` states the repository is "the official repository for the Berkeley Mobile iOS application," a campus app providing Bear Transit routes, library and gym information, dining hall menus, and campus resources. It is described as a product of the ASUC Office of the Chief Technology Officer (OCTO).

## Languages / Frameworks

LEVEL 1 (directly observed in source and project configuration):
- **Swift 5.0** (`SWIFT_VERSION = 5.0` in `berkeley-mobile.xcodeproj/project.pbxproj`).
- **UIKit** — `AppDelegate.swift`, `SceneDelegate.swift`, `TabBarController.swift`, `MainContainerViewController.swift` are `UIResponder`/`UIViewController`/`UITabBarController` subclasses.
- **SwiftUI** — screens such as `TodayView`, `SafetyView`, `ResourcesView` are hosted via `UIHostingController` in `berkeley-mobile/TabBarController.swift`.
- **WidgetKit** — `BerkeleyMobileWidget/GymOccupancyWidget.swift` defines a `Widget`/`TimelineProvider` (`GymOccupancyWidget`, `GymOccupancyProvider`).
- **MapKit** — used in `berkeley-mobile/Home/Map/MapViewController.swift` and `berkeley-mobile/Data/BMLocationManager.swift`.
- **Firebase** (via CocoaPods, see `Podfile`): `Firebase/Analytics`, `Firebase` (core), `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`.
- **GoogleSignIn** (CocoaPods, `Podfile`).
- **Factory** (Swift Package Manager, `FactoryKit` product) — dependency-injection container, referenced via `@Injected` property wrappers in `berkeley-mobile/TabBarController.swift` and `berkeley-mobile/MainContainerViewController.swift`. Repository declares this dependency at `https://github.com/hmlongco/Factory.git`, minimum version 2.5.3 (`berkeley-mobile.xcodeproj/project.pbxproj`).
- **Glur** (Swift Package Manager) — declared at `https://github.com/joogps/Glur.git`, minimum version 1.1.0 (`berkeley-mobile.xcodeproj/project.pbxproj`). Usage sites were not inspected beyond this declaration.

LEVEL 2: WidgetKit, SwiftUI, MapKit, and UIKit are Apple platform frameworks; their general capabilities are documented by Apple and not repeated here.

## Package Management

LEVEL 1: Dependencies are managed through two mechanisms observed in the repository:
- **CocoaPods** — `Podfile` and `Podfile.lock` define Firebase and GoogleSignIn pods for the `berkeley-mobile` and `BerkeleyMobileWidgetExtension` targets. The `Pods/` directory is checked into this working tree.
- **Swift Package Manager** — `Factory`/`FactoryKit` and `Glur` are declared as `XCRemoteSwiftPackageReference` entries in `berkeley-mobile.xcodeproj/project.pbxproj`.

## Runtime Architecture

LEVEL 1:
- App entry point is `AppDelegate.swift` (`@UIApplicationMain`), which configures Firebase (`FirebaseApp.configure()`), triggers `DataManager.shared.fetchAll()`, requests location via `BMLocationManager.shared.requestLocation()`, and registers for push notifications through `Messaging` (Firebase Cloud Messaging) and `UNUserNotificationCenter`.
- Scene lifecycle is handled by `SceneDelegate.swift`; `AppDelegate` looks up the root view controller through `UIApplication.shared.connectedScenes.first?.delegate as? SceneDelegate`.
- The root UI is `TabBarController` (`berkeley-mobile/TabBarController.swift`), a `UITabBarController` with four tabs: a UIKit-hosted map/home flow (`MainContainerViewController`), and three SwiftUI screens (`TodayView`, `SafetyView`, `ResourcesView`) wrapped in `UIHostingController`.
- `MainContainerViewController` (`berkeley-mobile/MainContainerViewController.swift`) hosts a SwiftUI `HomeView` inside a UIKit container and implements `MainDrawerViewDelegate` for the bottom-drawer UI (see `berkeley-mobile/Drawer/`).
- A separate WidgetKit extension target, `BerkeleyMobileWidgetExtension`, implements `GymOccupancyWidget` (`BerkeleyMobileWidget/GymOccupancyWidget.swift`), which independently fetches gym-occupancy data via `GymOccupancyViewModel` on a timeline refresh policy.

## Data Access

LEVEL 1:
- The app reads directly from **Google Cloud Firestore** (per `README.md` and confirmed in source). `DataSource`-conforming types (`berkeley-mobile/Data/DataSource.swift`) each implement `static func fetchItems(_:)` against a named Firestore collection, e.g. `GymDataSource` ("Gyms"), `LibraryDataSource` ("Libraries"), `MapDataSource` ("Map Marker"), `GymClassDataSource` ("Gym Classes"). A separate class, `BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift`), also queries Firestore directly for `Safety Logs` and `Resource Categories` collections using `async`/`await`.
- `DataManager` (`berkeley-mobile/Data/DataManager.swift`) is a singleton that orchestrates fetches from a fixed list of `DataSource` types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`), caches results in an `AtomicDictionary`, and enforces a minimum re-fetch interval of one hour (`fetchInterval`).
- `README.md` states the production Firebase configuration file, `berkeley-mobile/GoogleService-Info.plist`, and `berkeley-mobile/Secrets.swift` are not included in the repository; both are listed in `.gitignore`.

## Local Persistence

LEVEL 1: `UserDefaults` is used for lightweight local state via a typed extension (`berkeley-mobile/Utils/UserDefaults+Extension.swift`, enum `UserDefaultsKeys`), covering launch counters, feedback-form/app-review timers, last-saved-event dates, recent searches, and pinned home-drawer items. `RecentSearchManager` (`berkeley-mobile/Home/Search/RecentSearchManager.swift`) persists a capped list (7 items) of recent map searches as JSON in `UserDefaults`.

## Deployment / Runtime Model

LEVEL 1 (from `berkeley-mobile.xcodeproj/project.pbxproj`):
- Main app target (`berkeley-mobile`): bundle identifier `org.asuc.ASUC`, marketing version `11.14.1`, iOS deployment target `18.0` (Release/Debug configs also show an entry at `13.0` for a build-settings baseline; the two target-specific configurations both read `18.0`).
- Widget extension target (`BerkeleyMobileWidgetExtension`): bundle identifier `org.asuc.ASUC.BerkeleyMobileWidget`, marketing version `1.0`, iOS deployment target `17.0`.
- `berkeley-mobile/berkeley-mobile.entitlements` declares `aps-environment: development` (push notifications) and `com.apple.developer.weatherkit: true`.
- `berkeley-mobile/Info.plist` declares usage-description strings for Calendar access (`NSCalendarsUsageDescription`, `NSCalendarsFullAccessUsageDescription`) and location (`NSLocationWhenInUseUsageDescription`).
- Distribution is via the Apple App Store and Google Play (per `README.md`); no CI/CD pipeline configuration (e.g. GitHub Actions, Fastlane) was found in the repository root or a `.github/` directory.

## Not found in codebase

- Automated build/release pipeline configuration (no `.github/workflows`, no `Fastfile`).
- Backend/server-side source (the backend is an external Firebase project, not part of this repository).
