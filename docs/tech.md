<!-- steering-agent-last-run: 2026-10-29 13:05 UTC -->
# Technical Overview

## Repository classification
- Type: Mobile application (iOS), with a widget extension.
- Language: Swift (`SWIFT_VERSION = 5.0` in `berkeley-mobile.xcodeproj/project.pbxproj`).
- Platforms/frameworks: UIKit (`AppDelegate`, `SceneDelegate`, `TabBarController`, view controllers) and SwiftUI/Observation (`@Observable` in `WeatherDataViewModel`, `NewsDataViewModel`, `DebugViewModel`; `ObservableObject` in `HomeViewModel`). MapKit is used in `MapDataSource.swift`.
- Marketing version: `MARKETING_VERSION = 11.14.1` (app target). Deployment targets found in the project file: 13.0, 17.0, 18.0 (per build configuration).

## Purpose
`README.md` describes Berkeley Mobile as the official iOS app of the ASUC OCTO, covering library and gym information, dining hall menus and campus resources. The code contains feature areas for Map, Libraries, Fitness, Dining, Guides, Events, Safety, Resources, Today (news/weather tiles) and a Feedback form.

## Dependencies
- CocoaPods (`Podfile`): `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, `GoogleSignIn` for target `berkeley-mobile`; `Firebase/Firestore` for target `BerkeleyMobileWidgetExtension`.
- Swift Package Manager (`project.pbxproj`): `Factory` (`https://github.com/hmlongco/Factory.git`, product `FactoryKit`) and `Glur` (`https://github.com/joogps/Glur.git`).

## Runtime architecture
- Entry point: `AppDelegate` (`@UIApplicationMain`). `didFinishLaunchingWithOptions` calls `FirebaseApp.configure()`, `checkForUpdate()`, `DataManager.shared.fetchAll()`, `BMLocationManager.shared.requestLocation()`, sets `Messaging` and `UNUserNotificationCenter` delegates and requests notification authorization.
- Scene lifecycle: `SceneDelegate`; root UI via `TabBarController` and `MainContainerViewController`.
- Backend: Google Cloud Firestore (`README.md`: "The application pulls data from Google Cloud Firestore"). Firestore is accessed from `MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`, `BMNetworkingManager`, `GuidesViewModel`, `DiningHallsViewModel`, `GymOccupancyViewModel`, `FeedbackFormViewModel`, `NewsDataViewModel`.
- Local caching/state: `DataManager` (in-memory `AtomicDictionary`, 60-minute `fetchInterval`), `UserDefaults` helpers (`Utils/UserDefaults+Extension.swift`), `Firestore.clearPersistence` in `AppDelegate+Migration.swift`.
- Dependency injection: `Container` extensions from FactoryKit in `BerkeleyMobile+Injection.swift`.
- Widget: `BerkeleyMobileWidget/` (`BerkeleyMobileWidgetBundle.swift`, `GymOccupancyWidget.swift`), product type `app-extension`.

## Deployment / CI
- `GoogleService-Info.plist` is not in the repository (`README.md`).
- CI configuration files: Not found in inspected repository areas.
