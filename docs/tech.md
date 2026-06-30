# Technical Overview

## Repository Purpose

Berkeley Mobile is an iOS application for UC Berkeley students. The app provides campus-specific information including dining hall listings, fitness facilities, library locations, map markers, campus events, safety logs, and campus resources. A companion Widget Extension exposes gym occupancy data on the iOS home screen.

## Repository Classification

- **Type**: Mobile application (iOS)
- **Primary Language**: Swift
- **UI Frameworks**: UIKit (legacy screens), SwiftUI (primary framework for current screens)
- **Architecture Style**: Mixed UIKit / SwiftUI, MVVM with dependency injection via FactoryKit

---

## Languages and Frameworks

| Technology | Usage |
|---|---|
| Swift | All application source |
| SwiftUI | Primary UI framework for current views |
| UIKit | Legacy view controllers, drawer system, map overlay |
| WidgetKit | Home screen gym occupancy widget (`BerkeleyMobileWidget` target) |
| WeatherKit | Berkeley weather tile in `TodayView` |
| MapKit | Campus map (`MapViewController`, `MKMapView`) |
| Firebase / Firestore | Remote data source for all collections |
| Firebase Analytics | Event logging throughout the app |
| Firebase Messaging | Push notification registration and FCM token management |
| Google Sign-In | Authentication dependency (declared in `Podfile`) |
| FactoryKit | Dependency injection container |
| CocoaPods | Dependency manager (`Podfile`, `Podfile.lock`) |

---

## Major Technical Components

### Application Entry

`berkeley-mobile/AppDelegate.swift` is the `@UIApplicationMain` entry point. On launch it:
- Calls `FirebaseApp.configure()`
- Calls `DataManager.shared.fetchAll()` to pre-load data from Firestore
- Calls `BMLocationManager.shared.requestLocation()` to start location updates
- Registers for remote push notifications via `UNUserNotificationCenter` and `Messaging`

`berkeley-mobile/SceneDelegate.swift` sets up the window. The root view controller is `TabBarController`, installed in `scene(_:willConnectTo:)`.

### Tab Navigation

`TabBarController` (`berkeley-mobile/TabBarController.swift`) defines four tabs:

| Tab | Label | Root View |
|---|---|---|
| 0 | Home | `MainContainerViewController` (wraps `HomeView` + `MapViewController`) |
| 1 | Today | `TodayView` (SwiftUI) |
| 2 | Safety | `SafetyView` (SwiftUI) |
| 3 | Resources | `ResourcesView` (SwiftUI) |

### Home Tab Architecture

`MainContainerViewController` (`berkeley-mobile/MainContainerViewController.swift`) is a `UIViewController` that conforms to `MainDrawerViewDelegate`. It embeds `HomeView` (SwiftUI) via `UIHostingController`. `HomeView` overlays `HomeMapView` (an `MKMapView` wrapper) with a bottom drawer (`BMDrawerView`) that contains a segmented control switching between:
- **Dining** (`DiningHallsView`)
- **Fitness** (`FitnessView`)
- **Study** (`LibrariesView`)
- **Guides** (`GuidesView`)

### Drawer System

The drawer system is UIKit-based, centred on:
- `DrawerState` enum: `.hidden`, `.collapsed`, `.middle`, `.full`
- `DrawerViewDelegate` protocol: declares pan-gesture handling and position management
- `DrawerViewController`: UIViewController subclass with a pan gesture recogniser and animated position changes
- `MainDrawerViewDelegate`: extends `DrawerViewDelegate` with a stack-based multi-drawer management API (`dismissTop`, `coverTop`, `hideTop`, `showTop`, `showMainDrawer`)

`HomeView` in the current implementation uses a pure SwiftUI `BMDrawerView` (`berkeley-mobile/Common/BMDrawerView.swift`) controlled by `homeViewModel.drawerViewState`.

### Data Layer

`DataManager` (`berkeley-mobile/Data/DataManager.swift`) is a singleton that coordinates Firestore fetches via the `DataSource` protocol. Registered data sources at startup:
- `MapDataSource` — Firestore collection `"Map Marker"`
- `LibraryDataSource` — Firestore collection `"Libraries"`
- `GymDataSource` — Firestore collection `"Gyms"`

`DataManager` caches results in an `AtomicDictionary` and enforces a minimum re-fetch interval of 3 600 seconds (1 hour).

`BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift`) is a separate singleton that directly queries Firestore for:
- Safety logs (`"Safety Logs"` collection)
- Resource categories (`"Resource Categories"` collection)

`EventsDataService` (`berkeley-mobile/Events/EventDataSource/EventsViewModel.swift`) fetches campus events from a `"Events"` Firestore collection using Swift Concurrency (`async/await`).

`GymOccupancyViewModel` fetches real-time gym occupancy from a `"Gym Occupancy Meters"` Firestore collection using `TaskGroup`. The Widget Extension uses the same `GymOccupancyViewModel` and fetches on a `Timeline` refresh schedule.

### Dependency Injection

FactoryKit is used throughout. `Container` extensions are defined in `berkeley-mobile/BerkeleyMobile+Injection.swift`. Registered factories include view models and managers such as `homeViewModel`, `eventsViewModel`, `safetyViewModel`, `weatherDataViewModel`, `gymOccupancyViewModel`, and others. ViewModels are declared as `.singleton` or `.shared` scope as appropriate.

### Widget Extension

`BerkeleyMobileWidget` target (`BerkeleyMobileWidget/`) provides a single WidgetKit widget:
- `GymOccupancyWidget`: displays RSF Weight Rooms and CMS Fitness Center occupancy percentages. Uses `GymOccupancyProvider` (a `TimelineProvider`) which fetches from `GymOccupancyViewModel`. Timeline refresh interval is `GymOccupancyViewModel.Constants.refreshIntervalSecs` (15 minutes).

### Location

`BMLocationManager` (`berkeley-mobile/Data/BMLocationManager.swift`) is a singleton wrapper around `CLLocationManager`. It broadcasts location updates via `NotificationCenter` using the `Notification.Name.locationUpdated` name.

### Image Loading

`ImageLoader` is used for caching and fetching remote images. The `HasImage` protocol (`berkeley-mobile/Data/ItemProtocols/HasImage.swift`) provides a default `fetchImage(completion:)` implementation backed by `ImageLoader.shared`.

### Today Tab

`TodayView` renders a tiled layout using `TodayTilingLayout` (a custom SwiftUI `Layout`) with `TodayTilePlacementEngine`. Current tile types are `news` and `weather` (defined in the `TodayTiles` enum).

### Debug Mode

A `DebugView` is presented when a shake gesture is detected in `TabBarController.motionEnded(_:with:)`. This is gated with `#if DEBUG`.

---

## Deployment and Runtime Model

- **Platform**: iOS
- **Package format**: `.xcworkspace` managed by CocoaPods
- **Project file**: `berkeley-mobile.xcodeproj`
- **Targets**: `berkeley-mobile` (main app), `BerkeleyMobileWidgetExtension` (widget)
- **Push notifications**: FCM token subscribed to `"all"` topic on registration
- **App Store review prompt**: triggered via `ReviewPrompter` after map data loads
- **Feedback form**: `FeedbackFormPresenter` attempts to show a feedback form on app launch based on a launch-count threshold stored in `UserDefaults`
