# Technical Overview

## Repository Purpose

`berkeley-mobile` is a native iOS application for UC Berkeley students. Based on evidence in the source, it surfaces campus resources across four primary domains: campus map and facilities (Home), a daily-at-a-glance view (Today), safety incident logs (Safety), and campus resource links (Resources). A companion widget extension (`BerkeleyMobileWidget`) is included in the same workspace.

## Repository Classification

- **Type**: Native iOS mobile application + WidgetKit extension
- **Primary language**: Swift
- **UI frameworks**: SwiftUI (primary, observed in majority of screens) and UIKit (retained for `MapViewController`, `DrawerViewController`, and legacy components)
- **Architectural style**: MVVM with protocol-oriented data modeling; UIKit/SwiftUI interoperability via `UIHostingController` and `UIViewControllerRepresentable`

## Languages and Frameworks

| Concern | Technology |
|---|---|
| Primary language | Swift |
| UI — new surfaces | SwiftUI |
| UI — map and drawer | UIKit |
| Backend / data store | Firebase / Cloud Firestore |
| Authentication | Firebase Auth, Google Sign-In |
| Push notifications | Firebase Cloud Messaging (FCM) |
| Analytics | Firebase Analytics |
| Dependency injection | FactoryKit |
| Widget extension | WidgetKit (SwiftUI) |
| Location | CoreLocation, MapKit |
| Calendar integration | EventKit (via `BMEventManager`) |
| Package management | CocoaPods (`Podfile`) |

## Firebase Collections Referenced in Code

The following Firestore collection names are defined in `BMConstants` and data source files:

| Swift constant / literal | Firestore collection |
|---|---|
| `safetyLogsCollectionName` | `"Safety Logs"` |
| `resourceCategoriesCollectionName` | `"Resource Categories"` |
| `kLibrariesEndpoint` | `"Libraries"` |
| `kGymsEndpoint` | `"Gyms"` |
| `kDiningHallEndpoint` | `"Dining Halls V2"` |
| `kDiningHallAdditionalDataEndpoint` | `"Dining Halls"` |
| `kEventsDataServiceEndpoint` | `"Events"` |
| `gymOccupancyCollectionName` | `"Gym Occupancy Meters"` |
| `FeedbackFormViewModel` (inferred from Logger registration) | Not directly confirmed in examined code |

## Runtime Architecture

### Application entry and lifecycle

- `AppDelegate` (`berkeley-mobile/AppDelegate.swift`) annotated with `@UIApplicationMain`; configures Firebase, registers for push notifications via FCM, and invokes `DataManager.shared.fetchAll()` at launch.
- `SceneDelegate` (`berkeley-mobile/SceneDelegate.swift`) creates the root `UIWindow` and sets `TabBarController` as the root view controller. On `sceneWillEnterForeground`, it calls `DataManager.shared.fetchIfNecessary()` to refresh data.
- Single-scene lifecycle (`UIApplicationSupportsMultipleScenes = false` in `Info.plist`).

### Tab navigation

`TabBarController` (`berkeley-mobile/TabBarController.swift`) constructs four tabs at startup:

| Tab index | Title | Root controller |
|---|---|---|
| 0 | Home | `MainContainerViewController` (UIKit host for `HomeView` + `MapViewController`) |
| 1 | Today | `UIHostingController<TodayView>` |
| 2 | Safety | `UIHostingController<SafetyView>` |
| 3 | Resources | `UIHostingController<ResourcesView>` |

A debug-only `DebugView` is presented modally when the device is shaken (`motionEnded`, `#if DEBUG` guarded).

### Data layer

`DataManager` (`berkeley-mobile/Data/DataManager.swift`) is a singleton that fetches from registered `DataSource` implementations (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) at most once per source per app session, with a one-hour minimum re-fetch interval. Data is cached in `AtomicDictionary`, which wraps a `pthread_rwlock_t` read-write lock for thread safety.

`BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift`) is a separate singleton for direct Firestore reads (safety logs, resource categories) using Swift concurrency (`async/throws`).

### Widget extension

`BerkeleyMobileWidgetBundle` (`BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift`) registers a single widget: `GymOccupancyWidget`. It initialises Firebase independently and uses `GymOccupancyViewModel` to fetch occupancy data from Firestore on a 15-minute `Timeline` refresh interval.

## Deployment Configuration

- Orientation: portrait only on iPhone; all orientations on iPad (from `Info.plist`).
- Background modes declared: `fetch`, `remote-notification` (from `Info.plist`).
- Permissions requested: location when in use, calendar full access (from `Info.plist`).
- Architecture target: `armv7` (from `Info.plist`).
- `NSAllowsArbitraryLoads = true` in `NSAppTransportSecurity` (from `Info.plist`).

## Version Migration

`AppDelegate+Migration.swift` implements a `checkForUpdate()` mechanism that compares the running version string against the last-seen version stored in `UserDefaults`. Migrations are keyed by version (e.g. cache clear for versions prior to `10.0.1`).
