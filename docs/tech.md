<!-- steering-agent-last-run: 2026-11-17 20:35 UTC -->
# Technical Overview

## Repository classification
- Type: Mobile application (iOS) with a WidgetKit app extension.
- Purpose (README.md): official repository for the Berkeley Mobile iOS app (ASUC OCTO) — campus information such as libraries, gyms, dining, events, resources.
- Languages: Swift (`SWIFT_VERSION = 5.0` in `berkeley-mobile.xcodeproj/project.pbxproj`).
- UI: UIKit (`AppDelegate`, `SceneDelegate`, `TabBarController`, `MapViewController`) mixed with SwiftUI hosted via `UIHostingController` (`TodayView`, `SafetyView`, `ResourcesView`).
- Deployment targets in pbxproj: `IPHONEOS_DEPLOYMENT_TARGET` values 13.0, 17.0 and 18.0 appear across build configurations.

## Targets
- `berkeley-mobile` (application) and `BerkeleyMobileWidgetExtension` (app extension, `BerkeleyMobileWidget/`, `GymOccupancyWidget.swift`). No test target product type was found in the pbxproj.

## Dependencies
- CocoaPods (`Podfile`): Firebase, Firebase/Analytics, FirebaseMessaging, Firebase/Firestore, Firebase/Auth, GoogleSignIn; widget target uses Firebase/Firestore.
- Swift Package Manager (pbxproj): Factory (`hmlongco/Factory`, upToNextMajor 2.5.3, imported as `FactoryKit`) and Glur (`joogps/Glur`, upToNextMajor 1.1.0).
- Apple frameworks observed: MapKit, EventKit, CoreLocation, WidgetKit, SwiftUI, UserNotifications, os `Logger`.

## Runtime architecture
- Launch: `AppDelegate.application(_:didFinishLaunchingWithOptions:)` calls `FirebaseApp.configure()`, `checkForUpdate()`, `DataManager.shared.fetchAll()`, `BMLocationManager.shared.requestLocation()`, and registers for notifications/FCM (topic `all`).
- `SceneDelegate` creates a window with `TabBarController` as root; on foreground it calls `DataManager.shared.fetchIfNecessary()`.
- `TabBarController` tabs: Home (`MainContainerViewController`), Today, Safety, Resources.
- Data layer: `DataManager` (singleton) fetches `DataSource` types listed in `kDataSources` (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) with a 1-hour `fetchInterval`; `BMNetworkingManager` fetches Firestore collections with async/await.
- Dependency injection: `Container` extensions in `berkeley-mobile/BerkeleyMobile+Injection.swift` (FactoryKit) expose view models and `FeedbackFormPresenter`.
- Backend: Firebase Firestore (README.md: production `GoogleService-Info.plist` not included in the repository).
- Build/deployment pipeline (CI): Not found in codebase (no `.github` directory).
