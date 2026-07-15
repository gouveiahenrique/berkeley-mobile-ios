# API Standards

This repository is a native iOS mobile application. It does not define or expose HTTP APIs. This document describes the networking contracts the app uses to communicate with its backend (Firebase/Firestore) and any native system integrations.

---

## Backend: Firebase Firestore

All application data is read from Cloud Firestore. No REST or GraphQL endpoints were found in the inspected codebase.

### Data Access Patterns

Two distinct patterns are used to read from Firestore:

**Pattern 1 — `DataSource` protocol (callback-based)**

Classes conforming to `DataSource` (`berkeley-mobile/Data/DataSource.swift`) implement:

```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

`DataManager.shared.fetch(source:_:)` calls `fetchItems` and caches the result. Duplicate concurrent fetches are prevented via `fetchDispatch` (a per-source `DispatchGroup`). Data is returned on the main thread.

Active `DataSource` implementations and their Firestore collections:

| Class | Firestore collection |
|---|---|
| `LibraryDataSource` | `"Libraries"` |
| `GymDataSource` | `"Gyms"` |
| `MapDataSource` | `"Map Marker"` |

**Pattern 2 — `BMNetworkingManager` (async/await)**

`BMNetworkingManager.shared` (`berkeley-mobile/Data/BMNetworkingManager.swift`) uses Swift concurrency for direct Firestore reads:

```swift
func fetchSafetyLogs() async throws -> [BMSafetyLog]
func fetchResourcesCategories() async throws -> [BMResourceCategory]
```

The Firestore collection names are referenced via `BMConstants.safetyLogsCollectionName` and `BMConstants.resourceCategoriesCollectionName` (defined in `BMConstants.swift`).

**Pattern 3 — Direct `Firestore.firestore()` in view models**

Some view models create their own `Firestore` instance directly:

| View model | Collection |
|---|---|
| `DiningHallsViewModel` | `"Dining Halls V2"`, `"Dining Halls"` |
| `EventsDataService` | `"Events"` |

---

## Data Contracts (Observed Firestore Schemas)

### `BMLibrary` (from `"Libraries"` collection)

Fields read by `LibraryDataSource.parseLibrary`:

| Firestore field | Swift type | Notes |
|---|---|---|
| `name` | `String` | Required |
| `description` | `String?` | |
| `address` | `String?` | |
| `phone` | `String?` | |
| `picture` | `String?` | Image URL |
| `latitude` | `Double?` | |
| `longitude` | `Double?` | |
| `open_close_array` | `[[String: Any]]?` | Weekly hours |

### `BMGym` (from `"Gyms"` collection)

Fields read by `GymDataSource.parseGym`:

| Firestore field | Swift type |
|---|---|
| `name` | `String` |
| `description` | `String?` |
| `address` | `String?` |
| `phone` | `String?` |
| `picture` | `String?` |
| `latitude` | `Double?` |
| `longitude` | `Double?` |
| `open_close_array` | `[[String: Any]]?` |
| `link` | `String?` |

### `MapMarker` (from `"Map Marker"` collection)

Fields read by `MapDataSource.parseMarker`:

| Firestore field | Swift type |
|---|---|
| `tag` | `String` (marker type, required) |
| `latitude` | `Double` (required) |
| `longitude` | `Double` (required) |
| `name` | `String?` |
| `description` | `String?` |
| `address` | `String?` |
| `on_campus` | `Bool?` |
| `phone` | `String?` |
| `email` | `String?` |
| `by_appointment` | `Bool?` |
| `Average_Meal` | `String?` |
| `Cal1Card_Accepted` | `Bool?` |
| `EatWell_Accepted` | `Bool?` |
| `open_close_array` | `[[String: Any]]?` |
| `rooms` | `[[String: Any]]?` | For "Menstrual Products" type |
| `accessibleGIRs` | `[String]?` |
| `nonAccessibleGIRs` | `[String]?` |

### `BMDiningHallDocument` (from `"Dining Halls V2"` collection)

Decoded via `Codable`. The document root contains a `BMDiningHallRepresentation` with `CodingKeys`:

| Firestore field | Swift key |
|---|---|
| `locationName` | `name` |
| `status` | `status` |
| `timeSpans` | `openHourPeriods` |
| `serveDate` | `serveDate` |
| `meals` | `meals` (array of `BMMeal`) |

### `BMSafetyLog` (from safety logs collection)

Decoded via `Codable`. `CodingKeys`:

| Firestore field | Swift key |
|---|---|
| `crime` | `crime` |
| `date_time` | `date` |
| `detail` | `detail` |
| `latitude` | `latitude` |
| `location` | `location` |
| `longitude` | `longitude` |

### `BerkeleyEventsDaySnapshot` (from `"Events"` collection)

Decoded via `Codable`:

| Firestore field | Swift type |
|---|---|
| `date` | `Date?` |
| `displayDate` | `String?` |
| `scrapedAt` | `Date?` |
| `events` | `[BerkeleyEvent]` |

---

## Push Notifications

The app requests push notification authorization on launch (`UNAuthorizationOptions`: `.alert`, `.badge`, `.sound`) and registers for remote notifications. On receiving an FCM token, it:

1. Posts a `"FCMToken"` `NotificationCenter` notification with the token string
2. Subscribes to the `"all"` FCM topic via `Messaging.messaging().subscribe(toTopic:)`

On receiving a notification tap, the app selects tab index 2 (Safety tab) of `TabBarController`.

---

## Native System Integrations

| Integration | Usage |
|---|---|
| `CLLocationManager` | `requestWhenInUseAuthorization()`; continuous updates broadcast via `Notification.Name.locationUpdated` |
| `EventKit` | `BMEventManager` adds/deletes events in the device calendar (via `EKEventStore`) |
| Maps app | `RedirectionManager.openInMaps(for:withName:)` redirects to native Maps |
| Phone dialer | `RedirectionManager.call(_:)` opens a `tel:` URL |
| App Store review | Launch count tracked in UserDefaults (`numAppLaunchForAppStoreReview`) |
| Safari | `UIApplication.shared.open(url)` used for library booking (`https://berkeley.libcal.com`) and settings URL |
