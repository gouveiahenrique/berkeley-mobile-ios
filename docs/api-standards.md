# API Standards

This is an iOS mobile application. There are no HTTP server routes, REST controllers, or GraphQL endpoints implemented in this repository. The following documents the networking and data-access contracts the application uses to communicate with external services.

## Data Backend: Firebase Firestore

All campus data is fetched from Firebase Firestore. The application communicates with Firestore through two patterns:

### Pattern 1 — Callback-based DataSource (legacy)

Used by `MapDataSource`, `LibraryDataSource`, `GymDataSource`, and `GymClassDataSource`.

```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

Each data source calls `Firestore.firestore().collection(<name>).getDocuments { ... }` and passes parsed model arrays to the completion handler. `DataManager` coordinates these fetches with a `DispatchGroup` per source, enforcing single-fetch semantics.

**Known Firestore collection names:**

| Collection | DataSource | Model |
|---|---|---|
| `"Map Marker"` | `MapDataSource` | `MapMarker` |
| `"Libraries"` | `LibraryDataSource` | `BMLibrary` |
| `"Gyms"` | `GymDataSource` | `BMGym` |
| `"Gym Classes"` | `GymClassDataSource` | `GymClass` |

Collection names are defined as file-private constants (e.g., `kMapEndpoint`, `kLibrariesEndpoint`) within each data source file.

### Pattern 2 — Async/Await via BMNetworkingManager

Used by `SafetyViewModel` and `ResourcesViewModel`.

```swift
class BMNetworkingManager {
    static let shared = BMNetworkingManager()
    func fetchSafetyLogs() async throws -> [BMSafetyLog]
    func fetchResourcesCategories() async throws -> [BMResourceCategory]
}
```

Collection names for this pattern are referenced via `BMConstants`:

| Constant | Used For |
|---|---|
| `BMConstants.safetyLogsCollectionName` | Safety crime log documents |
| `BMConstants.resourceCategoriesCollectionName` | Campus resource categories |

Documents in these collections are decoded directly via `$0.data(as: SomeType.self)` using Firestore's `Codable` support.

## Data Models and Decoding

### Codable Models (Firestore `Codable` decode)

- **`BMSafetyLog`** — `Codable`, uses `CodingKeys` to remap `date_time` → `date`
- **`BMResourceCategory`** — `Codable` (inferred from `data(as:)` usage)

### Manual Dictionary Parse Models

`MapMarker`, `BMLibrary`, `BMGym`, `GymClass` are parsed manually from `[String: Any]` dictionaries using key string lookups.

Example fields for `MapMarker`: `"tag"`, `"latitude"`, `"longitude"`, `"name"`, `"description"`, `"address"`, `"on_campus"`, `"phone"`, `"email"`, `"open_close_array"`, `"by_appointment"`, `"Average_Meal"`, `"Cal1Card_Accepted"`, `"EatWell_Accepted"`, `"rooms"` (for Menstrual Products type).

## Push Notifications: Firebase Cloud Messaging

The app registers for remote notifications and sets `Messaging.messaging().delegate` in `AppDelegate`. On receiving an FCM registration token, the token is broadcast via `NotificationCenter` with the name `"FCMToken"` and the device is subscribed to the `"all"` FCM topic. Receiving a push notification tap navigates the user to tab index 2 (Safety tab).

## Location Services

`BMLocationManager` wraps `CLLocationManager` and requests `.authorizedWhenInUse` authorization. Location updates are broadcast via `NotificationCenter` using the notification name `BMLocationManager.locationUpdated`. There is no outbound location data transmission observed in the inspected repository areas.

## External URL Interactions

- **Google Sign-In** (`GoogleSignIn 8.0.0`) is declared as a Podfile dependency and imported in `AppDelegate`. Usage beyond the import was not found in inspected repository areas.
- The app opens `UIApplication.openSettingsURLString` when location permission is denied.
- `BMEventCalendarEntry` stores `registerLink` and `sourceLink` as String fields; the app opens these as external URLs (observed in `BMEventCalendarEntry` model and event detail views).

## Widget Networking

`GymOccupancyProvider` calls `GymOccupancyViewModel.fetchOccupancyPercentages()` to fetch RSF Weight Room and CMS Fitness Center occupancy from Firestore. The widget refreshes on a schedule defined by `GymOccupancyViewModel.Constants.refreshIntervalSecs`. Firebase is initialized in `BerkeleyMobileWidgetBundle.init()` if not already configured.

## Error Handling

- Callback-based data sources print errors to the console (`print("[Error @ ...]: \(err)")`) and do not call the completion handler on failure in most cases.
- `BMNetworkingManager` methods `throw` on Firestore error; callers catch and set a `BMAlert` on the view model for user-facing error display.
- `SafetyViewModel` and `ResourcesViewModel` use `BMAlert` to surface Firestore errors in the UI via the `presentAlert` view modifier.
