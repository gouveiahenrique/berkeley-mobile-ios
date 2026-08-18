# Technical Overview

## Repository Purpose

`berkeley-mobile-ios` is the iOS application for UC Berkeley mobile services, branded as Berkeley Mobile. The application provides campus-focused features including an interactive map, gym occupancy tracking, dining hall information, library listings, campus safety logs, academic events, and campus resources.

The project is maintained by ASUC OCTO (Associated Students of the University of California, Office of the Chief Technology Officer).

## Languages and Frameworks

| Concern | Technology |
|---|---|
| Primary language | Swift |
| UI frameworks | UIKit and SwiftUI (coexist in the same app) |
| Dependency managers | CocoaPods (`Podfile`, `Podfile.lock`) and Swift Package Manager (`berkeley-mobile.xcodeproj/project.pbxproj` `XCRemoteSwiftPackageReference` entries, resolved in `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`) |
| Widget extension | SwiftUI + WidgetKit (`BerkeleyMobileWidget` target) |

## Primary Dependencies

### CocoaPods

Declared in `Podfile` and resolved in `Podfile.lock`:

| Pod | Purpose |
|---|---|
| `Firebase` | Core Firebase SDK |
| `Firebase/Firestore` | Cloud Firestore database client (primary data store) |
| `Firebase/Analytics` | Event analytics |
| `Firebase/Auth` | Firebase authentication SDK (imported in `AppDelegate.swift`) |
| `FirebaseMessaging` | Push notification token management |
| `GoogleSignIn` | Google identity provider (imported in `AppDelegate.swift`) |

### Swift Package Manager

Declared as `XCRemoteSwiftPackageReference` entries in `berkeley-mobile.xcodeproj/project.pbxproj`:

| Package | Repository | Purpose |
|---|---|---|
| `FactoryKit` (product of package "Factory") | `https://github.com/hmlongco/Factory.git` | Dependency injection container |
| `Glur` | `https://github.com/joogps/Glur.git` | SwiftUI progressive-blur view modifier (`.glur(...)`), used in `berkeley-mobile/Today/Tiles/News Tile/NewsTileView.swift` |

## Xcode Targets

| Target | Description |
|---|---|
| `berkeley-mobile` | Main iOS application |
| `BerkeleyMobileWidgetExtension` | iOS home-screen widget for gym occupancy |

## Runtime Architecture

### Application Lifecycle

`AppDelegate` (`berkeley-mobile/AppDelegate.swift`) is marked `@UIApplicationMain` and is the process entry point. On launch it:

1. Configures Firebase via `FirebaseApp.configure()`.
2. Invokes `DataManager.shared.fetchAll()` to prefetch Firestore data.
3. Requests user location via `BMLocationManager.shared.requestLocation()`.
4. Registers for remote push notifications.
5. Sets itself as the `UNUserNotificationCenterDelegate` and `MessagingDelegate`.

`SceneDelegate` (`berkeley-mobile/SceneDelegate.swift`) creates the `UIWindow` and sets `TabBarController` as the root view controller. It also calls `DataManager.shared.fetchIfNecessary()` when the scene returns to the foreground.

### Navigation Model

The root of the view hierarchy is `TabBarController` (`berkeley-mobile/TabBarController.swift`), a `UITabBarController` with four tabs:

| Tab index | Title | Root view |
|---|---|---|
| 0 | Home | `MainContainerViewController` (UIKit, wraps `HomeView` SwiftUI) |
| 1 | Today | `UIHostingController(rootView: TodayView())` |
| 2 | Safety | `UIHostingController(rootView: SafetyView())` |
| 3 | Resources | `UIHostingController(rootView: ResourcesView())` |

`MainContainerViewController` embeds `HomeView` (SwiftUI) via `UIHostingController` and implements `MainDrawerViewDelegate` to manage the legacy UIKit drawer stack.

### UIKit–SwiftUI Bridge

SwiftUI views are hosted inside UIKit using `UIHostingController`. Conversely, UIKit view controllers (e.g. `MapViewController`) are wrapped as `UIViewControllerRepresentable` or embedded directly into SwiftUI via `HomeMapView`.

### Data Layer

`DataManager` (`berkeley-mobile/Data/DataManager.swift`) is a singleton that manages prefetching from Firestore using the `DataSource` protocol. The three registered data sources are:

- `MapDataSource` — Firestore collection `"Map Marker"`.
- `LibraryDataSource` — Firestore collection `"Libraries"`.
- `GymDataSource` — Firestore collection `"Gyms"`.

Each `DataSource` conforms to the `DataSource` protocol (`fetchItems(_:)` + `fetchDispatch`). `DataManager` uses a `DispatchGroup` per source to guarantee each collection is only fetched once; results are stored in an `AtomicDictionary` protected by a POSIX read-write lock.

`BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift`) is a secondary singleton used for on-demand async/await Firestore fetches (safety logs, resource categories).

### Dependency Injection

`FactoryKit` is the DI framework. All registered factories are defined in `BerkeleyMobile+Injection.swift` as extensions on `Container`. View models are injected at call sites using the `@Injected`, `@InjectedObject`, and `@InjectedObservable` property wrappers.

### Image Loading

`ImageLoader` (`berkeley-mobile/Common/Images/ImageLoader.swift`) is an in-memory image cache backed by `URLSession`. It maps `URL` to `UIImage` and tracks in-flight `URLSessionDataTask` instances by `UUID`.

### Location

`BMLocationManager` (`berkeley-mobile/Data/BMLocationManager.swift`) wraps `CLLocationManager` as a singleton. Location updates are broadcast via `NotificationCenter` using the `Notification.Name.locationUpdated` name.

### Widget Extension

The `BerkeleyMobileWidget` target provides an iOS home-screen widget (`GymOccupancyWidget.swift`). It uses `WidgetKit`'s `TimelineProvider` and shares `GymOccupancyViewModel` with the main app to fetch real-time gym occupancy from Firestore.

## Deployment and Build Configuration

The project uses Xcode (`.xcodeproj` + `.xcworkspace`). CocoaPods manages third-party dependencies. The workspace must be opened via `berkeley-mobile.xcworkspace` to include Pod targets.

The `berkeley-mobile.entitlements` file is present, indicating an entitlements configuration, but specific entitlements are not enumerated here.

A DEBUG build flag is observed in `TabBarController.swift` (shake-to-open `DebugView`) and `BerkeleyMobile+Injection.swift` (conditional `debugViewModel` factory).

App version at time of analysis: `11.14.1` (from recent git commit).
