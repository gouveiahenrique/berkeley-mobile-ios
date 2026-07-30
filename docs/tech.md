# Technical Overview

## Repository Purpose

Berkeley Mobile is an iOS mobile application built for the UC Berkeley campus community. The application provides students and visitors with campus information across four primary areas: a home view with map and venue details (dining, fitness, libraries, guides), a daily-glance "Today" view with news and weather tiles, a campus safety log view, and a campus resources directory.

## Repository Type

- **Category**: Mobile application (iOS)
- **Targets**: `berkeley-mobile` (main app), `BerkeleyMobileWidgetExtension` (iOS WidgetKit extension)

## Primary Language

- Swift (100% of application code)

## Frameworks and Platforms

| Dependency | Role |
|---|---|
| UIKit | Legacy and bridging view controllers (`AppDelegate`, `TabBarController`, `MapViewController`, drawer views) |
| SwiftUI | Primary UI framework for feature screens (`TodayView`, `SafetyView`, `ResourcesView`, `HomeView`, and most detail/tile views) |
| Firebase / Firestore | Primary remote data backend — all application data is fetched from Firestore collections |
| Firebase Analytics | User interaction analytics (`Analytics.logEvent`) |
| Firebase Messaging | Push notification delivery; subscribes all devices to the `"all"` topic |
| GoogleSignIn | Imported in `AppDelegate`; Google OAuth sign-in support |
| MapKit | Interactive maps in the Home tab and Safety tab |
| WeatherKit | Real-time weather data for the Today Weather tile |
| WidgetKit | Home-screen widget (`GymOccupancyWidget`) |
| FactoryKit | Dependency injection container; all ViewModels are registered in `BerkeleyMobile+Injection.swift` |
| os.Logger | Structured logging via the `Logger` type, with per-subsystem categories defined in `Logger+Ext.swift` |

Pod dependencies (from `Podfile`): `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, `GoogleSignIn`. The widget extension uses only `Firebase/Firestore`.

## Runtime Architecture

The application uses a UIKit scene-based lifecycle with SwiftUI views embedded through `UIHostingController`.

- `AppDelegate` (`@UIApplicationMain`) handles initial app launch: configures Firebase, requests location, initiates the first `DataManager.fetchAll()`, and sets up push notification delegation.
- `SceneDelegate` calls `DataManager.fetchIfNecessary()` on scene activation to refresh data if stale (refresh interval: 3,600 seconds).
- `TabBarController` (UIKit) is the root view controller. It hosts four top-level views: **Home** (`MainContainerViewController`), **Today** (SwiftUI `TodayView`), **Safety** (SwiftUI `SafetyView`), and **Resources** (SwiftUI `ResourcesView`).

### Data Layer

Two parallel data-fetching strategies coexist:

1. **`DataManager` + `DataSource` protocol** — used for map markers, libraries, and gyms. `DataSource` subclasses (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) fetch from named Firestore collections and parse dictionaries into model objects. `DataManager.shared` is a singleton that deduplicates concurrent fetches with `DispatchGroup`.

2. **`@Observable` ViewModels fetching directly** — used for dining halls, events, safety logs, resources, news, and gym occupancy. These ViewModels fetch from Firestore using `async/await` and publish state via the `@Observable` macro or `ObservableObject`.

### Widget Extension

`BerkeleyMobileWidgetExtension` contains a single `GymOccupancyWidget` (`.systemSmall`). It uses `GymOccupancyProvider: TimelineProvider` which calls `GymOccupancyViewModel.fetchOccupancyPercentages()` to fetch RSF Weight Room and CMS Fitness Center occupancy percentages from the `"Gym Occupancy Meters"` Firestore collection. The timeline refreshes every 15 minutes.

## Firestore Collections Referenced

| Collection | Consumer |
|---|---|
| `"Libraries"` | `LibraryDataSource` |
| `"Gyms"` | `GymDataSource` |
| `"Gym Classes"` | `GymClassDataSource` |
| `"Map Marker"` | `MapDataSource` |
| `"Gym Occupancy Meters"` | `GymOccupancyViewModel` |
| `"Dining Halls V2"` | `DiningHallsViewModel` |
| `"Dining Halls"` | `DiningHallsViewModel` (additional data) |
| `"Events"` | `EventsDataService` |
| `"Safety Logs"` | `BMNetworkingManager` |
| `"Resource Categories"` | `BMNetworkingManager` |
| `"Daily Cal News"` | `NewsDataViewModel` |

## Deployment Model

The application is distributed as a standard iOS app. No server-side code exists in this repository. All backend logic runs inside the Firebase/Firestore platform. App version is tracked via `CFBundleShortVersionString`; a `checkForUpdate()` migration system in `AppDelegate+Migration.swift` runs per-version cleanup tasks on launch.
