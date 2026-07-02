# API Standards

## Data Backend: Firebase Cloud Firestore

The repository does not expose or consume an HTTP REST API. All remote data communication uses the Firebase SDK directly against Cloud Firestore collections.

### Observed Firestore Collections

The following collection names are used in the production application code:

| Collection Name | Used By |
|---|---|
| `"Gyms"` | `GymDataSource` (`GymDataSource.swift:12`) |
| `"Libraries"` | `LibraryDataSource` (`LibraryDataSource.swift:12`) |
| `"Map Marker"` | `MapDataSource` (`MapDataSource.swift:13`) |
| `"Events"` | `EventsDataService` (`EventsViewModel.swift:14`) |
| `"Daily Cal News"` | `NewsDataViewModel` (`NewsDataViewModel.swift:23`) |
| `"Safety Logs"` | `BMNetworkingManager`, `SafetyViewModel` (`BMConstants.swift:39`) |
| `"Resource Categories"` | `BMNetworkingManager` (`BMConstants.swift:40`) |

### Data Fetch Patterns

Two patterns are used to retrieve Firestore data:

**1. DataSource protocol pattern** (used for gyms, libraries, map markers):

```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

Concrete implementations (e.g., `GymDataSource`, `LibraryDataSource`, `MapDataSource`) call `db.collection(...).getDocuments()` with a completion-based callback and manually parse `[String: Any]` dictionaries into model types.

**2. Direct async/await pattern** (used for events, news, safety logs, resources):

Newer view models use Swift concurrency:

```swift
guard let snap = try? await db.collection(kEndpoint).getDocuments() else { return [] }
```

Documents are decoded using `Firestore`'s `doc.data(as: ModelType.self)` with Codable conformance, or manually parsed.

### Document Decoding

- Legacy data sources (`GymDataSource`, `LibraryDataSource`, `MapDataSource`) use manual `[String: Any]` dictionary parsing.
- Newer data sources (`NewsDataViewModel`, `EventsDataService`, `BMNetworkingManager`) use `Codable` conformance decoded via `doc.data(as:)`.

### Fetch Deduplication

`DataManager` uses `DispatchGroup` per `DataSource` type to ensure each Firestore collection is fetched only once per session, preventing duplicate concurrent requests (`DataManager.swift:65-87`).

## Push Notifications: Firebase Cloud Messaging (FCM)

- The app registers for remote notifications on launch (`AppDelegate.swift:32`).
- FCM token registration automatically subscribes the device to the `"all"` topic (`AppDelegate.swift:86`).
- Notification tap handling navigates to tab index `2` (Safety tab) (`AppDelegate.swift:68`).
- Notification display options: `.banner` and `.sound` (`AppDelegate.swift:61`).

## Location Services

- `BMLocationManager` uses `CLLocationManager` with `desiredAccuracy = kCLLocationAccuracyBest`.
- Authorization requested: `whenInUse`.
- Location updates are broadcast via `NotificationCenter` using the `.locationUpdated` notification name, not via delegation to individual consumers.

## Apple WeatherKit

`WeatherDataViewModel` uses `WeatherService.shared` from the `WeatherKit` framework to fetch:
- Current weather (`WeatherService.weather(for:including:.current)`)
- Daily forecast (`WeatherService.weather(for:including:.daily)`)

The fixed location is Berkeley, CA (latitude `37.8716`, longitude `-122.2727`) (`WeatherDataViewModel.swift:25`). Data is refreshed on a `Timer` with a configurable interval (default 5 minutes) (`WeatherDataViewModel.swift:31`).

## EventKit (Calendar Integration)

`BMEventManager` integrates with Apple's `EventKit` framework to allow users to add and delete calendar events from the Events feature. The app declares `NSCalendarsUsageDescription` and `NSCalendarsFullAccessUsageDescription` in `Info.plist`.

## Google Sign-In

`GoogleSignIn` is imported in `AppDelegate`. The app registers a custom URL scheme `com.googleusercontent.apps.592064103331-73lugm9urcosj9uetcsk0bsno0lf5ek2` in `Info.plist` for the OAuth redirect flow.

## App Transport Security

`Info.plist` sets `NSAllowsArbitraryLoads = true`, permitting non-HTTPS connections.
