<!-- steering-agent-last-run: 2026-10-21 13:37 UTC -->
# Technical Overview

## Repository classification
- Type: Mobile application (iOS), single app target plus one WidgetKit extension.
- Language: Swift (`SWIFT_VERSION = 5.0` in `berkeley-mobile.xcodeproj/project.pbxproj`).
- UI: UIKit and SwiftUI mixed (`UIHostingController` wraps SwiftUI views inside `TabBarController`; `MapViewController` is UIKit with `MKMapView`).
- App version: `MARKETING_VERSION = 11.14.1` for the app target.
- Deployment targets present in `project.pbxproj`: `13.0`, `17.0`, `18.0` (per-configuration/target values; mapping to individual targets was not resolved).

## Purpose (from `README.md`)
Berkeley Mobile is the ASUC OCTO app for UC Berkeley students: libraries, gyms, dining halls, campus resources, map, events, and safety information.

## Dependencies
CocoaPods (`Podfile`, target `berkeley-mobile`): `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, `GoogleSignIn`.
Widget target `BerkeleyMobileWidgetExtension`: `Firebase/Firestore`.
Swift Package Manager (`XCRemoteSwiftPackageReference` in `project.pbxproj`): `Factory` (hmlongco/Factory, imported as `FactoryKit`) and `Glur` (joogps/Glur).
`Pods/` is tracked in git.

## Runtime architecture
- Entry: `AppDelegate` (`@UIApplicationMain`) calls `FirebaseApp.configure()`, `checkForUpdate()` (migrations), `DataManager.shared.fetchAll()`, `BMLocationManager.shared.requestLocation()`, registers for push notifications and FCM (`Messaging`, subscribes to topic `all`).
- `SceneDelegate` creates the window with `TabBarController` as root; on foreground it calls `DataManager.shared.fetchIfNecessary()`.
- `TabBarController` hosts four tabs: Home (`MainContainerViewController` → `HomeView` + `MapViewController`), Today (`TodayView`), Safety (`SafetyView`), Resources (`ResourcesView`). A notification tap selects tab index 2.
- Backend: Google Cloud Firestore (`README.md`; `Firestore.firestore()` used in data sources and view models). The production `GoogleService-Info.plist` is not in the repository (`README.md`).
- Dependency injection: FactoryKit `Container` extensions in `berkeley-mobile/BerkeleyMobile+Injection.swift`, consumed with `@Injected` / `@InjectedObservable`.
- Local persistence: `UserDefaults` via the typed `UserDefaultsKeys` enum (`Utils/UserDefaults+Extension.swift`).
- Native integrations found: MapKit, CoreLocation (`BMLocationManager`), EventKit (`BMEventManager`), Firebase Analytics/Messaging, UserNotifications, WidgetKit (`BerkeleyMobileWidget/GymOccupancyWidget.swift`), WeatherKit entitlement (`berkeley-mobile.entitlements`), Info.plist background modes `fetch` and `remote-notification`.

## Deployment/CI
No CI configuration (e.g. `.github/`, Fastlane) was found in inspected repository areas.
