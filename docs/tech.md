# Technical Overview

## Repository Purpose

Berkeley Mobile is an iOS application for UC Berkeley students. The repository contains the main iOS app target (`berkeley-mobile`) and a WidgetKit extension (`BerkeleyMobileWidget`).

## Languages and Frameworks

- **Language**: Swift
- **UI Frameworks**: UIKit (legacy screens) and SwiftUI (newer screens); the two are bridged using `UIHostingController` and `UIViewControllerRepresentable`
- **Backend / Data**: Firebase (Firestore, Analytics, Messaging, Auth); accessed via the CocoaPods-managed `Firebase` pod family
- **Authentication library**: GoogleSignIn (imported in `AppDelegate.swift`, Podfile target `berkeley-mobile`)
- **Dependency injection**: FactoryKit (`BerkeleyMobile+Injection.swift`)
- **Widget extension**: WidgetKit + SwiftUI (`BerkeleyMobileWidget/`)

## Runtime Architecture

The app uses the standard iOS UIKit scene-based lifecycle:

- `AppDelegate` (`berkeley-mobile/AppDelegate.swift`) — tagged `@UIApplicationMain`; configures Firebase, registers for push notifications via `UNUserNotificationCenter`, subscribes to the FCM topic `"all"`, requests user location, and kicks off `DataManager.shared.fetchAll()` at launch
- `SceneDelegate` (`berkeley-mobile/SceneDelegate.swift`) — creates the `UIWindow` and installs `TabBarController` as root view controller; calls `DataManager.shared.fetchIfNecessary()` on foreground re-entry

## Navigation Model

`TabBarController` (`berkeley-mobile/TabBarController.swift`) manages four top-level tabs:

| Tab | Title | Root View |
|-----|-------|-----------|
| 0 | Home | `MainContainerViewController` → `HomeView` + `MapViewController` |
| 1 | Today | `TodayView` (SwiftUI) |
| 2 | Safety | `SafetyView` (SwiftUI) |
| 3 | Resources | `ResourcesView` (SwiftUI) |

## Data Layer

- `DataManager` (`berkeley-mobile/Data/DataManager.swift`) is a singleton that coordinates `DataSource` protocol implementations. Active sources at launch: `MapDataSource`, `LibraryDataSource`, `GymDataSource`. Fetches are rate-limited to one per 60 minutes (`fetchInterval`).
- `BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift`) provides async/await Firestore calls for Safety Logs and Resource Categories.
- Individual feature `ViewModel` classes (e.g., `DiningHallsViewModel`, `EventsDataService`, `SafetyViewModel`) interact with Firestore directly using the `async/await` pattern.

## Major Technical Components

| Component | Location |
|-----------|----------|
| App entry point | `berkeley-mobile/AppDelegate.swift` |
| Scene / window setup | `berkeley-mobile/SceneDelegate.swift` |
| Tab navigation | `berkeley-mobile/TabBarController.swift` |
| Home + map container | `berkeley-mobile/MainContainerViewController.swift` |
| Data orchestration | `berkeley-mobile/Data/DataManager.swift` |
| Firestore networking | `berkeley-mobile/Data/BMNetworkingManager.swift` |
| Location | `berkeley-mobile/Data/BMLocationManager.swift` |
| Dependency injection container | `berkeley-mobile/BerkeleyMobile+Injection.swift` |
| Widget extension entry | `BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift` |
| Widget content | `BerkeleyMobileWidget/GymOccupancyWidget.swift` |

## Widget Extension

`BerkeleyMobileWidgetBundle` registers `GymOccupancyWidget`, a `systemSmall` WidgetKit widget that displays RSF Weight Room and CMS Fitness Center occupancy percentages fetched from Firestore via `GymOccupancyViewModel`. Firebase is configured in the widget's `init()` if not already set up.

## Push Notifications

The app registers for remote notifications at launch. `AppDelegate` conforms to `MessagingDelegate` and subscribes to the FCM topic `"all"`. On notification tap, `AppDelegate`'s `UNUserNotificationCenterDelegate` implementation selects tab index 2 (Safety).

## Permissions Declared (Info.plist)

- `NSLocationWhenInUseUsageDescription` — location for map distance and POI features
- `NSCalendarsUsageDescription` / `NSCalendarsFullAccessUsageDescription` — adding events to the system calendar

## Version Migration

`AppDelegate+Migration.swift` (`checkForUpdate()`) compares the current app version against the last-launched version stored in `UserDefaults`. Migrations are keyed on version ranges; the observed migration (for versions before 10.0.1) clears Firestore persistence and Firebase Analytics data.

## Deployment Model

iOS application distributed through the App Store (standard iOS bundle; no server component in this repository).
