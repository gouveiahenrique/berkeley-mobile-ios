# Technology Stack

**Last updated:** 2026-08-03

## Summary

Berkeley Mobile iOS (`berkeley-mobile.xcodeproj`, product name `Berkeley`, bundle identifier `org.asuc.ASUC`) is a native Swift application for UC Berkeley students. The application implements Google Cloud Firestore as its backend data store via the Firebase iOS SDK. The repository builds with Xcode using CocoaPods for Firebase/auth-related dependencies and Swift Package Manager for two additional libraries.

## Languages

- **Primary Language:** Swift — `SWIFT_VERSION = 5.0` is set on both the `berkeley-mobile` and `BerkeleyMobileWidgetExtension` targets (`berkeley-mobile.xcodeproj/project.pbxproj`).
- **Secondary Languages:** Not found in codebase (no Objective-C `.m`/`.h` application source files were found under `berkeley-mobile/` or `BerkeleyMobileWidget/`).

## Frameworks

### Mobile (iOS)

- **UI Framework:** The repository implements views with both SwiftUI (66 files contain `import SwiftUI`) and UIKit. `UIHostingController` is used to embed SwiftUI views inside UIKit view controllers in 4 files: `berkeley-mobile/TabBarController.swift`, `berkeley-mobile/MainContainerViewController.swift`, `berkeley-mobile/Home/Map/MapViewController.swift`, `berkeley-mobile/FeedbackForm/FeedbackFormPresenter.swift`.
- **App Lifecycle:** The repository implements `UIApplicationDelegate` in `berkeley-mobile/AppDelegate.swift` (annotated `@UIApplicationMain`) and a `UIWindowSceneDelegate` in `berkeley-mobile/SceneDelegate.swift`.
- **State Observation:** The repository uses both the Swift `@Observable` macro (e.g. `berkeley-mobile/Home/Dining/DiningHallsViewModel.swift`-style ViewModels) and the older `ObservableObject`/`@Published` pattern (e.g. `SafetyViewModel`) in different feature modules. `@Observable` requires iOS 17+ — this is a Level 2 platform capability statement; the repository's own minimum deployment target is documented below.
- **Dependency Injection:** The repository imports `FactoryKit` (Factory package, SPM) and defines a `Container` extension in `berkeley-mobile/BerkeleyMobile+Injection.swift` for DI registrations.
- **Native frameworks used directly:** MapKit (`berkeley-mobile/Home/Map/`), EventKit (`berkeley-mobile/Data/BMEventManager.swift`), CoreLocation (`berkeley-mobile/Data/BMLocationManager.swift`), UserNotifications (`AppDelegate.swift`), `os.Logger` (`berkeley-mobile/Utils/Logger+Ext.swift`).

### Backend / Data

- **Database:** The repository implements data access against Google Cloud Firestore through the Firebase iOS SDK (`import FirebaseFirestore` is used across ViewModels/networking managers).
- **Authentication:** The repository imports `FirebaseAuth` and `GoogleSignIn`; usage was confirmed in `berkeley-mobile/AppDelegate.swift` (Firebase configuration) and referenced elsewhere in auth-related code paths.
- **Analytics:** `Firebase/Analytics` is declared as a Podfile dependency.
- **Push Messaging:** `FirebaseMessaging` is imported and used in `berkeley-mobile/AppDelegate.swift` (`Messaging.messaging().delegate = self`, topic subscription, `MessagingDelegate` conformance).

## Major Dependencies

### CocoaPods Runtime Dependencies (from `Podfile.lock`)

| Pod | Locked Version | Declared in Podfile |
|-----|-----|-----|
| Firebase | 11.2.0 | Yes (direct) |
| Firebase/Analytics | 11.2.0 | Yes (direct) |
| Firebase/Auth | 11.2.0 | Yes (direct) |
| Firebase/Firestore | 11.2.0 | Yes (direct) |
| FirebaseMessaging | 11.4.0 | Yes (direct) |
| GoogleSignIn | 8.0.0 | Yes (direct) |
| AppAuth | 1.7.5 | Transitive (via GoogleSignIn) |
| AppCheckCore | 11.0.0 | Transitive (via Firebase App Check integration) |
| GTMSessionFetcher/Core | 3.5.0 | Transitive (via Google auth stack) |

Both the `berkeley-mobile` app target and the `BerkeleyMobileWidgetExtension` target link CocoaPods (`Podfile` declares two targets); the widget extension target declares only `Firebase/Firestore`.

### Swift Package Manager Dependencies (from `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`)

| Package | Repository | Pinned Version |
|---------|-----------|-----------------|
| Factory | github.com/hmlongco/Factory | 2.5.3 |
| Glur | github.com/joogps/Glur | 1.1.0 |

## Build Tools

- **Native dependency manager:** CocoaPods — `Podfile`, `Podfile.lock` (`COCOAPODS: 1.16.2` recorded in `Podfile.lock`).
- **SPM dependency manager:** Xcode's built-in Swift Package Manager — lockfile at `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`.
- **Build system:** Xcode project/workspace (`berkeley-mobile.xcodeproj`, `berkeley-mobile.xcworkspace`). CocoaPods integration requires opening the `.xcworkspace`, not the `.xcodeproj`, per the CocoaPods-generated xcconfig references (`baseConfigurationReference` entries pointing at `Pods-berkeley-mobile.debug.xcconfig` / `.release.xcconfig`).
- **Task Runner:** Not found in codebase (no Makefile, Fastfile, or shell build scripts were found at the repository root).

## Development Tools

- **IDE:** Not directly discoverable beyond Xcode project format; the shared scheme (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`) exists.
- **Linter:** Not found in codebase — no `.swiftlint.yml` or SwiftLint build phase was found.
- **Formatter:** Not found in codebase.
- **Type Checker:** The Swift compiler (invoked by Xcode/`xcodebuild`) is the only type-checking mechanism found.
- **Pre-commit Hooks:** Not found in codebase (no `.pre-commit-config.yaml`, no `.git/hooks` custom scripts inspected as part of tracked files).

## Runtime Environment

- **Project-level default deployment target:** iOS 13.0 (`IPHONEOS_DEPLOYMENT_TARGET = 13.0` set at the `PBXProject` build configuration level in `berkeley-mobile.xcodeproj/project.pbxproj`).
- **`berkeley-mobile` app target (effective, overrides project default):** iOS 18.0 — both its Debug and Release `XCBuildConfiguration` blocks set `IPHONEOS_DEPLOYMENT_TARGET = 18.0`, which takes precedence over the project-level 13.0 default per Xcode build-setting resolution order.
- **`BerkeleyMobileWidgetExtension` target:** iOS 17.0 (`IPHONEOS_DEPLOYMENT_TARGET = 17.0` in both Debug and Release configurations).
- **Device family:** `TARGETED_DEVICE_FAMILY = 1` (iPhone only) for the main app target; `TARGETED_DEVICE_FAMILY = "1,2"` (iPhone + iPad) for the widget extension.
- **App version:** `MARKETING_VERSION = 11.14.1` for the main app target; `MARKETING_VERSION = 1.0` for the widget extension target.
- **Bundle identifiers:** `org.asuc.ASUC` (main app), `org.asuc.ASUC.BerkeleyMobileWidget` (widget extension).

## External Services

- **Backend Database:** Google Cloud Firestore. A `GoogleService-Info.plist` configuration file is referenced by the README as required but is not committed to the repository.
- **Authentication:** Firebase Auth combined with Google Sign-In (`GoogleSignIn` pod).
- **Push Notifications:** Firebase Cloud Messaging, integrated in `berkeley-mobile/AppDelegate.swift`.

## Constraints (Repository-Observed)

- The `.xcworkspace` must be opened rather than the `.xcodeproj` because build configurations reference CocoaPods-generated `.xcconfig` files.
- `GoogleService-Info.plist` is required for Firebase initialization (`FirebaseApp.configure()` in `AppDelegate.swift`) but is excluded from the repository per the README.
- The main app target's effective minimum iOS version (18.0) is higher than the project-level default (13.0) and higher than the widget extension's minimum (17.0) — this discrepancy is repository-observed and not explained by any comment in the `.pbxproj` file.
