# Technical Overview

## Repository Purpose

berkeley-mobile is an iOS mobile application for UC Berkeley students. Based on repository evidence, it provides access to campus resources including dining halls, fitness facilities, libraries, campus map markers, safety alerts, events, and general campus resources. The repository also includes a WidgetKit extension for home screen widgets.

## Languages and Frameworks

- **Primary language**: Swift
- **UI frameworks**: UIKit (legacy views, `UIViewController`-based flows) and SwiftUI (newer screens and detail views). Both are used concurrently; UIKit views are bridged into SwiftUI using `UIViewControllerRepresentable` and `UIHostingController`.
- **Dependency management**: CocoaPods (`Podfile`, `Podfile.lock`)
- **Dependency injection**: FactoryKit (`BerkeleyMobile+Injection.swift`)
- **Platform**: iOS (iPhone)
- **Widget extension**: WidgetKit (`BerkeleyMobileWidget/`)

## External Dependencies (from Podfile)

| Pod | Usage observed in repository |
|-----|-------------------------------|
| `Firebase/Analytics` | Analytics event logging (`Analytics.logEvent`) |
| `Firebase` | Firebase SDK base |
| `Firebase/Firestore` | Firestore document and collection fetching across all data sources |
| `FirebaseMessaging` | FCM push notification token handling (`AppDelegate`) |
| `Firebase/Auth` | Imported; exact authentication flow not fully traced |
| `GoogleSignIn` | Imported in `AppDelegate` |

## Runtime Architecture

The application entry point is `AppDelegate` (`berkeley-mobile/AppDelegate.swift`), annotated `@UIApplicationMain`. On launch, `AppDelegate.application(_:didFinishLaunchingWithOptions:)`:
1. Configures Firebase (`FirebaseApp.configure()`).
2. Triggers a full data fetch via `DataManager.shared.fetchAll()`.
3. Starts location updates via `BMLocationManager.shared.requestLocation()`.
4. Configures push notifications and Firebase Cloud Messaging.

`SceneDelegate` (`berkeley-mobile/SceneDelegate.swift`) constructs the app's root window with a `TabBarController` as the root view controller. On foreground re-entry (`sceneWillEnterForeground`), it calls `DataManager.shared.fetchIfNecessary()` to refresh data if the minimum interval (1 hour) has elapsed.

## Major Technical Components

### TabBarController
`berkeley-mobile/TabBarController.swift` — Root navigation controller hosting four tabs: **Home**, **Today**, **Safety**, **Resources**. The Home tab is a UIKit `MainContainerViewController`; the other three are SwiftUI views wrapped in `UIHostingController`.

### DataManager
`berkeley-mobile/Data/DataManager.swift` — Singleton data coordinator managing three registered `DataSource` implementations: `MapDataSource`, `LibraryDataSource`, `GymDataSource`. Uses `DispatchGroup` to coordinate concurrent Firestore fetches. Stores fetched data in an `AtomicDictionary`. Enforces a minimum 1-hour fetch interval via `fetchIfNecessary()`.

### DataSource Protocol
`berkeley-mobile/Data/DataSource.swift` — Protocol requiring `fetchItems(_:)` and a `fetchDispatch: DispatchGroup`. Each conforming type fetches from a named Firestore collection.

### BMNetworkingManager
`berkeley-mobile/Data/BMNetworkingManager.swift` — Singleton networking manager using `async/await`. Provides `fetchSafetyLogs()` and `fetchResourcesCategories()` via Firestore document decoding.

### BMLocationManager
`berkeley-mobile/Data/BMLocationManager.swift` — Singleton wrapper for `CLLocationManager`. Broadcasts `.locationUpdated` notifications via `NotificationCenter` when the user's location changes.

### Dependency Injection Container
`berkeley-mobile/BerkeleyMobile+Injection.swift` — Extends `Container` (FactoryKit) registering all view model factories, including: `calendarViewModel`, `diningHallsViewModel`, `eventsViewModel`, `feedbackFormPresenter`, `guidesViewModel`, `gymOccupancyViewModel`, `homeDrawerPinViewModel`, `homeViewModel`, `mapMarkersDropdownViewModel`, `mapUserLocationButtonViewModel`, `menuItemIconCacheManager`, `newsDataViewModel`, `resourcesViewModel`, `safetyViewModel`, `searchViewModel`, `weatherDataViewModel`.

### ImageLoader
`berkeley-mobile/Common/Images/ImageLoader.swift` — Singleton in-memory image cache using `URLSessionDataTask`. Images are stored by `URL`; tasks are tracked by `UUID` for cancellation support.

### WidgetKit Extension
`BerkeleyMobileWidget/` — `GymOccupancyWidget` (`BerkeleyMobileWidget/GymOccupancyWidget.swift`) is the only registered widget. It uses `TimelineProvider` to display gym occupancy percentages for RSF Weight Rooms and CMS Fitness Center. Refreshes on a 15-minute interval defined in `GymOccupancyViewModel.Constants.refreshIntervalSecs`.

## Deployment / Runtime Model

The application is distributed as an iOS app. The WidgetKit extension is bundled as a separate target (`BerkeleyMobileWidgetExtension`). Both targets use CocoaPods for dependency management. Firebase is initialized in both the app (`AppDelegate`) and the widget bundle (`BerkeleyMobileWidgetBundle`).
