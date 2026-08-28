# Technical Overview

## Repository Classification

- **Repository type:** Mobile application (native iOS).
- **Primary language:** Swift.
- **Primary framework/platform:** Apple UIKit and SwiftUI, targeting iOS via Xcode.
- **Runtime model:** Native iOS application process, with a separate WidgetKit app-extension process.
- **Deployment model:** Xcode project archived and distributed as an iOS app (App Store), evidenced by `berkeley-mobile.xcodeproj`, `berkeley-mobile.xcworkspace`, and the `README.md` reference to the App Store listing.

Evidence: `Podfile`, `berkeley-mobile.xcodeproj/project.pbxproj`, `berkeley-mobile.xcworkspace`, `README.md`.

## Purpose (per repository evidence)

`README.md` states this is the official repository for the "Berkeley Mobile" iOS application, maintained by the ASUC Office of the Chief Technology Officer (OCTO). The README describes application features as: Bear Transit routes, library and gym information, dining hall menus, and campus resources.

## Languages and Frameworks

### Direct repository evidence (Level 1)

- **Swift** is the implementation language for all application source files under `berkeley-mobile/` and `BerkeleyMobileWidget/` (e.g. `berkeley-mobile/AppDelegate.swift`, `berkeley-mobile/TabBarController.swift`).
- **UIKit** is used for the app's window/scene lifecycle and root navigation: `berkeley-mobile/AppDelegate.swift` declares `class AppDelegate: UIResponder, UIApplicationDelegate`, and `berkeley-mobile/TabBarController.swift` declares `class TabBarController: UITabBarController, UITabBarControllerDelegate`.
- **SwiftUI** is used for individual screens, hosted inside UIKit view controllers via `UIHostingController` — e.g. `berkeley-mobile/TabBarController.swift` wraps `TodayView()`, `SafetyView()`, and `ResourcesView()` in `UIHostingController`.
- **WidgetKit** is used for a home-screen widget extension: `BerkeleyMobileWidget/GymOccupancyWidget.swift` defines `GymOccupancyWidget: Widget` with a `TimelineProvider`.
- **Firebase** is imported and configured: `berkeley-mobile/AppDelegate.swift` calls `FirebaseApp.configure()`, and imports include `Firebase`, `FirebaseCore`, `FirebaseMessaging`.
  - **Firebase/Firestore** is used as the remote data store: `berkeley-mobile/Data/BMNetworkingManager.swift` uses `Firestore.firestore()` to query collections (`BMConstants.safetyLogsCollectionName`, `BMConstants.resourceCategoriesCollectionName`).
  - **Firebase Analytics** is used: `berkeley-mobile/AppDelegate+Migration.swift` calls `Analytics.resetAnalyticsData()`.
  - **FirebaseMessaging** (push notifications) is used: `AppDelegate` conforms to `MessagingDelegate` and subscribes to topic `"all"`.
- **GoogleSignIn** is declared as a dependency in `Podfile` (`pod 'GoogleSignIn'`) and imported in `berkeley-mobile/AppDelegate.swift`.
- **FactoryKit** is used for dependency injection: `berkeley-mobile/BerkeleyMobile+Injection.swift` defines an `extension Container` registering view models as `Factory<T>` values (e.g. `.shared`, `.singleton`), and consumers use the `@Injected(\.homeViewModel)` property wrapper (e.g. `berkeley-mobile/MainContainerViewController.swift`, `berkeley-mobile/TabBarController.swift`).

### Dependency management (Level 1)

- **CocoaPods** is used, per the root `Podfile` and `Podfile.lock`, and a checked-in `Pods/` directory. The `Podfile` declares two targets:
  - `berkeley-mobile` — pods: `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, `GoogleSignIn`.
  - `BerkeleyMobileWidgetExtension` — pod: `Firebase/Firestore`.
- **Swift Package Manager (SPM)** is also used, per `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`, which resolves the `FactoryKit` package referenced in `berkeley-mobile.xcodeproj/project.pbxproj`.

## Runtime Architecture

### Application targets (Level 1)

Two native targets are defined in `berkeley-mobile.xcodeproj/project.pbxproj`:
- `berkeley-mobile` — `productType = "com.apple.product-type.application"` (the main iOS app).
- `BerkeleyMobileWidgetExtension` — `productType = "com.apple.product-type.app-extension"` (the WidgetKit extension, source in `BerkeleyMobileWidget/`).

### App entry point and lifecycle (Level 1)

- `berkeley-mobile/AppDelegate.swift` is annotated `@UIApplicationMain` and is the app's entry point.
- On launch (`application(_:didFinishLaunchingWithOptions:)`), the app: configures Firebase (`FirebaseApp.configure()`), increments an app-launch counter in `UserDefaults`, runs a version-based migration check (`checkForUpdate()`, defined in `berkeley-mobile/AppDelegate+Migration.swift`), triggers `DataManager.shared.fetchAll()`, requests location via `BMLocationManager.shared.requestLocation()`, and registers for push notifications.
- `berkeley-mobile/SceneDelegate.swift` and the `UIScene` lifecycle methods in `AppDelegate` handle scene configuration (`UIApplicationDelegate` scene APIs).
- `berkeley-mobile/TabBarController.swift` (a `UITabBarController`) is composed of four tabs: `MainContainerViewController` (Home/Map), `TodayView` (SwiftUI, hosted), `SafetyView` (SwiftUI, hosted), and `ResourcesView` (SwiftUI, hosted).
- `berkeley-mobile/MainContainerViewController.swift` hosts the SwiftUI `HomeView` inside a `UIHostingController` and implements `MainDrawerViewDelegate` for the custom drawer UI (`berkeley-mobile/Drawer/`).

### Data/networking layer (Level 1)

- `berkeley-mobile/Data/DataManager.swift` is a singleton (`DataManager.shared`) that fetches and caches data from a fixed list of `DataSource`-conforming types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`), using `DispatchGroup` to coordinate one-time fetches per source and an in-memory `AtomicDictionary` cache (`berkeley-mobile/Utils/AtomicDictionary.swift`).
- `berkeley-mobile/Data/DataSource.swift` defines the `DataSource` protocol (`fetchItems`, `fetchDispatch`) implemented by individual data sources.
- `berkeley-mobile/Data/BMNetworkingManager.swift` is a separate singleton (`BMNetworkingManager.shared`) that performs `async`/`await` Firestore queries for safety logs and resource categories, decoding documents via `Codable` (`$0.data(as: BMSafetyLog.self)`).
- View-model classes (e.g. `berkeley-mobile/Resources/ResourcesViewModel.swift`, `berkeley-mobile/Safety/SafetyViewModel.swift`) are `ObservableObject` types that call into `BMNetworkingManager` from `Task` blocks and publish results via `@Published` properties.

### State management (Level 1)

View models are `ObservableObject` classes with `@Published` properties, instantiated and shared via FactoryKit `Factory` scopes (`.shared`, `.singleton`) declared in `berkeley-mobile/BerkeleyMobile+Injection.swift`, and consumed via the `@Injected` property wrapper.

## Major Technical Components (by top-level folder)

Direct repository evidence — see `docs/structure.md` for full detail:
- `berkeley-mobile/Data` — data fetching/caching layer.
- `berkeley-mobile/Home` — home tab (map, dining, fitness, libraries, guides, search).
- `berkeley-mobile/Today` — "Today" tab and its tiles (weather, news, etc.).
- `berkeley-mobile/Safety` — safety tab (safety log list/map/filtering).
- `berkeley-mobile/Events` — calendar/events feature.
- `berkeley-mobile/FeedbackForm` — in-app feedback form presentation.
- `berkeley-mobile/Drawer` — custom bottom-sheet/drawer UI system.
- `berkeley-mobile/Common` — shared UI components.
- `berkeley-mobile/Utils` — Foundation/UIKit/SwiftUI extensions and utility types.
- `berkeley-mobile/Debug` — `#if DEBUG`-only debug screen (`DebugView`, `DebugViewModel`).
- `berkeley-mobile/Resources` — "Resources" tab.
- `BerkeleyMobileWidget` — WidgetKit app-extension target (home-screen widget).

## Deployment / Runtime Configuration (Level 1)

- iOS deployment target: `IPHONEOS_DEPLOYMENT_TARGET = 13.0` (main app configurations) and `18.0` (one configuration found in `berkeley-mobile.xcodeproj/project.pbxproj`, applicable to the widget extension target based on grep proximity).
- `README.md` recommends Xcode 10.2+ and Swift 5, and instructs contributors to run `pod install`.
- The production `GoogleService-Info.plist` (Firebase configuration) is not checked into the repository, per `README.md`: "The production backend API key and GoogleService-Info.plist ... are not included in this repository."

## Unknowns

- No CI/CD configuration (e.g. `.github/workflows`, `fastlane`, `Fastfile`) was found in the repository. Not found in codebase.
- No automated test target is configured: the only Xcode scheme (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`) has an empty `<Testables>` list in its `TestAction`, and no `XCTest`/`TEST_HOST` references were found in `project.pbxproj`. Not found in codebase.
