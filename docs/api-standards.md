# API / Interface Standards

This repository is a mobile application. It has no server-side HTTP API surface of its own. The relevant "interfaces" are its outbound networking contracts with Firebase/Firestore and its internal data-access abstractions.

## External Data Communication

### Firestore Collections (Backend Contract)

The application reads data from Google Cloud Firestore. Collection names observed as literal string constants in the repository:

- `"Libraries"` — `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift:12` (`kLibrariesEndpoint`), read via `LibraryDataSource.fetchItems`.
- `"Gyms"` — `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift:12` (`kGymsEndpoint`), read via `GymDataSource.fetchItems`.
- `"Map Marker"` — `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift:13` (`kMapEndpoint`), read via `MapDataSource.fetchItems`.
- `BMConstants.safetyLogsCollectionName` = `"Safety Logs"` — `berkeley-mobile/Data/BMConstants.swift:36`, read via `BMNetworkingManager.fetchSafetyLogs()` in `berkeley-mobile/Data/BMNetworkingManager.swift`.
- `BMConstants.resourceCategoriesCollectionName` = `"Resource Categories"` — `berkeley-mobile/Data/BMConstants.swift:37`, read via `BMNetworkingManager.fetchResourcesCategories()`.

All observed Firestore access is **read-only** (`getDocuments()` calls); no write/set/update calls to Firestore collections were found in the inspected files.

### Fetch Pattern

- Each Firestore-backed feature implements the `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift`): a static `fetchItems(_ completion:)` method and a static `fetchDispatch: DispatchGroup` used to prevent duplicate concurrent fetches of the same source.
- `DataManager` (`berkeley-mobile/Data/DataManager.swift`) is the sole caller of these `DataSource.fetchItems` implementations for `MapDataSource`, `LibraryDataSource`, and `GymDataSource`, and caches results in-memory (`AtomicDictionary<String, [Any]>`) keyed by the source type name.
- `BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift`) implements a separate, `async`/`await`-based fetch pattern (not through `DataSource`/`DataManager`) for Safety Logs and Resource Categories, decoding Firestore documents directly into `Codable` model types (`try? $0.data(as: BMSafetyLog.self)`, `try? $0.data(as: BMResourceCategory.self)`).

### Error Handling in Data Access

- `LibraryDataSource.fetchItems`, `GymDataSource.fetchItems`, and `MapDataSource.fetchItems` handle Firestore errors by printing to the console (`print("Error getting documents: \(err)")` / `print("[Error @ ...]: \(err)")`) and returning without invoking the completion handler on error — i.e., failures are logged but not surfaced to the caller through the `DataSource.completionHandler` contract.
- `BMNetworkingManager`'s methods are `throws`-annotated (`async throws`), propagating Firestore errors to callers (e.g. `ResourcesViewModel`, `SafetyViewModel`) rather than swallowing them.
- `BMError` (`berkeley-mobile/Data/BMError.swift`) is a `LocalizedError` enum used for calendar-related errors (`eventAlreadyAddedInCalendar`, `insufficientAccessToCalendar`, `mayExistedInCalendarAlready`, `unableToFindEventInCalendar`), consumed in `berkeley-mobile/Data/BMEventManager.swift`.

## Authentication

- `GoogleSignIn` is imported in `berkeley-mobile/AppDelegate.swift`. The `Podfile` declares `pod 'Firebase/Auth'` for the main target.
- Not found in codebase: an explicit sign-in flow invocation, session/token storage mechanism, or authorization-gated Firestore query was not located in the files inspected for this documentation pass.

## Push Notifications

- `berkeley-mobile/AppDelegate.swift` configures `UNUserNotificationCenter` and `Messaging` (Firebase Cloud Messaging). On registration-token receipt, the app subscribes to the `"all"` FCM topic (`Messaging.messaging().subscribe(toTopic: "all")`) and posts a local `Notification.Name("FCMToken")` notification.
- Notification taps route the user to tab index `2` of `TabBarController` (`didReceive response:` handler in `AppDelegate.swift`).

## Internal Interfaces (Protocols)

Several Swift protocols in `berkeley-mobile/Data/ItemProtocols/` and `berkeley-mobile/Data/DataSource.swift` define internal contracts between the data layer and UI layer:
- `DataSource` — fetch contract for Firestore-backed feature data (`fetchItems`, `fetchDispatch`).
- `SearchItem` (`berkeley-mobile/Data/ItemProtocols/SearchItem.swift`) — contract for items surfaced in in-app search, requiring `searchName`, `location`, `locationName`, `icon`; provides default `location`/`locationName` implementations when the conforming type also conforms to `HasLocation`.
- `HasLocation`, `HasImage`, `HasName`, `HasOpenClosedStatus`, `HasOpenTimes`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `BMCalendarEvent` — smaller capability protocols composed by feature model types (e.g. `BMEventCalendarEntry` conforms to `NSCoding`, `Identifiable`, `BMCalendarEvent`, `HasImage`, `CanFavorite`).

## Not Applicable

- No REST/GraphQL HTTP endpoints, route handlers, or server-side controller code exist in this repository — it is a client-only mobile application. Any "API" in the traditional backend sense is provided by the external Firebase/Firestore platform, not implemented by this repository.
