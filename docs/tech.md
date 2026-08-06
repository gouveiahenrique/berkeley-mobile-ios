# Technical Overview

## Repository Classification

**Repository type:** Mobile application (native iOS).

**Evidence:** The repository root contains `berkeley-mobile.xcodeproj`, `berkeley-mobile.xcworkspace`, and a `Podfile` (CocoaPods dependency manifest). Source files use the `.swift` extension and import `UIKit`, `SwiftUI`, `MapKit`, and `Firebase` (e.g. `berkeley-mobile/AppDelegate.swift:9-14`).

## Repository Purpose

The repository implements `berkeley-mobile/README.md` states this is "the official repository for the Berkeley Mobile iOS application," described as providing Bear Transit routes, library and gym information, dining hall menus, and campus resources. This is documentation, not verified application behavior, but the codebase's module names (`Home/Fitness`, `Home/Libraries`, `Home/Dining`, `Safety`, `Events`) are consistent with this description (LEVEL 1: these directories exist in the repository).

## Languages and Frameworks

- **Language:** Swift. `SWIFT_VERSION = 5.0` is set in `berkeley-mobile.xcodeproj/project.pbxproj` for the application target's build configurations.
- **UI frameworks:** The repository implements UI using both `UIKit` (e.g. `berkeley-mobile/TabBarController.swift:13` extends `UITabBarController`) and `SwiftUI` (e.g. `TabBarController.swift:17-20` wraps SwiftUI views such as `TodayView`, `SafetyView`, `ResourcesView` in `UIHostingController`).
- **Minimum deployment targets:** `project.pbxproj` defines `IPHONEOS_DEPLOYMENT_TARGET` values of `13.0`, `17.0`, and `18.0` across different build configurations/targets. Not found in codebase: a single unambiguous minimum target applicable to all configurations — the value differs by target/configuration in the project file.
- **Dependency manager:** CocoaPods. The repository defines a `Podfile` with two targets: `berkeley-mobile` and `BerkeleyMobileWidgetExtension`.
- **Third-party dependencies declared in `Podfile`:**
  - `Firebase/Analytics`
  - `Firebase`
  - `FirebaseMessaging`
  - `Firebase/Firestore`
  - `Firebase/Auth`
  - `GoogleSignIn`
  - (Widget extension target additionally depends on `Firebase/Firestore`)
- **Dependency injection:** The repository uses the `FactoryKit` library. `berkeley-mobile/BerkeleyMobile+Injection.swift` defines `Factory` registrations on a shared `Container` for view models such as `HomeViewModel`, `SearchViewModel`, `SafetyViewModel`, `ResourcesViewModel`, etc. Consumers use the `@Injected` property wrapper (e.g. `berkeley-mobile/TabBarController.swift:15`).

## Runtime Architecture

- **App entry point:** `berkeley-mobile/AppDelegate.swift` is annotated `@UIApplicationMain` and implements `UIApplicationDelegate`. On launch (`application(_:didFinishLaunchingWithOptions:)`), it configures Firebase (`FirebaseApp.configure()`), triggers a data prefetch (`DataManager.shared.fetchAll()`), requests location (`BMLocationManager.shared.requestLocation()`), and registers for push notifications via `Messaging` (Firebase Cloud Messaging) and `UNUserNotificationCenter`.
- **Scene lifecycle:** The app uses the `UIScene` lifecycle (`UISceneSession`, `SceneDelegate` referenced in `AppDelegate.swift:39-43` and `AppDelegate.swift:66-68`). `berkeley-mobile/SceneDelegate.swift` was not read in full during this analysis; its existence is confirmed via the file `berkeley-mobile/SceneDelegate.swift` referenced from `AppDelegate.swift`.
- **Root navigation:** `TabBarController` (`berkeley-mobile/TabBarController.swift:13`) is a `UITabBarController` subclass that composes four tabs: `MainContainerViewController` (Home/map), a SwiftUI `TodayView`, a SwiftUI `SafetyView`, and a SwiftUI `ResourcesView` (`TabBarController.swift:64-69`).
- **Data layer:** `DataManager` (`berkeley-mobile/Data/DataManager.swift`) is a singleton (`DataManager.shared`) that coordinates fetching from a fixed list of `DataSource`-conforming types (`MapDataSource`, `LibraryDataSource`, `GymDataSource` — `DataManager.swift:12-16`), caching results in an `AtomicDictionary<String, [Any]>`, and using `DispatchGroup` to prevent duplicate concurrent Firebase fetches per source (`DataManager.swift:65-87`).
- **Backend:** The application implements data fetching from Google Cloud Firestore. Multiple `DataSource` implementations call `Firestore.firestore().collection(...).getDocuments()` (e.g. `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift:20-21`, `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift:22-23`, `berkeley-mobile/Data/BMNetworkingManager.swift:20-24`). The README states the production `GoogleService-Info.plist` and backend API key are not included in the repository; a `GoogleService-Info.plist` file reference does exist in `berkeley-mobile.xcodeproj/project.pbxproj:373`, but its contents were not inspected as part of this analysis.
- **Push notifications:** The repository implements Firebase Cloud Messaging via `MessagingDelegate` (`AppDelegate.swift:75-87`), subscribing the device to the `"all"` topic on token registration.
- **Location services:** `BMLocationManager` (`berkeley-mobile/Data/BMLocationManager.swift`) wraps `CLLocationManager` as a singleton and broadcasts location updates via `NotificationCenter` using the `.locationUpdated` notification name.
- **Widget extension:** The repository contains a second application target, `BerkeleyMobileWidgetExtension` (confirmed via `project.pbxproj` `productType = "com.apple.product-type.app-extension"` and the `BerkeleyMobileWidget/` directory containing `BerkeleyMobileWidgetBundle.swift` and `GymOccupancyWidget.swift`). This target also depends on `Firebase/Firestore` per the `Podfile`.
- **Version migration:** `berkeley-mobile/AppDelegate+Migration.swift` implements a `Version`-comparison-based migration mechanism (`checkForUpdate()`) that runs one-time cache-clearing logic (`Analytics.resetAnalyticsData()`, `Firestore.firestore().clearPersistence`) when the app is launched after an update, tracked via a `UserDefaults` key (`kLatestLaunchedVersionKey`).

## Deployment / Runtime Model

The framework (iOS/Xcode) supports building and distributing this application via the App Store, and the platform (Firebase) supports cloud-hosted backend services — these are platform capabilities. Not found in codebase: any CI/CD pipeline configuration, Fastlane configuration, or GitHub Actions workflow files were searched for and none were found in the repository (no `.github/` directory, no `Fastfile`, no `Gemfile`).

## Major Technical Components (by directory)

Directly observed top-level directories under `berkeley-mobile/`:
`Assets`, `Assets.xcassets`, `Base.lproj`, `Common`, `Data`, `Debug`, `Drawer`, `Events`, `FeedbackForm`, `Home`, `Resources`, `Safety`, `Today`, `Utils`. Each is documented in detail in `docs/structure.md`.
