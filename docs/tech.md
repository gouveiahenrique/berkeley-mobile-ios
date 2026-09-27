# Technical Overview

## Repository Identity

This repository (`berkeley-mobile-ios`) implements the Berkeley Mobile iOS application, a native mobile client for the University of California, Berkeley community, as stated in `README.md`. The repository implements a native iOS application project structured as an Xcode project (`berkeley-mobile.xcodeproj`) with a companion Xcode workspace (`berkeley-mobile.xcworkspace`) that integrates CocoaPods-managed dependencies.

Repository classification: **Mobile application (iOS)**.

## Languages and Frameworks

- The repository implements its application code in Swift (`SWIFT_VERSION = 5.0`, found in `berkeley-mobile.xcodeproj/project.pbxproj`).
- The repository implements UI using both `UIKit` (`UIViewController`, `UIView` subclasses throughout `berkeley-mobile/`) and `SwiftUI` (`View` structs, e.g. `berkeley-mobile/Home/HomeView.swift`, `berkeley-mobile/Today/TodayView.swift`). Several screens implement SwiftUI views wrapped in `UIViewControllerRepresentable` bridges to host existing `UIKit` view controllers (e.g. `berkeley-mobile/Home/Fitness/GymDetailViewController.swift`, `berkeley-mobile/Home/Libraries/LibraryDetailViewController.swift`).
- The application declares a `@UIApplicationMain` entry point in `berkeley-mobile/AppDelegate.swift`, and a `UIWindowSceneDelegate` entry point in `berkeley-mobile/SceneDelegate.swift`, confirming a `UIKit` application lifecycle with Scene-based window management (`IPHONEOS_DEPLOYMENT_TARGET = 18.0` for the primary app target, per `project.pbxproj`).
- A second target, `BerkeleyMobileWidgetExtension`, implements a WidgetKit extension. The repository defines its entry point via `@main struct BerkeleyMobileWidgetBundle: WidgetBundle` in `BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift`, which declares a single widget, `GymOccupancyWidget` (`BerkeleyMobileWidget/GymOccupancyWidget.swift`).

## Dependency Management

The repository uses two dependency managers concurrently:

- **CocoaPods** (`Podfile`, `Podfile.lock`, `COCOAPODS: 1.16.2`). The repository declares the following pod dependencies for the `berkeley-mobile` target: `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, `GoogleSignIn`. The `BerkeleyMobileWidgetExtension` target declares `Firebase/Firestore` only.
- **Swift Package Manager**, referenced directly in `berkeley-mobile.xcodeproj/project.pbxproj` via `XCRemoteSwiftPackageReference`, resolving two packages: `FactoryKit` (`https://github.com/hmlongco/Factory.git`) and `Glur` (`https://github.com/joogps/Glur.git`).

## Backend Integration

The repository implements backend communication exclusively through **Google Cloud Firestore** (per `README.md`: "The application pulls data from Google Cloud Firestore"). `FirebaseApp.configure()` is called in `AppDelegate.application(_:didFinishLaunchingWithOptions:)` (`berkeley-mobile/AppDelegate.swift:21`) and again conditionally in the widget bundle (`BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift:23-28`) to support the extension's separate process. The production Firebase configuration file `GoogleService-Info.plist` is excluded from the repository (declared in `.gitignore`, confirmed absent from disk), consistent with the README's statement that production credentials are not distributed with the repository.

Firebase Authentication (`Firebase/Auth`) and Google Sign-In (`GoogleSignIn`) pods are declared as dependencies; a specific usage site for these was not located within the discovery performed for this document — not found in codebase during this pass.

Firebase Cloud Messaging is implemented in `AppDelegate.swift`: the app registers `Messaging.messaging().delegate` and subscribes to the `"all"` topic on receipt of an FCM token (`AppDelegate.swift:75-87`), and requests remote notification authorization via `UNUserNotificationCenter`.

## Major Technical Components

- **`DataManager`** (`berkeley-mobile/Data/DataManager.swift`): a singleton (`DataManager.shared`) responsible for coordinating fetches from a fixed list of `DataSource`-conforming types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`, declared in the file-private `kDataSources` array). It de-duplicates concurrent fetches per source using a `DispatchGroup` and caches fetched results in an `AtomicDictionary`.
- **`DataSource` protocol** (`berkeley-mobile/Data/DataSource.swift`): declares the contract (`fetchItems(_:)`, `fetchDispatch`) implemented by feature-specific data sources such as `MapDataSource`, `LibraryDataSource`, `GymDataSource`, and `GymClassDataSource`, each of which queries a distinct Firestore collection (e.g. `"Map Marker"`, `"Libraries"`, `"Gyms"`, `"Gym Classes"`).
- **`BMNetworkingManager`** (`berkeley-mobile/Data/BMNetworkingManager.swift`): a newer, `async`/`await`-based singleton that queries Firestore collections directly via `Codable` decoding (`Firestore.getDocuments()` + `data(as:)`), covering the `"Safety Logs"` and `"Resource Categories"` collections (`BMConstants.safetyLogsCollectionName`, `BMConstants.resourceCategoriesCollectionName`).
- **`BMLocationManager`** (`berkeley-mobile/Data/BMLocationManager.swift`): a singleton wrapper around `CLLocationManager` that posts location updates via `NotificationCenter` under the `.locationUpdated` name.
- **Dependency injection container**: the repository implements dependency injection using the `FactoryKit` Swift package. `berkeley-mobile/BerkeleyMobile+Injection.swift` extends `Container` with `Factory<T>` properties for view models (e.g. `homeViewModel`, `diningHallsViewModel`, `eventsViewModel`, `safetyViewModel`), each configured with a lifetime (`.shared`, `.singleton`, or unscoped/default).
- **`ImageLoader`** (`berkeley-mobile/Common/Images/ImageLoader.swift`): a singleton that fetches and caches images via `URLSession.shared.dataTask`, tracking in-flight requests by `UUID`.
- **`TabBarController`** (`berkeley-mobile/TabBarController.swift`) and **`MainContainerViewController`** (`berkeley-mobile/MainContainerViewController.swift`): the root navigation surfaces installed as `window.rootViewController` in `SceneDelegate.scene(_:willConnectTo:options:)`.

## Runtime / Deployment Model

- The repository implements a client-only mobile application; there is no server-side code in this repository.
- The primary app target (`org.asuc.ASUC`, per `project.pbxproj`) targets iOS 18.0 (`IPHONEOS_DEPLOYMENT_TARGET = 18.0`); the widget extension target (`org.asuc.ASUC.BerkeleyMobileWidget`) targets iOS 17.0.
- Current marketing version is `11.14.1` for the main app and `1.0` for the widget extension (`MARKETING_VERSION`, `project.pbxproj`), consistent with the most recent commit message "update app version to 11.14.1" on this branch.
- No CI/CD configuration (e.g. `.github/workflows`, Fastlane `Fastfile`) was found in the repository during this pass — not found in codebase.
- No automated test target was found: the shared Xcode scheme (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`) declares an empty `<Testables>` block, and no `XCTest`-based test target exists in `project.pbxproj`.
