# Technical Overview

## Repository Classification

This repository is a **Mobile application** (iOS). Evidence: `berkeley-mobile.xcodeproj/project.pbxproj` defines a native target `berkeley-mobile` with `productType = "com.apple.product-type.application"` and a product reference `Berkeley.app` (project.pbxproj:1033, 1029). A second target, `BerkeleyMobileWidgetExtension`, has `productType = "com.apple.product-type.app-extension"` (project.pbxproj:1055).

## Purpose

Per `README.md`, the repository implements "Berkeley Mobile," an iOS application providing Bear Transit routes, library and gym information, dining hall menus, and campus resources for UC Berkeley students. The application is produced by the ASUC Office of the Chief Technology Officer (OCTO).

## Languages and Frameworks

- **Language**: Swift. `SWIFT_VERSION = 5.0` is set in build configurations (project.pbxproj:1527, 1553).
- **UI frameworks**: The repository implements screens using both `UIKit` (e.g. `berkeley-mobile/TabBarController.swift`, `berkeley-mobile/Home/Map/MapViewController.swift`) and `SwiftUI` (e.g. `berkeley-mobile/Home/HomeViewModel.swift` imports `SwiftUI`; `berkeley-mobile/Today/TodayView.swift`, `berkeley-mobile/Safety/SafetyView.swift`, `berkeley-mobile/Resources/ResourcesView.swift` are hosted via `UIHostingController` in `berkeley-mobile/TabBarController.swift`).
- **Backend/data platform**: The repository imports `Firebase`, `FirebaseCore`, `FirebaseMessaging`, and uses `Firestore` (Google Cloud Firestore) as the data backend. Evidence: `berkeley-mobile/Data/DataManager.swift`, `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift`, `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift`, `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift`, `berkeley-mobile/Data/BMNetworkingManager.swift` all call `Firestore.firestore()`.
- **Authentication**: `GoogleSignIn` is imported in `berkeley-mobile/AppDelegate.swift`. The `Podfile` also declares `pod 'Firebase/Auth'`.
- **Push notifications**: `FirebaseMessaging` is used in `berkeley-mobile/AppDelegate.swift` (`Messaging.messaging().delegate = self`, topic subscription `"all"`).
- **Location services**: `MapKit` and `CoreLocation` (`CLLocationManager`) are used in `berkeley-mobile/Data/BMLocationManager.swift`.

## Dependency Management

Two dependency managers are used together:
- **CocoaPods**: `Podfile` and `Podfile.lock` define pods for both the `berkeley-mobile` and `BerkeleyMobileWidgetExtension` targets — `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, `GoogleSignIn` (main target), and `Firebase/Firestore` (widget extension target).
- **Swift Package Manager**: `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved` pins two packages: `Factory` (dependency-injection library, `hmlongco/Factory`, v2.5.3) and `Glur` (`joogps/Glur`, v1.1.0). These are also listed as `packageProductDependencies` (`FactoryKit`, `Glur`) on the `berkeley-mobile` native target in `project.pbxproj:1023-1026`.

## Runtime Architecture

- **Application entry point**: `berkeley-mobile/AppDelegate.swift`, annotated `@UIApplicationMain`, implements `application(_:didFinishLaunchingWithOptions:)`. On launch it configures Firebase (`FirebaseApp.configure()`), triggers a data prefetch (`DataManager.shared.fetchAll()`), requests location access (`BMLocationManager.shared.requestLocation()`), and registers for push notifications.
- **Scene lifecycle**: `berkeley-mobile/SceneDelegate.swift` and `UISceneConfiguration` handling are present in `AppDelegate.swift` (`application(_:configurationForConnecting:options:)`).
- **Root UI controller**: `berkeley-mobile/TabBarController.swift` defines a `UITabBarController` that hosts four sections: a today view (`TodayView`, SwiftUI), a map/home view (`MainContainerViewController`, UIKit), a safety view (`SafetyView`, SwiftUI), and a resources view (`ResourcesView`, SwiftUI), each shown via `UIHostingController` where SwiftUI is used.
- **Data layer**: `berkeley-mobile/Data/DataManager.swift` is a singleton (`DataManager.shared`) that fetches from a fixed list of `DataSource` types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) and caches results in an `AtomicDictionary`. `berkeley-mobile/Data/DataSource.swift` defines the `DataSource` protocol (`fetchItems`, `fetchDispatch`).
- **Dependency injection**: `berkeley-mobile/BerkeleyMobile+Injection.swift` uses the `FactoryKit` package to register view models (e.g. `homeViewModel`, `eventsViewModel`, `resourcesViewModel`, `guidesViewModel`) as `.shared` or `.singleton` factories on a `Container`.

## App Extension

`BerkeleyMobileWidget/` contains a WidgetKit extension (`BerkeleyMobileWidgetBundle.swift`, `GymOccupancyWidget.swift`) that displays gym occupancy data using a `TimelineProvider` (`GymOccupancyProvider` in `berkeley-mobile/BerkeleyMobileWidget/GymOccupancyWidget.swift`... see `BerkeleyMobileWidget/GymOccupancyWidget.swift`). It shares the `Firebase/Firestore` pod dependency with the main app.

## Deployment / Build Configuration

- `IPHONEOS_DEPLOYMENT_TARGET` values found in build configurations: `13.0`, `17.0`, and `18.0` across different configuration blocks in `berkeley-mobile.xcodeproj/project.pbxproj` (varies by target/configuration; not a single repository-wide value).
- `MARKETING_VERSION = 11.14.1` is set for the main app target's Release-oriented configuration blocks (project.pbxproj:1524, 1549).
- The `README.md` states development is done with "XCode 10.2 or higher and Swift 5," and that CocoaPods must be installed and `pod install` run in the repository directory. A `GoogleService-Info.plist` (Firebase configuration) is referenced by the Xcode project (`project.pbxproj:136, 373`) but per `README.md` is "not included in this repository" for production use.

## Not Found in Codebase

- No CI/CD pipeline configuration files (e.g. GitHub Actions workflows, Fastlane `Fastfile`) were found in the repository root or standard locations.
- No `.swiftlint.yml` or SwiftFormat configuration file was found.
