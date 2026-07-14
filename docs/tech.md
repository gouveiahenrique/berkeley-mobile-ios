# Technical Overview

## Repository Purpose

Berkeley Mobile is an iOS application for UC Berkeley students produced by ASUC OCTO (Office of the Chief Technology Officer). The app provides access to campus resources including dining, fitness, libraries, maps, campus events, safety logs, and student resource directories. The bundle identifier is `org.asuc.ASUC` and the marketing version at time of analysis is `11.14.1`.

## Repository Type

Native iOS mobile application with a WidgetKit extension.

## Languages

- Swift 5.0 (primary)
- Objective-C (transitively via CocoaPods dependencies)

## Frameworks and Platforms

| Framework | Version | Role |
|-----------|---------|------|
| Firebase (Analytics, Firestore, Auth, Messaging) | 11.2.0 | Backend data, authentication, analytics, push notifications |
| FirebaseMessaging | 11.4.0 | Push notification delivery |
| GoogleSignIn | 8.0.0 | OAuth sign-in |
| FactoryKit | (Swift Package) | Dependency injection container |
| WeatherKit | (Apple SDK) | Weather data for the Today tab |
| Glur | (Swift Package) | Image blur effect in news tile |
| UIKit | (Apple SDK) | Primary UI framework for older screens |
| SwiftUI | (Apple SDK) | UI framework for newer screens and widgets |
| MapKit | (Apple SDK) | Map rendering and location search |
| WidgetKit | (Apple SDK) | iOS home-screen widget |
| UserNotifications | (Apple SDK) | Push notification presentation |
| EventKit | (Apple SDK) | Calendar event management |

## Runtime Architecture

The app uses UIKit's `UIApplicationDelegate` / `UISceneDelegate` lifecycle:

- `AppDelegate` (`berkeley-mobile/AppDelegate.swift`) — configures Firebase, starts data prefetch, registers for push notifications, and increments App Store review launch counter.
- `SceneDelegate` (`berkeley-mobile/SceneDelegate.swift`) — creates the root `UIWindow`, sets `TabBarController` as the root view controller, and triggers `DataManager.shared.fetchIfNecessary()` when the scene re-enters the foreground.

The root UI is `TabBarController` (`berkeley-mobile/TabBarController.swift`), a `UITabBarController` with four tabs:

| Tab | Root View | Technology |
|-----|-----------|------------|
| Home | `MainContainerViewController` → `HomeView` + `MapViewController` | UIKit + SwiftUI bridge |
| Today | `TodayView` | SwiftUI |
| Safety | `SafetyView` | SwiftUI |
| Resources | `ResourcesView` | SwiftUI |

## Major Technical Components

### Data Layer

- **`DataManager`** (`berkeley-mobile/Data/DataManager.swift`) — Singleton that orchestrates fetching from registered `DataSource` types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`). Results are stored in `AtomicDictionary` (read-write locked) and cached for a 3600-second interval.
- **`DataSource` protocol** (`berkeley-mobile/Data/DataSource.swift`) — Each concrete source implements `fetchItems(_:)` and exposes a `fetchDispatch: DispatchGroup` to deduplicate concurrent Firebase reads.
- **`BMNetworkingManager`** (`berkeley-mobile/Data/BMNetworkingManager.swift`) — Singleton wrapping `Firestore.firestore()` for ad-hoc queries (safety logs, resource categories) using Swift structured concurrency (`async/throws`).
- **`BMLocationManager`** (`berkeley-mobile/Data/BMLocationManager.swift`) — Singleton `CLLocationManager` wrapper; broadcasts location changes via `NotificationCenter` under `Notification.Name.locationUpdated`.

### Dependency Injection

`FactoryKit` is used throughout. The injection container is extended in `BerkeleyMobile+Injection.swift` (`berkeley-mobile/BerkeleyMobile+Injection.swift`). View models are registered with scopes (`.singleton`, `.shared`). Dependencies are resolved at the call site using `@Injected`, `@InjectedObject`, and `@InjectedObservable` property wrappers.

### View-Model Pattern

Feature modules use `@Observable` (Swift Observation framework) or `ObservableObject` (`@Published`) for state. Examples:
- `SafetyViewModel` — `ObservableObject`, `@Published` properties
- `EventsViewModel` — `@Observable`, `@MainActor`
- `NewsDataViewModel` — `@Observable`, `@MainActor`

### UIKit–SwiftUI Bridge

`MainContainerViewController` embeds `HomeView` (SwiftUI) using `UIHostingController`. `MapViewController` (UIKit) is wrapped in `HomeMapView: UIViewControllerRepresentable` for use inside SwiftUI.

### Widget Extension

`BerkeleyMobileWidget/` is a WidgetKit target (`org.asuc.ASUC.BerkeleyMobileWidget`) that provides a `GymOccupancyWidget`. It configures Firebase independently, reads the `Gym Occupancy Meters` Firestore collection, and refreshes every 15 minutes via `Timeline` policy.

## Deployment Model

- iOS deployment target: 18.0 (main app and widget extension targets)
- The Xcode project also records a 13.0 target for a build configuration, and 17.0 for other configurations; the 18.0 entries represent the current active targets.
- Dependency management: CocoaPods (`Podfile`, `Podfile.lock`) for Firebase and GoogleSignIn; Swift Package Manager (`FactoryKit`, `Glur`, and others) managed via Xcode's package resolution.
