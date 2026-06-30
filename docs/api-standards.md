# API and Communication Standards

This repository is an iOS mobile application. It does not expose an HTTP API. Communication is exclusively outbound from the app to Firebase services and Apple platform services.

---

## Firestore (Primary Data Backend)

All production data reads go to Firebase Firestore. Two patterns are observed:

### Pattern 1 — `DataSource` Protocol (Callback-based)

Used for the three startup data sources registered in `DataManager`.

```swift
// berkeley-mobile/Data/DataSource.swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

Each conforming type calls `Firestore.firestore().collection(<name>).getDocuments { ... }` and invokes the `completion` with the parsed result. The `fetchDispatch` `DispatchGroup` ensures each collection is fetched from Firestore exactly once per app session.

Registered collections:

| DataSource class | Firestore collection |
|---|---|
| `MapDataSource` | `"Map Marker"` |
| `LibraryDataSource` | `"Libraries"` |
| `GymDataSource` | `"Gyms"` |

### Pattern 2 — Direct `async/await` Queries

Used for features that fetch independently of `DataManager`.

| Class | Firestore Collection | Method |
|---|---|---|
| `BMNetworkingManager` | `"Safety Logs"` | `fetchSafetyLogs() async throws -> [BMSafetyLog]` |
| `BMNetworkingManager` | `"Resource Categories"` | `fetchResourcesCategories() async throws -> [BMResourceCategory]` |
| `EventsDataService` | `"Events"` | `fetchEventsGroupedByDate() async -> [(Date, [BMEventCalendarEntry])]` |
| `GymOccupancyViewModel` | `"Gym Occupancy Meters"` | `fetchOccupancyPercentages() async -> [GymOccupancyLocation: Double]` |

Documents in `"Gym Occupancy Meters"` are decoded directly via `getDocument(as:)` into `GymOccupancyLocationData` (a `Codable` struct). Documents in `"Events"` are decoded via `doc.data(as: BerkeleyEventsDaySnapshot.self)`.

For the callback-based sources, documents are parsed manually from `[String: Any]` dictionaries (e.g., `parseLibrary(_:docID:)`, `parseGym(_:docID:)`, `parseMarker(_:)`).

---

## Firestore Collection Schema (Observed Field Names)

### `"Libraries"` (parsed in `LibraryDataSource`)

| Field | Type |
|---|---|
| `name` | String |
| `description` | String |
| `address` | String |
| `phone` | String |
| `picture` | String (URL) |
| `latitude` | Double |
| `longitude` | Double |
| `open_close_array` | Array of dict |

### `"Gyms"` (parsed in `GymDataSource`)

| Field | Type |
|---|---|
| `name` | String |
| `description` | String |
| `address` | String |
| `phone` | String |
| `picture` | String (URL) |
| `link` | String (URL) |
| `latitude` | Double |
| `longitude` | Double |
| `open_close_array` | Array of dict |

### `"Map Marker"` (parsed in `MapDataSource`)

| Field | Type |
|---|---|
| `tag` | String (marker type) |
| `latitude` | Double |
| `longitude` | Double |
| `name` | String |
| `description` | String |
| `address` | String |
| `on_campus` | Bool |
| `phone` | String |
| `email` | String |
| `by_appointment` | Bool |
| `Average_Meal` | String |
| `Cal1Card_Accepted` | Bool |
| `EatWell_Accepted` | Bool |
| `open_close_array` | Array of dict |
| `accessibleGIRs` | Array of String |
| `nonAccessibleGIRs` | Array of String |
| `rooms` | Array of dict (for `"Menstrual Products"` type only) |

### `"Gym Occupancy Meters"` (decoded via `Codable`)

Decoded into `GymOccupancyLocationData`:

| Firestore field | Swift property | Type |
|---|---|---|
| `gymId` | `id` | String |
| `gymName` | `gymName` | String |
| `occupancyPercentage` | `occupancyPercentage` | Int |
| `sourcePageUrl` | `sourcePageURL` | URL |
| `scrapedAt` | `scrapedTimestamp` | Date |

Document names: `"rsf-weight-room"`, `"cms-fitness"`.

### `"Events"` (decoded via `Codable` into `BerkeleyEventsDaySnapshot`)

| Field | Type |
|---|---|
| `date` | Date |
| `displayDate` | String |
| `scrapedAt` | Date |
| `events` | Array of `BerkeleyEvent` |

`BerkeleyEvent` fields: `startTime`, `endTime`, `eventName`, `eventDescription`, `eventRegisterLinkURL`, `eventImageURL`, `eventURL`, `isAllDay`, `location`.

### `"Safety Logs"` and `"Resource Categories"`

Decoded via `$0.data(as:)` into `BMSafetyLog` and `BMResourceCategory` respectively. Field-level schema is not inspected in the observed source.

---

## Push Notifications (Firebase Cloud Messaging)

- FCM token is captured in `AppDelegate.messaging(_:didReceiveRegistrationToken:)` and posted via `NotificationCenter` with key `"FCMToken"`.
- The device subscribes to the `"all"` FCM topic on token receipt.
- A received notification navigates to tab index `2` (Safety tab) in `userNotificationCenter(_:didReceive:)`.

---

## Apple Platform Services

| Service | Usage |
|---|---|
| WeatherKit (`WeatherService.shared`) | Current weather and daily forecast for Berkeley coordinates in `WeatherDataViewModel` |
| CoreLocation (`CLLocationManager`) | User location via `BMLocationManager` singleton |
| EventKit | Calendar event add/delete in `BMEventManager` |
| MapKit | Interactive campus map in `MapViewController` |

---

## Image Loading

Remote images are fetched via `ImageLoader.shared.getImage(url:completion:)`. This is not a standard URLSession pattern; it is a custom caching loader. The `HasImage` protocol provides a default `fetchImage(completion:)` implementation used by all model types that carry image URLs.

---

## Data Caching

- `DataManager` caches Firestore results in an `AtomicDictionary<String, [Any]>`. The minimum re-fetch interval is 3 600 seconds (one hour), enforced by `fetchIfNecessary()` called in `sceneWillEnterForeground`.
- Individual `DataSource` classes gate concurrent Firestore fetches with a `DispatchGroup` (`fetchDispatch`) to prevent duplicate in-flight requests.
- Gym occupancy data is refreshed on a 15-minute timer (`GymOccupancyViewModel.Constants.refreshIntervalSecs`).
- Weather data is refreshed on a 5-minute timer (default `refreshInterval` in `WeatherDataViewModel.init`).
