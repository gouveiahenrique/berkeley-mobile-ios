# API / Interface Standards

This repository is a mobile application. It does not expose HTTP routes, controllers, or a backend API of its own. This document covers the repository's networking/data-communication layer — how it communicates with its external backend (Google Cloud Firestore) and other external services.

## Backend Communication: Firestore

The repository implements data access through the Firebase Firestore SDK (`import Firebase`), not a hand-written HTTP client.

### Two observed access patterns

**Pattern 1 — `DataSource` protocol conformers (completion-handler based).**
`berkeley-mobile/Data/DataSource.swift` defines:
```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```
Conforming types (`GymDataSource`, `LibraryDataSource`, `MapDataSource`, `GymClassDataSource`, and others under `Home/*/*/`) each:
1. Define a `fileprivate` constant for the Firestore collection name (e.g. `kGymsEndpoint = "Gyms"` in `GymDataSource.swift:12`, `kLibrariesEndpoint = "Libraries"` in `LibraryDataSource.swift:12`, `kMapEndpoint = "Map Marker"` in `MapDataSource.swift:13`).
2. Call `Firestore.firestore().collection(<name>).getDocuments { (querySnapshot, err) in ... }`.
3. Manually map each `QueryDocumentSnapshot`'s `.data()` dictionary (`[String: Any]`) into a domain struct via a private `parse...` static function (e.g. `GymDataSource.parseGym(_:docID:)`, `LibraryDataSource.parseLibrary(_:docID:)`, `MapDataSource.parseMarker(_:)`).
4. Invoke the `completion` callback with the parsed array.
5. On error, the repository implements `print(...)` logging to the console (e.g. `GymDataSource.swift:23`, `LibraryDataSource.swift:26`); no retry, alerting, or user-facing error surface was found in these methods.

All `DataSource` fetches are routed exclusively through `DataManager.shared.fetch(source:_:)` (`berkeley-mobile/Data/DataManager.swift:65-87`), which deduplicates concurrent fetches per source using a per-type `DispatchGroup` and caches results in-memory for the process lifetime (cleared only when the app relaunches). `DataManager.fetchIfNecessary()` additionally gates re-fetching all registered sources behind a fixed `fetchInterval` of one hour (`DataManager.swift:24`).

**Pattern 2 — `BMNetworkingManager` (async/await + `Codable`).**
`berkeley-mobile/Data/BMNetworkingManager.swift` is a singleton (`BMNetworkingManager.shared`) that implements a newer, `Codable`-based access pattern, distinct from the `DataSource` protocol:
```swift
func fetchSafetyLogs() async throws -> [BMSafetyLog] {
    let collection = db.collection(BMConstants.safetyLogsCollectionName)
    let querySnapshot = try await collection.getDocuments()
    let documents = querySnapshot.documents
    return documents.compactMap { try? $0.data(as: BMSafetyLog.self) }.sorted(by: { $0.date > $1.date })
}
```
This pattern uses `FirestoreSwift`'s `data(as:)` decoding directly into a `Codable`-conforming struct (e.g. `BMSafetyLog`, defined in `berkeley-mobile/Safety/SafetyViewModel.swift:12-28`, which maps Firestore field `date_time` to the Swift property `date` via a `CodingKeys` enum), rather than manual dictionary parsing. Decode failures are silently dropped per-document via `try?` inside `compactMap` (no error surfaced for individual malformed documents; the method itself is `throws` only for the top-level `getDocuments()` call).

Collection names for this pattern are centralized as constants on `BMConstants` (e.g. `BMConstants.safetyLogsCollectionName`, `BMConstants.resourceCategoriesCollectionName`), rather than being declared `fileprivate` per file as in Pattern 1.

Not found in codebase: documentation or code comments explaining why two different Firestore access patterns coexist, or a stated plan to migrate Pattern 1 call sites to Pattern 2.

### Firebase Cloud Messaging (push notifications)

The repository implements `MessagingDelegate` in `berkeley-mobile/AppDelegate.swift:75-87`. On receiving an FCM registration token, it posts a local `Notification.Name("FCMToken")` via `NotificationCenter` and subscribes the device to the Firebase topic `"all"` (`Messaging.messaging().subscribe(toTopic: "all")`).

### Authentication

The `Podfile` declares `pod 'Firebase/Auth'` and `pod 'GoogleSignIn'`. `Info.plist` registers a Google Sign-In URL scheme (`com.googleusercontent.apps.592064103331-...`). Not found in codebase: the Swift source implementing the sign-in flow was not located as part of this analysis (no `GoogleSignIn` or `Auth.auth()` call sites were inspected).

## Internal Communication Patterns

- **`NotificationCenter`** is implemented as an internal pub/sub mechanism, e.g. `BMLocationManager` posts `.locationUpdated` on location changes (`Data/BMLocationManager.swift:14-19`, `76-78`, `94-96`); `AppDelegate` posts `Notification.Name("FCMToken")` on FCM token receipt.
- **`FactoryKit` dependency injection** is used as the mechanism by which view models are constructed and shared/singleton-scoped across the app (`berkeley-mobile/BerkeleyMobile+Injection.swift`), rather than passed through initializers everywhere.
- **Delegate protocols** are implemented for cross-component communication, e.g. `SearchResultsViewDelegate` (`Home/Search/SearchViewModel.swift:15-18`), `SearchDrawerViewDelegate` (implemented by `MapViewController`), `FeedbackFormPresenterDelegate` (implemented by `TabBarController.swift:76-82`).

## External Web Content

`berkeley-mobile/Resources/SafariWebView.swift` exists in the `Resources` feature directory, suggesting the repository implements in-app web viewing (likely via `SFSafariViewController` or `WKWebView`) for external resource links. Its exact implementation was not read as part of this analysis.

## Not Applicable

This repository does not implement or expose: HTTP route definitions, REST/GraphQL endpoint handlers, server-side controllers, or an OpenAPI/GraphQL schema. These sections of a typical API-standards document are not applicable for this repository type.
