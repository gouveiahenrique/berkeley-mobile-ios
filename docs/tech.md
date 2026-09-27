# Technical Overview

## Repository Purpose

This repository is the official iOS application for **Berkeley Mobile**, a campus companion app for UC Berkeley students, built and maintained by the ASUC Office of the Chief Technology Officer (OCTO). Per `README.md`, the app provides Bear Transit routes, library and gym information, dining hall menus, campus resources, safety logs, campus news, and weather, "all in one place for the busy Berkeley student."

The product name in code/bundles is `berkeley-mobile`; the historical/legacy name found in older file headers is `bm-persona`.

## Languages and Frameworks

- **Primary language:** Swift (`SWIFT_VERSION = 5.0`, per `berkeley-mobile.xcodeproj/project.pbxproj`).
- **UI frameworks:** Both **UIKit** (`UIViewController`, `UITabBarController`, `UICollectionView`, etc.) and **SwiftUI** (`View`, `@Observable`, `ObservableObject`) are used side by side. UIKit view controllers frequently host SwiftUI views via `UIHostingController` (e.g. `berkeley-mobile/TabBarController.swift`).
- **Deployment targets:** Multiple `IPHONEOS_DEPLOYMENT_TARGET` values are present in the project file: `13.0`, `17.0`, and `18.0`, indicating per-target/per-configuration minimums (main app vs. widget extension vs. newer OS-gated features such as `WeatherKit` and iOS 17+ EventKit APIs).

### Dependencies

Dependency management uses two systems:

- **CocoaPods** (`Podfile`, `Podfile.lock`, `Pods/`):
  - `Firebase` (core, `Firebase/Analytics`, `Firebase/Firestore`, `Firebase/Auth`)
  - `FirebaseMessaging`
  - `GoogleSignIn`
  - Two Podfile targets: `berkeley-mobile` (main app) and `BerkeleyMobileWidgetExtension` (widget, using only `Firebase/Firestore`).
- **Swift Package Manager** (`berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`):
  - `factory` (v2.5.3) — the `FactoryKit` dependency-injection library.
  - `glur` (v1.1.0) — used for progressive image blur effects (e.g. `NewsTileView.swift`).

### Apple frameworks in use (observed via imports)

`UIKit`, `SwiftUI`, `Foundation`, `MapKit`, `EventKit`, `WeatherKit`, `WidgetKit`, `Observation`, `os` (unified logging), `UserNotifications`, `CoreLocation`.

## Runtime Architecture

- **App entry point:** `berkeley-mobile/AppDelegate.swift` — configures Firebase, sets up push notification handling (`UNUserNotificationCenter`, `Messaging`), triggers an app-launch data fetch (`DataManager.shared.fetchAll()`), and requests the user's location (`BMLocationManager.shared.requestLocation()`).
- **Scene lifecycle:** `berkeley-mobile/SceneDelegate.swift` manages the `UIWindowScene`/`UIWindow` per the standard iOS Scene-based lifecycle.
- **Root navigation:** `berkeley-mobile/TabBarController.swift` is a `UITabBarController` with four tabs, each backed by a distinct top-level feature area:
  - Home (`MainContainerViewController` — map-centric drawer UI, UIKit)
  - Today (`TodayView` — SwiftUI, hosted via `UIHostingController`)
  - Safety (`SafetyView` — SwiftUI)
  - Resources (`ResourcesView` — SwiftUI)
- **Migration handling:** `berkeley-mobile/AppDelegate+Migration.swift` implements a version-gated migration mechanism (`Version` struct comparisons against a `UserDefaults`-persisted `LatestLaunchedVersion` key) to run one-time cache-clearing logic (Analytics + Firestore persistence) across app updates.
- **Dependency injection:** `berkeley-mobile/BerkeleyMobile+Injection.swift` extends `FactoryKit`'s `Container` to register app-wide view models as factories (`.shared`, `.singleton`, or default scope), consumed via the `@Injected` / `@InjectedObservable` property wrappers throughout the codebase.
- **Widget extension:** `BerkeleyMobileWidget/` is a separate WidgetKit target (`BerkeleyMobileWidgetBundle.swift`, `GymOccupancyWidget.swift`) that independently configures Firebase and shares the Firestore-backed data model with the main app.

## Major Technical Components

| Component | Responsibility | Evidence |
|---|---|---|
| `DataManager` | Singleton in-memory cache/fetch coordinator for Firestore-backed "data sources" (Map, Library, Gym); prevents duplicate concurrent fetches via `DispatchGroup` | `berkeley-mobile/Data/DataManager.swift` |
| `DataSource` protocol + implementations | Per-domain Firestore fetch/parse logic (`MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`) | `berkeley-mobile/Data/DataSource.swift`, `berkeley-mobile/Home/**/*DataSource.swift` |
| `BMNetworkingManager` | Newer async/await Firestore access layer for Safety Logs and Resource Categories | `berkeley-mobile/Data/BMNetworkingManager.swift` |
| `BMEventManager` | Wraps `EventKit` to add/remove/check calendar events for campus events, using async/await and `BMError` for domain errors | `berkeley-mobile/Data/BMEventManager.swift` |
| `BMLocationManager` | Location services (singleton, referenced in `AppDelegate`) | `berkeley-mobile/Data/BMLocationManager.swift` |
| Drawer system | Custom bottom-sheet UI (`DrawerViewController`, `DrawerViewDelegate`, `MainDrawerViewDelegate`) implementing a stack-based drawer presentation model with pan-gesture state transitions | `berkeley-mobile/Drawer/*.swift` |
| ItemProtocols | Shared capability protocols composed onto domain models (`HasLocation`, `HasOpenTimes`, `HasImage`, `HasName`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `SearchItem`) | `berkeley-mobile/Data/ItemProtocols/*.swift` |
| FactoryKit `Container` | Central DI registry for ViewModels | `berkeley-mobile/BerkeleyMobile+Injection.swift` |
| Feedback form | In-app feedback prompt system (`FeedbackFormPresenter`/`FeedbackFormViewModel`/`FeedbackFormView`), gated by app-launch count in `UserDefaults` | `berkeley-mobile/FeedbackForm/*.swift` |
| `ReviewPrompter` | App Store review prompt logic | `berkeley-mobile/Common/ReviewPrompter.swift` |
| Debug tools | `DebugView`/`DebugViewModel`, only compiled in `#if DEBUG`, reachable via a shake gesture in `TabBarController.motionEnded` | `berkeley-mobile/Debug/*.swift` |
| Widget | `GymOccupancyWidget` — a WidgetKit extension sharing the app's Firestore data | `BerkeleyMobileWidget/GymOccupancyWidget.swift` |

## Deployment / Runtime Model

- This is a native **iOS application** (not a server/service). There is no backend source code in this repository; the backend is **Google Cloud Firestore**, accessed directly from the client via the Firebase iOS SDK.
- `README.md` states production Firebase credentials (`GoogleService-Info.plist`) are intentionally excluded from the repository, and contributors must contact the maintainers for backend access — confirmed by the absence of `GoogleService-Info.plist` in the working tree.
- Push notifications use **Firebase Cloud Messaging** (`FirebaseMessaging`), with devices auto-subscribed to the `"all"` topic on token registration (`AppDelegate.swift`).
- The project defines one shared Xcode scheme, `berkeley-mobile.xcscheme` (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/`), targeting the product `Berkeley.app`. Build/test/profile/archive actions are declared, but the `TestAction`'s `<Testables>` list is empty (no test target wired to this scheme).
- No CI configuration files (e.g. `.github/workflows`, Fastlane) were found in the repository — not found in codebase.
