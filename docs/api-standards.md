# API Standards

## Overview

This is an iOS mobile application. It does not expose HTTP APIs. All external data communication is inbound — the app consumes Firebase/Firestore as its data backend and does not define server-side API routes, controllers, or HTTP handlers.

The sections below document the observed data communication contracts and networking patterns in the repository.

---

## Data Backend: Firebase Firestore

All structured data is fetched from Cloud Firestore. The repository does not contain REST or GraphQL client code outside of Firestore SDK calls.

### Observed Firestore Collection Names

Defined as `fileprivate let` constants or strings in data source files:

| Collection name (string) | Source file | Data shape |
|--------------------------|-------------|------------|
| `"Map Marker"` | `MapDataSource.swift` | Dictionary fields: `tag`, `latitude`, `longitude`, `name`, `description`, `address`, `on_campus`, `phone`, `email`, `open_close_array`, `by_appointment`, `Average_Meal`, `Cal1Card_Accepted`, `EatWell_Accepted`, `rooms` |
| `"Gyms"` | `GymDataSource.swift` | Dictionary fields: `name`, `description`, `address`, `phone`, `picture`, `open_close_array`, `link`, `latitude`, `longitude` |
| `"Gym Classes"` | `GymClassDataSource.swift` | Dictionary fields: `class`, `class type`, `open_close_array` (`open_time`, `close_time`), `location`, `link`, `trainer` |
| `"Gym Occupancy Meters"` | `GymOccupancyViewModel.swift` | `GymOccupancyLocationData` (`gymId`, `gymName`, `occupancyPercentage`, `sourcePageUrl`, `scrapedAt`) |
| `"Dining Halls V2"` | `DiningHallsViewModel.swift` | `BMDiningHallDocument` (Codable): nested `BMDiningHallRepresentation` with `locationName`, `status`, `timeSpans`, `serveDate`, `meals` |
| `"Dining Halls"` | `DiningHallsViewModel.swift` | `BMDiningHallAdditionalData` (Codable): `name`, `address`, `picture`, `latitude`, `longitude`, `description`, `phone` |
| `BMConstants.safetyLogsCollectionName` | `BMNetworkingManager.swift` | `BMSafetyLog` (Codable): `crime`, `date_time`, `detail`, `latitude`, `location`, `longitude` |
| `BMConstants.resourceCategoriesCollectionName` | `BMNetworkingManager.swift` | `BMResourceCategory` (Codable): decoded via `data(as:)` |

### Document Fetch Patterns

Two patterns are observed in the repository:

**Callback-based (legacy DataSource protocol)**  
Used by `MapDataSource`, `GymDataSource`, `GymClassDataSource`:
```
db.collection(name).getDocuments { querySnapshot, error in ... }
```
Data is decoded manually from `[String: Any]` dictionaries.

**async/await with Codable (newer pattern)**  
Used by `DiningHallsViewModel`, `BMNetworkingManager`, `GymOccupancyViewModel`:
```
try await db.collection(name).getDocuments()
try await docRef.getDocument(as: SomeCodable.self)
```
Data is decoded using Firestore's `data(as:)` with `Codable`-conforming types.

---

## Push Notifications

Firebase Cloud Messaging (FCM) is configured in `AppDelegate`. The observed behavior:

- FCM token is received via `MessagingDelegate.messaging(_:didReceiveRegistrationToken:)`.
- Token is broadcast via `NotificationCenter` under the name `"FCMToken"`.
- The app subscribes to the FCM topic `"all"` on token receipt.
- Notification tap handling in `UNUserNotificationCenterDelegate.userNotificationCenter(_:didReceive:)` navigates to tab index `2` (Safety tab).

---

## Location Services

Location data is obtained internally via `BMLocationManager` (a `CLLocationManager` wrapper). No external location API calls are observed. Location updates are broadcast as `Notification.Name.locationUpdated` on `NotificationCenter.default`.

---

## Image Loading

Images are fetched using `URLSession.shared.dataTask(with:)` in `ImageLoader` (`berkeley-mobile/Common/Images/ImageLoader.swift`). Image URLs originate from Firestore document fields (e.g., `picture`, `imageURL`). Results are cached in memory keyed by `URL`.

---

## Authentication

`Firebase/Auth` and `GoogleSignIn` are listed as pod dependencies. The exact sign-in flow was not found in the inspected repository areas.

---

## Widget Data Contract

`GymOccupancyWidget` (WidgetKit extension) fetches gym occupancy data directly from Firestore using the same `GymOccupancyViewModel`. The widget refreshes on a `Timeline` policy with a 15-minute refresh interval (`GymOccupancyViewModel.Constants.refreshIntervalSecs = 15 * 60`).
