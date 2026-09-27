# Technical Overview

## Repository Classification

Mobile application (native iOS). LEVEL 1 — the repository contains an Xcode project (`berkeley-mobile.xcodeproj`), an `.xcworkspace`, a `Podfile` managed by CocoaPods, and Swift source files under `berkeley-mobile/`.

## Purpose

LEVEL 1 — `README.md` states this repository is "the official repository for the Berkeley Mobile iOS application," described as providing "Bear Transit routes, library and gym information, dining hall menus, and campus resources." The app is a product of the ASUC Office of the Chief Technology Officer (OCTO) (`README.md`).

## Languages and Platform

- LEVEL 1 — The application is written in Swift. `SWIFT_VERSION = 5.0` is set in `berkeley-mobile.xcodeproj/project.pbxproj`.
- LEVEL 1 — The main app target (`berkeley-mobile`) declares `IPHONEOS_DEPLOYMENT_TARGET` values of 17.0 and 18.0 across build configurations (`berkeley-mobile.xcodeproj/project.pbxproj`). Not found in codebase: a single unambiguous minimum deployment target, since two different values (17.0 and 18.0) appear in different configuration blocks.
- LEVEL 1 — The build product name is `Berkeley` (`PRODUCT_NAME = Berkeley;` in `berkeley-mobile.xcodeproj/project.pbxproj`), while the Xcode target/blueprint name is `berkeley-mobile`.
- LEVEL 1 — App version at the time of analysis: `MARKETING_VERSION = 11.14.1` (`berkeley-mobile.xcodeproj/project.pbxproj`), consistent with the most recent commit message "update app version to 11.14.1".

## UI Frameworks

- LEVEL 1 — The repository mixes UIKit and SwiftUI. `grep` over `berkeley-mobile/**/*.swift` shows 66 files importing `SwiftUI` and 66 files importing `UIKit`.
- LEVEL 1 — UIKit view controllers are bridged into SwiftUI via `UIViewControllerRepresentable` in: `berkeley-mobile/Resources/SafariWebView.swift`, `berkeley-mobile/Home/Map/MapMarkersDropdownView.swift`, `berkeley-mobile/Home/Libraries/LibraryDetailViewController.swift`, `berkeley-mobile/Home/Fitness/GymDetailViewController.swift`, `berkeley-mobile/Home/Map/MapViewController.swift`.
- LEVEL 1 — The app entry point (`berkeley-mobile/AppDelegate.swift`, `berkeley-mobile/SceneDelegate.swift`) uses the UIKit `UIApplicationDelegate`/`UIWindowSceneDelegate` lifecycle. `SceneDelegate.scene(_:willConnectTo:options:)` sets the root view controller to `TabBarController()`.

## Major Technical Components

- LEVEL 1 — **App lifecycle**: `berkeley-mobile/AppDelegate.swift` configures Firebase (`FirebaseApp.configure()`), triggers `DataManager.shared.fetchAll()`, requests location via `BMLocationManager.shared.requestLocation()`, and registers push notification handling (`Messaging`, `UNUserNotificationCenter`).
- LEVEL 1 — **Version migration**: `berkeley-mobile/AppDelegate+Migration.swift` defines a `Version` struct and a `checkForUpdate()` routine that compares `CFBundleShortVersionString` against a `UserDefaults`-stored `LatestLaunchedVersion` key and runs one-time migrations (e.g., clearing Firebase Analytics/Firestore cache for versions below `10.0.1`).
- LEVEL 1 — **Data layer**: `berkeley-mobile/Data/DataManager.swift` is a singleton (`DataManager.shared`) that fetches from an array of `DataSource`-conforming types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) and caches results in an `AtomicDictionary<String, [Any]>`.
- LEVEL 1 — **Networking**: `berkeley-mobile/Data/BMNetworkingManager.swift` is a singleton (`BMNetworkingManager.shared`) wrapping `Firestore.firestore()` async calls (e.g., `fetchSafetyLogs()`, `fetchResourcesCategories()`).
- LEVEL 1 — **Dependency injection**: `berkeley-mobile/BerkeleyMobile+Injection.swift` extends `FactoryKit`'s `Container` with `Factory<...>` definitions for view models (e.g., `homeViewModel`, `safetyViewModel`, `guidesViewModel`), using `.shared`, `.singleton`, or unscoped lifetimes. 36 files reference `@Injected` (via `grep`).
- LEVEL 1 — **Widget extension**: `BerkeleyMobileWidget/` is a separate app-extension target (`productType = "com.apple.product-type.app-extension"` for `BerkeleyMobileWidgetExtension` in `project.pbxproj`) containing `BerkeleyMobileWidgetBundle.swift` and `GymOccupancyWidget.swift`.

## Backend / External Services

- LEVEL 1 — `Podfile` declares CocoaPods dependencies: `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, `GoogleSignIn` for the `berkeley-mobile` target, and `Firebase/Firestore` for the `BerkeleyMobileWidgetExtension` target.
- LEVEL 1 — Data is read from Google Cloud Firestore collections referenced by name as string literals, e.g. `"Map Marker"` (`MapDataSource.swift`), `"Libraries"` (`LibraryDataSource.swift`), `"Gyms"` (`GymDataSource.swift`), `"Gym Classes"` (`GymClassDataSource.swift`), and constants `BMConstants.safetyLogsCollectionName = "Safety Logs"` / `BMConstants.resourceCategoriesCollectionName = "Resource Categories"` (`berkeley-mobile/Data/BMConstants.swift`).
- LEVEL 1 — `README.md` states: "The application pulls data from Google Cloud Firestore... The production backend API key and GoogleService-Info.plist are not included in this repository." Not found in codebase: `GoogleService-Info.plist` (confirmed absent by file search), consistent with this statement.
- LEVEL 1 — `AppDelegate.swift` imports `GoogleSignIn`, and the `Podfile` includes `Firebase/Auth`. Not found in codebase: any other file importing `GoogleSignIn`/`FirebaseAuth` beyond `AppDelegate.swift` — sign-in/auth usage appears limited to that import in the inspected files.
- LEVEL 1 — Push notifications: `AppDelegate.swift` implements `MessagingDelegate` (`didReceiveRegistrationToken`) and `UNUserNotificationCenterDelegate`, subscribing devices to the FCM topic `"all"`.
- LEVEL 2 — WeatherKit is used for weather data (`berkeley-mobile/Today/Tiles/Weather Tile/WeatherDataViewModel.swift` imports `WeatherKit` and calls `WeatherService.shared.weather(for:including:)`). This is an Apple framework capability; the repository's own usage is the `WeatherDataViewModel` class fetching current/daily forecasts for a fixed Berkeley coordinate.

## Deployment / Runtime Model

- LEVEL 1 — The app is built as a single iOS application target (`berkeley-mobile`, product `Berkeley.app`) plus a widget extension target (`BerkeleyMobileWidgetExtension`), defined in `berkeley-mobile.xcodeproj/project.pbxproj` and referenced from the shared scheme `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`.
- LEVEL 1 — Dependencies are vendored/managed via CocoaPods (`Podfile`, `Podfile.lock`, `Pods/` directory, `berkeley-mobile.xcworkspace` used to open the project with Pods integrated).
- Not found in codebase: any CI/CD pipeline configuration (no `.github/workflows`, no `Fastfile`/fastlane directory, no other CI YAML files were found in the repository).
