<!-- steering-agent-last-run: 2026-11-18 12:26 UTC -->
# Technical Overview

## Classification
Mobile application (iOS), with a WidgetKit extension. Primary language: Swift (`SWIFT_VERSION = 5.0` in `berkeley-mobile.xcodeproj/project.pbxproj`). Deployment targets in the project file: 18.0 / 17.0 for app/extension build configurations (13.0 at project level).

## Purpose (from evidence)
README.md describes Berkeley Mobile as the ASUC OCTO app with library, gym, dining and campus resource information. The code defines tabs Home, Today, Safety, Resources (`berkeley-mobile/TabBarController.swift`).

## Frameworks and dependencies
- UIKit + SwiftUI mixed: UIKit `UITabBarController`, `MapViewController` (MapKit); SwiftUI views hosted via `UIHostingController` (`TodayView`, `SafetyView`, `ResourcesView`).
- CocoaPods (`Podfile`): Firebase/Analytics, Firebase, FirebaseMessaging, Firebase/Firestore, Firebase/Auth, GoogleSignIn. Widget target: Firebase/Firestore.
- Swift Package Manager (`project.pbxproj`): Factory (hmlongco/Factory, imported as `FactoryKit`), Glur (joogps/Glur).
- MapKit, EventKit (`BMEventManager`), UserNotifications.

## Runtime architecture
- Entry: `AppDelegate` (`@UIApplicationMain`) calls `FirebaseApp.configure()`, `checkForUpdate()`, `DataManager.shared.fetchAll()`, `BMLocationManager.shared.requestLocation()`, registers for remote notifications and subscribes to FCM topic `all`.
- `SceneDelegate` hosts `TabBarController` as root.
- Backend: Google Cloud Firestore (README.md). `GoogleService-Info.plist` is not included in the repository (README.md).
- Dependency injection: `FactoryKit` `Container` extension in `berkeley-mobile/BerkeleyMobile+Injection.swift`.
- Local persistence: `UserDefaults` keys in `Utils/UserDefaults+Extension.swift` (`UserDefaultsKeys`); Firestore persistence cleared in migration.
- Widget: `BerkeleyMobileWidget/GymOccupancyWidget.swift` (`GymOccupancyProvider` timeline); `BerkeleyMobileWidget/CampusEventsWidget.swift` (`CampusEventsProvider`, small/medium/large + Lock Screen `.accessoryRectangular`/`.accessoryInline`), backed by the shared `EventsDataService`/`WidgetEvent` data layer (`berkeley-mobile/Events/EventDataSource/`) and an on-disk JSON cache (`BerkeleyMobileWidget/WidgetEventsCache.swift`) for offline resilience.
- Deep linking: custom URL scheme `berkeleymobile://events?id=<id>` (`berkeley-mobile/Utils/DeepLink.swift`), routed via `DeepLinkRouter` (`berkeley-mobile/Utils/DeepLinkRouter.swift`, FactoryKit-registered) from `SceneDelegate` into `TodayView`/`EventsView`, used by the Campus Events widget to open a specific event's detail.

## Deployment/CI
Not found in codebase (no `.github` directory or CI config inspected). Build tooling `xcodebuild` is not available in the analysis environment.
