# Technical Overview

## Repository Purpose

Berkeley Mobile is an iOS application for UC Berkeley students developed by ASUC OCTO. The app surfaces campus services including dining halls, fitness facilities, libraries, campus events, safety logs, and campus resources through a tab-based interface backed by Firebase Firestore.

## Repository Classification

- **Type**: iOS mobile application
- **Primary Language**: Swift
- **UI Frameworks**: SwiftUI (primary), UIKit (legacy components and host controllers)
- **Dependency Manager**: CocoaPods

## Major Frameworks and Libraries

| Dependency | Resolved Version | Purpose |
|---|---|---|
| Firebase | 11.2.0 | Analytics, Firestore database, Auth, Messaging |
| FirebaseFirestore | 11.2.0 | Primary data store for all campus entity data |
| FirebaseMessaging | 11.4.0 | Push notifications (FCM) |
| FirebaseAnalytics | 11.2.0 | Usage event tracking |
| FirebaseAuth | 11.2.0 | Authentication (Google Sign-In backed) |
| GoogleSignIn | 8.0.0 | Google OAuth identity provider |
| FactoryKit | — | Dependency injection container |

> FactoryKit version is declared in Podfile but not reflected with a version constraint; the resolved version is in Podfile.lock.

## Runtime Architecture

### Application Entry

- `AppDelegate` (`berkeley-mobile/AppDelegate.swift`) — annotated `@UIApplicationMain`. On `didFinishLaunching`, it calls `FirebaseApp.configure()`, `DataManager.shared.fetchAll()`, and `BMLocationManager.shared.requestLocation()`. It also registers for FCM push notifications.
- `SceneDelegate` (`berkeley-mobile/SceneDelegate.swift`) — creates the `UIWindow` with a `TabBarController` as root view controller. On `sceneWillEnterForeground`, calls `DataManager.shared.fetchIfNecessary()`.

### Navigation Model

`TabBarController` (`berkeley-mobile/TabBarController.swift`) defines four tabs:

| Tab | Root View | Tag |
|---|---|---|
| Home | `MainContainerViewController` (UIKit host for `HomeView`) | 0 |
| Today | `UIHostingController<TodayView>` | 1 |
| Safety | `UIHostingController<SafetyView>` | 2 |
| Resources | `UIHostingController<ResourcesView>` | 3 |

### SwiftUI / UIKit Bridging

The codebase mixes SwiftUI and UIKit. `UIHostingController` is used to embed SwiftUI views into UIKit containers. `UIViewControllerRepresentable` is used in the reverse direction — for example, `HomeMapView` wraps `MapViewController` (UIKit) so it can be embedded inside SwiftUI `HomeView`.

### Data Layer

- `DataManager` (`berkeley-mobile/Data/DataManager.swift`) — singleton. Coordinates fetches from registered `DataSource` types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`). Uses `DispatchGroup` to prevent duplicate Firestore fetches. Caches results in an `AtomicDictionary` protected by a POSIX read-write lock. Has a minimum fetch interval of 3,600 seconds to avoid excessive Firestore calls.
- `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift`) — defines the contract for data source classes: `fetchItems(_:)` and `fetchDispatch`.
- `BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift`) — singleton used by Safety and Resources features for direct `async/await`-based Firestore queries.
- `ImageLoader` (`berkeley-mobile/Common/Images/ImageLoader.swift`) — singleton in-memory image cache using `URLSession.shared` for HTTP image downloads.

### Dependency Injection

`FactoryKit` is used for all ViewModels and shared services. `Container` extensions are defined in `berkeley-mobile/BerkeleyMobile+Injection.swift`. View models are injected via `@Injected`, `@InjectedObservable`, or `@InjectedObject` property wrappers.

### Widget Extension

`BerkeleyMobileWidget` (`BerkeleyMobileWidget/`) is an iOS WidgetKit extension. It exposes a single widget: `GymOccupancyWidget` (`BerkeleyMobileWidget/GymOccupancyWidget.swift`) showing RSF and Stadium gym occupancy percentages. It fetches data from Firestore via `GymOccupancyViewModel` and refreshes on a timer-based `Timeline`.

## Platform and Deployment

- Platform: iOS
- Build system: Xcode with CocoaPods
- Version at most recent commit: 11.14.1 (`berkeley-mobile/Info.plist`, per commit message)
- The app targets iOS with a minimum version defined in the Xcode project file (not inspected).
- The entitlements file is at `berkeley-mobile/berkeley-mobile.entitlements`.
