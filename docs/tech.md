<!-- steering-agent-last-run: 2026-10-21 16:32 UTC -->
# Technical Overview

## Repository classification
- Type: Mobile application (iOS), with a WidgetKit app extension.
- Language: Swift (`SWIFT_VERSION = 5.0` in `berkeley-mobile.xcodeproj/project.pbxproj`).
- UI frameworks: UIKit and SwiftUI, mixed (`TabBarController` hosts SwiftUI views via `UIHostingController`; `MapViewController` is UIKit).
- Dependency managers: CocoaPods (`Podfile`, `Podfile.lock`, `Pods/`) and Swift Package Manager (`Factory`, `Glur` as `XCRemoteSwiftPackageReference` in the project file).

## Purpose (from evidence)
The app product name is `Berkeley` (`PRODUCT_NAME = Berkeley`, `MARKETING_VERSION = 11.14.1`). Source files carry the copyright "ASUC OCTO". It presents a map-based home screen plus Today, Safety, and Resources tabs (`berkeley-mobile/TabBarController.swift`), with dining, libraries, fitness/gym, guides, events, and search features under `berkeley-mobile/Home` and `berkeley-mobile/Events`.

## Targets
- `berkeley-mobile` (application, `com.apple.product-type.application`), product `Berkeley.app`.
- `BerkeleyMobileWidgetExtension` (`com.apple.product-type.app-extension`), source in `BerkeleyMobileWidget/`; defines `GymOccupancyWidget` (`StaticConfiguration`, `.systemSmall` family) in `BerkeleyMobileWidget/GymOccupancyWidget.swift`.
- Deployment targets found in the project file: `IPHONEOS_DEPLOYMENT_TARGET` values 13.0, 17.0, 18.0 (per-configuration/target; which applies to which target was not mapped).

## Dependencies
Declared in `Podfile`:
- App target: `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, `GoogleSignIn`.
- Widget target: `Firebase/Firestore`.

Swift packages: `https://github.com/hmlongco/Factory.git` (imported as `FactoryKit`), `https://github.com/joogps/Glur.git`.

## Runtime architecture
- Entry: `AppDelegate` (`@UIApplicationMain`) in `berkeley-mobile/AppDelegate.swift`. On launch it calls `FirebaseApp.configure()`, increments an app-launch counter in `UserDefaults`, runs `checkForUpdate()` (migrations), `DataManager.shared.fetchAll()`, `BMLocationManager.shared.requestLocation()`, requests notification authorization, and registers for remote notifications.
- Scene: `SceneDelegate` creates a `UIWindow` with `TabBarController` as root; on foreground it calls `DataManager.shared.fetchIfNecessary()`.
- Root navigation: `TabBarController` with four tabs — Home (`MainContainerViewController`), Today (`TodayView`), Safety (`SafetyView`), Resources (`ResourcesView`).
- Home: `MainContainerViewController` hosts `HomeView` (SwiftUI) wrapping a `MapViewController` (MapKit `MKMapView`), with a drawer system under `berkeley-mobile/Drawer`.
- Dependency injection: FactoryKit `Container` extensions in `berkeley-mobile/BerkeleyMobile+Injection.swift` (`.shared` / `.singleton` scopes) consumed with `@Injected`.
- Data: Firebase Firestore via `DataManager`/`DataSource` subclasses and `BMNetworkingManager`; `DataManager.fetchInterval` is 3600 seconds.
- Push: Firebase Messaging; on registration token receipt the app subscribes to topic `"all"`; tapping a notification selects tab index 2 (Safety).
- Calendar: `BMEventManager` uses EventKit.
- Persistence observed: `UserDefaults` (version tracking, launch count), Firestore persistence cleared in migration `clearCache`. Other persistence mechanisms: Not found in inspected areas.

## Deployment / CI
- Build configuration is the Xcode project/workspace (`berkeley-mobile.xcworkspace`, shared scheme `berkeley-mobile`).
- CI/CD configuration (e.g. `.github/workflows`, Fastlane): not found in codebase.
