# Technical Overview

## Repository Classification

- **Repository type:** Mobile application (iOS native client).
- **Primary language:** Swift (`SWIFT_VERSION = 5.0`, per `berkeley-mobile.xcodeproj/project.pbxproj`).
- **Runtime model:** Native iOS app with a UIKit application shell hosting SwiftUI feature screens, plus a separate Home Screen Widget extension.
- **Deployment model:** Distributed as an App Store application (README references availability on "the App Store"). `MARKETING_VERSION = 11.14.1` is defined in `berkeley-mobile.xcodeproj/project.pbxproj`.

## Repository Purpose (evidence-based)

The repository implements the Berkeley Mobile iOS application, per `README.md`: "This is the official repository for the Berkeley Mobile iOS application." The README states the app provides "Bear Transit routes, library and gym information, dining hall menus, and campus resources." The repository is maintained by ASUC OCTO, per copyright headers across source files (e.g. `berkeley-mobile/Data/BMConstants.swift`: "Copyright © 2025 ASUC OCTO").

## Targets

The Xcode project (`berkeley-mobile.xcodeproj/project.pbxproj`) defines two build targets:

- `berkeley-mobile` — `productType = "com.apple.product-type.application"`, produces `Berkeley.app` (per `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`).
- `BerkeleyMobileWidgetExtension` — `productType = "com.apple.product-type.app-extension"`, source in `BerkeleyMobileWidget/`.

No test target (`com.apple.product-type.bundle.unit-test` or `.ui-testing`) is defined in `berkeley-mobile.xcodeproj/project.pbxproj` (searched, zero matches). The shared scheme's `<TestAction>` has an empty `<Testables>` list.

## Deployment targets

`project.pbxproj` declares `IPHONEOS_DEPLOYMENT_TARGET` values of `13.0`, `17.0`, and `18.0` across different build configurations/targets. Not found in codebase: a single authoritative minimum iOS version applicable to all configurations — the project defines the value per build configuration rather than as one global constant.

## UI Frameworks

The repository implements screens in both UIKit and SwiftUI:

- UIKit is used for application-shell classes: `AppDelegate` (`berkeley-mobile/AppDelegate.swift`), `SceneDelegate` (`berkeley-mobile/SceneDelegate.swift`), `TabBarController` (`berkeley-mobile/TabBarController.swift`, extends `UITabBarController`), and `MainContainerViewController` (`berkeley-mobile/MainContainerViewController.swift`, extends `UIViewController`).
- SwiftUI is used for feature screens embedded via `UIHostingController`, e.g. `TabBarController.swift`: `UIHostingController(rootView: TodayView())`, `UIHostingController(rootView: SafetyView())`, `UIHostingController(rootView: ResourcesView())`, and in `MainContainerViewController.swift`: `UIHostingController(rootView: HomeView(mapViewController: mapVC))`.
- 66 Swift files import `SwiftUI` and 66 import `UIKit` (counts from `grep -rl` across `berkeley-mobile/`), indicating substantial and comparable use of both frameworks. Not found in codebase: an explicit statement of which framework is considered primary going forward.

## Major Technical Components

- **`DataManager`** (`berkeley-mobile/Data/DataManager.swift`) — a singleton (`static let shared`) that fetches and caches data from a fixed list of `DataSource` types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`, declared as `kDataSources`), using `DispatchGroup` to fetch each source at most once and cache results in an `AtomicDictionary`.
- **`BMNetworkingManager`** (`berkeley-mobile/Data/BMNetworkingManager.swift`) — a singleton wrapping direct Firestore queries (`Firestore.firestore()`) for safety logs and resource categories, using Swift `async`/`await` and `Codable` document decoding (`try $0.data(as: BMSafetyLog.self)`).
- **`EventsDataService`** (`berkeley-mobile/Events/EventDataSource/EventsViewModel.swift`) — a Firestore-backed service that fetches and decodes calendar event day-snapshots into `BMEventCalendarEntry` domain objects.
- **`FactoryKit`-based dependency injection**: `berkeley-mobile/BerkeleyMobile+Injection.swift` defines an `extension Container` registering `Factory<T>` closures for view models (e.g. `homeViewModel`, `safetyViewModel`, `feedbackFormPresenter`) with lifetimes `.shared`, `.singleton`, or unscoped, consumed via the `@Injected`/`@InjectedObservable` property wrappers (e.g. `TabBarController.swift`: `@Injected(\.feedbackFormPresenter)`).
- **`BerkeleyMobileWidget`** (`BerkeleyMobileWidget/GymOccupancyWidget.swift`) — a WidgetKit `TimelineProvider` (`GymOccupancyProvider`) that fetches gym occupancy percentages via `GymOccupancyViewModel` and renders a Home Screen widget entry (`GymOccupancyEntry`).

## Third-Party Dependencies

Declared in `Podfile` (CocoaPods, target `berkeley-mobile`):
- `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`
- `GoogleSignIn`

Declared in `Podfile` (CocoaPods, target `BerkeleyMobileWidgetExtension`):
- `Firebase/Firestore`

Declared as Swift Package Manager remote packages in `berkeley-mobile.xcodeproj/project.pbxproj` (`XCRemoteSwiftPackageReference`):
- `https://github.com/hmlongco/Factory.git` (product `FactoryKit`) — dependency injection, used throughout view-model registration (`berkeley-mobile/BerkeleyMobile+Injection.swift`).
- `https://github.com/joogps/Glur.git` (product `Glur`).

## Push Notifications and Background Data

`AppDelegate.swift` configures `Firebase`, registers for remote notifications (`application.registerForRemoteNotifications()`), and implements `MessagingDelegate`/`UNUserNotificationCenterDelegate` for FCM token handling and notification presentation. `berkeley-mobile.entitlements` declares `aps-environment: development` and `com.apple.developer.weatherkit: true`.

`SceneDelegate.swift` calls `DataManager.shared.fetchIfNecessary()` in `sceneWillEnterForeground`, and `AppDelegate.swift` calls `DataManager.shared.fetchAll()` on launch — the repository implements a foreground-refresh data strategy gated by a fetch interval (`DataManager.fetchInterval = 60 * 60` seconds).

## Not Applicable / Not Found

- CI/CD configuration: not found in codebase (no `.github/workflows`, no CI YAML files at the repository root).
- Fastlane or other release-automation tooling: not found in codebase.
- Automated test suite: not found in codebase (no `XCTest` imports found via repository-wide search; no test target in the Xcode project).
