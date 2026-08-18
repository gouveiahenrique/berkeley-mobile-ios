# Technical Overview

## Repository Classification

- **Repository type:** Mobile application (iOS).
- **Primary language:** Swift. `SWIFT_VERSION = 5.0` is set for all build configurations in `berkeley-mobile.xcodeproj/project.pbxproj`.
- **Runtime model:** Native iOS application process, launched via `UIApplicationMain` (`berkeley-mobile/AppDelegate.swift:17`), plus a separate iOS Home Screen Widget extension process (`BerkeleyMobileWidget/`).
- **UI framework:** Hybrid UIKit + SwiftUI. `AppDelegate`, `SceneDelegate`, `TabBarController`, and `MainContainerViewController` are `UIKit` types (`UIResponder`, `UIViewController`, `UITabBarController`); several of them host SwiftUI views via `UIHostingController` (e.g. `berkeley-mobile/TabBarController.swift:17-20`, `berkeley-mobile/MainContainerViewController.swift:35`).

## Repository Purpose (per repository evidence)

`README.md` states: "This is the official repository for the Berkeley Mobile iOS application... Berkeley Mobile has accumulated over 20,000 downloads on iOS and Android... It has Bear Transit routes, library and gym information, dining hall menus, and campus resources." The repository is described as a product of the ASUC Office of the Chief Technology Officer (OCTO).

The codebase implements features consistent with this description: a campus map (`berkeley-mobile/Home/Map`), dining halls (`berkeley-mobile/Home/Dining`), gyms/fitness (`berkeley-mobile/Home/Fitness`), libraries (`berkeley-mobile/Home/Libraries`), campus guides (`berkeley-mobile/Home/Guides`), campus safety logs (`berkeley-mobile/Safety`), and events/academic calendar (`berkeley-mobile/Events`).

## Targets

`berkeley-mobile.xcodeproj/project.pbxproj` defines two `PBXNativeTarget` entries:

| Target | Product type | Bundle identifier | `IPHONEOS_DEPLOYMENT_TARGET` | `MARKETING_VERSION` |
|---|---|---|---|---|
| `berkeley-mobile` | `com.apple.product-type.application` | `org.asuc.ASUC` | 18.0 | 11.14.1 |
| `BerkeleyMobileWidgetExtension` | `com.apple.product-type.app-extension` | `org.asuc.ASUC.BerkeleyMobileWidget` | 17.0 | 1.0 |

The widget extension source lives in `BerkeleyMobileWidget/` and defines a widget bundle (`BerkeleyMobileWidgetBundle.swift`) and a gym-occupancy widget (`GymOccupancyWidget.swift`).

## Dependency Management

Two dependency mechanisms are used together:

- **CocoaPods** — `Podfile` and `Podfile.lock` at the repository root. The `berkeley-mobile` target depends on `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, and `GoogleSignIn`. The `BerkeleyMobileWidgetExtension` target depends on `Firebase/Firestore`.
- **Swift Package Manager** — `berkeley-mobile.xcodeproj/project.pbxproj` declares two `XCRemoteSwiftPackageReference` entries: `Factory` (`https://github.com/hmlongco/Factory.git`, imported in code as `FactoryKit`) and `Glur` (`https://github.com/joogps/Glur.git`).

The application is built via the `berkeley-mobile.xcworkspace` workspace (standard for CocoaPods-integrated Xcode projects), not the bare `.xcodeproj`.

## Major Technical Components

- **App entry points:** `berkeley-mobile/AppDelegate.swift` (configures Firebase, push notification registration, initial data fetch, location request) and `berkeley-mobile/SceneDelegate.swift` (constructs the root `TabBarController` and window).
- **Dependency injection:** `berkeley-mobile/BerkeleyMobile+Injection.swift` extends `FactoryKit`'s `Container` with `Factory<...>` definitions for the app's view models (e.g. `homeViewModel`, `safetyViewModel`, `eventsViewModel`, `searchViewModel`). View models and services are obtained elsewhere in the code via the `@Injected`/`@InjectedObject` property wrappers (e.g. `berkeley-mobile/MainContainerViewController.swift:15`, `berkeley-mobile/Safety/SafetyMapView.swift:14`).
- **Data layer:** `berkeley-mobile/Data/DataManager.swift` is a singleton (`DataManager.shared`) that fetches and caches data from a fixed list of `DataSource`-conforming types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`). `berkeley-mobile/Data/BMNetworkingManager.swift` is a separate singleton used for on-demand Firestore reads (safety logs, resource categories) that are not routed through `DataManager`.
- **Backend:** Google Cloud Firestore, accessed directly from the client via the `Firebase`/`FirebaseFirestore` SDK (`import Firebase`, `Firestore.firestore()`). `README.md` confirms: "The application pulls data from Google Cloud Firestore... The production backend API key and GoogleService-Info.plist are not included in this repository." Consistent with this, no `GoogleService-Info.plist` file exists in the repository (verified by search).
- **Push notifications / analytics:** `FirebaseMessaging` (`MessagingDelegate` in `AppDelegate.swift`) and `FirebaseAnalytics` (e.g. `Analytics.logEvent(...)` calls in `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift`).
- **Navigation shell:** `berkeley-mobile/TabBarController.swift` is a `UITabBarController` with four tabs: Home (`MainContainerViewController`), Today (`TodayView`), Safety (`SafetyView`), and Resources (`ResourcesView`).
- **Custom drawer UI system:** `berkeley-mobile/Drawer/` implements a bottom-sheet-style drawer (`DrawerViewController`, `DrawerViewDelegate`, `MainDrawerViewDelegate`) used to present contextual detail panels over the map/home screen.

## Deployment / Runtime Model

Not found in codebase: no CI/CD configuration (no `.github/workflows`), no Fastlane configuration (`Fastfile`/`Appfile`), and no build/release scripts were found in the repository. Deployment is inferred only from the presence of an `ArchiveAction` in the shared Xcode scheme (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`), which is a standard Xcode capability for producing a release archive; no repository-specific automation of that process was found.
