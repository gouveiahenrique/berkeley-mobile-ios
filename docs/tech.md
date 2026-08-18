# Technical Overview

## Repository Classification

- **Repository type:** Mobile application (native iOS client).
- **Primary language:** Swift (174 `.swift` files under `berkeley-mobile/`).
- **Frameworks/platforms:** UIKit (app shell, navigation) combined with SwiftUI (majority of feature screens), Firebase (Firestore, Analytics, Auth, Cloud Messaging), MapKit, GoogleSignIn.
- **Runtime model:** Event-driven iOS application lifecycle (`UIApplicationDelegate` + `UIWindowSceneDelegate`), plus a separate WidgetKit extension process.
- **Deployment model:** Distributed as an iOS App Store binary (`berkeley-mobile.xcodeproj` → `Berkeley.app`), built via Xcode/xcodebuild. Not found in codebase: any CI/CD pipeline definition (no `.github/` workflows, no Fastlane configuration were found in the inspected repository areas).
- **Architectural style:** Modular-by-feature UIKit/SwiftUI hybrid app with a shared singleton data layer and a dependency-injection container (FactoryKit) for view models.

## Repository Purpose (evidence-based)

The repository implements `berkeley-mobile/README.md`'s stated purpose: a UC Berkeley campus companion app ("Berkeley Mobile") providing map points-of-interest, library/gym/dining information, campus events, safety logs, and campus resources. This description is stated directly in `README.md`; the application code (`Home/Map`, `Home/Libraries`, `Home/Fitness`, `Home/Dining`, `Events`, `Safety`, `Resources`) implements screens matching each of these areas.

## Languages, Frameworks, and Major Dependencies

Dependency evidence is drawn from `Podfile` and import statements in source files.

- **CocoaPods** is the dependency manager (`Podfile`, `Podfile.lock`, `Pods/` directory).
- `Podfile` declares, for the `berkeley-mobile` target:
  - `Firebase/Analytics`
  - `Firebase`
  - `FirebaseMessaging`
  - `Firebase/Firestore`
  - `Firebase/Auth`
  - `GoogleSignIn`
- `Podfile` declares, for the `BerkeleyMobileWidgetExtension` target:
  - `Firebase/Firestore`
- Source imports observed include `FactoryKit` (dependency-injection library; e.g. `berkeley-mobile/BerkeleyMobile+Injection.swift`, `berkeley-mobile/TabBarController.swift`) and `Observation`/`@Observable` (Swift's Observation framework; e.g. `berkeley-mobile/Home/Search/SearchViewModel.swift:43`, `berkeley-mobile/FeedbackForm/FeedbackFormViewModel.swift:32`).
- `import UIKit`, `import SwiftUI`, `import MapKit`, `import Firebase`/`FirebaseCore`/`FirebaseMessaging`/`FirebaseAnalytics`, and `import GoogleSignIn` appear throughout the codebase (e.g. `berkeley-mobile/AppDelegate.swift:9-14`).

The framework capability of GoogleSignIn/Firebase Auth for user sign-in is present as a dependency (`Podfile`), and a Google URL scheme is registered in `berkeley-mobile/Info.plist:19-28` (`CFBundleURLTypes` → `com.googleusercontent.apps...`). Not found in codebase: an active sign-in flow invoking `GIDSignIn` was not located in the inspected files — `AppDelegate.swift` only imports `GoogleSignIn` without calling it.

## Runtime Architecture

### Application entry points

- `berkeley-mobile/AppDelegate.swift` — `@UIApplicationMain class AppDelegate: UIResponder, UIApplicationDelegate`. On `application(_:didFinishLaunchingWithOptions:)` it: configures Firebase (`FirebaseApp.configure()`), increments an app-launch counter in `UserDefaults`, runs `checkForUpdate()` (migration logic), triggers `DataManager.shared.fetchAll()`, requests location via `BMLocationManager.shared.requestLocation()`, sets itself as `MessagingDelegate` and `UNUserNotificationCenterDelegate`, requests notification authorization, and registers for remote notifications.
- `berkeley-mobile/SceneDelegate.swift` — `UIWindowSceneDelegate` implementation that sets up the app's root `UIWindow` (per the scene-based lifecycle declared in `Info.plist:57-73`, `UIApplicationSceneManifest`).
- `berkeley-mobile/TabBarController.swift` — the app's root `UITabBarController`, wiring four tabs: `MainContainerViewController` (Home/Map), `TodayView` (SwiftUI, hosted via `UIHostingController`), `SafetyView` (SwiftUI), and `ResourcesView` (SwiftUI). Also wires up `FeedbackFormPresenter` and a debug menu triggered by shake gesture (`motionEnded`, `#if DEBUG`).
- `BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift` and `BerkeleyMobileWidget/GymOccupancyWidget.swift` — entry points for a separate WidgetKit extension target (`BerkeleyMobileWidgetExtension`).

### UI architecture

The repository implements a hybrid UIKit/SwiftUI architecture:
- Older/map-centric screens are UIKit `UIViewController` subclasses (e.g. `Home/Map/MapViewController.swift`, `MainContainerViewController.swift`, `Drawer/DrawerViewController.swift`).
- Newer feature screens are SwiftUI `View` structs, frequently bridged into UIKit via `UIHostingController` (e.g. `TabBarController.swift:17-20` hosts `TodayView`, `SafetyView`, `ResourcesView`; `MapViewController.swift:180-190` hosts `SearchBarView` and `SearchResultsView`).
- View models follow either the `ObservableObject`/`@Published` pattern (e.g. `berkeley-mobile/Home/HomeViewModel.swift:34`, `MapUserLocationButtonViewModel` in `berkeley-mobile/Home/Map/MapUserLocationButton.swift:12`) or the newer `@Observable` macro (e.g. `berkeley-mobile/Home/Search/SearchViewModel.swift:43`, `berkeley-mobile/FeedbackForm/FeedbackFormViewModel.swift:32`, `berkeley-mobile/Debug/DebugViewModel.swift:11`).

### Dependency injection

The repository uses FactoryKit for dependency injection of view models. `berkeley-mobile/BerkeleyMobile+Injection.swift` defines an `extension Container` registering `Factory<T>` providers (e.g. `homeViewModel`, `safetyViewModel`, `eventsViewModel`, `feedbackFormViewModel`, `searchViewModel`) with lifetime scopes (`.shared`, `.singleton`, or unscoped). Views/view controllers consume these via the `@Injected` / `@InjectedObject` / `@InjectedObservable` property wrappers (e.g. `berkeley-mobile/TabBarController.swift:15`, `berkeley-mobile/Home/Map/MapUserLocationButton.swift:34`, `berkeley-mobile/FeedbackForm/FeedbackFormView.swift:14`).

### Data layer

- `berkeley-mobile/Data/DataManager.swift` — singleton (`DataManager.shared`) coordinating fetches from a fixed list of `DataSource`-conforming types (`kDataSources`: `MapDataSource`, `LibraryDataSource`, `GymDataSource`, `berkeley-mobile/Data/DataManager.swift:12-16`). Uses a `DispatchGroup`-per-source pattern to fetch each source from Firestore only once, caching results in an `AtomicDictionary<String, [Any]>` (`berkeley-mobile/Utils/AtomicDictionary.swift`).
- `berkeley-mobile/Data/DataSource.swift` — defines the `DataSource` protocol contract: a static `fetchItems(_:)` method and a static `fetchDispatch: DispatchGroup`.
- Concrete data sources fetch directly from `Firestore.firestore()` and parse Firestore documents into model structs, e.g. `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift` (collection `"Map Marker"`), `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift` (collection `"Libraries"`), `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift` (collection `"Gyms"`).
- `berkeley-mobile/Data/BMNetworkingManager.swift` — a second, `async`/`await`-based singleton (`BMNetworkingManager.shared`) that fetches Safety logs and Resource categories directly via `Firestore.firestore()` using `Codable` decoding (`try await collection.getDocuments()` + `$0.data(as: T.self)`), independent of `DataManager`.
- `berkeley-mobile/Data/ItemProtocols/` defines shared model capability protocols consumed across features: `SearchItem`, `HasLocation`, `HasImage`, `HasName`, `HasOpenTimes`, `HasOpenClosedStatus`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `BMCalendarEvent`.
- `berkeley-mobile/Data/BMLocationManager.swift` — singleton wrapper (`BMLocationManager.shared`) around `CLLocationManager`, broadcasting location updates via `NotificationCenter` (`.locationUpdated`).

### Error handling

`berkeley-mobile/Data/BMError.swift` defines a repository-specific `enum BMError: Error` (calendar-related cases) conforming to `LocalizedError`, used for surfacing user-facing error messages. Data-source fetch errors elsewhere are generally handled by printing to console (e.g. `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift:24-26`) rather than propagating typed errors — see `docs/code-conventions.md`.

## Deployment / Runtime Model

- Built with Xcode via the `berkeley-mobile.xcworkspace` (required because CocoaPods is used — `Podfile`). The shared scheme `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` builds product `Berkeley.app`.
- `MARKETING_VERSION` is currently `11.14.1` and `CURRENT_PROJECT_VERSION` is `1` (`berkeley-mobile.xcodeproj/project.pbxproj`).
- The app declares background modes `fetch` and `remote-notification`, and usage descriptions for Calendar and Location access (`berkeley-mobile/Info.plist`).
- A companion WidgetKit extension target, `BerkeleyMobileWidgetExtension`, ships gym-occupancy data via `BerkeleyMobileWidget/GymOccupancyWidget.swift`.
- Firebase configuration file (`GoogleService-Info.plist`) is explicitly excluded from the repository per `README.md` ("The production backend API key and GoogleService-Info.plist are not included in this repository").
- Not found in codebase: automated CI/CD, containerization, or server-side deployment configuration — this repository contains only the mobile client.
