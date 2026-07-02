# Tech Overview

## Repository Purpose

Berkeley Mobile is an iOS application for UC Berkeley students and community members. The application provides information about campus resources including dining halls, fitness facilities, libraries, campus map markers, events, safety logs, and general university resources.

## Languages and Frameworks

- **Language**: Swift
- **UI Frameworks**: UIKit (legacy screens and drawer system) and SwiftUI (newer screens and components)
- **Dependency Manager**: CocoaPods (`Podfile`, `Podfile.lock`)
- **Build System**: Xcode (`berkeley-mobile.xcodeproj`)

## Primary External Dependencies (from `Podfile`)

| Dependency | Purpose |
|---|---|
| `Firebase/Analytics` | Event analytics via `FirebaseAnalytics` |
| `Firebase` | Firebase SDK core |
| `FirebaseMessaging` | Push notifications (FCM) |
| `Firebase/Firestore` | Cloud Firestore database (primary data backend) |
| `Firebase/Auth` | Firebase Authentication |
| `GoogleSignIn` | Google OAuth sign-in |
| `FactoryKit` | Dependency injection container |

## Internal Dependencies (from `berkeley-mobile/BerkeleyMobile+Injection.swift`)

The app uses `FactoryKit` for dependency injection. The `Container` extension registers view models and services as factories with singleton or shared scopes.

## Runtime Architecture

The application uses a dual UIKit / SwiftUI runtime:

- `AppDelegate` (UIApplicationDelegate) initializes Firebase, the data layer, location manager, and push notification registration on launch (`AppDelegate.swift:20`).
- `SceneDelegate` handles the UIScene lifecycle and sets the root window.
- `TabBarController` (UITabBarController) is the root view controller, hosting four tabs: **Home**, **Today**, **Safety**, and **Resources** (`TabBarController.swift:64-69`).
- The **Home** tab uses `MainContainerViewController` (UIViewController), which embeds a SwiftUI `HomeView` via `UIHostingController`.
- The **Today**, **Safety**, and **Resources** tabs are hosted via `UIHostingController` wrapping SwiftUI root views.

## Data Layer

- `DataManager.shared` is a singleton that orchestrates data fetching from Firestore through registered `DataSource` types (`DataManager.swift:18`).
- Registered data sources at launch: `MapDataSource`, `LibraryDataSource`, `GymDataSource` (`DataManager.swift:12-16`).
- Individual view models may also query Firestore directly (e.g., `NewsDataViewModel`, `EventsDataService`, `BMNetworkingManager`).
- The fetch interval enforced by `DataManager` is 1 hour (`DataManager.swift:24`).

## Background Modes

The `Info.plist` declares two background modes: `fetch` and `remote-notification`.

## Push Notifications

Firebase Cloud Messaging (FCM) is used. On FCM token registration, the app subscribes to the `all` topic (`AppDelegate.swift:86`). Incoming notification taps navigate to tab index 2 (Safety tab) (`AppDelegate.swift:68`).

## Widget Extension

The `BerkeleyMobileWidget` target provides an iOS widget extension (`BerkeleyMobileWidgetBundle.swift`). The widget bundle currently registers `GymOccupancyWidget`, which fetches gym occupancy percentages from Firestore and refreshes on a schedule (`GymOccupancyWidget.swift`). The widget extension uses `Firebase/Firestore` via CocoaPods.

## Persistence

- **Firestore**: Primary remote data store for gyms, libraries, map markers, events, safety logs, resources, news, and guides.
- **UserDefaults**: Used for app launch counters, cached event dates, recent searches, and home drawer pinned item IDs (`UserDefaults+Extension.swift:11-18`).
- **Apple WeatherKit**: Used by `WeatherDataViewModel` for weather data; fetches current and daily forecasts for Berkeley (latitude 37.8716, longitude -122.2727) (`WeatherDataViewModel.swift:25`).

## Location

`BMLocationManager` is a singleton wrapping `CLLocationManager`. It requests `whenInUse` authorization and broadcasts updates via `NotificationCenter` using the `.locationUpdated` notification name (`BMLocationManager.swift:27-96`).

## Logging

The app uses `os.Logger` with per-subsystem categories defined in `Logger+Ext.swift`. Categories observed include `DiningHallsViewModel`, `EventsDataService`, `GuidesViewModel`, `OpenClosedStatusManager`, `FeedbackFormViewModel`, `HomeDrawerPinViewModel`, `NewsDataViewModel`, and `WeatherDataViewModel`.

## Typography

The application uses the Apercu typeface family (Regular, Mono, Bold Italic, Bold, Italic, Light Italic, Light, Medium Italic, Medium) declared as `UIAppFonts` in `Info.plist`. The `BMFont` struct provides access to these fonts.

## Analytics

Firebase Analytics is used. The `EventsViewModel` logs named analytics events such as `opened_academic_calendar` and `opened_campus_wide_events` (`EventsViewModel.swift:94-100`).
