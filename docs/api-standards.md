# API Standards

## Communication Architecture

Berkeley Mobile does not expose or consume a custom REST or GraphQL API. All backend communication uses **Firebase/Firestore** as the data store, accessed directly from the iOS client via the Firebase iOS SDK. There is no intermediary application server.

## Firestore Collection Contracts

The following Firestore collections were observed in the codebase:

| Collection Name | Constant Location | Consumer |
|-----------------|------------------|----------|
| `"Map Marker"` | `MapDataSource.swift` (`kMapEndpoint`) | `MapDataSource.fetchItems(_:)` |
| `"Gyms"` | `GymDataSource.swift` (`kGymsEndpoint`) | `GymDataSource.fetchItems(_:)` |
| Libraries endpoint | `LibraryDataSource.swift` | `LibraryDataSource.fetchItems(_:)` |
| `"Safety Logs"` | `BMConstants.safetyLogsCollectionName` | `BMNetworkingManager.fetchSafetyLogs()` |
| `"Resource Categories"` | `BMConstants.resourceCategoriesCollectionName` | `BMNetworkingManager.fetchResourcesCategories()` |
| `"Gym Occupancy Meters"` | `GymOccupancyViewModel.Constants.gymOccupancyCollectionName` | `GymOccupancyViewModel.fetchOccupancyPercentages()` |
| `"Daily Cal News"` | `NewsDataViewModel.kNewsDataEndpoint` | `NewsDataViewModel.fetchNewsArticles()` |
| Events collection | `kEventsDataServiceEndpoint` in `EventsViewModel.swift` | `EventsDataService.fetchEventsGroupedByDate()` |
| Feedback form config | `FeedbackFormViewModel` | `FeedbackFormViewModel.fetchFeedbackFormConfig()` |

## Data Fetch Patterns

### Pattern 1: `DataSource` Protocol (Cached, Deduped)

Used by `MapDataSource`, `LibraryDataSource`, `GymDataSource`.

```
AppDelegate.application(_:didFinishLaunchingWithOptions:)
  └─ DataManager.shared.fetchAll()
       └─ DataManager.fetch(source:_:)
            └─ source.fetchDispatch (DispatchGroup — prevents duplicate fetches)
                 └─ source.fetchItems(_:)  →  Firestore query
```

Results are stored in `AtomicDictionary<String, [Any]>` keyed by the type name of the data source. Subsequent callers receive the cached value. `DataManager.fetchIfNecessary()` re-fetches only if more than 3600 seconds have elapsed since the last fetch.

### Pattern 2: `BMNetworkingManager` (Async/Await, Per-Request)

Used for safety logs and resource categories.

```swift
func fetchSafetyLogs() async throws -> [BMSafetyLog]
func fetchResourcesCategories() async throws -> [BMResourceCategory]
```

Both methods call `db.collection(_:).getDocuments()` and use `$0.data(as:)` for Codable decoding. They are called from view model `Task {}` blocks on the `@MainActor`.

### Pattern 3: Direct Firestore in ViewModels (Async/Await)

`GymOccupancyViewModel` and `EventsDataService` instantiate `Firestore.firestore()` directly. `GymOccupancyViewModel` uses a Swift `TaskGroup` to fetch multiple gym documents concurrently.

### Pattern 4: Apple WeatherKit

`WeatherDataViewModel` uses `WeatherService.shared.weather(for:including:)` from Apple's `WeatherKit` framework, targeting a fixed Berkeley coordinate. A repeating `Timer` refreshes data at a configurable interval (default 5 minutes).

## Data Models and Decoding

Data models are plain Swift structs or classes conforming to `Codable`. Firebase documents are decoded using `DocumentSnapshot.data(as:)` (Firestore Swift SDK). Custom `CodingKeys` are used where Firestore field names differ from Swift property names.

Example (`BMSafetyLog`):
```swift
struct BMSafetyLog: Identifiable, Codable, Hashable {
    enum CodingKeys: String, CodingKey {
        case date = "date_time"
        // ...
    }
}
```

## Push Notifications

- `AppDelegate` registers the device for remote notifications and sets `Messaging.messaging().delegate = self`.
- On FCM token receipt, the app subscribes to the `"all"` topic (`Messaging.messaging().subscribe(toTopic:)`).
- Incoming notifications with a notification response navigate to tab index 2 (Safety) via the `TabBarController`.

## Authentication

Firebase Auth (`Firebase/Auth`) and GoogleSignIn (`8.0.0`) are declared as CocoaPods dependencies. The observed production code configures `FirebaseApp.configure()` on launch. Active authentication UI or sign-in flow implementation was not found in the inspected source files.

## Location Services

The app requests `authorizedWhenInUse` location permission. `BMLocationManager` broadcasts location updates via `NotificationCenter.default` (key: `"BMLocationManager.locationUpdated"`). Location is used for distance-to-item calculations in `LocationDetailView` and map annotation placement.

## Calendar Integration

`BMEventManager` interacts with `EKEventStore` (EventKit) to add and delete events. The add-to-calendar flow is triggered from `EventsViewModel` and presents a confirmation alert before writing.

## Widget Communication

The `BerkeleyMobileWidget` extension does not share memory or IPC with the main app. It reads Firestore independently and refreshes its `Timeline` with a `.after(nextRefreshDate)` policy where `nextRefreshDate` is 15 minutes from data fetch time.

## Internal Notifications

The app uses `NotificationCenter` for decoupled communication within the process:

| Notification Name | Sender | Subscribers |
|-------------------|--------|-------------|
| `"BMLocationManager.locationUpdated"` | `BMLocationManager` | `LocationDetailView`, map components |
| `"FCMToken"` | `AppDelegate` (MessagingDelegate) | Not observed in inspected files |
| `UIApplication.willEnterForegroundNotification` | UIKit | `OpenClosedStatusManager` |
| `UIApplication.didEnterBackgroundNotification` | UIKit | `OpenClosedStatusManager` |
