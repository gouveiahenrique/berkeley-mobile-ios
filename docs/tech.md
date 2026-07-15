# Technical Overview

## Repository Purpose

`berkeley-mobile` is an iOS application for UC Berkeley students published by ASUC OCTO. The app surfaces campus resources including dining halls, fitness facilities, libraries, a campus map, safety alerts, events, and campus guides.

## Repository Type

Native iOS mobile application with an iOS widget extension.

## Languages

- Swift (primary language throughout `berkeley-mobile/` and `BerkeleyMobileWidget/`)

## Frameworks and Platforms

- **UIKit** — used for legacy view controllers, drawer UI, map integration, and tab bar setup
- **SwiftUI** — used for all newer screens (`HomeView`, `SafetyView`, `ResourcesView`, `TodayView`) and shared UI components
- **WidgetKit** — used in `BerkeleyMobileWidget/` for the `GymOccupancyWidget`
- **MapKit** — used for map rendering in `MapViewController` and `SafetyMapView`
- **Firebase/Firestore** — primary backend; all data is fetched from Firestore collections
- **Firebase/Analytics** — analytics events logged throughout the app
- **Firebase/Messaging** — push notification token registration and topic subscription
- **Firebase/Auth** — declared as a CocoaPods dependency (direct usage not found in inspected code)
- **GoogleSignIn** — declared as a CocoaPods dependency (direct usage not found in inspected code)
- **FactoryKit** — dependency injection container used throughout view models and view controllers
- **UserNotifications** — push notification permission and presentation handling
- **CoreLocation** — location permissions and continuous location updates via `CLLocationManager`

## Dependency Management

Dependencies are managed with **CocoaPods** (`Podfile`, `Podfile.lock`). The main app target depends on:

```
pod 'Firebase/Analytics'
pod 'Firebase'
pod 'FirebaseMessaging'
pod 'Firebase/Firestore'
pod 'Firebase/Auth'
pod 'GoogleSignIn'
```

The widget extension target additionally uses:

```
pod 'Firebase/Firestore'
```

## Application Lifecycle

- Entry point: `AppDelegate` annotated with `@UIApplicationMain`
- Scene management: `SceneDelegate` implements `UIWindowSceneDelegate` and sets `TabBarController` as the root view controller
- On `application(_:didFinishLaunchingWithOptions:)`:
  - `FirebaseApp.configure()` is called
  - `DataManager.shared.fetchAll()` triggers the initial data fetch from Firestore
  - `BMLocationManager.shared.requestLocation()` begins location updates
  - Push notification authorization is requested and FCM token registration occurs
- On `sceneWillEnterForeground`: `DataManager.shared.fetchIfNecessary()` re-fetches data if more than one hour has elapsed since the last fetch (defined by `DataManager.fetchInterval = 60 * 60`)

## Major Technical Components

| Component | Role |
|---|---|
| `AppDelegate` | Application lifecycle, Firebase setup, push notifications, FCM |
| `SceneDelegate` | Scene lifecycle, root view controller assignment |
| `TabBarController` | Root navigation: Home, Today, Safety, Resources tabs |
| `MainContainerViewController` | UIKit container hosting `HomeView` via `UIHostingController` |
| `DataManager` | Singleton that fetches and caches data from registered `DataSource` types |
| `BMNetworkingManager` | Singleton for direct async Firestore reads (safety logs, resource categories) |
| `BMLocationManager` | Singleton CLLocationManager wrapper; broadcasts updates via `NotificationCenter` |
| `BerkeleyMobile+Injection.swift` | FactoryKit `Container` extension registering all view model factories |
| `AtomicDictionary` | Thread-safe dictionary using POSIX read-write locks, used internally by `DataManager` |
| `BMDrawerView` / Drawer system | Two drawer implementations: a UIKit-based `DrawerViewController` stack and a SwiftUI `BMDrawerView` |

## Runtime Architecture

- **UIKit + SwiftUI hybrid**: `TabBarController` and `MainContainerViewController` are UIKit; tab content screens (`HomeView`, `SafetyView`, `TodayView`, `ResourcesView`) are SwiftUI, hosted via `UIHostingController`
- **Observation**: view models use both `ObservableObject`/`@Published` (older pattern) and the `@Observable` macro (newer pattern introduced in Swift 5.9)
- **Concurrency**: mix of GCD (`DispatchGroup`, `DispatchQueue`) and Swift structured concurrency (`async`/`await`, `Task`)
- **Firestore** is the sole persistent backend; there is no local Core Data store observed

## Widget Extension

`BerkeleyMobileWidgetBundle` (in `BerkeleyMobileWidget/`) registers `GymOccupancyWidget`, a WidgetKit widget that displays RSF Weight Room and CMS Fitness Center occupancy percentages. The widget calls `GymOccupancyViewModel.fetchOccupancyPercentages()` and refreshes on a schedule defined by `GymOccupancyViewModel.Constants.refreshIntervalSecs`.

## App Version

The last committed version string is `11.14.1` (from git commit `3c4517a`).
