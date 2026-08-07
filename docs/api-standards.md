# API Standards

## Overview

This is an iOS mobile application. It does not expose HTTP APIs. All external communication is outbound — the app consumes data from Firebase/Firestore and uses device-native services. This document describes the observed networking contracts and data communication patterns.

---

## Firestore Data Sources

### DataSource Protocol

Defined in `berkeley-mobile/Data/DataSource.swift`:

```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

All Firestore collection reads that flow through `DataManager` conform to this protocol. The completion handler delivers `[Any]` — callers downcast to the expected model type.

### Registered DataSource Implementations

| Class | Firestore Collection | Model type |
|---|---|---|
| `MapDataSource` | `"Map Marker"` | `[String: [MapMarker]]` |
| `LibraryDataSource` | `"Libraries"` | `[BMLibrary]` |
| `GymDataSource` | `"Gyms"` | `[BMGym]` |

### BMNetworkingManager

`berkeley-mobile/Data/BMNetworkingManager.swift` provides async/await Firestore fetches not managed by `DataManager`:

| Method | Firestore Collection | Returns |
|---|---|---|
| `fetchSafetyLogs()` | `BMConstants.safetyLogsCollectionName` | `[BMSafetyLog]` |
| `fetchResourcesCategories()` | `BMConstants.resourceCategoriesCollectionName` | `[BMResourceCategory]` |

Both methods decode documents using `Firestore`'s `data(as:)` with `Codable` models.

### GymOccupancyViewModel

`berkeley-mobile/Home/Fitness/GymOccupancy/GymOccupancyViewModel.swift` reads Firestore directly:

- Collection: `"Gym Occupancy Meters"`
- Document IDs: `"rsf-weight-room"`, `"cms-fitness"`
- Model: `GymOccupancyLocationData` (Codable), fields include `gymId`, `gymName`, `occupancyPercentage`, `sourcePageUrl`, `scrapedAt`
- Refresh interval: `15 * 60` seconds (constant in `GymOccupancyViewModel.Constants`)

---

## Firestore Data Contracts

### MapMarker fields (parsed in `MapDataSource.parseMarker(_:)`)

| Firestore field | Swift type |
|---|---|
| `tag` | `String` (maps to `MapMarkerType`) |
| `latitude` / `longitude` | `Double` |
| `name` | `String?` |
| `description` | `String?` |
| `address` | `String?` |
| `on_campus` | `Bool?` |
| `phone` | `String?` |
| `email` | `String?` |
| `open_close_array` | `[[String: Any]]?` (parsed to `WeeklyHours`) |
| `by_appointment` | `Bool?` |
| `Average_Meal` | `String?` |
| `Cal1Card_Accepted` | `Bool?` |
| `EatWell_Accepted` | `Bool?` |
| `rooms` | `[[String: Any]]?` (menstrual products type only) |
| `accessibleGIRs` / `nonAccessibleGIRs` | `[String]?` |

### BMSafetyLog Codable mapping

`berkeley-mobile/Safety/SafetyViewModel.swift`:

| Firestore field | Swift property |
|---|---|
| `crime` | `crime: String` |
| `date_time` | `date: Date` |
| `detail` | `detail: String` |
| `latitude` | `latitude: Double` |
| `location` | `location: String` |
| `longitude` | `longitude: Double` |

### GymOccupancyLocationData Codable mapping

| Firestore field | Swift property |
|---|---|
| `gymId` | `id: String` |
| `gymName` | `gymName: String` |
| `occupancyPercentage` | `occupancyPercentage: Int` |
| `sourcePageUrl` | `sourcePageURL: URL` |
| `scrapedAt` | `scrapedTimestamp: Date` |

---

## Image Loading

`ImageLoader` (`berkeley-mobile/Common/Images/ImageLoader.swift`) loads images over HTTPS using `URLSession.shared.dataTask(with:)`. Images are cached in memory by `URL`. There is no observed disk cache layer.

---

## Push Notifications

`AppDelegate` registers for remote push notifications via `application.registerForRemoteNotifications()`. FCM token receipt is handled in `MessagingDelegate.messaging(_:didReceiveRegistrationToken:)`, which subscribes the device to the `"all"` FCM topic.

Incoming notification tap routes to tab index 2 (Safety) via `UNUserNotificationCenterDelegate.userNotificationCenter(_:didReceive:)`.

---

## Authentication

`Firebase/Auth` and `GoogleSignIn` are declared as CocoaPods dependencies and `import`ed in `AppDelegate.swift`. Active use of Google Sign-In flows was not found in the inspected source areas.

---

## Analytics

`Analytics.logEvent(_:parameters:)` is called in `MapViewController` (e.g., `"map_icon_clicked"` with `"Category"` parameter). `Analytics.resetAnalyticsData()` is called during version migrations in `AppDelegate+Migration.swift`.

---

## Location

`BMLocationManager` uses `CLLocationManager` with `kCLLocationAccuracyBest`. Location updates are broadcast via `NotificationCenter` (`Notification.Name.locationUpdated`). The app requests `whenInUseAuthorization`.

---

## Internal Communication Patterns

| Pattern | Usage |
|---|---|
| `NotificationCenter` | `BMLocationManager` → observers via `.locationUpdated` |
| `@Published` + `ObservableObject` | SwiftUI view model state propagation (`SafetyViewModel`, `ResourcesViewModel`, etc.) |
| `@Observable` | Used in `GymOccupancyViewModel` |
| Completion callbacks | `DataSource.completionHandler` and `ImageLoader.getImage(url:completion:)` |
| `async/await` + `Task` | `BMNetworkingManager`, `GymOccupancyViewModel.fetchOccupancyPercentages()` |
| `DispatchGroup` | `DataManager.fetchAll()` coordinates multiple Firestore fetches |
