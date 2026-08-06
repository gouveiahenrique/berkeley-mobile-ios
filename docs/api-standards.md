# API / Interface Standards

This repository is a mobile application (native iOS). It does not expose HTTP routes, controllers, or server-side APIs. This document covers the repository's outbound networking layer and service interface contracts, per the mobile analysis path.

## Backend Communication

The repository implements outbound communication exclusively with Google Cloud Firestore via the Firebase iOS SDK (`Firebase/Firestore` pod, `import Firebase` / `import FirebaseFirestore`). No custom REST/GraphQL client code was found in the inspected repository areas.

Two distinct access patterns coexist in the repository:

### 1. `DataSource` protocol + `DataManager` cache

`berkeley-mobile/Data/DataSource.swift` defines the contract:

```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

Conforming types (Level 1, confirmed in repository):
- `MapDataSource` (`berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift`) — Firestore collection `"Map Marker"`.
- `LibraryDataSource` (`berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift`) — Firestore collection `"Libraries"`.
- `GymDataSource` (`berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift`) — Firestore collection `"Gyms"`.
- `GymClassDataSource` (`berkeley-mobile/Home/Fitness/GymClassDataSource/GymClassDataSource.swift`) — Firestore collection `"Gym Classes"` (constant `kGymClassesEndpoint`).

Each `fetchItems(_:)` implementation calls `Firestore.firestore().collection(<name>).getDocuments { querySnapshot, err in ... }`, parses each document into a typed model via a private `parse*` function, and reports errors by printing to console (e.g. `GymClassDataSource.fetchItems`: `print("[Error @ GymClassDataSource.fetchItems()]: \(err)")`) rather than propagating a typed error to the completion handler.

`DataManager` (`berkeley-mobile/Data/DataManager.swift`) is the central consumer: it holds a fixed list of `DataSource.Type` (`kDataSources`: `MapDataSource`, `LibraryDataSource`, `GymDataSource`), fetches each once via a `DispatchGroup`-guarded `fetch(source:_:)`, caches results in an internal `AtomicDictionary<String, [Any]>` keyed by type name, and exposes `fetchAll()` / `fetchIfNecessary()` (throttled to once per `fetchInterval = 60 * 60` seconds).

Note: `GymClassDataSource` conforms to `DataSource` but is not present in `DataManager`'s `kDataSources` list based on the explored source of `DataManager.swift`.

### 2. Direct `async`/`await` Firestore access

`berkeley-mobile/Data/BMNetworkingManager.swift` defines a separate singleton, `BMNetworkingManager.shared`, exposing `async throws` methods that query Firestore directly and decode results with `Codable`:

```swift
func fetchSafetyLogs() async throws -> [BMSafetyLog]
func fetchResourcesCategories() async throws -> [BMResourceCategory]
```

Both use `db.collection(<BMConstants collection name>).getDocuments()` then `documents.compactMap { try? $0.data(as: <Type>.self) }`, silently dropping documents that fail to decode (no error surfaced for individual decode failures). Collection names are centralized as constants in `berkeley-mobile/Data/BMConstants.swift` (e.g. `safetyLogsCollectionName`, `resourceCategoriesCollectionName`).

Some view models bypass both `DataManager` and `BMNetworkingManager`, querying `Firestore.firestore()` directly inline, e.g. `DiningHallsViewModel` (`berkeley-mobile/Home/Dining/DiningDataSource/DiningHallsViewModel.swift`) queries collections `"Dining Halls"` and `"Dining Halls V2"` directly using `async`/`await` and `Codable` decoding, and `GymOccupancyViewModel` (`berkeley-mobile/Home/Fitness/GymOccupancy/GymOccupancyViewModel.swift`) queries the `"Gym Occupancy Meters"` collection directly via `withTaskGroup`.

The repository does not have a single unified networking-client abstraction; three coexisting access styles were observed: the `DataSource`/`DataManager` cache pattern, the `BMNetworkingManager` async wrapper, and direct in-view-model Firestore calls.

## Error Handling

- `berkeley-mobile/Data/BMError.swift` defines an app-level `BMError: Error` enum (cases: `.eventAlreadyAddedInCalendar`, `.insufficientAccessToCalendar`, `.mayExistedInCalendarAlready`, `.unableToFindEventInCalendar`) conforming to `LocalizedError`, providing user-facing `errorDescription` strings via `NSLocalizedString`. This type is scoped to calendar-related operations based on its case names.
- Firestore fetch errors in the `DataSource` conformances (e.g. `GymClassDataSource`) are logged to the console and the completion handler is not invoked, rather than being surfaced as a typed error.
- `async throws` methods in `BMNetworkingManager` and `DiningHallsViewModel` propagate Firestore errors via Swift's `throws`/`try` mechanism to their callers; some call sites catch and log via `os.Logger` (e.g. `Logger.diningHallsViewModel.error("\(error)")` in `DiningHallsViewModel.swift`) rather than surfacing to the UI.

## Authentication

`GoogleSignIn` and `Firebase/Auth` are declared as dependencies in `Podfile`, and `GoogleSignIn` is imported in `berkeley-mobile/AppDelegate.swift`. The specific authentication flow implementation was not further inspected in this pass. Not found in codebase (in inspected areas): explicit sign-in view controller or authentication view model source.

## Push Notifications

`berkeley-mobile/AppDelegate.swift` implements `MessagingDelegate` (`messaging(_:didReceiveRegistrationToken:)`, posting a local `NotificationCenter` notification named `"FCMToken"` and subscribing the device to the Firebase Cloud Messaging topic `"all"`) and `UNUserNotificationCenterDelegate` (`willPresent`, `didReceive response:`), the latter routing a tapped notification to `tabBarController?.selectedIndex = 2`.

## Data Contracts

Shared model protocols are defined under `berkeley-mobile/Data/ItemProtocols/`: `HasImage`, `HasLocation`, `HasName`, `HasOpenTimes`, `HasOpenClosedStatus`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `SearchItem`, `BMCalendarEvent`. Concrete Firestore-backed model types (e.g. `BMGym`, `BMLibrary`, `BMDiningHall`, `MapMarker`, `GymClass`, `BMEventCalendarEntry`, `BMSafetyLog`, `BMResourceCategory`) compose these protocols to participate in shared app features such as search (`SearchItem`) and favoriting (`CanFavorite`). `BMEventCalendarEntry` (`berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift`) additionally conforms to `NSCoding`, implementing `encode(with:)` / `init?(coder:)` for archiving.

Not applicable: this repository has no server-side route, controller, or GraphQL schema layer to document.
