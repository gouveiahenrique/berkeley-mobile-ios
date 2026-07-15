# Technical Overview

## Repository Purpose

Berkeley Mobile is an iOS mobile application for UC Berkeley students, providing campus information including dining, fitness, libraries, campus events, safety logs, and campus resources. The app is developed by ASUC OCTO (Office of Chief Technology Officer).

## Repository Classification

- **Type:** iOS Mobile Application
- **Platform:** iOS (UIKit + SwiftUI hybrid)
- **Language:** Swift
- **Dependency Management:** CocoaPods (for Firebase dependencies) + Swift Package Manager (for FactoryKit, Glur)

## Primary Languages and Frameworks

| Layer | Technology |
|---|---|
| Application Language | Swift |
| UI — legacy controllers | UIKit |
| UI — feature views | SwiftUI |
| Backend-as-a-Service | Firebase (Firestore, Analytics, Messaging, Auth) |
| Dependency Injection | Factory 2.5.3 (via SPM, `hmlongco/Factory`) |
| UI effect | Glur 1.1.0 (via SPM, `joogps/Glur`) |
| Maps | MapKit |
| Identity | GoogleSignIn (CocoaPods) |

## Firebase SDK Dependencies (CocoaPods)

The `Podfile` declares the following Firebase pods for the main target `berkeley-mobile`:

- `Firebase`
- `Firebase/Analytics`
- `Firebase/Auth`
- `Firebase/Firestore`
- `FirebaseMessaging`
- `GoogleSignIn`

The widget extension target `BerkeleyMobileWidgetExtension` declares only `Firebase/Firestore`.

## Runtime Architecture

### Application Entry Point

`AppDelegate` (`berkeley-mobile/AppDelegate.swift:17`) is annotated with `@UIApplicationMain` and serves as the application delegate. In `application(_:didFinishLaunchingWithOptions:)` (line 20) the following initialization sequence runs:

1. `FirebaseApp.configure()` — initialises the Firebase SDK.
2. `UserDefaults.standard.increment(forKey: .numAppLaunchForAppStoreReview)` — increments the launch counter used for App Store review prompting.
3. `self.checkForUpdate()` — runs version-based migrations (`AppDelegate+Migration.swift`).
4. `DataManager.shared.fetchAll()` — triggers background Firestore fetches for all registered data sources.
5. `BMLocationManager.shared.requestLocation()` — requests user location.
6. Push notification registration via `UNUserNotificationCenter` and `Messaging.messaging()`.

Scene management is delegated to `SceneDelegate` via UISceneSession lifecycle methods.

### UI Layer

The root view controller is `TabBarController` (`berkeley-mobile/TabBarController.swift:13`), a `UITabBarController` subclass that hosts four tabs:

| Tab | Type | Root View |
|---|---|---|
| Today | `UIHostingController<TodayView>` | SwiftUI |
| Home (Map) | `MainContainerViewController` | UIKit + embedded SwiftUI |
| Safety | `UIHostingController<SafetyView>` | SwiftUI |
| Resources | `UIHostingController<ResourcesView>` | SwiftUI |

`MainContainerViewController` (`berkeley-mobile/MainContainerViewController.swift:13`) embeds a `MapViewController` (UIKit) together with a `HomeView` (SwiftUI) via `UIHostingController`.

### Widget Extension

`BerkeleyMobileWidget` is an iOS Widget Extension target. It implements a `StaticConfiguration` WidgetKit widget (`GymOccupancyWidget`) that displays RSF and CMS Fitness Center occupancy. The widget fetches occupancy data from Firestore through a shared `GymOccupancyViewModel` and refreshes on a fixed interval defined by `GymOccupancyViewModel.Constants.refreshIntervalSecs`.

### Data Layer

Data is fetched exclusively from Firebase Firestore. Two distinct fetch mechanisms are observed:

1. **`DataManager` + `DataSource` protocol** (`berkeley-mobile/Data/DataManager.swift`, `berkeley-mobile/Data/DataSource.swift`): used for `MapDataSource`, `LibraryDataSource`, and `GymDataSource`. Data is fetched once per session (guarded by a per-source `DispatchGroup`) and cached in an in-memory `AtomicDictionary`. A minimum re-fetch interval of 3600 seconds is enforced.

2. **`BMNetworkingManager`** (`berkeley-mobile/Data/BMNetworkingManager.swift`): used for Safety Logs and Resources Categories, fetching directly from Firestore using Swift async/await.

### State Management

View models use two distinct observation mechanisms:

- `ObservableObject` with `@Published` properties (e.g., `HomeViewModel`)
- `@Observable` macro (e.g., `EventsViewModel`, `DebugViewModel`, `DiningHallsViewModel`, `GymOccupancyViewModel`)

Both patterns are present in the codebase.

### Dependency Injection

The app uses the Factory library (version 2.5.3). The DI container is configured in `berkeley-mobile/BerkeleyMobile+Injection.swift` as an extension on `Container`. View models and services are registered with `.singleton`, `.shared`, or default (transient) scopes. View and view controller code accesses dependencies via `@Injected` (value types) and `@InjectedObject` / `@InjectedObservable` (reference types).

### Image Loading

`ImageLoader` (`berkeley-mobile/Common/Images/ImageLoader.swift`) is a shared singleton that loads remote images via `URLSession.shared.dataTask`. Loaded images are cached in-memory by `URL`.

### Push Notifications

`AppDelegate` registers for remote notifications on launch and subscribes the device to the `"all"` FCM topic via `Messaging.messaging().subscribe(toTopic:)`. On notification tap, the app navigates to tab index 2 (Safety tab) (`berkeley-mobile/AppDelegate.swift:67`).

### App Store Review Prompting

`ReviewPrompter` (`berkeley-mobile/Common/ReviewPrompter.swift`) is referenced in the common module. The app increments `UserDefaultsKeys.numAppLaunchForAppStoreReview` on each launch via `AppDelegate`.

### In-App Feedback Form

A feedback form is conditionally displayed via `FeedbackFormPresenter` (`berkeley-mobile/FeedbackForm/FeedbackFormPresenter.swift`). Presentation is gated on a launch-count threshold stored in `UserDefaults` and a remote configuration (`FeedbackFormConfig`) fetched from Firestore.

### Version Migration

`AppDelegate+Migration.swift` implements a `checkForUpdate()` function that compares the running app version against a stored `LatestLaunchedVersion` key and performs necessary one-time migrations. The observed migration for versions before 10.0.1 clears Firebase Analytics data and Firestore persistence.
