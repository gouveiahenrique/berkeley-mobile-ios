# API Standards

## Networking Architecture

Berkeley Mobile is a consumer iOS application. It does not expose or serve HTTP endpoints. All external data communication is with Google Firebase services using the Firebase iOS SDK.

## Backend: Firebase / Cloud Firestore

The app communicates with Cloud Firestore as its primary backend. Two networking patterns are observed in the codebase.

### Pattern 1: Callback-based (`DataSource` protocol)

Used by `DataManager` for the three core data sources registered at startup.

**Protocol contract** (`Data/DataSource.swift`):

```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

**Observed implementations:**

| Class | Firestore Collection | Model Type |
|---|---|---|
| `MapDataSource` | `"Map Marker"` | `MapMarker` |
| `LibraryDataSource` | `"Libraries"` | `BMLibrary` |
| `GymDataSource` | `"Gyms"` | `BMGym` |
| `GymClassDataSource` | `"Gym Classes"` | `GymClass` |

Each implementation calls `Firestore.firestore().collection(...).getDocuments()` and maps the resulting `QueryDocumentSnapshot` documents to model objects via private `parse*` static methods. Documents are mapped using dictionary key lookups (`doc.data() as? [String: Any]`).

**Deduplication guarantee:** `DataManager` uses each source's `fetchDispatch: DispatchGroup` to ensure Firestore is queried at most once per source per fetch cycle. Subsequent callers receive the cached result.

### Pattern 2: Async/await (`BMNetworkingManager`)

Used for Safety and Resources data (`Data/BMNetworkingManager.swift`).

```swift
class BMNetworkingManager {
    static let shared = BMNetworkingManager()
    private let db = Firestore.firestore()

    func fetchSafetyLogs() async throws -> [BMSafetyLog]
    func fetchResourcesCategories() async throws -> [BMResourceCategory]
}
```

Documents are decoded directly using `try? $0.data(as: T.self)` (Firestore's `Codable` decoding). Failed document decodes are silently dropped via `compactMap`.

**Collection names** are defined as constants in `BMConstants.swift`:

| Constant | Collection name |
|---|---|
| `BMConstants.safetyLogsCollectionName` | `"Safety Logs"` |
| `BMConstants.resourceCategoriesCollectionName` | `"Resource Categories"` |

### Pattern 3: Async/await (`EventsDataService`)

Used for campus events data (`Events/EventDataSource/EventsViewModel.swift`).

```swift
class EventsDataService {
    static var shared = EventsDataService()
    private let db = Firestore.firestore()

    func fetchEventsGroupedByDate() async -> [(Date, [BMEventCalendarEntry])]
}
```

Documents are decoded as `BerkeleyEventsDaySnapshot` via Firestore Codable. Decode errors are logged via `os.Logger` and the document is skipped.

### Pattern 4: `FeedbackFormViewModel`

Fetches feedback form configuration from Firestore. The exact collection name was not inspected.

## Push Notifications (Firebase Cloud Messaging)

The app registers for APNs remote notifications on launch and passes the APNs token to Firebase Messaging. On token receipt (`MessagingDelegate.messaging(_:didReceiveRegistrationToken:)`):

1. Posts an `NSNotification` with the token under the `"FCMToken"` name.
2. Subscribes the device to the FCM topic `"all"`.

On notification tap, the app navigates to tab index 2 (Safety) via `TabBarController.selectedIndex`.

Background modes declared: `fetch`, `remote-notification`.

## Apple WeatherKit

`WeatherDataViewModel` uses `WeatherService.shared` from the WeatherKit framework to fetch current weather and daily forecast for a hardcoded Berkeley coordinate (`37.8716, -122.2727`). Fetches are performed via `Task.detached(priority: .userInitiated)` and refreshed every 5 minutes via a scheduled `Timer`.

## Image Loading

`ImageLoader` (singleton, `Common/Images/ImageLoader.swift`) downloads images using `URLSession.shared.dataTask(with:completionHandler:)` and caches results in an in-memory `[URL: UIImage]` dictionary. It does not use any HTTP-layer abstraction beyond `URLSession`.

`Info.plist` declares `NSAllowsArbitraryLoads = true` under `NSAppTransportSecurity`, permitting HTTP image URLs.

## Calendar Integration (EventKit)

`BMEventManager` (wraps EventKit) handles adding and deleting events in the device's system calendar. This is a local device API, not a network call.

## Google Sign-In

The `GoogleSignIn` SDK is imported in `AppDelegate`. A custom URL scheme (`com.googleusercontent.apps.592064103331-73lugm9urcosj9uetcsk0bsno0lf5ek2`) is registered in `Info.plist` for the OAuth redirect. Active usage of sign-in flows beyond the import and URL scheme registration was not inspected in detail.

## Data Models (selected)

All Firestore-decoded models use either dictionary key access or `Codable` decoding as noted above.

### `BMSafetyLog` (Codable)
| Field | Firestore key | Type |
|---|---|---|
| `crime` | `crime` | String |
| `date` | `date_time` | Date |
| `detail` | `detail` | String |
| `latitude` | `latitude` | Double |
| `location` | `location` | String |
| `longitude` | `longitude` | Double |

### `BMResourceCategory` / `BMResource` (Codable)

Nested: `BMResourceCategory` contains `[BMResourceSection]`, each containing `[BMResource]`.

### `BerkeleyEvent` (Codable)
Fields include `startTime`, `endTime`, `eventName`, `eventDescription`, `eventRegisterLinkURL`, `eventImageURL`, `eventURL`, `isAllDay`, `location`.

### `MapMarker` (dictionary parsing)
Constructed from `[String: Any]` dictionary keys including `"tag"`, `"latitude"`, `"longitude"`, `"name"`, `"description"`, `"address"`, `"on_campus"`, `"phone"`, `"email"`, `"open_close_array"`, `"by_appointment"`, `"Average_Meal"`, `"Cal1Card_Accepted"`, `"EatWell_Accepted"`, `"accessibleGIRs"`, `"nonAccessibleGIRs"`.
