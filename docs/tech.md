# Technical Overview

## Repository Classification

- **Repository type:** Mobile application (native iOS)
- **Primary language:** Swift
- **Frameworks/platforms:** UIKit, SwiftUI (mixed), WidgetKit
- **Runtime model:** Native iOS application with a WidgetKit extension
- **Deployment model:** App Store distribution (`org.asuc.ASUC` bundle identifier, per `berkeley-mobile.xcodeproj/project.pbxproj`)
- **Architectural style:** MVVM-oriented, with UIKit view controllers hosting SwiftUI views via `UIHostingController`

## Repository Purpose

The repository implements the Berkeley Mobile iOS application, described in `README.md` as providing "Bear Transit routes, library and gym information, dining hall menus, and campus resources." The application is a product of the ASUC Office of the Chief Technology Officer (OCTO), per `README.md`.

## Languages and Frameworks

### Direct Repository Evidence

- The codebase is implemented in Swift (`SWIFT_VERSION = 5.0;` in `berkeley-mobile.xcodeproj/project.pbxproj`).
- The application target imports `UIKit` (e.g. `berkeley-mobile/AppDelegate.swift:13`) and `SwiftUI` (e.g. `berkeley-mobile/TabBarController.swift:11`), and mixes both: `TabBarController` (`berkeley-mobile/TabBarController.swift`) is a `UITabBarController` whose tabs host `UIHostingController`-wrapped SwiftUI views (`TodayView`, `SafetyView`, `ResourcesView`).
- `berkeley-mobile/MainContainerViewController.swift` is a `UIViewController` that embeds a SwiftUI `HomeView` via `UIHostingController`.
- Dependency management uses CocoaPods (`Podfile`, `Podfile.lock`) and Swift Package Manager (`berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`).

### CocoaPods Dependencies (from `Podfile`)

- `Firebase/Analytics`
- `Firebase`
- `FirebaseMessaging`
- `Firebase/Firestore`
- `Firebase/Auth`
- `GoogleSignIn`

The `Podfile` defines two targets: `berkeley-mobile` (main app, uses all pods above) and `BerkeleyMobileWidgetExtension` (uses `Firebase/Firestore` only).

### Swift Package Manager Dependencies (from `Package.resolved`)

- `Factory` (`https://github.com/hmlongco/Factory.git`, version 2.5.3) — used as `FactoryKit` in source (e.g. `berkeley-mobile/BerkeleyMobile+Injection.swift:9`)
- `Glur` (`https://github.com/joogps/Glur.git`, version 1.1.0)

### Firebase Usage

The repository implements Firebase integration at startup: `AppDelegate.application(_:didFinishLaunchingWithOptions:)` calls `FirebaseApp.configure()` (`berkeley-mobile/AppDelegate.swift:21`). The application uses `FirebaseMessaging` (`Messaging.messaging().delegate = self`, `berkeley-mobile/AppDelegate.swift:27`) and `Firestore` for data retrieval (`berkeley-mobile/Data/BMNetworkingManager.swift:15`, `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift:20`, `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift:22`, `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift:23`).

`GoogleSignIn` is imported in `berkeley-mobile/AppDelegate.swift:12`. A Google client URL scheme is registered in `berkeley-mobile/Info.plist:26` (`com.googleusercontent.apps.592064103331-...`). Not found in codebase: an explicit call site invoking `GIDSignIn` sign-in flow within the inspected files.

## Runtime Architecture

### Application Lifecycle

- The app uses the UIKit application lifecycle with Scenes: `AppDelegate` (`berkeley-mobile/AppDelegate.swift`) is annotated `@UIApplicationMain` and implements `UIApplicationDelegate`.
- `SceneDelegate` (`berkeley-mobile/SceneDelegate.swift`) implements `UIWindowSceneDelegate` and sets the root view controller to `TabBarController()` (`berkeley-mobile/SceneDelegate.swift:18`).
- On launch, `AppDelegate` calls `DataManager.shared.fetchAll()` and `BMLocationManager.shared.requestLocation()` (`berkeley-mobile/AppDelegate.swift:24-25`).
- On scene foreground, `SceneDelegate.sceneWillEnterForeground` calls `DataManager.shared.fetchIfNecessary()` (`berkeley-mobile/SceneDelegate.swift:44`).
- `AppDelegate+Migration.swift` implements a version-based migration mechanism (`checkForUpdate()`) that compares the last-launched app version against the current version and runs registered migrations (e.g. clearing Firebase Analytics/Firestore caches for versions prior to `10.0.1`).

### Navigation Structure

- Root navigation is a `UITabBarController` subclass, `TabBarController` (`berkeley-mobile/TabBarController.swift:13`), with four tabs: `MainContainerViewController` (Home), `TodayView` (Today, SwiftUI), `SafetyView` (Safety, SwiftUI), `ResourcesView` (Resources, SwiftUI) — `berkeley-mobile/TabBarController.swift:17-20, 64-69`.
- `MainContainerViewController` (`berkeley-mobile/MainContainerViewController.swift`) hosts a SwiftUI `HomeView` and conforms to `MainDrawerViewDelegate` for a custom drawer UI (`berkeley-mobile/Drawer/MainDrawerViewDelegate.swift`).
- A custom drawer system (`berkeley-mobile/Drawer/`) manages stacked, draggable panels (`DrawerViewDelegate`, `MainDrawerViewDelegate`, `DrawerViewController`, `SearchDrawerViewDelegate`, `SearchDrawerViewController`, `BarView`).

### Dependency Injection

The repository implements dependency injection using the `FactoryKit` package. `berkeley-mobile/BerkeleyMobile+Injection.swift` extends `Container` with `Factory<T>` properties for view models (e.g. `homeViewModel`, `safetyViewModel`, `resourcesViewModel`, `eventsViewModel`, `feedbackFormViewModel`, `gymOccupancyViewModel`), registered with lifetimes `.shared` or `.singleton`. View controllers and views consume these via the `@Injected` property wrapper (e.g. `berkeley-mobile/MainContainerViewController.swift:15`, `berkeley-mobile/TabBarController.swift:15`).

### Data Layer

- `DataManager` (`berkeley-mobile/Data/DataManager.swift:18`) is a singleton (`DataManager.shared`) that coordinates fetching from a fixed list of `DataSource`-conforming types: `MapDataSource`, `LibraryDataSource`, `GymDataSource` (`berkeley-mobile/Data/DataManager.swift:12-16`). It throttles refetching using `fetchInterval` (1 hour, `berkeley-mobile/Data/DataManager.swift:24`) and stores fetched data in an `AtomicDictionary<String, [Any]>` (`berkeley-mobile/Data/DataManager.swift:26`).
- The `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift:11`) requires a static `fetchItems(_:)` method and a static `fetchDispatch: DispatchGroup` used to prevent duplicate concurrent Firestore fetches.
- `BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift:12`) is a separate singleton used by `ResourcesViewModel` and `SafetyViewModel` for async/await-based Firestore queries (`fetchSafetyLogs()`, `fetchResourcesCategories()`), decoding documents directly into `Codable` structs (`BMSafetyLog`, `BMResourceCategory`) via `Firestore.Decoder` (`$0.data(as:)`).
- Individual data source types (e.g. `GymDataSource`, `MapDataSource`, `LibraryDataSource`) each query a specific Firestore collection and manually parse `[String: Any]` documents into typed model structs/classes (e.g. `BMGym`, `MapMarker`, `BMLibrary`).

### Error Handling

The repository defines `BMError` (`berkeley-mobile/Data/BMError.swift:11`), an `Error`-conforming enum with cases for calendar-related failures, and implements `LocalizedError` for user-facing messages. UI-facing error/notice presentation uses `BMAlert` (`berkeley-mobile/Common/BMAlert.swift:12`), an `Identifiable`/`Equatable` struct with a `BMAlertType` (`.action`/`.notice`), consumed by SwiftUI view models (e.g. `SafetyViewModel.alert`, `berkeley-mobile/Safety/SafetyViewModel.swift:68`).

## Major Technical Components

| Component | Evidence |
|---|---|
| `AppDelegate` / `SceneDelegate` | App/scene lifecycle, Firebase configuration, push notification setup (`berkeley-mobile/AppDelegate.swift`, `berkeley-mobile/SceneDelegate.swift`) |
| `DataManager` / `DataSource` | Firestore data fetch orchestration (`berkeley-mobile/Data/DataManager.swift`, `berkeley-mobile/Data/DataSource.swift`) |
| `BMNetworkingManager` | Async/await Firestore queries for Safety and Resources features (`berkeley-mobile/Data/BMNetworkingManager.swift`) |
| `TabBarController` | Root tab navigation (`berkeley-mobile/TabBarController.swift`) |
| Drawer system | Custom bottom-sheet/drawer UI framework (`berkeley-mobile/Drawer/`) |
| Dependency injection container | `FactoryKit`-based DI (`berkeley-mobile/BerkeleyMobile+Injection.swift`) |
| `BMLocationManager` | Location services (referenced in `berkeley-mobile/AppDelegate.swift:25`; defined in `berkeley-mobile/Data/BMLocationManager.swift`) |
| Feature modules | `Home` (Map, Dining, Fitness, Libraries, Guides, Search), `Today` (News/Weather tiles), `Safety`, `Resources`, `Events`, `FeedbackForm`, `Debug` — each under `berkeley-mobile/<ModuleName>/` |
| `BerkeleyMobileWidget` | A separate WidgetKit extension target showing gym occupancy (`BerkeleyMobileWidget/GymOccupancyWidget.swift`, `BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift`) |

## Deployment / Runtime Model

- `IPHONEOS_DEPLOYMENT_TARGET = 18.0` for the main app target and `17.0` for the widget extension target, per `berkeley-mobile.xcodeproj/project.pbxproj`. (A separate `IPHONEOS_DEPLOYMENT_TARGET = 13.0` entry also appears in the project file's base/project-level build settings.)
- `MARKETING_VERSION = 11.14.1` for the main app target; `MARKETING_VERSION = 1.0` for the widget extension target.
- Bundle identifiers: `org.asuc.ASUC` (main app), `org.asuc.ASUC.BerkeleyMobileWidget` (widget extension).
- The app requests background modes `fetch` and `remote-notification` (`berkeley-mobile/Info.plist:74-78`).
- `berkeley-mobile/berkeley-mobile.entitlements` declares `aps-environment: development` and `com.apple.developer.weatherkit: true`.
- `NSAppTransportSecurity` / `NSAllowsArbitraryLoads` is set to `true` in `berkeley-mobile/Info.plist:36-37`.
- Not found in codebase: CI/CD pipeline configuration (no `.github/workflows`, `Fastfile`, or other CI definitions were found in the inspected repository areas).

## Framework Capability Notes (Level 2)

- WidgetKit supports home-screen widgets; the repository implements this via `BerkeleyMobileWidgetBundle` and `GymOccupancyWidget` (Level 1 usage confirmed in `BerkeleyMobileWidget/`).
- Firebase supports Authentication, Analytics, Cloud Messaging, and Firestore as separate products; the repository's `Podfile` includes `Firebase/Auth`, but a production authentication call site (e.g., `Auth.auth().signIn`) was not found in inspected repository areas.
