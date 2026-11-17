<!-- steering-agent-last-run: 2026-11-17 21:29 UTC -->
# Technical Overview

## Repository classification
- Type: Mobile application (iOS) with a WidgetKit extension target.
- Language: Swift (`SWIFT_VERSION = 5.0` in `berkeley-mobile.xcodeproj/project.pbxproj`).
- UI: UIKit (`AppDelegate`, `SceneDelegate`, `TabBarController`, `MapViewController`) mixed with SwiftUI views (e.g. `GuidePlacesStackedCollageView`, `HomeView`, `EventsView`).
- Deployment targets found in the project file: `IPHONEOS_DEPLOYMENT_TARGET` values 13.0, 17.0 and 18.0 (per build configuration/target).
- App version: `MARKETING_VERSION = 11.14.1`; bundle id `org.asuc.ASUC`; widget bundle id `org.asuc.ASUC.BerkeleyMobileWidget`.

## Purpose (from README.md)
Berkeley Mobile iOS app by ASUC OCTO: campus information (libraries, gyms, dining, resources, safety logs, events, map).

## Dependencies
- CocoaPods (`Podfile`): `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, `GoogleSignIn` (app target); `Firebase/Firestore` (widget target `BerkeleyMobileWidgetExtension`).
- Swift Package Manager (`project.pbxproj`): `Factory` (hmlongco/Factory, imported as `FactoryKit`), `Glur`.

## Runtime architecture
- Entry: `@UIApplicationMain AppDelegate` configures Firebase (`FirebaseApp.configure()`), runs `checkForUpdate()` migrations, calls `DataManager.shared.fetchAll()`, requests location via `BMLocationManager.shared`, registers for push notifications (FCM; subscribes to topic `all`).
- `SceneDelegate` sets `TabBarController` as the window root and calls `DataManager.shared.fetchIfNecessary()` on foreground.
- Data: Firebase Firestore is the backend (README: "The application pulls data from Google Cloud Firestore"). `GoogleService-Info.plist` is not included in the repository (README).
- Dependency injection: `Container` extension in `berkeley-mobile/BerkeleyMobile+Injection.swift` using Factory (`.shared` / `.singleton` scopes).
- Local persistence found: `UserDefaults` (migration version key, app-launch count, recent searches, pins), `NSCoding` on `BMEventCalendarEntry`, Firestore persistence cleared in `AppDelegate+Migration.swift`.
- Native integrations found: MapKit (`MapViewController`), CoreLocation (`BMLocationManager`), push notifications / FCM (`AppDelegate`), calendar events (`BMEventManager`, `BMError` calendar cases), WidgetKit (`BerkeleyMobileWidget/GymOccupancyWidget.swift`).
- Deployment/CI: CI configuration (e.g. `.github/workflows`) was not found in inspected repository areas.
