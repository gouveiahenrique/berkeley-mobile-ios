# API / Interface Standards

This repository is a mobile application (iOS client), not a backend service. "Interfaces" here refer to how the app communicates with its backend (Google Cloud Firestore) and structures data contracts, not HTTP routes/controllers.

## Backend Communication

The application uses the Firebase iOS SDK (`Firebase`/`FirebaseFirestore`, pinned to `11.2.0` in `Podfile.lock`) as its sole observed backend integration. There is no evidence of a custom REST/GraphQL client.

Two access patterns are used across the repository:

1. **Centralized manager**: `berkeley-mobile/Data/BMNetworkingManager.swift` defines a singleton (`BMNetworkingManager.shared`) with `async throws` methods that query Firestore collections and decode documents into Swift models:
   ```swift
   func fetchSafetyLogs() async throws -> [BMSafetyLog]
   func fetchResourcesCategories() async throws -> [BMResourceCategory]
   ```
   Collection names are defined as constants in `berkeley-mobile/Data/BMConstants.swift` (e.g., `safetyLogsCollectionName = "Safety Logs"`, `resourceCategoriesCollectionName = "Resource Categories"`).

2. **Per-feature direct access**: Several view models/services instantiate their own `Firestore.firestore()` instance and query a collection directly, rather than going through `BMNetworkingManager`:
   - `DiningHallsViewModel` (`berkeley-mobile/Home/Dining/DiningDataSource/DiningHallsViewModel.swift`) queries `"Dining Halls V2"` and `"Dining Halls"`.
   - `EventsDataService` (`berkeley-mobile/Events/EventDataSource/EventsViewModel.swift`) queries `"Events"`.
   - `GuidesViewModel` (`berkeley-mobile/Home/Guides/GuidesViewModel.swift`) queries `"Guides"`.
   - `MapDataSource` (`berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift`) queries `"Map Marker"` using the legacy completion-handler API (`getDocuments { (querySnapshot, err) in ... }`) rather than `async/await`.

   Not found in codebase: a documented rule for when to add a method to `BMNetworkingManager` versus querying Firestore directly in a view model.

## Data Fetch Coordination: `DataSource` Protocol

For a subset of features, the repository implements a `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift`):

```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

Conforming types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) are registered in `DataManager.swift`'s `kDataSources` array and fetched/cached through `DataManager.shared.fetch(source:_:)`, which uses a per-source `DispatchGroup` to ensure each source is only fetched once from Firebase and coalesces concurrent callers. `GymClassDataSource` also conforms to `DataSource` but the repository evidence gathered does not confirm it is included in `kDataSources` (Not found in codebase: confirm inclusion by reading `DataManager.swift`'s full `kDataSources` list, which currently lists only `MapDataSource`, `LibraryDataSource`, `GymDataSource`).

Not all data-driven view models use this protocol; `DiningHallsViewModel`, `EventsViewModel`, `GuidesViewModel`, `ResourcesViewModel`, and `SafetyViewModel` fetch data directly in their own `init()`/methods rather than through `DataSource`/`DataManager`.

## Data Contracts (Models)

Firestore documents are decoded into `Codable` Swift structs using `Firestore.Decoder` via `try $0.data(as: T.self)` (`FirebaseFirestoreSwift`/`FirebaseFirestore` Codable support). Examples:
- `BMSafetyLog` (`berkeley-mobile/Safety/SafetyViewModel.swift`) — `Codable, Hashable, Identifiable`, with custom `CodingKeys` mapping `date_time` → `date`.
- `BMResourceCategory` (`berkeley-mobile/Resources/ResourcesViewModel.swift`).
- `BerkeleyEventsDaySnapshot`, `BerkeleyEvent` (`berkeley-mobile/Events/EventDataSource/EventsViewModel.swift`) — `Codable`.
- `BMDiningHallDocument`, `BMDiningHallAdditionalData` (`berkeley-mobile/Home/Dining/DiningDataSource/BMDiningLocation.swift`) — decoded then mapped into a `BMDiningHall` presentation model.

Some data sources (`MapDataSource`) instead parse raw `[String: Any]` dictionaries manually (e.g., `parseMarker(_:)`), rather than using `Codable` decoding — this is an older pattern than the `Codable`-based fetches added later (per file header dates: `MapDataSource.swift` dated 2020 vs. `BMNetworkingManager.swift`/`DiningHallsViewModel.swift` dated 2025).

## Error Handling

- `async throws` methods propagate Firestore/decoding errors to callers, which catch them and populate a `BMAlert` (`berkeley-mobile/Common/BMAlert.swift`) shown via SwiftUI (e.g., `SafetyViewModel.listenForSafetyLogs()`, `EventsViewModel.deleteEvent(for:)`).
- `berkeley-mobile/Data/BMError.swift` defines an app-specific `BMError: Error, LocalizedError` enum for calendar-integration failures (`eventAlreadyAddedInCalendar`, `insufficientAccessToCalendar`, `mayExistedInCalendarAlready`, `unableToFindEventInCalendar`), each with a `NSLocalizedString`-based `errorDescription`.
- The legacy completion-handler-based fetch in `MapDataSource.fetchItems(_:)` logs errors via `print(...)` rather than surfacing them to the UI or propagating a typed error.

## Authentication

`Podfile` includes `Firebase/Auth` and `GoogleSignIn` as dependencies of the main app target. Not found in codebase: no `FirebaseAuth`/`GoogleSignIn` usage was located in the inspected source files above; further investigation of additional files would be required to document actual authentication flow usage.

## Push Notifications

`AppDelegate.swift` implements `MessagingDelegate` (`FirebaseMessaging`) and `UNUserNotificationCenterDelegate`. On receiving an FCM token, it posts a `Notification.Name("FCMToken")` local notification and subscribes the device to the `"all"` topic via `Messaging.messaging().subscribe(toTopic:)`.

## Not Applicable

No HTTP route/controller layer, no GraphQL schema, and no custom RPC/queue-based interface were found in the inspected repository areas — this is a client-only mobile codebase that consumes a single external service (Firestore) via its native SDK.
