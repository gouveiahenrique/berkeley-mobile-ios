# Technical Overview

## Repository Purpose

The repository implements the Berkeley Mobile iOS application, an application named `berkeley-mobile` (Xcode target `berkeley-mobile`, product name `bm-persona`, app product `Berkeley.app`). Per `README.md`, the application is described as a product of the Associated Students of University of California (ASUC) Office of the Chief Technology Officer (OCTO), providing Bear Transit routes, library and gym information, dining hall menus, and campus resources.

The repository contains a companion iOS home-screen widget extension, `BerkeleyMobileWidgetExtension` (source at `BerkeleyMobileWidget/`), defined as a second target in `berkeley-mobile.xcodeproj/project.pbxproj` with `productType = "com.apple.product-type.app-extension"`.

## Repository Classification

Based on evidence in `berkeley-mobile.xcodeproj`, `Podfile`, and source layout, this repository is classified as:

- **Repository type:** Mobile application (native iOS)
- **Primary language:** Swift (`SWIFT_VERSION = 5.0` in `berkeley-mobile.xcodeproj/project.pbxproj`)
- **UI frameworks:** The repository implements views using both UIKit (`import UIKit`, e.g. `berkeley-mobile/AppDelegate.swift`, `berkeley-mobile/TabBarController.swift`) and SwiftUI (`import SwiftUI`, e.g. `berkeley-mobile/Home/HomeViewModel.swift`, `berkeley-mobile/Events/CalendarView.swift`).
- **Deployment targets:** `IPHONEOS_DEPLOYMENT_TARGET` values of `13.0` and `18.0` are defined in different build configurations in `berkeley-mobile.xcodeproj/project.pbxproj`.
- **Runtime model:** Native iOS application with a home-screen widget extension process (WidgetKit).

## Languages and Frameworks

### Repository-confirmed dependencies (Level 1)

Declared in `Podfile` (CocoaPods, target `berkeley-mobile`):
- `Firebase/Analytics`
- `Firebase`
- `FirebaseMessaging`
- `Firebase/Firestore`
- `Firebase/Auth`
- `GoogleSignIn`

Declared in `Podfile` (CocoaPods, target `BerkeleyMobileWidgetExtension`):
- `Firebase/Firestore`

Declared in `berkeley-mobile.xcodeproj/project.pbxproj` under `XCRemoteSwiftPackageReference` (Swift Package Manager):
- `Factory` (repository `https://github.com/hmlongco/Factory.git`, imported in source as `FactoryKit`)
- `Glur` (repository `https://github.com/joogps/Glur.git`)

Frameworks imported directly in source (Level 1), observed via `AppDelegate.swift` and other files explored:
- `Firebase`, `FirebaseCore`, `FirebaseMessaging`, `FirebaseAnalytics`, `FirebaseFirestore` — backend/analytics/push messaging
- `GoogleSignIn` — authentication
- `UIKit`, `SwiftUI` — UI layers
- `UserNotifications` — push/local notification handling
- `WidgetKit` — widget extension (`BerkeleyMobileWidget/GymOccupancyWidget.swift`)
- `MapKit` — map features (`berkeley-mobile/Data/BMConstants.swift`, `berkeley-mobile/Home/Search/SearchViewModel.swift`)
- `Observation` — Swift's `@Observable` macro-based state management (e.g. `berkeley-mobile/Home/Search/SearchViewModel.swift`, `berkeley-mobile/Home/Dining/DiningDataSource/DiningHallsViewModel.swift`)
- `os` (`os.Logger`) — structured logging (e.g. `berkeley-mobile/Home/Dining/DiningDataSource/DiningHallsViewModel.swift`)

### Backend

The application uses Google Cloud Firestore as its data backend, confirmed by direct `Firestore.firestore()` usage in `berkeley-mobile/Data/BMNetworkingManager.swift`, `berkeley-mobile/Home/Fitness/GymClassDataSource/GymClassDataSource.swift`, and `berkeley-mobile/Home/Dining/DiningDataSource/DiningHallsViewModel.swift`. `README.md` states: "The application pulls data from Google Cloud Firestore," and notes that the production `GoogleService-Info.plist` and API key are not included in the repository.

## Runtime Architecture

### Application entry points

- `berkeley-mobile/AppDelegate.swift` — implements `UIApplicationDelegate` (class `AppDelegate`, marked `@UIApplicationMain`). On launch it calls `FirebaseApp.configure()`, `DataManager.shared.fetchAll()`, `BMLocationManager.shared.requestLocation()`, registers `Messaging.messaging().delegate` and `UNUserNotificationCenter.current().delegate`, and requests remote-notification registration.
- `berkeley-mobile/SceneDelegate.swift` — present in the repository as the `UIWindowSceneDelegate` implementation (file confirmed via directory listing; referenced by `AppDelegate` via `UIApplication.shared.connectedScenes.first?.delegate as? SceneDelegate`).
- `berkeley-mobile/TabBarController.swift` — root `UITabBarController` referenced from `AppDelegate` (`tabBarController?.selectedIndex = 2` on notification tap).
- `berkeley-mobile/MainContainerViewController.swift` — present in repository; exact role not further inspected beyond file presence.
- `BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift` and `BerkeleyMobileWidget/GymOccupancyWidget.swift` — widget extension entry points; `GymOccupancyWidget` is a `Widget` (WidgetKit) with a `TimelineProvider` (`GymOccupancyProvider`) that fetches data via `GymOccupancyViewModel` on a periodic refresh (`GymOccupancyViewModel.Constants.refreshIntervalSecs`).

### Data layer

- `berkeley-mobile/Data/DataManager.swift` defines the `DataManager` singleton (`DataManager.shared`), which owns a static list of `DataSource`-conforming types (`kDataSources`: `MapDataSource`, `LibraryDataSource`, `GymDataSource`) and coordinates fetching/caching their results in an internal `AtomicDictionary<String, [Any]>`, with a minimum re-fetch interval (`fetchInterval = 60 * 60` seconds).
- `berkeley-mobile/Data/DataSource.swift` defines the `DataSource` protocol contract (`fetchItems(_:)`, `fetchDispatch`) implemented by feature-specific data source types such as `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift`, `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift`, `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift`, and `berkeley-mobile/Home/Fitness/GymClassDataSource/GymClassDataSource.swift`. Each conforming type fetches directly from a named Firestore collection (e.g. `kGymClassesEndpoint = "Gym Classes"`).
- `berkeley-mobile/Data/BMNetworkingManager.swift` defines `BMNetworkingManager`, a separate singleton (`BMNetworkingManager.shared`) that performs `async`/`await` Firestore queries decoded via `Codable` (`fetchSafetyLogs()`, `fetchResourcesCategories()`), used by `berkeley-mobile/Safety/SafetyViewModel.swift` and `berkeley-mobile/Resources/ResourcesViewModel.swift`.
- Some feature view models (e.g. `berkeley-mobile/Home/Dining/DiningDataSource/DiningHallsViewModel.swift`) query `Firestore.firestore()` directly rather than going through `DataManager` or `BMNetworkingManager`, so both a shared-cache data-source pattern and direct-Firestore-access patterns coexist in the repository.
- `berkeley-mobile/Data/BMLocationManager.swift` is present in the repository (referenced from `AppDelegate.requestLocation()`); not further inspected.

### Dependency injection

The repository uses the third-party `Factory` package (imported as `FactoryKit`) for dependency injection. `berkeley-mobile/BerkeleyMobile+Injection.swift` extends `Container` with computed `Factory<T>` properties for view models (e.g. `calendarViewModel`, `diningHallsViewModel`, `eventsViewModel`, `homeViewModel`, `gymOccupancyViewModel`, `guidesViewModel`, `homeDrawerPinViewModel`, `feedbackFormPresenter`, `feedbackFormViewModel`), using `Factory` scopes `.shared` and `.singleton`, and a `#if DEBUG`-gated `debugViewModel`. SwiftUI views consume these via the `@InjectedObject` property wrapper (e.g. `berkeley-mobile/Events/CalendarView.swift`).

### View/ViewModel structure

Feature areas under `berkeley-mobile/` each define a `*ViewModel` type alongside their views, e.g.:
- `HomeViewModel` (`berkeley-mobile/Home/HomeViewModel.swift`) — conforms to `ObservableObject`, exposes `@Published` state for dining halls, libraries, gyms, and drawer view state; fetches via `DataManager.shared.fetch(source:)`.
- `DiningHallsViewModel` (`berkeley-mobile/Home/Dining/DiningDataSource/DiningHallsViewModel.swift`) — uses the `@Observable` macro (Swift `Observation` framework) rather than `ObservableObject`/`@Published`.
- `SearchViewModel` (`berkeley-mobile/Home/Search/SearchViewModel.swift`) — also uses `@Observable`; manages map/location search state (`SearchResultsState` enum: `.idle`, `.loading`, `.populated`, `.empty`, `.error`).
- `GymOccupancyViewModel` (`berkeley-mobile/Home/Fitness/GymOccupancy/GymOccupancyViewModel.swift`) — `@Observable`, subclasses `NSObject`, performs periodic Firestore polling via `Timer` and exposes `startAutoRefresh()`/`stopAutoRefresh()`; reused by the widget extension (`BerkeleyMobileWidget/GymOccupancyWidget.swift`).

Both `ObservableObject`/`@Published` (older Combine-based pattern) and `@Observable` (newer Observation-framework pattern) are present concurrently in the repository — the codebase has not standardized on a single state-management approach as of the explored files.

### Widget extension

`BerkeleyMobileWidget/GymOccupancyWidget.swift` defines `GymOccupancyWidget: Widget` with a `StaticConfiguration`, a `GymOccupancyProvider: TimelineProvider`, and SwiftUI views (`GymOccupancyWidgetEntryView`, `GymOccupancyWidgetRowView`). It supports the `.systemSmall` widget family and reuses `GymOccupancyViewModel` to fetch occupancy data directly from Firestore.

## Deployment/Runtime Model

- Package management: CocoaPods (`Podfile`, `Podfile.lock`, `Pods/` directory, `berkeley-mobile.xcworkspace` referencing both `berkeley-mobile.xcodeproj` and `Pods/Pods.xcodeproj`) combined with Swift Package Manager (`XCRemoteSwiftPackageReference` entries in `project.pbxproj`).
- Build/run is via Xcode using the `berkeley-mobile.xcworkspace` workspace, with a checked-in scheme at `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`.
- No CI configuration files (e.g. `.github/workflows/`, Fastlane, `Gemfile`) were found in the inspected repository areas.
- Not found in codebase: server-side deployment configuration (this is a client-only mobile repository; the Firestore backend project/configuration itself, including `GoogleService-Info.plist`, is explicitly excluded per `README.md`).
