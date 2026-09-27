# Technical Overview

## Repository Classification

This repository is a **mobile application** repository (iOS). It contains an Xcode project (`berkeley-mobile.xcodeproj`) and workspace (`berkeley-mobile.xcworkspace`) with two build targets defined in `berkeley-mobile.xcodeproj/project.pbxproj`:

- `berkeley-mobile` (`productType = com.apple.product-type.application`) — the main iOS application.
- `BerkeleyMobileWidgetExtension` (`productType = com.apple.product-type.app-extension`) — a WidgetKit app extension, source under `BerkeleyMobileWidget/`.

## Purpose

The repository implements the Berkeley Mobile iOS application. Per `README.md`, the application provides Bear Transit routes, library and gym information, dining hall menus, and campus resources. The repository is described in `README.md` as maintained by the ASUC Office of the Chief Technology Officer (OCTO).

## Languages and Frameworks

- **Swift** is the implementation language. `SWIFT_VERSION = 5.0` is set for all targets in `berkeley-mobile.xcodeproj/project.pbxproj`.
- The repository implements UI using both **UIKit** (e.g. `berkeley-mobile/AppDelegate.swift`, `berkeley-mobile/SceneDelegate.swift`, `berkeley-mobile/TabBarController.swift`, `berkeley-mobile/Home/Map/MapViewController.swift`) and **SwiftUI** (e.g. views embedded via `UIHostingController` in `berkeley-mobile/TabBarController.swift:17-20`, and `Common/DetailView/OpenTimesCardSwiftUIView.swift`).
- The application uses **WidgetKit** and **SwiftUI** for the home-screen widget, defined in `BerkeleyMobileWidget/GymOccupancyWidget.swift` and `BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift`.
- The application uses **MapKit** for map rendering (`berkeley-mobile/Home/Map/MapViewController.swift` imports `MapKit` and uses `MKMapView`).
- The application uses **Combine**-adjacent Swift Observation via the `@Observable` macro for several view models (e.g. `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift:76-78` — `@MainActor @Observable class EventsViewModel`).

## Dependency Management

Two dependency managers are in use:

- **CocoaPods**, configured in `Podfile` and locked in `Podfile.lock`. The `berkeley-mobile` target depends on `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, and `GoogleSignIn`. The `BerkeleyMobileWidgetExtension` target depends on `Firebase/Firestore`.
- **Swift Package Manager**, resolved in `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`, pinning:
  - `Factory` (`hmlongco/Factory`, version `2.5.3`) — a dependency-injection library.
  - `Glur` (`joogps/Glur`, version `1.1.0`) — a SwiftUI blur/gradient library.

## Backend / Data Layer

- The repository implements Firebase/Firestore-backed data fetching. `berkeley-mobile/Data/BMNetworkingManager.swift` defines `BMNetworkingManager`, a singleton that queries Firestore collections (`BMConstants.safetyLogsCollectionName`, `BMConstants.resourceCategoriesCollectionName`) and decodes documents into `Codable` models (`BMSafetyLog`, `BMResourceCategory`).
- `berkeley-mobile/Data/DataManager.swift` defines `DataManager`, a singleton that coordinates fetching from a fixed list of `DataSource`-conforming types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) and caches results in an `AtomicDictionary`.
- `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift` defines `EventsDataService`, which queries a Firestore collection named `"Events"` and decodes `BerkeleyEventsDaySnapshot` documents.
- Firebase is initialized in `berkeley-mobile/AppDelegate.swift:21` via `FirebaseApp.configure()`. The production `GoogleService-Info.plist` is not included in this repository (stated in `README.md`).
- **Firebase Auth** and **GoogleSignIn** pods are declared in `Podfile`, indicating the application supports Google sign-in. Not found in codebase: a call site invoking `GIDSignIn` or `Auth.auth().signIn` within `berkeley-mobile/` source files inspected in this session.
- **Firebase Cloud Messaging** is implemented: `berkeley-mobile/AppDelegate.swift` conforms to `MessagingDelegate` and subscribes to a `"all"` topic (`AppDelegate.swift:86`).

## Runtime Architecture

- App entry point: `berkeley-mobile/AppDelegate.swift`, annotated `@UIApplicationMain`, implementing `UIApplicationDelegate`, `UNUserNotificationCenterDelegate`, and `MessagingDelegate`.
- Scene lifecycle: `berkeley-mobile/SceneDelegate.swift` implements `UIWindowSceneDelegate` and sets the root view controller to `TabBarController()`.
- Root navigation: `berkeley-mobile/TabBarController.swift` defines a `UITabBarController` subclass with four tabs: Home (`MainContainerViewController`), Today (`TodayView` via `UIHostingController`), Safety (`SafetyView` via `UIHostingController`), and Resources (`ResourcesView` via `UIHostingController`).
- Dependency injection: `berkeley-mobile/BerkeleyMobile+Injection.swift` extends `Container` (from the `FactoryKit`/Factory package) with `Factory<T>` registrations for view models such as `CalendarViewModel`, `DiningHallsViewModel`, `EventsViewModel`, `HomeViewModel`, `SafetyViewModel`, etc., using `.shared` and `.singleton` scopes.
- App version migrations: `berkeley-mobile/AppDelegate+Migration.swift` implements a `checkForUpdate()` method that compares the current `CFBundleShortVersionString` against a `UserDefaults`-stored last-launched version, and runs a cache-clearing migration (`clearCache`, calling `Analytics.resetAnalyticsData()` and `Firestore.firestore().clearPersistence`) when upgrading past version `10.0.1`.

## Deployment / Runtime Model

- `IPHONEOS_DEPLOYMENT_TARGET` values found in `berkeley-mobile.xcodeproj/project.pbxproj`: `18.0` for the `berkeley-mobile` app target's Debug/Release configurations, and `17.0` for the `BerkeleyMobileWidgetExtension` target's Debug/Release configurations. (One additional configuration block at line 1445/1499 specifies `13.0`; this session did not confirm which target/configuration that entry belongs to.)
- `MARKETING_VERSION = 11.14.1` for the `berkeley-mobile` app target; `MARKETING_VERSION = 1.0` for `BerkeleyMobileWidgetExtension`.
- `PRODUCT_BUNDLE_IDENTIFIER = org.asuc.ASUC` for the app target; `org.asuc.ASUC.BerkeleyMobileWidget` for the widget extension target.
- The application is distributed on the Apple App Store (stated in `README.md`, linking to an App Store listing).

## Analytics

The repository implements Firebase Analytics event logging at multiple call sites via `Analytics.logEvent(...)`, e.g. `berkeley-mobile/Home/Map/MapViewController.swift:376` (`"point_of_interest_clicked"`) and `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift:95,99` (`"opened_academic_calendar"`, `"opened_campus_wide_events"`).

## Not Found in Codebase

- A backend/server-side repository component (this repository contains only the iOS client).
- CI/CD pipeline configuration (no `.github/workflows` directory or other CI configuration files were found in this repository).
