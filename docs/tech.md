# Technical Overview

## Repository Classification

- **Repository type**: Mobile application (iOS native).
- **Primary language**: Swift (176 `.swift` files under `berkeley-mobile/`, excluding `Pods/`).
- **Frameworks/platforms**: UIKit and SwiftUI (both present), Firebase (Firestore, Analytics, Auth, Messaging), GoogleSignIn, MapKit, CoreLocation.
- **Runtime model**: Native iOS app with an app-extension (widget) target.
- **Architectural style**: MVVM-leaning, with `DataSource`/`DataManager` abstractions for data fetching and a dependency-injection container (`FactoryKit`) wiring view models.

The repository implements the Berkeley Mobile iOS client, per `README.md`: "This is the official repository for the Berkeley Mobile iOS application" — a campus information app (dining, libraries, gyms, safety logs, events, maps, guides).

## Targets

The Xcode project (`berkeley-mobile.xcodeproj/project.pbxproj`) defines two native targets:

- `berkeley-mobile` (product name `bm-persona`, product `Berkeley.app`) — the main application, `IPHONEOS_DEPLOYMENT_TARGET = 18.0`.
- `BerkeleyMobileWidgetExtension` — a widget extension under `BerkeleyMobileWidget/`, `IPHONEOS_DEPLOYMENT_TARGET = 18.0`.

An older build configuration in the same file also references `IPHONEOS_DEPLOYMENT_TARGET = 13.0`, indicating multiple build configurations exist (Not found in codebase: which specific configuration each value applies to, beyond what is visible in `project.pbxproj`).

`SWIFT_VERSION = 5.0` is defined in the project build settings.

## Entry Points

- `berkeley-mobile/AppDelegate.swift` — implements `UIApplicationDelegate`. On launch it calls `FirebaseApp.configure()`, increments an app-launch counter via `UserDefaults.standard.increment(forKey:)`, calls `DataManager.shared.fetchAll()`, requests location via `BMLocationManager.shared.requestLocation()`, and configures push notifications (`UNUserNotificationCenter`, `Messaging.messaging().delegate`).
- `berkeley-mobile/SceneDelegate.swift` — scene lifecycle (UIKit `UIScene` API).
- `berkeley-mobile/TabBarController.swift` and `berkeley-mobile/MainContainerViewController.swift` — root UI containers.
- `BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift` — widget extension entry point.

## Dependency Management

- **CocoaPods** (`Podfile`, `Podfile.lock`): the main `berkeley-mobile` target depends on `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, and `GoogleSignIn`. The `BerkeleyMobileWidgetExtension` target depends on `Firebase/Firestore`. `Podfile.lock` pins `Firebase` to version `11.2.0` (and its subspecs).
- **Swift Package Manager** (`berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`): two packages are pinned —
  - `Factory` (`hmlongco/Factory`, version `2.5.3`) — used as the dependency-injection container (`FactoryKit`, see `BerkeleyMobile+Injection.swift`).
  - `Glur` (`joogps/Glur`, version `1.1.0`).

## Backend

The application uses Google Cloud Firestore as its backend data source. The repository implements Firestore-backed fetches in multiple places, e.g.:
- `berkeley-mobile/Data/BMNetworkingManager.swift` — `Firestore.firestore()`, collections `BMConstants.safetyLogsCollectionName` ("Safety Logs") and `BMConstants.resourceCategoriesCollectionName` ("Resource Categories").
- `berkeley-mobile/Home/Dining/DiningDataSource/DiningHallsViewModel.swift`, `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift`, `berkeley-mobile/Home/Guides/GuidesViewModel.swift` — each holds its own `Firestore.firestore()` instance and queries a named collection (e.g., `"Dining Halls V2"`, `"Events"`, `"Guides"`).

Per `README.md`: "The application pulls data from Google Cloud Firestore... The production backend API key and GoogleService-Info.plist are not included in this repository." The file `berkeley-mobile/GoogleService-Info.plist` is listed in `.gitignore` and is not present in version control.

## Major Technical Components

- **Data layer** (`berkeley-mobile/Data/`): `DataManager` (singleton cache/fetch coordinator over a fixed list of `DataSource` types), `DataSource` (protocol), `BMNetworkingManager` (Firestore access for Safety/Resources), `BMLocationManager` (CoreLocation wrapper, singleton), `BMEventManager` (calendar event integration), `BMConstants`, `BMError`.
- **Dependency injection** (`berkeley-mobile/BerkeleyMobile+Injection.swift`): extends `FactoryKit`'s `Container` with `Factory<...>` properties for each view model (e.g., `homeViewModel`, `safetyViewModel`, `eventsViewModel`, `resourcesViewModel`), each declared `.shared` or `.singleton`.
- **Feature modules** under `berkeley-mobile/`: `Home` (Map, Dining, Fitness, Libraries, Guides, Search), `Safety`, `Events`, `Resources`, `Today` (Tiles: News, Weather), `FeedbackForm`, `Debug`, `Drawer`, `Common` (shared UI components).
- **Widget extension** (`BerkeleyMobileWidget/`): `GymOccupancyWidget.swift`, `BerkeleyMobileWidgetBundle.swift`.

## UI Frameworks

Both UIKit (e.g., `MapViewController: UIViewController`, `TabBarController`) and SwiftUI (e.g., `OpenTimesCardSwiftUIView: View`, `@Observable` view models such as `EventsViewModel`, `GuidesViewModel`, `DiningHallsViewModel`) are used in the repository. Framework capability: SwiftUI's `@Observable` macro (module `Observation`) is used for state-observable view models.

## Deployment/Runtime Model

Not found in codebase: no CI/CD configuration (no `.github/workflows`, no `Fastfile`/fastlane directory, no other CI pipeline files) was found in the inspected repository areas. Build/deployment is presumed to occur via Xcode (`berkeley-mobile.xcworkspace`, scheme `berkeley-mobile`), consistent with `README.md`'s instruction to use Xcode and `pod install`.
