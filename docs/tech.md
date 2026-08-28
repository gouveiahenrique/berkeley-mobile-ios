# Technical Overview

## Repository Classification

- **Repository type:** Mobile application (native iOS)
- **Primary language:** Swift
- **Frameworks/platforms:** UIKit, SwiftUI, WidgetKit, Firebase (Analytics, Firestore, Auth, Messaging), MapKit, CoreLocation
- **Runtime model:** Native iOS application process plus a separate WidgetKit extension process
- **Deployment model:** Xcode project distributed via the App Store (per `README.md`: "Berkeley Mobile" on the App Store and Google Play)
- **Architectural style:** Mixed UIKit/SwiftUI view layer with per-feature ViewModel classes and a Factory-based dependency-injection container

Evidence: `berkeley-mobile.xcodeproj/project.pbxproj`, `Podfile`, `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`.

## Repository Purpose

The repository implements the official iOS client for "Berkeley Mobile," an app providing UC Berkeley students with campus information. `README.md` states the app surfaces "Bear Transit routes, library and gym information, dining hall menus, and campus resources." The codebase's top-level feature folders (`Home`, `Events`, `Safety`, `Today`, `FeedbackForm`, `Resources`) correspond to these functions.

## Languages and Frameworks

- The project is a Swift project (`SWIFT_VERSION = 5.0` in `berkeley-mobile.xcodeproj/project.pbxproj`).
- `IPHONEOS_DEPLOYMENT_TARGET = 13.0` is defined in `berkeley-mobile.xcodeproj/project.pbxproj`.
- The application uses UIKit (`import UIKit` in `berkeley-mobile/AppDelegate.swift`, `berkeley-mobile/TabBarController.swift`) and SwiftUI (e.g. `berkeley-mobile/Safety/SafetyViewModel.swift`, `BerkeleyMobileWidget/GymOccupancyWidget.swift`) side by side. UIKit view controllers are bridged into SwiftUI via `UIHostingController` (`berkeley-mobile/TabBarController.swift:17-20`) and SwiftUI views are bridged into UIKit via `UIViewControllerRepresentable` (`berkeley-mobile/Home/Map/MapViewController.swift:17-31`).
- Dependency management uses both CocoaPods (`Podfile`) and Swift Package Manager (`XCRemoteSwiftPackageReference` entries in `berkeley-mobile.xcodeproj/project.pbxproj`).

### CocoaPods dependencies (`Podfile`)

- `Firebase`, `Firebase/Analytics`, `Firebase/Firestore`, `Firebase/Auth`, `FirebaseMessaging` — applied to the `berkeley-mobile` target.
- `Firebase/Firestore` — also applied to the `BerkeleyMobileWidgetExtension` target.
- `GoogleSignIn` — applied to the `berkeley-mobile` target.

### Swift Package Manager dependencies (`project.pbxproj`)

- `Factory` (product `FactoryKit`, repository `https://github.com/hmlongco/Factory.git`) — used as the app's dependency-injection container (`berkeley-mobile/BerkeleyMobile+Injection.swift`, `@Injected` usages such as `berkeley-mobile/TabBarController.swift:15`).
- `Glur` (repository `https://github.com/joogps/Glur.git`).

## Runtime Architecture

- **App entry point:** `berkeley-mobile/AppDelegate.swift`, annotated `@UIApplicationMain`. On launch it calls `FirebaseApp.configure()`, `DataManager.shared.fetchAll()`, `BMLocationManager.shared.requestLocation()`, registers for push notifications via `Messaging`/`UNUserNotificationCenter`, and conforms to `MessagingDelegate` and `UNUserNotificationCenterDelegate`.
- **Scene lifecycle:** `berkeley-mobile/SceneDelegate.swift` calls `DataManager.shared.fetchIfNecessary()` (per codegraph blast-radius data; the single caller of `fetchIfNecessary`).
- **Root navigation:** `berkeley-mobile/TabBarController.swift` is a `UITabBarController` that hosts four tabs: a UIKit-based map flow (`MainContainerViewController`), and three SwiftUI screens wrapped in `UIHostingController` (`TodayView`, `SafetyView`, `ResourcesView`).
- **Widget extension:** `BerkeleyMobileWidget/GymOccupancyWidget.swift` defines a `WidgetKit` `TimelineProvider`-based widget (`GymOccupancyWidget`) that renders gym occupancy data in a home-screen widget, built as a separate `BerkeleyMobileWidgetExtension` target (per `Podfile`).

## Major Technical Components

| Component | Evidence |
|---|---|
| `DataManager` (`berkeley-mobile/Data/DataManager.swift`) | Singleton coordinating fetches from an array of `DataSource`-conforming types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`), caching results in an `AtomicDictionary`, and exposing a computed `searchable` collection. |
| `BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift`) | Wraps `Firestore.firestore()` queries (e.g. `fetchSafetyLogs()`, `fetchResourcesCategories()`) using Firebase's Firestore SDK. |
| `BMLocationManager` (`berkeley-mobile/Data/BMLocationManager.swift`) | Singleton wrapper around `CLLocationManager`, broadcasting location updates via `NotificationCenter`. |
| Dependency injection container (`berkeley-mobile/BerkeleyMobile+Injection.swift`) | Registers ViewModels (e.g. `homeViewModel`, `safetyViewModel`, `eventsViewModel`) against a `Container` using the `FactoryKit` package, with `.shared` / `.singleton` scopes. |
| Drawer system (`berkeley-mobile/Drawer/`) | Custom bottom-sheet UI (`DrawerViewController`, `DrawerViewDelegate`, `MainDrawerViewDelegate`) implemented with `UIPanGestureRecognizer` and manual view-center animation, not a system API. |

## Deployment / Runtime Model

- The app is built from `berkeley-mobile.xcworkspace` (required because CocoaPods is used per `Podfile`).
- Two targets are defined in the Xcode project: the main `berkeley-mobile` app (bundle id `org.asuc.ASUC`) and `BerkeleyMobileWidgetExtension` (bundle id `org.asuc.ASUC.BerkeleyMobileWidget`), per `berkeley-mobile.xcodeproj/project.pbxproj`.
- No CI/CD configuration (e.g. `.github/workflows`, Fastlane `Fastfile`) was found in the inspected repository areas.
- `README.md` states production Firebase configuration (`GoogleService-Info.plist`) is not included in the repository and must be obtained by contacting the maintainers, so a fully-configured production build is not reproducible from the repository alone.
