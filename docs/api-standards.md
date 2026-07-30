# API and Communication Standards

## Overview

This is a mobile client application. It does not expose any HTTP API. All remote data communication is outbound, from the app to Firebase/Firestore and Apple platform services.

## Remote Data Sources

### Firebase Firestore (primary backend)

All application data is read from Firestore. No custom REST or GraphQL API is used. There are two implementation patterns:

#### 1. `DataSource` Protocol (callback-based)

Used by `MapDataSource`, `LibraryDataSource`, `GymDataSource`, and `GymClassDataSource`.

```
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get }
}
```

Each `DataSource` conforming type:
- Opens a direct `Firestore.firestore()` connection
- Calls `.collection(endpoint).getDocuments()` with a closure
- Parses Firestore document dictionaries into typed model objects via private `parse*` static methods
- Invokes the `completionHandler` with the parsed array

`DataManager.shared.fetch(source:_:)` deduplicates concurrent fetches using the `DataSource.fetchDispatch` DispatchGroup, so a collection is only read once per session cycle.

**Firestore collection names** are declared as `fileprivate let k*Endpoint` constants within each DataSource file:
- `"Libraries"` — `LibraryDataSource`
- `"Gyms"` — `GymDataSource`
- `"Gym Classes"` — `GymClassDataSource`
- `"Map Marker"` — `MapDataSource`

#### 2. Direct `async/await` Firestore Fetches (ViewModel-owned)

Used by `DiningHallsViewModel`, `EventsDataService`, `BMNetworkingManager`, `GymOccupancyViewModel`, and `NewsDataViewModel`.

Pattern:
```swift
let snap = try await db.collection("Collection Name").getDocuments()
let models = snap.documents.compactMap { try? $0.data(as: ModelType.self) }
```

For types conforming to `Codable`, documents are decoded with `data(as:)`. For types not conforming to `Codable`, document dictionaries are accessed via `doc.data()` and parsed field-by-field.

**Firestore collection names** are stored in:
- `BMConstants` struct: `safetyLogsCollectionName` (`"Safety Logs"`), `resourceCategoriesCollectionName` (`"Resource Categories"`)
- `fileprivate let` constants in ViewModel/DataService files: `kDiningHallEndpoint` (`"Dining Halls V2"`), `kDiningHallAdditionalDataEndpoint` (`"Dining Halls"`), `kEventsDataServiceEndpoint` (`"Events"`), `kNewsDataEndpoint` (`"Daily Cal News"`)
- `GymOccupancyViewModel.Constants`: `gymOccupancyCollectionName` (`"Gym Occupancy Meters"`)

### Firestore Data Contracts (Model Structures)

#### `BMSafetyLog` (Codable, Firestore field mapping)
```
crime          → "crime"
date           → "date_time"
detail         → "detail"
latitude       → "latitude"
location       → "location"
longitude      → "longitude"
```

#### `GymOccupancyLocationData` (Codable)
```
id                  → "gymId"
gymName             → "gymName"
occupancyPercentage → "occupancyPercentage"
sourcePageURL       → "sourcePageUrl"
scrapedTimestamp    → "scrapedAt"
```

#### `NewsArticle` / `NewsArticleContent` (Codable)
```
NewsArticleContent.imageURL   → "imageUrl"
NewsArticleContent.articleURL → "url"
```

#### `BMLibrary` — parsed from dictionary fields
```
name, description, address, phone, picture, latitude, longitude
open_close_array → [[open_time: Double, close_time: Double, notes: String]]
```

#### `BMGym` — parsed from dictionary fields
```
name, description, address, phone, picture, latitude, longitude, link
open_close_array → [[open_time: Double, close_time: Double]]
```

#### `MapMarker` — parsed from dictionary fields
```
tag, latitude, longitude, name, description, address, on_campus, phone, email
open_close_array, by_appointment, Average_Meal, Cal1Card_Accepted, EatWell_Accepted
accessibleGIRs, nonAccessibleGIRs
rooms (for "Menstrual Products" type) → [[bathroomType, productType, floorName, roomNumber]]
```

### Apple WeatherKit

`WeatherDataViewModel` uses `WeatherService.shared` from the `WeatherKit` framework to fetch current conditions and daily forecast for a fixed Berkeley coordinate (`37.8716, -122.2727`). This is an Apple platform API, not a custom service. Errors are logged via `Logger.weatherDataViewModel` and surfaced to the UI via `showNotAvailable = true`.

### Firebase Cloud Messaging (Push Notifications)

`AppDelegate` registers the device for remote notifications and subscribes to the FCM topic `"all"` via `Messaging.messaging().subscribe(toTopic: "all")`. The FCM token is broadcast locally via `NotificationCenter` under the `"FCMToken"` notification name.

Incoming notifications received while the app is in the foreground display with `.banner` and `.sound` presentation options. Tapping a notification navigates to tab index `2` (Safety).

## Internal Communication Patterns

### NotificationCenter

`BMLocationManager` broadcasts location updates using `NotificationCenter` with the notification name `.locationUpdated` (defined as `"BMLocationManager.locationUpdated"`). Observers receive a `CLLocation` object in the notification's `object` field.

### Delegation

- `OpenClosedStatusManagerDelegate` — called by timer-based status refresh to update open/closed state for dining halls
- `FeedbackFormPresenterDelegate` — called when the feedback form should be presented
- `MainDrawerViewDelegate` / `DrawerViewDelegate` — UIKit protocol-based drawer stack management
- `MapViewController` conforms to `MKMapViewDelegate` for map annotation interactions

### FactoryKit (Dependency Injection)

ViewModels are not passed directly between views. All inter-component state sharing happens through the shared FactoryKit `Container`. ViewModels registered as `.singleton` (e.g., `homeViewModel`, `diningHallsViewModel`, `gymOccupancyViewModel`) have a single instance for the app's lifetime. ViewModels registered as `.shared` are scoped to the current injection context.

## Not Applicable

This repository does not implement:
- HTTP REST or GraphQL server endpoints
- OAuth token management beyond GoogleSignIn import
- Custom network request retry or caching middleware
- Local database (Core Data, SQLite) — persistence is limited to `UserDefaults` for pinned items and migration state
