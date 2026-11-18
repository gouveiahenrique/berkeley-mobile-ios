<!-- steering-agent-last-run: 2026-11-18 18:30 UTC -->
# Technical Overview

## Repository classification
- Type: Mobile application (iOS) with a WidgetKit app extension.
- Language: Swift (`SWIFT_VERSION = 5.0` in `berkeley-mobile.xcodeproj/project.pbxproj`).
- UI frameworks: UIKit (`AppDelegate`, `SceneDelegate`, `TabBarController`, `MapViewController`) and SwiftUI (`TodayView`, `SafetyView`, `ResourcesView`, widget views), bridged with `UIHostingController` in `berkeley-mobile/TabBarController.swift`.

## Purpose (from README.md)
The repository is the Berkeley Mobile iOS app (ASUC OCTO): campus information such as transit routes, libraries, gyms, dining menus and resources.

## Targets
- `berkeley-mobile` (application, product `Berkeley.app` in the shared scheme).
- `BerkeleyMobileWidgetExtension` (app extension, `BerkeleyMobileWidget/`): `GymOccupancyWidget` is a `StaticConfiguration` widget, `.systemSmall` family, refreshed via a `TimelineProvider` using `GymOccupancyViewModel.Constants.refreshIntervalSecs` (15 minutes).

## Dependencies
- CocoaPods (`Podfile`): `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, `GoogleSignIn` (app target); `Firebase/Firestore` (widget target). `use_frameworks!` is set.
- Swift Package Manager (`project.pbxproj`): `Factory` (`hmlongco/Factory`, imported as `FactoryKit`) and `Glur` (`joogps/Glur`).

## Runtime architecture
- Entry: `@UIApplicationMain AppDelegate` calls `FirebaseApp.configure()`, `DataManager.shared.fetchAll()`, `BMLocationManager.shared.requestLocation()`, registers for remote notifications and sets the Firebase Messaging delegate (subscribes to topic `"all"`).
- `SceneDelegate` creates the window with `TabBarController` as root; `sceneWillEnterForeground` calls `DataManager.shared.fetchIfNecessary()`.
- `TabBarController` hosts Today (SwiftUI), Map (`MainContainerViewController`), Safety (SwiftUI) and Resources (SwiftUI) tabs.
- Data backend: Cloud Firestore. `README.md` states the production `GoogleService-Info.plist` is not included; `.gitignore` lists `berkeley-mobile/GoogleService-Info.plist`.
- Dependency injection: `FactoryKit` `Container` extensions in `berkeley-mobile/BerkeleyMobile+Injection.swift`, consumed with `@Injected` / `Container.shared.<name>.resolve()`.
- Version migrations: `AppDelegate+Migration.swift` (`checkForUpdate`, `Version`), tracked via `UserDefaults` key `LatestLaunchedVersion`.
- Deployment target: `IPHONEOS_DEPLOYMENT_TARGET` values 13.0 and 18.0 both appear in `project.pbxproj`; which applies to which target was not determined.

## Not found in codebase
CI/CD configuration, test targets, linter configuration.
