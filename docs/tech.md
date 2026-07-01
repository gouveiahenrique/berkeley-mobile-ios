# Technical Overview

## Repository Purpose

Berkeley Mobile is a native iOS application built for UC Berkeley students. The app surfaces campus resources across four main areas: an interactive campus map, a daily-at-a-glance "Today" screen, safety incident logs, and campus resource listings. A companion iOS widget extension displays gym occupancy data from the home screen.

## Repository Classification

- **Type:** iOS Mobile Application (with Widget Extension)
- **Primary Language:** Swift
- **UI Frameworks:** UIKit and SwiftUI (used side by side; SwiftUI via `UIHostingController` embeds)
- **Backend:** Firebase (Firestore, Analytics, Messaging, Auth)
- **Dependency Manager:** CocoaPods

## Languages and Frameworks

| Technology | Evidence |
|---|---|
| Swift 5.0 | `SWIFT_VERSION = 5.0` in `berkeley-mobile.xcodeproj/project.pbxproj` |
| UIKit | `AppDelegate.swift`, `SceneDelegate.swift`, `DrawerViewController.swift`, etc. |
| SwiftUI | `TodayView.swift`, `SafetyView.swift`, `ResourcesView.swift`, `HomeView.swift`, etc. |
| WidgetKit | `BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift` |
| WeatherKit | `WeatherDataViewModel.swift` |
| MapKit | `MapViewController.swift`, `BMLocationManager.swift`, `BMConstants.swift` |
| Firebase/Firestore | `BMNetworkingManager.swift`, `LibraryDataSource.swift`, `GymDataSource.swift`, `EventsViewModel.swift`, etc. |
| Firebase/Analytics | `EventsViewModel.swift` (`Analytics.logEvent`) |
| Firebase/Messaging | `AppDelegate.swift` (`Messaging.messaging()`) |
| GoogleSignIn | `Podfile` |
| FactoryKit | `BerkeleyMobile+Injection.swift`, `TabBarController.swift`, `MainContainerViewController.swift` |
| Glur | `NewsTileView.swift` |

## iOS Deployment Target

- Main app target: iOS 18.0 (`IPHONEOS_DEPLOYMENT_TARGET = 18.0` in `project.pbxproj`)
- Widget extension target: iOS 17.0

## Application Version

- Marketing version: 11.14.1 (`MARKETING_VERSION` in `project.pbxproj`)
- Bundle identifier: `org.asuc.ASUC`

## Application Lifecycle

`AppDelegate` (`berkeley-mobile/AppDelegate.swift`) is the `@UIApplicationMain` entry point. On launch it:
1. Configures Firebase via `FirebaseApp.configure()`
2. Triggers `DataManager.shared.fetchAll()` to pre-load map, library, and gym data from Firestore
3. Starts location tracking via `BMLocationManager.shared.requestLocation()`
4. Registers for push notifications and sets up Firebase Cloud Messaging

`SceneDelegate` (`berkeley-mobile/SceneDelegate.swift`) sets `TabBarController` as the root view controller. It calls `DataManager.shared.fetchIfNecessary()` each time the scene enters the foreground.

## Runtime Architecture

The app is structured as a `UITabBarController` with four tabs (`TabBarController.swift`):

| Tab | Title | Root View |
|---|---|---|
| 0 | Home | `MainContainerViewController` (UIKit + SwiftUI `HomeView` + `MapViewController`) |
| 1 | Today | `TodayView` (SwiftUI) |
| 2 | Safety | `SafetyView` (SwiftUI) |
| 3 | Resources | `ResourcesView` (SwiftUI) |

## Major Technical Components

### DataManager (`berkeley-mobile/Data/DataManager.swift`)
A singleton that orchestrates initial data loading from Firestore. It manages three registered `DataSource` types: `MapDataSource`, `LibraryDataSource`, and `GymDataSource`. Fetches are deduplicated via `DispatchGroup` per data source. A 1-hour minimum refetch interval is enforced.

### BMNetworkingManager (`berkeley-mobile/Data/BMNetworkingManager.swift`)
A singleton providing `async/await`-based Firestore fetch methods for safety logs and resource categories, used by feature-level view models.

### Dependency Injection (`berkeley-mobile/BerkeleyMobile+Injection.swift`)
The app uses FactoryKit for dependency injection. `Container` extensions register all view models as `Factory` instances with `.shared` or `.singleton` scopes.

### Drawer System (`berkeley-mobile/Drawer/`)
A custom bottom-sheet drawer implementation. `DrawerViewController` provides a pan-gesture-driven panel. `DrawerViewDelegate` and `MainDrawerViewDelegate` protocols manage a stack of overlapping drawers on the Home tab.

### Widget Extension (`BerkeleyMobileWidget/`)
A WidgetKit bundle containing a `GymOccupancyWidget`. `GymOccupancyProvider` implements `TimelineProvider`, fetching occupancy data from Firestore via `GymOccupancyViewModel` and refreshing on a scheduled interval.

### ImageLoader (`berkeley-mobile/Common/Images/ImageLoader.swift`)
A singleton in-memory image cache using `URLSession`. Images are cached by URL; running tasks are tracked by UUID for cancellation.

### Location Manager (`berkeley-mobile/Data/BMLocationManager.swift`)
A singleton `CLLocationManager` wrapper. Broadcasts updates via `NotificationCenter` using the `Notification.Name.locationUpdated` key.

## Persistence

- **Firestore**: Primary data store for all structured content (maps, libraries, gyms, events, safety logs, resources, news, dining).
- **UserDefaults**: Used for lightweight local state including app launch counts, recent searches, and pinned home drawer items (keys defined in `UserDefaultsKeys` enum in `UserDefaults+Extension.swift`).
- **NSCoding / NSCoder**: `BMEventCalendarEntry` uses `NSCoding` for local calendar event persistence.

## Push Notifications

`AppDelegate` registers for remote notifications. Firebase Cloud Messaging delegates token registration and subscribes the device to the `"all"` topic. Receiving a notification taps the Safety tab (index 2) via `TabBarController`.

## App Store Review Prompting

`AppDelegate` increments a launch counter in `UserDefaults` (`numAppLaunchForAppStoreReview`) and a separate counter drives the configurable feedback form shown via `FeedbackFormPresenter`.
