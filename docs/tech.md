# Technical Overview

## Repository Purpose

Berkeley Mobile is an iOS mobile application for UC Berkeley students, built by ASUC OCTO. It surfaces campus resources, dining hall information, fitness facilities, library hours, campus safety logs, general university resources, events, and a map of campus markers. The repository also contains an iOS widget extension for gym occupancy.

## Languages and Frameworks

- **Swift** — primary implementation language throughout the main app and widget extension
- **UIKit** — used in legacy and hybrid view controllers (`AppDelegate`, `TabBarController`, `MapViewController`, `MainContainerViewController`, `CardView`, `FilterView`, `DrawerViewController`, and detail views)
- **SwiftUI** — used for all top-level tab views (`HomeView`, `TodayView`, `SafetyView`, `ResourcesView`) and a growing set of feature views; bridged into UIKit via `UIHostingController`
- **WidgetKit** — used in the `BerkeleyMobileWidget` target for the `GymOccupancyWidget`

## Key Dependencies (CocoaPods)

| Dependency | Resolved Version |
|---|---|
| Firebase | 11.2.0 |
| Firebase/Analytics | 11.2.0 |
| Firebase/Auth | 11.2.0 |
| Firebase/Firestore | 11.2.0 |
| FirebaseMessaging | 11.4.0 |
| GoogleSignIn | 8.0.0 |
| FactoryKit | (resolved via Pods) |

Dependencies are managed with CocoaPods. The `Podfile` targets `berkeley-mobile` and `BerkeleyMobileWidgetExtension`; both use `use_frameworks!`.

## Runtime Architecture

The application uses a UIKit scene-based lifecycle:

- **`AppDelegate`** — configures Firebase, starts location updates, registers for push notifications via Firebase Cloud Messaging, and runs version-based migrations on launch
- **`SceneDelegate`** — creates the root `UIWindow` and sets `TabBarController` as the root view controller
- **`TabBarController`** — hosts four top-level tab views: Home, Today, Safety, Resources

Data is loaded from Firebase Firestore at launch via `DataManager.shared.fetchAll()` and re-fetched when the app enters the foreground (`sceneWillEnterForeground` calls `DataManager.shared.fetchIfNecessary()`).

## Major Technical Components

### Data Layer
- **`DataManager`** — singleton that coordinates fetching across `DataSource` implementors using `DispatchGroup`. Enforces a 1-hour minimum interval between full fetches. Stores fetched results in an `AtomicDictionary` (pthread read-write lock).
- **`DataSource` protocol** — defines the `fetchItems` and `fetchDispatch` contract implemented by `MapDataSource`, `LibraryDataSource`, `GymDataSource`, and `GymClassDataSource`. Each source fetches directly from a named Firestore collection.
- **`BMNetworkingManager`** — separate singleton for async/await Firestore fetches used by `SafetyViewModel` and `ResourcesViewModel`.

### Location
- **`BMLocationManager`** — singleton wrapping `CLLocationManager`. Broadcasts location updates via `NotificationCenter` using the `BMLocationManager.locationUpdated` notification name. Requests `whenInUse` authorization.

### Dependency Injection
- **FactoryKit** — the application uses the `Container` extension defined in `BerkeleyMobile+Injection.swift` to register view models and services as `Factory` instances with `.shared` or `.singleton` scopes. Views inject dependencies using `@Injected`, `@InjectedObservable`, and `@InjectedObject` property wrappers from FactoryKit.

### Push Notifications
- Firebase Cloud Messaging (FCM) receives the device token and subscribes the device to the `"all"` topic. Receiving a notification tap navigates to tab index 2 (Safety).

### Widget Extension
- **`BerkeleyMobileWidget`** target contains a single `GymOccupancyWidget` (WidgetKit, `systemSmall` size) that fetches RSF and CMS Fitness Center occupancy percentages via `GymOccupancyViewModel` and a shared Firestore connection.

## Persistence

- **Firebase Firestore** — primary remote data store for all campus data
- **Firebase Analytics** — analytics event tracking
- **UserDefaults** — local persistence for app-launch counters, recent searches, and pinned home drawer item IDs (keyed by `UserDefaultsKeys` enum)
- **EventKit** — the `BMEventManager` integrates with device calendar for academic and campus-wide event saving (observed in `EventsViewModel`)

## Build Configuration

- Targets: `berkeley-mobile` (main app) and `BerkeleyMobileWidgetExtension`
- Minimum deployment target and exact SDK version are defined in the Xcode project; `LSRequiresIPhoneOS` is `true`
- Version is set via `$(MARKETING_VERSION)` and `$(CURRENT_PROJECT_VERSION)` build settings; the most recent commit updated the marketing version to `11.14.1`
- A `DEBUG` build condition gates `DebugView` presentation via shake gesture in `TabBarController`
