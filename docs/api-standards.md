# API Standards

This repository is an iOS mobile application. It does not expose HTTP APIs. All external communication is outbound — the app consumes Firebase services and Apple system frameworks. There is no REST, GraphQL, or RPC server implemented in this repository.

## Firebase Firestore — Read Patterns

All Firestore access in the repository uses the Firebase iOS SDK. Two distinct patterns are observed:

### Pattern 1: Callback-based (DataSource protocol)

Used by `MapDataSource`, `LibraryDataSource`, `GymDataSource`, and `GymClassDataSource`.

```swift
// DataSource.swift protocol requirement
static func fetchItems(_ completion: @escaping DataSource.completionHandler)
```

Callers use `Firestore.firestore().collection(...).getDocuments { snapshot, err in ... }` with a completion closure. Results are delivered on the calling thread; `DataManager` dispatches completions to the main queue.

### Pattern 2: async/await (Feature view models)

Used by `BMNetworkingManager`, `EventsDataService`, `NewsDataViewModel`, `DiningHallsViewModel`, and `FeedbackFormViewModel`.

```swift
let snapshot = try await db.collection(collectionName).getDocuments()
```

Results are decoded using either `doc.data(as: T.self)` (Codable-conformant models) or manual dictionary extraction.

## Known Firestore Collection Names

Defined as constants in `BMConstants.swift` or as `fileprivate` constants within each data source:

| Constant / Literal | Collection Name | Used In |
|---|---|---|
| `BMConstants.safetyLogsCollectionName` | `"Safety Logs"` | `BMNetworkingManager.fetchSafetyLogs()` |
| `BMConstants.resourceCategoriesCollectionName` | `"Resource Categories"` | `BMNetworkingManager.fetchResourcesCategories()` |
| `kLibrariesEndpoint` | `"Libraries"` | `LibraryDataSource` |
| `kMapEndpoint` | `"Map Marker"` | `MapDataSource` |
| `kGymsEndpoint` | `"Gyms"` | `GymDataSource` |
| `kGymClassesEndpoint` | `"Gym Classes"` | `GymClassDataSource` |
| `kEventsDataServiceEndpoint` | `"Events"` | `EventsDataService` |
| `kNewsDataEndpoint` | `"Daily Cal News"` | `NewsDataViewModel` |

## Firebase Cloud Messaging

The app registers for remote notifications in `AppDelegate.swift` and subscribes to the topic `"all"` unconditionally on each FCM token registration:

```swift
Messaging.messaging().subscribe(toTopic: "all") { _ in }
```

FCM token changes broadcast a `NotificationCenter` post with key `"FCMToken"`.

## Apple WeatherKit

`WeatherDataViewModel` uses `WeatherService.shared` from the WeatherKit framework to fetch current conditions and daily forecasts for a hardcoded Berkeley coordinate (`37.8716, -122.2727`). The service is called via Swift concurrency (`async/await`). A repeating `Timer` refreshes data at a configurable interval (default: 5 minutes).

## Apple EventKit (Calendar)

`BMEventManager` reads and writes to the user's calendar using the EventKit framework. Access is requested at runtime. The app can add events to and delete events from the device calendar.

## Apple MapKit

`MapViewController` uses `MKMapView` with custom `MKAnnotation` pins (`MapMarker`, `SearchAnnotation`). `BMLocationManager` wraps `CLLocationManager` with `WhenInUse` authorization and broadcasts location changes via `NotificationCenter`.

## Image Loading

`ImageLoader` fetches images over HTTPS using `URLSession.shared.dataTask`. There is no centralized base URL — each image URL is stored directly in the corresponding Firestore document field.

## Internal Module Communication

The repository uses `NotificationCenter` for two cross-module notifications:

| Notification Name | Posted By | Observed By |
|---|---|---|
| `BMLocationManager.locationUpdated` | `BMLocationManager` | `LocationDetailView`, location-dependent UI |
| `"FCMToken"` (string key) | `AppDelegate.MessagingDelegate` | Not observed in inspected code |

FactoryKit `@Injected` / `@InjectedObservable` property wrappers connect views to view models across module boundaries.

## Authentication

`Firebase/Auth` and `GoogleSignIn` are declared as CocoaPods dependencies in `Podfile`. Direct invocations of auth APIs were not found in the inspected source areas of the main app code beyond the Firebase SDK initialization in `AppDelegate`.
