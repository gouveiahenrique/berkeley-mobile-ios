# API Standards

## Networking Overview

This is an iOS mobile application. It has no HTTP server and exposes no REST or GraphQL API of its own. All backend communication is outbound-only to Firebase Cloud Firestore and Firebase Cloud Messaging.

## Data Access Patterns

### Pattern 1 — `DataSource` protocol + `DataManager`

`berkeley-mobile/Data/DataSource.swift` defines:

```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

Implementations (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) call `Firestore.firestore().collection(<name>).getDocuments()` and map raw Firestore documents to typed model objects via manual dictionary parsing. The `fetchDispatch: DispatchGroup` property ensures each source is fetched at most once per app session; duplicate callers block on the group and receive the cached result.

`DataManager.shared.fetchAll()` iterates the registered data sources and dispatches concurrent fetches via `DispatchGroup`. Results are stored in `AtomicDictionary<String, [Any]>`.

### Pattern 2 — `BMNetworkingManager` (async/await)

`berkeley-mobile/Data/BMNetworkingManager.swift` is a singleton that performs direct Firestore reads using Swift concurrency:

```swift
func fetchSafetyLogs() async throws -> [BMSafetyLog]
func fetchResourcesCategories() async throws -> [BMResourceCategory]
```

Models conform to `Codable`. Documents are decoded with `doc.data(as: T.self)` (Firestore Swift SDK).

### Pattern 3 — Inline Firestore reads in view models

Several view models (`DiningHallsViewModel`, `EventsDataService`, `GymOccupancyViewModel`, `FeedbackFormViewModel`) contain their own `Firestore.firestore()` instances and perform async document reads directly without going through `DataManager` or `BMNetworkingManager`.

### Pattern 4 — `ImageLoader` (in-memory HTTP image cache)

`berkeley-mobile/Common/Images/ImageLoader.swift` loads remote images via `URLSession.shared.dataTask(with:)`. Loaded images are cached in-memory keyed by `URL`. The class is used as `ImageLoader.shared`.

## Firestore Collections

| Collection | Model type | Access point |
|---|---|---|
| `Libraries` | `BMLibrary` | `LibraryDataSource` |
| `Gyms` | `BMGym` | `GymDataSource` |
| `Dining Halls V2` | `BMDiningHallDocument` | `DiningHallsViewModel` |
| `Dining Halls` | `BMDiningHallAdditionalData` | `DiningHallsViewModel` |
| `Events` | `BerkeleyEventsDaySnapshot` | `EventsDataService` |
| `Safety Logs` | `BMSafetyLog` | `BMNetworkingManager` |
| `Resource Categories` | `BMResourceCategory` | `BMNetworkingManager` |
| `Gym Occupancy Meters` | `GymOccupancyLocationData` | `GymOccupancyViewModel` |

## Document Decoding Approaches

Two decoding approaches are observed in the codebase:

1. **Manual dictionary parsing** — Used in `LibraryDataSource`, `GymDataSource`, and `MapDataSource`. Documents are accessed as `[String: Any]` dictionaries and mapped field-by-field.

2. **Codable + `doc.data(as:)`** — Used in `BMNetworkingManager`, `DiningHallsViewModel`, `EventsDataService`, `GymOccupancyViewModel`. Models conform to `Codable` and use `CodingKeys` for field name mapping.

`BMSafetyLog` uses a custom `CodingKeys` to map `date_time` (Firestore field) → `date` (Swift property).

## Push Notifications

`AppDelegate` registers for remote notifications via `UNUserNotificationCenter` and sets itself as `MessagingDelegate`. On FCM token receipt, the token is broadcast via `NotificationCenter` with name `"FCMToken"`. The app subscribes all devices to the FCM topic `"all"`.

On notification tap (`userNotificationCenter(_:didReceive:)`), the app navigates `TabBarController.selectedIndex` to tab 2 (Safety).

## Google Sign-In

`GoogleSignIn` is listed as a CocoaPods dependency and a URL scheme for the OAuth callback is registered in `Info.plist` (`com.googleusercontent.apps.592064103331-73lugm9urcosj9uetcsk0bsno0lf5ek2`). The specific sign-in call sites were not found in the examined source files.

## External Deep Links

`RedirectionManager` and `EventsViewModel` open URLs via `UIApplication.shared.open(_:)`:

- Maps deep link: `"calshow:<timeIntervalSinceReferenceDate>"` (calendar event)
- Phone calls: `"tel://<phoneNumber>"` pattern (inferred from `redirectionManager.call`)
- App Settings: `UIApplication.openSettingsURLString` (from `BMLocationManager` when location is denied)

## No Server-Side API Exposed

Not applicable. This repository is a client-only mobile application.
