# Technical Overview

## Repository Purpose

berkeley-mobile is an iOS mobile application for UC Berkeley students, developed under ASUC OCTO. The app surfaces campus resources including dining halls, fitness facilities, libraries, campus maps, safety alerts, upcoming events, and general campus resources.

## Languages and Frameworks

- **Language**: Swift (174 `.swift` source files in the main target)
- **UI frameworks**: UIKit and SwiftUI, used together. Newer screens (Today, Resources, Safety, Events) are written in SwiftUI. The map and its drawer system are implemented in UIKit. Bridge points use `UIHostingController` and `UIViewControllerRepresentable`.
- **Dependency management**: CocoaPods (version 1.16.2 per `Podfile.lock`)
- **iOS widget extension**: `BerkeleyMobileWidget` target, written in SwiftUI using WidgetKit

## External Dependencies (from `Podfile` and `Podfile.lock`)

| Pod | Version | Purpose |
|-----|---------|---------|
| Firebase | 11.2.0 | Core Firebase SDK |
| Firebase/Analytics | 11.2.0 | Event analytics |
| Firebase/Auth | 11.2.0 | Authentication |
| Firebase/Firestore | 11.2.0 | Cloud database (primary data store) |
| FirebaseMessaging | 11.4.0 | Push notifications |
| GoogleSignIn | 8.0.0 | Google OAuth sign-in |
| FactoryKit | (Swift Package) | Dependency injection container |

## Runtime Architecture

The application entry point is `AppDelegate` (`berkeley-mobile/AppDelegate.swift`) annotated with `@UIApplicationMain`. On launch it:
1. Calls `FirebaseApp.configure()` to initialize Firebase
2. Calls `DataManager.shared.fetchAll()` to pre-fetch Firestore data
3. Calls `BMLocationManager.shared.requestLocation()` to start location updates
4. Registers for push notifications via `UNUserNotificationCenter` and Firebase Cloud Messaging

Scene lifecycle is managed by `SceneDelegate`. The root view controller is `TabBarController`, which assembles four top-level tabs: **Home**, **Today**, **Safety**, and **Resources**.

## Major Technical Components

### TabBarController (`berkeley-mobile/TabBarController.swift`)
Root `UITabBarController`. Creates and holds four tab controllers:
- `MainContainerViewController` → Home tab (map + drawer)
- `UIHostingController(rootView: TodayView())` → Today tab
- `UIHostingController(rootView: SafetyView())` → Safety tab
- `UIHostingController(rootView: ResourcesView())` → Resources tab

### DataManager (`berkeley-mobile/Data/DataManager.swift`)
Singleton that orchestrates all Firestore data fetches at startup and on demand. Maintains an `AtomicDictionary` cache keyed by `DataSource` type name. A fetch interval of 3600 seconds prevents excessive re-fetching. Registered data sources at startup: `MapDataSource`, `LibraryDataSource`, `GymDataSource`.

### Firestore Data Sources
Each feature area has a dedicated `DataSource` class conforming to a shared `DataSource` protocol that requires `fetchDispatch: DispatchGroup` and `fetchItems(_:)`. Discovered sources:
- `MapDataSource` — Firestore collection `"Map Marker"`
- `LibraryDataSource` — Firestore collection `"Libraries"`
- `GymDataSource` — Firestore collection `"Gyms"`
- `GymClassDataSource` — Firestore collection `"Gym Classes"`
- `EventsDataService` — Firestore collection `"Events"` (async/await pattern, not registered with DataManager)
- `BMNetworkingManager` — Firestore collections for safety logs and resource categories

### Dependency Injection (`berkeley-mobile/BerkeleyMobile+Injection.swift`)
Uses the FactoryKit library. A `Container` extension registers factories for all view models with lifecycle scopes (`.singleton`, `.shared`, individual). `@Injected`, `@InjectedObservable`, and `@InjectedObject` property wrappers resolve dependencies at the call site.

### Widget Extension (`BerkeleyMobileWidget/`)
A separate Xcode target providing a WidgetKit widget that displays RSF and CMS Fitness Center gym occupancy. Uses `GymOccupancyViewModel` to fetch Firestore data. Refreshes on a schedule defined by `GymOccupancyViewModel.Constants.refreshIntervalSecs`.

## Deployment / Runtime Model

- iOS application distributed via the App Store
- No server-side code in this repository; all backend is Firebase (Firestore, Auth, Analytics, FCM)
- Push notification topic subscription: all users are subscribed to the FCM topic `"all"` on registration
- App version migration logic is in `AppDelegate+Migration.swift`; the migration key `LatestLaunchedVersion` is stored in `UserDefaults`
