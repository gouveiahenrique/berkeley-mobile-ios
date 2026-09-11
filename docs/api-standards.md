# API / Interface Standards

This repository is a mobile application (iOS). It has no server-side HTTP API, routes, or controllers of its own. The applicable interfaces are its **networking layer, external service contracts, and native integrations**.

## Backend/Server Routes, Controllers, Middleware

Not applicable for this repository type — there is no server-side route/controller code in this repository.

## Networking Layer

### Firestore access

The repository implements a single networking access point for its custom backend, `BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift`):

```swift
class BMNetworkingManager {
    static let shared = BMNetworkingManager()
    private let db = Firestore.firestore()

    func fetchSafetyLogs() async throws -> [BMSafetyLog] { ... }
    func fetchResourcesCategories() async throws -> [BMResourceCategory] { ... }
}
```

- Pattern: a process-wide singleton (`shared`) wrapping `Firestore.firestore()`.
- Both methods are `async throws`, query a named Firestore collection (`BMConstants.safetyLogsCollectionName = "Safety Logs"`, `BMConstants.resourceCategoriesCollectionName = "Resource Categories"`), call `getDocuments()`, and decode each document with `try? $0.data(as:)` into a `Codable` model (`BMSafetyLog`, `BMResourceCategory`), silently dropping documents that fail to decode (`compactMap`).
- Callers: `SafetyViewModel` (`berkeley-mobile/Safety/SafetyViewModel.swift:90`) and `ResourcesViewModel` (per CodeGraph blast-radius data) call these methods from `Task { }` blocks and surface errors via a `catch` block that sets a `BMAlert` (`SafetyViewModel.swift:95-99`).

### `DataSource` protocol (bulk data fetch)

```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```
(`berkeley-mobile/Data/DataSource.swift`)

- This is the repository's second data-access contract, used for the `Map`, `Library`, and `Gym` domains. Concrete types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`, referenced in `berkeley-mobile/Data/DataManager.swift:12-16`) implement `fetchItems` with a completion-handler style (pre-`async/await`), as opposed to the `async throws` style used by `BMNetworkingManager`.
- `DataManager` (`berkeley-mobile/Data/DataManager.swift`) is the sole consumer that invokes `fetchItems` on these types, and it caches results per-source in an in-memory `AtomicDictionary`, using each type's own `fetchDispatch: DispatchGroup` to guarantee a source is fetched from Firebase at most once per app run (`DataManager.swift:65-87`).

### Two coexisting data-access styles

The repository implements two distinct patterns for reaching the backend:
1. `DataSource` protocol + `DataManager` — completion-handler based, used for `Map`/`Library`/`Gym` domains.
2. `BMNetworkingManager` — `async throws` based, used for `Safety` and `Resources` domains.

Both ultimately read from Firebase (Firestore), based on imports (`import Firebase` in `BMNetworkingManager.swift:9`) and the `Podfile` dependency on `Firebase/Firestore`. Not found in codebase: a documented reason for the two styles co-existing.

## Authentication

- The `Podfile` includes `Firebase/Auth` and `GoogleSignIn` as dependencies of the `berkeley-mobile` target. Not found in codebase within the areas inspected: the call sites that invoke `GoogleSignIn` or `Firebase/Auth` APIs — this would require further source inspection beyond the discovery performed for this document.

## Push Notifications / Messaging

- `AppDelegate` (`berkeley-mobile/AppDelegate.swift`) conforms to `MessagingDelegate` (Firebase Cloud Messaging) and `UNUserNotificationCenterDelegate`.
- On receiving an FCM token (`messaging(_:didReceiveRegistrationToken:)`), the code posts a local `NotificationCenter` notification named `"FCMToken"` and subscribes the device to the `"all"` topic via `Messaging.messaging().subscribe(toTopic:)` (`AppDelegate.swift:77-87`).
- On notification tap (`userNotificationCenter(_:didReceive:)`), the code navigates the user by setting `tabBarController?.selectedIndex = 2` (`AppDelegate.swift:64-69`).

## Native Integrations

- **Location:** `BMLocationManager` (`berkeley-mobile/Data/BMLocationManager.swift`), a singleton (`shared`) with a `requestLocation()` method called from `AppDelegate`. `Info.plist` declares `NSLocationWhenInUseUsageDescription`.
- **Calendar:** `BMEventManager` (`berkeley-mobile/Data/BMEventManager.swift`) and calendar-related error cases in `BMError` (`eventAlreadyAddedInCalendar`, `insufficientAccessToCalendar`, `mayExistedInCalendarAlready`, `unableToFindEventInCalendar`), indicating the repository implements EventKit-based calendar integration for the `Events` feature.
- **WeatherKit:** `berkeley-mobile.entitlements` declares `com.apple.developer.weatherkit: true`. The framework supports WeatherKit APIs; a specific call site was not inspected as part of this document's discovery.
- **Push notifications entitlement:** `berkeley-mobile.entitlements` declares `aps-environment: development`.
- **URL schemes:** `Info.plist` defines `CFBundleURLSchemes` (used for OAuth redirect callbacks such as Google Sign-In, per the `Podfile` dependency on `GoogleSignIn`); the specific scheme values were not extracted as part of this document.

## Widget Data Contract

- `GymOccupancyProvider` (`BerkeleyMobileWidget/GymOccupancyWidget.swift`) implements WidgetKit's `TimelineProvider` contract (`placeholder(in:)`, `getSnapshot(in:completion:)`, `getTimeline(in:completion:)`), producing `GymOccupancyEntry` (`TimelineEntry`) values populated from `GymOccupancyViewModel.fetchOccupancyPercentages()`.

## Error Handling / Error Contracts

- `BMError` (`berkeley-mobile/Data/BMError.swift`) is a repository-defined `Error` enum conforming to `LocalizedError`, providing user-facing `errorDescription` strings for calendar-related failures.
- View models surface errors to the UI via a `BMAlert` published property (e.g. `SafetyViewModel.alert: BMAlert?`, set inside a `catch` block using `error.localizedDescription`, `SafetyViewModel.swift:95-99`).
