# Technical Overview

## Repository Classification

- **Repository type**: Mobile application (native iOS).
- **Primary language**: Swift (`SWIFT_VERSION = 5.0`, set in `berkeley-mobile.xcodeproj/project.pbxproj` build settings for all four build configurations found).
- **Frameworks/platforms**: UIKit and SwiftUI (both are imported throughout `berkeley-mobile/`), Firebase (Firestore, Analytics, Auth, Messaging), Google Sign-In, WidgetKit, MapKit.
- **Runtime model**: Native iOS application process plus a separate WidgetKit extension process.
- **Deployment model**: Xcode project built and archived via `berkeley-mobile.xcodeproj`; distributed as an iOS `.app` (App Store, per `README.md` link to the App Store listing). No CI/CD pipeline configuration (no `.github/workflows`, no `Fastfile`, no other YAML CI config) was found in the repository outside of `Pods/`.
- **Architectural style**: Modular, feature-folder UIKit/SwiftUI hybrid app using per-feature `ViewModel`/`View` (or `ViewController`) pairs, a shared Firestore-backed data layer, and constructor/property injection via the third-party `Factory` (`FactoryKit`) dependency-injection library.

## Repository Purpose

The repository implements the "Berkeley Mobile" iOS client, per `README.md`: an app providing Bear Transit routes, library and gym information, dining hall menus, and campus resources. It is maintained by the ASUC Office of the Chief Technology Officer (OCTO), per `README.md` and copyright headers such as `berkeley-mobile/AppDelegate.swift` ("Copyright © 2019 RJ Pimentel") and newer files ("Copyright © 2025 ASUC OCTO").

## Languages and Frameworks

Direct repository evidence (imports found in source files under `berkeley-mobile/` and `BerkeleyMobileWidget/`):

- `UIKit` — used by `AppDelegate.swift`, `SceneDelegate.swift`, `TabBarController.swift`, `MainContainerViewController.swift`, and multiple `*ViewController.swift` files (e.g. `berkeley-mobile/Home/Map/MapViewController.swift`, `berkeley-mobile/Home/Fitness/GymDetailViewController.swift`, `berkeley-mobile/Home/Libraries/LibraryDetailViewController.swift`, `berkeley-mobile/Drawer/DrawerViewController.swift`).
- `SwiftUI` — used by feature `*View.swift` files (e.g. `berkeley-mobile/Home/HomeView.swift`, `berkeley-mobile/Safety/SafetyView.swift`, `berkeley-mobile/Today/TodayView.swift`, `berkeley-mobile/Events/EventsView.swift`, `berkeley-mobile/FeedbackForm/FeedbackFormView.swift`) and by `BerkeleyMobileWidget/GymOccupancyWidget.swift`.
- `Firebase` / `FirebaseCore` / `FirebaseAnalytics` / `FirebaseMessaging` — configured in `berkeley-mobile/AppDelegate.swift` (`FirebaseApp.configure()`, `Messaging.messaging().delegate = self`) and `BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift` (`configureFirebaseIfNeeded()`).
- `Firestore` — used directly via `Firestore.firestore()` in data-source files such as `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift`, `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift`, and in `berkeley-mobile/Data/BMNetworkingManager.swift` (`db.collection(BMConstants.safetyLogsCollectionName)`, `db.collection(BMConstants.resourceCategoriesCollectionName)`).
- `GoogleSignIn` — imported in `AppDelegate.swift`; the app's `Info.plist` declares a Google Sign-In reversed-client-ID URL scheme (`com.googleusercontent.apps.592064103331-...`).
- `WidgetKit` — used in `BerkeleyMobileWidget/GymOccupancyWidget.swift` and `BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift`.
- `MapKit` — used in `berkeley-mobile/Data/BMConstants.swift` (`MKCoordinateRegion`) and `berkeley-mobile/Home/Map/MapViewController.swift`.
- `FactoryKit` — a Swift Package dependency declared in `berkeley-mobile.xcodeproj/project.pbxproj` (`XCRemoteSwiftPackageReference "Factory"`, repository `https://github.com/hmlongco/Factory.git`, minimum version 2.5.3), used for dependency injection via `@Injected` (e.g. `berkeley-mobile/MainContainerViewController.swift`, `berkeley-mobile/TabBarController.swift`) and container extensions in `berkeley-mobile/BerkeleyMobile+Injection.swift`.
- `Glur` — a second Swift Package dependency declared in `project.pbxproj` (`https://github.com/joogps/Glur.git`, minimum version 1.1.0).

CocoaPods dependencies are declared in `Podfile` for the `berkeley-mobile` target: `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, `GoogleSignIn`. The `BerkeleyMobileWidgetExtension` target depends on `Firebase/Firestore` only.

## Runtime Architecture

The repository defines two native targets in `berkeley-mobile.xcodeproj/project.pbxproj`:

1. **`berkeley-mobile`** (`productType = "com.apple.product-type.application"`, product name `Berkeley.app`) — the main iOS application, source in `berkeley-mobile/`.
2. **`BerkeleyMobileWidgetExtension`** (`productType = "com.apple.product-type.app-extension"`) — a WidgetKit app extension, source in `BerkeleyMobileWidget/`.

Both targets are built with `IPHONEOS_DEPLOYMENT_TARGET = 18.0` and `17.0` respectively (values found at different build-configuration blocks in `project.pbxproj`; the `berkeley-mobile` app target configurations show `IPHONEOS_DEPLOYMENT_TARGET = 18.0`, and the widget extension's configurations show `17.0`). `MARKETING_VERSION = 11.14.1` is set for the main app target; `PRODUCT_NAME = Berkeley`.

### Application entry and lifecycle

- `berkeley-mobile/AppDelegate.swift` is annotated `@UIApplicationMain` and is the app's entry point. On launch it calls `FirebaseApp.configure()`, increments an app-launch counter (`UserDefaults.standard.increment(forKey: UserDefaultsKeys.numAppLaunchForAppStoreReview)`), calls `self.checkForUpdate()`, `DataManager.shared.fetchAll()`, and `BMLocationManager.shared.requestLocation()`, and registers for push notifications (`UNUserNotificationCenter`, `application.registerForRemoteNotifications()`). It conforms to `UNUserNotificationCenterDelegate` and `MessagingDelegate` (Firebase Cloud Messaging token handling, posted via `NotificationCenter` under the name `"FCMToken"`).
- `berkeley-mobile/SceneDelegate.swift` implements `UIWindowSceneDelegate`; on `scene(_:willConnectTo:options:)` it creates a `TabBarController` as the root view controller. On `sceneWillEnterForeground`, it calls `DataManager.shared.fetchIfNecessary()`.
- `berkeley-mobile/TabBarController.swift` is a `UITabBarController` hosting four tabs, each wrapped as a `UIHostingController` except the Home/Map tab: `MainContainerViewController` (Home/Map), `UIHostingController(rootView: TodayView())`, `UIHostingController(rootView: SafetyView())`, `UIHostingController(rootView: ResourcesView())`. It also owns a `FeedbackFormPresenter` (injected via `@Injected(\.feedbackFormPresenter)`) that is asked to `attemptShowFeedbackForm()` in `viewDidLoad`. In `DEBUG` builds only, a shake gesture (`motionEnded`) presents `DebugView` (`#if DEBUG`).
- `berkeley-mobile/MainContainerViewController.swift` embeds a SwiftUI `HomeView` (via `UIHostingController`) inside a `UIViewController`, and conforms to `MainDrawerViewDelegate` for the app's custom bottom-sheet ("drawer") interaction.

### Data layer

- `berkeley-mobile/Data/DataManager.swift` is a singleton (`DataManager.shared`) that owns an in-memory `AtomicDictionary<String, [Any]>` cache and coordinates fetching from a fixed list of `DataSource` types (`kDataSources = [MapDataSource.self, LibraryDataSource.self, GymDataSource.self]`). It exposes `fetchAll()`, `fetchIfNecessary()` (throttled by `fetchInterval = 60 * 60` seconds), and `fetch(source:_:)`, and aggregates all cached items into a flattened `searchable: [SearchItem]` computed property.
- `berkeley-mobile/Data/DataSource.swift` defines the `DataSource` protocol (`static func fetchItems(_:)`, `static var fetchDispatch: DispatchGroup`) implemented by feature-specific data sources, e.g. `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift`, `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift`, `berkeley-mobile/Home/Fitness/GymClassDataSource/GymClassDataSource.swift`, `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift`. Each fetches documents directly from a named Firestore collection (e.g. `kLibrariesEndpoint = "Libraries"`, `kGymsEndpoint = "Gyms"`) and parses them into feature model structs (e.g. `BMLibrary`, `BMGym`).
- `berkeley-mobile/Data/BMNetworkingManager.swift` is a separate singleton (`BMNetworkingManager.shared`) using Swift `async`/`await` Firestore calls (`fetchSafetyLogs()`, `fetchResourcesCategories()`), distinct from the callback-based `DataManager`/`DataSource` path used by the Home-tab data sources.
- Shared model-capability protocols live in `berkeley-mobile/Data/ItemProtocols/`: `HasName`, `HasLocation`, `HasImage`, `HasOpenTimes`, `HasOpenClosedStatus`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `SearchItem`, `BMCalendarEvent`. Feature models compose these (e.g. `berkeley-mobile/Home/Libraries/LibraryDataSource/BMLibrary.swift` declares `struct BMLibrary: HomeDrawerSectionRowItemType, CanFavorite, HasPhoneNumber, HasOpenTimes`).

### Dependency injection

`berkeley-mobile/BerkeleyMobile+Injection.swift` extends the `Factory` library's `Container` type with `Factory<T>` definitions for the app's view models (e.g. `homeViewModel`, `safetyViewModel`, `eventsViewModel`, `feedbackFormViewModel`, `guidesViewModel`, `gymOccupancyViewModel`, `weatherDataViewModel`), each scoped `.shared` or `.singleton`. View controllers and views consume these via the `@Injected` property wrapper (Level 1: direct repository usage of the `Factory`/`FactoryKit` package, Level 2: the underlying capability — arbitrary scoping semantics like `.shared`/`.singleton`/`.cached` — is provided by the `Factory` package itself, not reimplemented in this repository).

### Widget extension

`BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift` is the `@main` entry point for the widget extension, configuring Firebase independently (guarded by `FirebaseApp.app() == nil`) and declaring a single widget, `GymOccupancyWidget` (`BerkeleyMobileWidget/GymOccupancyWidget.swift`). This widget uses a `TimelineProvider` (`GymOccupancyProvider`) that calls `GymOccupancyViewModel().fetchOccupancyPercentages()` — the same view-model class also used by `berkeley-mobile/Home/Fitness/GymOccupancy/GymOccupancyView.swift` in the main app target (confirmed by `project.pbxproj`, where `GymOccupancyViewModel.swift` has `PBXBuildFile` entries in both the `berkeley-mobile` and `BerkeleyMobileWidgetExtension` sources phases). The widget supports only the `.systemSmall` family and refreshes on a timeline policy (`.after(nextRefreshDate)`).

## Capabilities and Permissions

Directly declared in `berkeley-mobile/berkeley-mobile.entitlements`:
- `aps-environment: development` (Apple Push Notification service entitlement).
- `com.apple.developer.weatherkit: true`.

No App Groups or associated-domains entitlements were found in `berkeley-mobile/berkeley-mobile.entitlements` — not found in codebase.

Directly declared in `berkeley-mobile/Info.plist`:
- `UIBackgroundModes`: `fetch`, `remote-notification`.
- `NSCalendarsUsageDescription`, `NSCalendarsFullAccessUsageDescription` — calendar access, described as being "used to allow you to add events you select to your calendar."
- `NSLocationWhenInUseUsageDescription` — location access, described for distance calculation, map display, and other location-based features.
- `NSAppTransportSecurity` → `NSAllowsArbitraryLoads: true`.
- `UIApplicationSceneManifest` configured with a single scene, `SceneDelegate` as the delegate class, `UIApplicationSupportsMultipleScenes: false`.

## Deployment/Runtime Model

The repository is built with Xcode via `berkeley-mobile.xcodeproj` / `berkeley-mobile.xcworkspace` (the workspace is used because CocoaPods integration is present — `Podfile`, `Podfile.lock`, and a checked-in `Pods/` directory). One shared scheme is defined: `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`, which builds/runs/archives the `Berkeley.app` product; its `TestAction` has an empty `<Testables>` list. No automated build/release pipeline (e.g. GitHub Actions, Fastlane) was found in the repository.
