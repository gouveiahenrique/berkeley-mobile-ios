# API Standards

## Overview

Berkeley Mobile is a client-only iOS application. It does not expose an HTTP API. All data communication is outbound from the app to Firebase services (Firestore, Analytics, Messaging, Auth). The patterns below describe the networking contracts the app uses when communicating with these external services.

---

## Primary Data Source: Firebase Firestore

All campus entity data is stored in Firebase Firestore. The app retrieves data using two different access patterns.

### Pattern 1 — `DataSource` Protocol (Callback-based)

Used for: map markers, libraries, gyms.

**Protocol definition** (`berkeley-mobile/Data/DataSource.swift`):
```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

**Registered sources** (`berkeley-mobile/Data/DataManager.swift`):
- `MapDataSource`
- `LibraryDataSource`
- `GymDataSource`

Each `DataSource` implementation calls `Firestore.firestore().collection(endpoint).getDocuments()` and maps documents to model objects. Results are returned through the `completionHandler` on the main thread.

**Known Firestore collection names** from inspected `DataSource` implementations:

| DataSource | Firestore Collection |
|---|---|
| `GymDataSource` | `"Gyms"` |
| `LibraryDataSource` | (observed in `LibraryDataSource.swift`, collection name not inspected) |
| `MapDataSource` | (observed in `MapDataSource.swift`, collection name not inspected) |

### Pattern 2 — `BMNetworkingManager` (async/await)

Used for: Safety Logs, Resource Categories.

**Class** (`berkeley-mobile/Data/BMNetworkingManager.swift`):

```swift
class BMNetworkingManager {
    static let shared = BMNetworkingManager()
    private let db = Firestore.firestore()

    func fetchSafetyLogs() async throws -> [BMSafetyLog]
    func fetchResourcesCategories() async throws -> [BMResourceCategory]
}
```

| Method | Firestore Collection | Returns |
|---|---|---|
| `fetchSafetyLogs()` | `"Safety Logs"` | `[BMSafetyLog]` sorted by `date` descending |
| `fetchResourcesCategories()` | `"Resource Categories"` | `[BMResourceCategory]` sorted by `name` descending |

### Pattern 3 — Direct Firestore access in ViewModels

Some ViewModels hold their own `Firestore.firestore()` reference for direct collection access:

| ViewModel | Firestore Collection |
|---|---|
| `NewsDataViewModel` | `"Daily Cal News"` |
| `EventsDataService` | `"Events"` |

---

## Data Models and Decoding

### Codable (Swift native)

The following models use `Codable` for Firestore document decoding:
- `BMSafetyLog` — with `CodingKeys` mapping `date_time` → `date`
- `BMResourceCategory`, `BMResourceSection`, `BMResource`
- `BerkeleyEventsDaySnapshot`, `BerkeleyEvent`
- `NewsArticle` (referenced in `NewsDataViewModel`)

### Manual Dictionary Parsing

The `DataSource`-pattern implementations (Gyms, Libraries, Map) parse Firestore document dictionaries manually using `dict["key"] as? Type` coercions. Firestore's `data(as:)` method is used for `Codable` models in the `BMNetworkingManager` and direct-Firestore ViewModel patterns.

---

## Error Handling

- `BMNetworkingManager` methods are `throws`; callers catch errors and populate a `@Published var alert: BMAlert?` property on the ViewModel.
- Direct Firestore ViewModel access uses `try? ... getDocuments()` — decode failures are logged via `os.Logger` and the document is skipped.
- `DataSource`-pattern implementations print errors to the console; they do not propagate failures to callers.

---

## Image Loading

Images are not served from Firestore. Image URLs are stored as strings in Firestore documents. The app fetches images via HTTP using `URLSession.shared.dataTask(with:)` in `ImageLoader` (`berkeley-mobile/Common/Images/ImageLoader.swift`). Results are cached in-memory by URL.

---

## Push Notifications (Firebase Cloud Messaging)

`AppDelegate` implements `MessagingDelegate`. On FCM token receipt, it subscribes to the topic `"all"`:
```swift
Messaging.messaging().subscribe(toTopic: "all") { _ in }
```
The received token is broadcast via `NotificationCenter` under key `"FCMToken"`. Notification tap on the Safety category navigates to tab index 2 (Safety tab).

---

## Location Services

`BMLocationManager` (`berkeley-mobile/Data/BMLocationManager.swift`) wraps `CLLocationManager` with `requestWhenInUseAuthorization`. Location updates are broadcast via `NotificationCenter` using the `Notification.Name.locationUpdated` key. No location data is sent to any server from inspected code.

---

## Analytics

Firebase Analytics events are logged at specific user interactions. Observed event names from code:

| Event Name | Logged In |
|---|---|
| `"opened_food_screen"` | `HomeViewModel.logOpenedDiningHomeSectionAnalytics()` |
| `"opened_academic_calendar"` | `EventsViewModel.logAcademicCalendarTabAnalytics()` |
| `"opened_campus_wide_events"` | `EventsViewModel.logCampuswideTabAnalytics()` |

---

## Google Sign-In

`GoogleSignIn` (8.0.0) is declared as a dependency and imported in `AppDelegate`. The specific authentication flow implementation was not found in the inspected files.

---

## Widget Extension Communication

The `BerkeleyMobileWidget` extension communicates with Firestore directly using the same Firebase SDK. It does not communicate with the main app process. It accesses `GymOccupancyViewModel` which queries the Firestore collection for gym occupancy data (collection name in `GymOccupancyViewModel.swift`, not inspected).
