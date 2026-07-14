# Technical Overview

## Repository Purpose

Berkeley Mobile is an iOS application built for the UC Berkeley campus community. The app surfaces campus resources including maps, libraries, fitness facilities, dining halls, campus events, safety logs, and curated guides. A companion WidgetKit extension provides a home-screen widget showing gym occupancy.

## Primary Language and Frameworks

- **Language:** Swift
- **UI Frameworks:** UIKit (legacy views and drawer system), SwiftUI (newer screens and tiles)
- **Dependency manager:** CocoaPods (`Podfile`, `Podfile.lock`)
- **Minimum device capability:** `armv7` (declared in `Info.plist`)
- **Supported orientations:** Portrait only on iPhone; portrait and landscape on iPad

## External Dependencies (from `Podfile`)

| Dependency | Purpose |
|---|---|
| `Firebase` / `FirebaseCore` | SDK root and app configuration |
| `Firebase/Analytics` | Event analytics (`FirebaseAnalytics`) |
| `Firebase/Firestore` | Cloud Firestore document database (primary backend) |
| `Firebase/Auth` | Authentication SDK (imported, GoogleSignIn integration present) |
| `FirebaseMessaging` | Push notification token management and topic subscriptions |
| `GoogleSignIn` | Google OAuth sign-in (imported in `AppDelegate`) |

## Internal Libraries (resolved via CocoaPods)

- **FactoryKit** — dependency injection container (`Container` extensions in `BerkeleyMobile+Injection.swift`)
- **Glur** — blur visual effect used in the News tile (`NewsTileView.swift`)
- **WeatherKit** — Apple WeatherKit used for campus weather data (`WeatherDataViewModel.swift`)

## Runtime Architecture

The app uses UIKit scene lifecycle with a `SceneDelegate` that installs `TabBarController` as the window root. Newer feature screens are implemented in SwiftUI and bridged via `UIHostingController`.

### Application Lifecycle

1. `AppDelegate.application(_:didFinishLaunchingWithOptions:)` configures Firebase, triggers `DataManager.shared.fetchAll()`, starts location updates via `BMLocationManager.shared.requestLocation()`, and registers for push notifications.
2. `SceneDelegate.scene(_:willConnectTo:)` creates `TabBarController` and sets it as the root view controller.
3. `SceneDelegate.sceneWillEnterForeground(_:)` calls `DataManager.shared.fetchIfNecessary()` to refresh data if more than one hour has elapsed since the last fetch (`DataManager.fetchInterval = 3600` seconds).

### Tab Structure

`TabBarController` (UIKit) instantiates four top-level view controllers:

| Tab index | Title | Implementation |
|---|---|---|
| 0 | Home | `MainContainerViewController` (UIKit + SwiftUI `HomeView`) |
| 1 | Today | `UIHostingController<TodayView>` (SwiftUI) |
| 2 | Safety | `UIHostingController<SafetyView>` (SwiftUI) |
| 3 | Resources | `UIHostingController<ResourcesView>` (SwiftUI) |

Push notification deep-linking navigates to tab index 2 (Safety) on notification tap (`AppDelegate+UNUserNotificationCenterDelegate`).

## Data Layer

`DataManager` (singleton) coordinates fetching from Firestore-backed `DataSource` implementations. Three sources are registered at compile time (`DataManager.swift` line 12–16):

- `MapDataSource` — fetches map markers from the `"Map Marker"` Firestore collection
- `LibraryDataSource` — fetches libraries from the `"Libraries"` Firestore collection
- `GymDataSource` — fetches gyms from the `"Gyms"` Firestore collection

`BMNetworkingManager` (singleton) provides async/await Firestore fetches for safety logs (`"Safety Logs"` collection) and resource categories (`"Resource Categories"` collection).

`EventsDataService` (singleton) fetches campus events from the `"Events"` Firestore collection.

## Location

`BMLocationManager` wraps `CLLocationManager` as a singleton and broadcasts location updates via `NotificationCenter` using the `.locationUpdated` notification name. Components observe this notification directly (e.g., `LocationDetailView`, `MapUserLocationButtonViewModel`).

## Dependency Injection

The repository uses FactoryKit. All injectable view models and presenters are registered as `Factory` instances in `Container` extensions defined in `BerkeleyMobile+Injection.swift`. Consumers inject dependencies via `@Injected`, `@InjectedObject`, and `@InjectedObservable` property wrappers.

## WidgetKit Extension

`BerkeleyMobileWidget` target declares a single widget (`GymOccupancyWidget`) in `BerkeleyMobileWidgetBundle`. The widget fetches gym occupancy data via `GymOccupancyViewModel` using Firestore and refreshes on a scheduled timeline policy.

## Version Migration

`AppDelegate+Migration.swift` defines a `checkForUpdate()` method that compares `CFBundleShortVersionString` against a `UserDefaults`-stored last-seen version and runs migration closures as needed. Migration history is preserved in the file (documented not to be trimmed).

## Custom Typography

The app registers the Apercu typeface family via `UIAppFonts` in `Info.plist` (Regular, Bold, Bold Italic, Italic, Light, Light Italic, Medium, Medium Italic, Mono). `BMFont` (`Assets/Fonts.swift`) exposes static closures mapping weight names to `UIFont` instances with a system font fallback.

## Push Notifications

The app subscribes all devices to the FCM topic `"all"` on token receipt (`AppDelegate+MessagingDelegate`). Background modes declared in `Info.plist`: `fetch` and `remote-notification`.
