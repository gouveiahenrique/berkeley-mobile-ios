# API Standards

## Data Communication

This repository is an iOS client application. There is no server-side HTTP API implemented in this codebase. All data communication is with Firebase backend services accessed through the Firebase iOS SDK.

---

## Firebase Firestore (Primary Data Interface)

The application reads data from Cloud Firestore. No write operations to Firestore were found in the inspected source, with the exception of cache management (`Firestore.firestore().clearPersistence`).

### Collection Names

Firestore collection identifiers are defined as file-private constants in each `DataSource` file:

| Constant | Value | Source file |
|----------|-------|-------------|
| `kMapEndpoint` | `"Map Marker"` | `MapDataSource.swift` |
| `kLibrariesEndpoint` | `"Libraries"` | `LibraryDataSource.swift` |
| `kGymsEndpoint` | `"Gyms"` | `GymDataSource.swift` |
| `kGymClassesEndpoint` | `"Gym Classes"` | `GymClassDataSource.swift` |
| `kEventsDataServiceEndpoint` | `"Events"` | `EventsViewModel.swift` |
| `BMConstants.safetyLogsCollectionName` | (value in `BMConstants.swift`) | `BMNetworkingManager.swift` |
| `BMConstants.resourceCategoriesCollectionName` | (value in `BMConstants.swift`) | `BMNetworkingManager.swift` |

### Fetch Patterns

Two distinct Firestore fetch patterns are used in the codebase:

**Pattern 1 — `DataSource` protocol (callback-based)**
```swift
static func fetchItems(_ completion: @escaping DataSource.completionHandler)
```
Used by `MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`. Called through `DataManager.shared.fetch(source:_:)`. Data is cached in `DataManager`'s `AtomicDictionary` and not re-fetched within a 3600-second window.

**Pattern 2 — async/await (structured concurrency)**
```swift
func fetchSafetyLogs() async throws -> [BMSafetyLog]
func fetchResourcesCategories() async throws -> [BMResourceCategory]
func fetchEventsGroupedByDate() async -> [(Date, [BMEventCalendarEntry])]
```
Used by `BMNetworkingManager` and `EventsDataService`. Called from view models using Swift concurrency (`Task { ... }`). No `DataManager` caching is applied to these sources.

### Document Deserialization

Firestore documents are deserialized in two ways:
- **Manual parsing**: Each `DataSource` contains a `parse*` static method that reads `[String: Any]` dictionaries by key. Example: `MapDataSource.parseMarker(_:)`, `LibraryDataSource.parseLibrary(_:docID:)`.
- **Codable decoding**: Newer data sources use `try? $0.data(as: T.self)` (Firestore's Swift Codable support). Example: `BMNetworkingManager.fetchSafetyLogs()` decodes to `BMSafetyLog`, and `EventsDataService` decodes to `BerkeleyEventsDaySnapshot`.

---

## Firebase Cloud Messaging (Push Notifications)

- All devices subscribe to the FCM topic `"all"` upon FCM token registration (`AppDelegate+MessagingDelegate`).
- The FCM token is broadcast internally via `NotificationCenter` with the name `"FCMToken"`.
- When a push notification is tapped, the app navigates to `TabBarController.selectedIndex = 2` (Safety tab).

---

## Firebase Analytics

Event logging uses `FirebaseAnalytics.Analytics.logEvent(_:parameters:)`. Observed event names in the inspected source:
- `"opened_food_screen"` — logged when the dining section of the Home drawer is opened
- `"opened_academic_calendar"` — logged from `EventsViewModel`
- `"opened_campus_wide_events"` — logged from `EventsViewModel`

---

## Apple EventKit (Calendar Integration)

`BMEventManager` uses `EventKit.EKEventStore` to read and write events to the device's calendar. The access request strategy differs by iOS version:
- iOS 17+: `eventStore.requestFullAccessToEvents()`
- Earlier: `eventStore.requestAccess(to: .event)`

---

## Image Loading (URLSession)

`ImageLoader` (`berkeley-mobile/Common/Images/ImageLoader.swift`) fetches images via `URLSession.shared.dataTask(with:)`. Loaded images are cached in-memory by URL. There is no disk cache or HTTP cache policy override in the observed implementation.

---

## Location Services (CLLocationManager)

`BMLocationManager` wraps `CLLocationManager` requesting `.authorizedWhenInUse` authorization. Location updates are broadcast via `NotificationCenter` using the `Notification.Name.locationUpdated` extension. No background location mode is observed in the inspected source.

---

## Google Sign-In

`GoogleSignIn` (version 8.0.0) is imported in `AppDelegate.swift`. The sign-in flow implementation details were not found in the inspected source beyond the import.

---

## Internal Notification Contracts

| Notification Name | Sender | Payload |
|-------------------|--------|---------|
| `"FCMToken"` | `AppDelegate+MessagingDelegate` | `["token": String]` |
| `BMLocationManager.locationUpdated` | `BMLocationManager` | `CLLocation?` (object) |
