# API / Interface Standards

This repository is a native iOS mobile application (see `docs/tech.md`). There is no server/API layer implemented in this repository. This document covers the interfaces the application uses to communicate with external/backend systems, and the internal service-boundary conventions observed in the code.

## Backend Communication (Firestore)

The repository implements direct client-side access to Google Cloud Firestore rather than a REST/GraphQL API client layer.

### Pattern: Centralized manager for some features

`berkeley-mobile/Data/BMNetworkingManager.swift` defines a singleton (`BMNetworkingManager.shared`) with a private `Firestore.firestore()` instance and `async throws` methods per feature:

```swift
func fetchSafetyLogs() async throws -> [BMSafetyLog]
func fetchResourcesCategories() async throws -> [BMResourceCategory]
```

Collection names are centralized as constants in `berkeley-mobile/Data/BMConstants.swift` (`safetyLogsCollectionName`, `resourceCategoriesCollectionName`). Documents are decoded with `Firestore`'s `Codable` support (`$0.data(as:)`), and results are sorted client-side before returning (e.g. `.sorted(by: { $0.date > $1.date })` in `fetchSafetyLogs`).

Consumers: `berkeley-mobile/Safety/SafetyViewModel.swift`, `berkeley-mobile/Resources/ResourcesViewModel.swift`.

### Pattern: Per-view-model direct Firestore access

Several view models each hold their own `private let db = Firestore.firestore()` and query a `fileprivate` endpoint-name constant directly, without going through `BMNetworkingManager`:

- `berkeley-mobile/Home/Dining/DiningDataSource/DiningHallsViewModel.swift` — collections `"Dining Halls V2"` and `"Dining Halls"`.
- `berkeley-mobile/Home/Guides/GuidesViewModel.swift` — collection `"Guides"`.
- `berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift` — collection `"Daily Cal News"`.
- `berkeley-mobile/FeedbackForm/FeedbackFormViewModel.swift` — reads collection `"Feedback Form Config"` (document `"config-data"`) and writes to collection `"Feedback Responses"` with a composite document ID of the form `"\(dateString)/\(email)/\(timeString)"`.

### Pattern: Static `DataSource`-conforming fetchers

`berkeley-mobile/Data/DataSource.swift` defines a protocol used by legacy data types:

```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

Conforming types (`GymDataSource`, `MapDataSource`, `LibraryDataSource`, `GymClassDataSource`) each query Firestore directly inside a static `fetchItems` using a completion-handler callback style (not `async/await`), and are orchestrated by `berkeley-mobile/Data/DataManager.swift`, which fetches all registered sources once and caches results.

Example, from `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift`:
```swift
static func fetchItems(_ completion: @escaping DataSource.completionHandler) {
    let db = Firestore.firestore()
    db.collection(kGymsEndpoint).getDocuments() { (querySnapshot, err) in ... }
}
```

### Error handling conventions observed

- The completion-handler-style `DataSource.fetchItems` implementations print errors to the console (`print("[Error @ ... ]: \(err)")`, `GymDataSource.swift:23`) rather than surfacing them to the UI.
- The `async/await`-style view models generally either:
  - log via `os.Logger` categories defined in `berkeley-mobile/Utils/Logger+Ext.swift` (e.g. `Logger.diningHallsViewModel.error(...)`, `Logger.newsDataViewModel.error(...)`), or
  - surface a `BMAlert` (`berkeley-mobile/Common/BMAlert.swift`) to the UI on failure, e.g. `berkeley-mobile/Safety/SafetyViewModel.swift:97` (`self.alert = BMAlert(title: "Failed To Fetch Safety Logs", message: error.localizedDescription, type: .notice)`).
  - Both approaches are used across different view models; no single repository-wide error-handling convention was found.
- Domain-specific errors are modeled with a repository-defined `Error`-conforming enum, `berkeley-mobile/Data/BMError.swift` (`BMError`), used for calendar-integration failures and given user-facing messages via `LocalizedError`.

## Authentication

- `Firebase/Auth` is declared as a CocoaPods dependency in `Podfile`, and `GoogleSignIn` is imported in `berkeley-mobile/AppDelegate.swift`. No repository call site invoking `FirebaseAuth`'s `Auth.auth()` API or `GIDSignIn` sign-in flow was found in the inspected areas. Not found in codebase: an implemented sign-in/authentication flow.

## Push Notifications

`berkeley-mobile/AppDelegate.swift` implements `MessagingDelegate` (`FirebaseMessaging`) and `UNUserNotificationCenterDelegate`:
- Registers for remote notifications and requests `[.alert, .badge, .sound]` authorization.
- On receiving an FCM token, posts a local `NotificationCenter` notification named `"FCMToken"` and subscribes the device to the `"all"` topic via `Messaging.messaging().subscribe(toTopic:)`.
- On notification tap (`didReceive response:`), navigates the root `TabBarController` to `selectedIndex = 2`.

## Native External Integrations (Non-HTTP)

- **WeatherKit:** `berkeley-mobile/Today/Tiles/Weather Tile/WeatherDataViewModel.swift` calls `WeatherService.shared.weather(for:including:)` for a hardcoded Berkeley `CLLocation`, with `async throws` error handling and a repeating `Timer`-based refresh (`refreshInterval`, default 5 minutes).
- **EventKit (device calendar):** `berkeley-mobile/Data/BMEventManager.swift` provides the calendar read/write integration used by the Events feature; failures are represented via `BMError`.
- **MapKit / CoreLocation:** `berkeley-mobile/Data/BMLocationManager.swift` wraps `CLLocationManager` as a singleton (`BMLocationManager.shared`) for location permission requests and updates, consumed by the Map and Safety features.

## Widget Extension Data Interface

`BerkeleyMobileWidget/GymOccupancyWidget.swift` implements WidgetKit's `TimelineProvider` protocol (`GymOccupancyProvider`), which calls `GymOccupancyViewModel.fetchOccupancyPercentages()` (an `async` method) to populate a `Timeline<GymOccupancyEntry>` with a `.after(nextRefreshDate)` reload policy computed from `GymOccupancyViewModel.Constants.refreshIntervalSecs`.

## Not Applicable / Not Found

- REST or GraphQL API route definitions: not applicable — this is a mobile client repository with no server code.
- API contract/schema files (e.g. OpenAPI, GraphQL SDL): not found in codebase.
- Rate limiting, request signing, or API versioning conventions: not found in codebase.
