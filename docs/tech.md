# Technical Overview

## Repository Identity

- **Type**: Mobile application (iOS).
- **Purpose (per `README.md`)**: The repository implements Berkeley Mobile, an iOS app providing Bear Transit routes, library and gym information, dining hall menus, and campus resources for UC Berkeley students. It is produced by the ASUC Office of the Chief Technology Officer (OCTO).
- **Primary language**: Swift. All application source files under `berkeley-mobile/` and `BerkeleyMobileWidget/` use the `.swift` extension.
- **Marketing version**: The repository defines `MARKETING_VERSION = 11.14.1` in `berkeley-mobile.xcodeproj/project.pbxproj`.
- **Minimum deployment target**: The repository defines `IPHONEOS_DEPLOYMENT_TARGET` values of `13.0` and `18.0` across different build configurations in `berkeley-mobile.xcodeproj/project.pbxproj` (not found which configuration maps to which target from the inspected excerpt).

## Frameworks and Runtime Architecture

- **UI framework**: The application entry point (`berkeley-mobile/AppDelegate.swift`) uses `@UIApplicationMain` and `UIApplicationDelegate`, and `berkeley-mobile/SceneDelegate.swift` implements `UIWindowSceneDelegate` — the repository implements a UIKit application lifecycle.
- **SwiftUI usage**: `berkeley-mobile/TabBarController.swift` embeds SwiftUI views (`TodayView`, `SafetyView`, `ResourcesView`, `DebugView`) via `UIHostingController`. `berkeley-mobile/MainContainerViewController.swift` embeds `HomeView` (SwiftUI) the same way. The repository implements a hybrid UIKit-shell / SwiftUI-screens architecture.
- **App target structure**: `berkeley-mobile.xcodeproj/project.pbxproj` defines two `productType` entries: `com.apple.product-type.application` (main app, `berkeley-mobile`) and `com.apple.product-type.app-extension` (`BerkeleyMobileWidgetExtension`, source in `BerkeleyMobileWidget/`).
- **Widget extension**: `BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift` defines a `WidgetBundle` (`@main struct BerkeleyMobileWidgetBundle`) that configures Firebase independently and serves `GymOccupancyWidget`.
- **Dependency injection**: `berkeley-mobile/BerkeleyMobile+Injection.swift` extends FactoryKit's `Container` to register view models (e.g. `calendarViewModel`, `homeViewModel`, `safetyViewModel`) with `.shared` or `.singleton` scopes. Consumers use `@Injected` (e.g. `berkeley-mobile/TabBarController.swift:15`, `berkeley-mobile/MainContainerViewController.swift:15`) or `@InjectedObservable` (e.g. `berkeley-mobile/Utils/View+Extension.swift:104`) property wrappers.
- **State/observation**: The repository uses a mix of the Swift `Observation` framework (`@Observable`, found in 10 files) and `ObservableObject` (found in 6 files) for SwiftUI state, plus `@MainActor` annotations (found in 12 files) for main-thread isolation.

## Backend / Data Layer

- **Backend**: The repository implements data access to Google Cloud Firestore (per `README.md` and direct `Firebase`/`FirebaseFirestore` imports).
- **Two coexisting data-access patterns**:
  - Legacy completion-handler pattern: `berkeley-mobile/Data/DataSource.swift` defines a `DataSource` protocol (`fetchItems(_:)` with a completion handler); `berkeley-mobile/Data/DataManager.swift` is a singleton (`DataManager.shared`) that fetches from a fixed list of `DataSource` types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) and caches results in an `AtomicDictionary`. Concrete implementations include `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift` and `berkeley-mobile/Home/Fitness/GymClassDataSource/GymClassDataSource.swift`.
  - Modern async/await pattern: `berkeley-mobile/Data/BMNetworkingManager.swift` (`BMNetworkingManager.shared`) implements `fetchSafetyLogs() async throws` and `fetchResourcesCategories() async throws` directly against `Firestore.firestore()`. `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift` defines `EventsDataService` with `fetchEventsGroupedByDate() async`.
- **Calendar integration**: `berkeley-mobile/Data/BMEventManager.swift` wraps `EKEventStore` (EventKit) for adding/deleting/checking events in the user's calendar, using `async`/`await` and `withCheckedContinuation`.
- **Push notifications**: `berkeley-mobile/AppDelegate.swift` configures `FirebaseMessaging` (`MessagingDelegate`) and `UNUserNotificationCenter`.
- **Location**: `berkeley-mobile/AppDelegate.swift` calls `BMLocationManager.shared.requestLocation()` at launch.
- **Authentication**: `Podfile` includes `pod 'GoogleSignIn'` and `pod 'Firebase/Auth'` — the repository declares a dependency on Google Sign-In and Firebase Auth; usage sites beyond dependency declaration were not found in the inspected areas.

## Package Management

- **CocoaPods** (`Podfile`, `Podfile.lock`): manages `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, `GoogleSignIn` for the `berkeley-mobile` target, and `Firebase/Firestore` for `BerkeleyMobileWidgetExtension`.
- **Swift Package Manager** (`berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`): resolves `Factory` (FactoryKit, v2.5.3, `github.com/hmlongco/Factory`) and `Glur` (v1.1.0, `github.com/joogps/Glur`).

## Permissions and Capabilities

Per `berkeley-mobile/Info.plist`:
- Calendar access (`NSCalendarsUsageDescription`, `NSCalendarsFullAccessUsageDescription`) — for adding events to the user's calendar.
- Location access (`NSLocationWhenInUseUsageDescription`) — for distance calculation and map display.
- Background modes: `fetch`, `remote-notification`.
- Arbitrary network loads allowed (`NSAllowsArbitraryLoads: true` under `NSAppTransportSecurity`).

Per `berkeley-mobile/berkeley-mobile.entitlements`:
- Push notifications (`aps-environment: development`).
- WeatherKit (`com.apple.developer.weatherkit`).

## Migration Handling

`berkeley-mobile/AppDelegate+Migration.swift` implements a `Version`-comparison based migration system (`checkForUpdate()`), run at every app launch, that can clear Firestore persistence/Analytics data (`clearCache`) when the app is updated past specific version thresholds (e.g. `10.0.1`).

## Not Found in Codebase

- CI/CD pipeline configuration (no `.github/workflows`, Fastlane, or Bitrise config files found in the inspected top-level listing).
- SwiftLint or other static-analysis tool configuration.
