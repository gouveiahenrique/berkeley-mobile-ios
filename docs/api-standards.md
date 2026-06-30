# API Standards

## Repository Type

This is an iOS mobile application. It does not expose HTTP APIs. Its external communication is entirely inbound (consuming Firebase services) and outbound to the iOS system (location, notifications, calendar). The sections below document the observed networking contracts and integration patterns.

## Firebase / Firestore — Data Contracts

All remote data is fetched from Firebase Firestore. No REST or GraphQL API layer is present in this repository.

### Firestore Collections

| Collection Name | Firestore Constant | Consumer | Model |
|----------------|-------------------|----------|-------|
| `"Map Marker"` | `kMapEndpoint` in `MapDataSource.swift` | `MapDataSource` | `MapMarker` |
| `"Libraries"` | `kLibrariesEndpoint` in `LibraryDataSource.swift` | `LibraryDataSource` | `BMLibrary` |
| `"Gyms"` | `kGymsEndpoint` in `GymDataSource.swift` | `GymDataSource` | `BMGym` |
| `"Dining Halls V2"` | `kDiningHallEndpoint` in `DiningHallsViewModel.swift` | `DiningHallsViewModel` | `BMDiningHallDocument` |
| `"Dining Halls"` | `kDiningHallAdditionalDataEndpoint` in `DiningHallsViewModel.swift` | `DiningHallsViewModel` | `BMDiningHallAdditionalData` |
| `"Events"` | `kEventsDataServiceEndpoint` in `EventsViewModel.swift` | `EventsDataService` | `BerkeleyEventsDaySnapshot` |
| `"Safety Logs"` | `BMConstants.safetyLogsCollectionName` | `BMNetworkingManager` | `BMSafetyLog` |
| `"Resource Categories"` | `BMConstants.resourceCategoriesCollectionName` | `BMNetworkingManager` | `BMResourceCategory` |

### Firestore Access Patterns

Two distinct patterns are observed:

**Pattern 1 — Callback-based (legacy DataSource protocol)**

Used by `MapDataSource`, `LibraryDataSource`, and `GymDataSource`. Each calls `db.collection(...).getDocuments()` with a completion closure and parses the result into model objects manually (dictionary key access). The `DataSource` protocol defines:

```swift
typealias completionHandler = (_ resources: [Any]) -> Void
static func fetchItems(_ completion: @escaping DataSource.completionHandler)
static var fetchDispatch: DispatchGroup { get set }
```

The `fetchDispatch` group prevents duplicate concurrent fetches per source.

**Pattern 2 — Async/await with Codable decoding (newer ViewModels)**

Used by `DiningHallsViewModel`, `EventsDataService`, `BMNetworkingManager`. Calls `try await db.collection(...).getDocuments()` and decodes documents using `doc.data(as: SomeType.self)` (FirebaseFirestoreSwift Codable API). Errors are logged using the `os.Logger` framework.

Example from `BMNetworkingManager.swift`:
```swift
func fetchSafetyLogs() async throws -> [BMSafetyLog] {
    let collection = db.collection(BMConstants.safetyLogsCollectionName)
    let querySnapshot = try await collection.getDocuments()
    return querySnapshot.documents.compactMap { try? $0.data(as: BMSafetyLog.self) }
        .sorted(by: { $0.date > $1.date })
}
```

### Firestore Data Rate Limiting

`DataManager` enforces a 1-hour minimum interval between full data refreshes (`fetchInterval = 60 * 60`). Individual `DataSource` types use a `DispatchGroup` to guarantee each source is fetched only once per session.

## Firebase Cloud Messaging (FCM)

The app subscribes all devices to the `"all"` FCM topic on launch. Registration tokens are broadcast via `NotificationCenter` under the key `"FCMToken"`. On notification receipt, the Safety tab (index 2) is selected.

## Firebase Analytics

Analytics events are logged at specific user interactions:

| Event Name | Location |
|-----------|----------|
| `"opened_food"` with parameter `dining_location` | `DiningHallsViewModel.logOpenedDiningDetailViewAnalytics()` |
| `"opened_academic_calendar"` | `EventsViewModel.logAcademicCalendarTabAnalytics()` |
| `"opened_campus_wide_events"` | `EventsViewModel.logCampuswideTabAnalytics()` |

## Google Sign-In

`GoogleSignIn` is imported in `AppDelegate.swift` and its OAuth redirect scheme is registered in `Info.plist` (`CFBundleURLSchemes`: `com.googleusercontent.apps.592064103331-73lugm9urcosj9uetcsk0bsno0lf5ek2`). The active code paths using `GoogleSignIn` beyond import were not found in the inspected source.

## iOS System Integrations

### Location (`CoreLocation`)

`BMLocationManager` wraps `CLLocationManager` and requests `.authorizedWhenInUse` permission. Location updates are broadcast via `NotificationCenter` (name: `BMLocationManager.locationUpdated`). Consumers observe this notification (e.g., `MapUserLocationButtonViewModel`).

### Calendar (`EventKit`)

`BMEventManager` uses `EventKit` to add and delete events in the user's calendar. The app declares `NSCalendarsUsageDescription` and `NSCalendarsFullAccessUsageDescription` in `Info.plist`. Calendar integration is triggered by user action in `EventsViewModel`.

### Push Notifications (`UserNotifications`)

The app requests `.alert`, `.badge`, and `.sound` authorization at launch. `AppDelegate` conforms to both `UNUserNotificationCenterDelegate` (for foreground presentation) and `MessagingDelegate` (for FCM token receipt).

### Maps (`MapKit`)

`MapViewController` embeds an `MKMapView`. Map markers are custom annotations. The app opens the system Maps app for navigation via `RedirectionManager`.

### Safari

`SafariWebView.swift` wraps `SFSafariViewController` as a SwiftUI view used in the Resources tab.

## App Transport Security

`Info.plist` sets `NSAllowsArbitraryLoads = true`, permitting non-HTTPS connections.

## Network Contracts — Not Applicable

This repository does not implement or document an HTTP API (no routes, controllers, request/response schemas, or authentication middleware). The only network communication is through Firebase SDKs.
