# API Standards

**Last updated:** 2026-08-03

## Overview

The repository does not expose or consume a traditional REST/HTTP API layer of its own — there is no URL router, no status-code handling, and no request middleware. All application data is read from and written to **Google Cloud Firestore** via the Firebase iOS SDK. This document describes the Firestore data-access conventions observed in the repository.

## Firestore Data Access Conventions

### Collection Naming

Firestore collection names are declared as constants, not hardcoded inline at the call site:

```swift
// berkeley-mobile/Data/BMConstants.swift — shared across multiple files
struct BMConstants {
    static let safetyLogsCollectionName = "Safety Logs"
    static let resourceCategoriesCollectionName = "Resource Categories"
}

// berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift — feature-specific, fileprivate
fileprivate let kMapEndpoint = "Map Marker"
```

**Observed convention:** a `k`-prefixed `fileprivate let` constant for a collection name used only within one file; a `static let` on `BMConstants` for a name shared across files.

### Fetch Pattern — async/await (current pattern, `BMNetworkingManager`)

```swift
// berkeley-mobile/Data/BMNetworkingManager.swift
func fetchSafetyLogs() async throws -> [BMSafetyLog] {
    let collection = db.collection(BMConstants.safetyLogsCollectionName)
    let querySnapshot = try await collection.getDocuments()
    let documents = querySnapshot.documents
    let safetyLogs = documents.compactMap { try? $0.data(as: BMSafetyLog.self) }.sorted(by: { $0.date > $1.date })
    return safetyLogs
}
```

- `compactMap { try? $0.data(as:) }` is used to silently skip documents that fail to decode.
- Results are sorted after fetch (`.sorted(by:)`) — Firestore query results are not implicitly ordered by the client code shown here.
- `BMNetworkingManager` is a singleton (`static let shared`) wrapping a single `Firestore.firestore()` instance.

### Fetch Pattern — completion handler (legacy `DataSource` subclasses)

Older `DataSource` conforming types (e.g. `MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`) use `getDocuments { (querySnapshot, err) in ... }` completion closures and a `static var fetchDispatch: DispatchGroup` to prevent duplicate concurrent fetches:

```swift
// berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift
class GymDataSource: DataSource {
    static var fetchDispatch: DispatchGroup = DispatchGroup()

    static func fetchItems(_ completion: @escaping DataSource.completionHandler) {
        let db = Firestore.firestore()
        db.collection(kGymsEndpoint).getDocuments() { (querySnapshot, err) in
            if let err = err {
                print("[Error @ GymDataSource.fetchGyms()]: \(err)")
                return
            } else {
                let gyms = querySnapshot!.documents.map { (doc) -> BMGym in ... }
                completion(gyms)
            }
        }
    }
}
```

These legacy `DataSource` implementations parse raw `[String: Any]` dictionaries manually (e.g. `dict["latitude"] as? Double`) rather than using `Codable` decoding, and log errors via `print(...)` rather than `os.Logger`. This differs from the conventions documented in `docs/code-conventions.md` for newer code — see that document's "Never use `print()` for logging" rule, which applies to code written after `Logger+Ext.swift` was introduced.

### Data Models

Firestore document models used by the async/await pattern conform to `Codable`/`Decodable` so `DocumentSnapshot.data(as:)` can decode them directly:

```swift
struct BMSafetyLog: Identifiable, Codable, Hashable {
    var id = UUID()
    var crime: String
    var date: Date

    enum CodingKeys: String, CodingKey {
        case crime
        case date = "date_time"
    }
}
```

Legacy `DataSource` model types (e.g. `BMGym`, `BMLibrary`, `MapMarker`) are populated by manual dictionary-parsing static methods (`parseGym`, `parseLibrary`, `parseMarker`) instead of `Codable`.

### Error Handling

Errors from the async/await Firestore path are caught at the ViewModel layer:

```swift
@MainActor
private func listenForSafetyLogs() async {
    do {
        defer { isLoading = false }
        let fetchedLogs = try await BMNetworkingManager.shared.fetchSafetyLogs()
        safetyLogs = fetchedLogs
    } catch {
        self.alert = BMAlert(title: "Failed To Fetch Safety Logs",
                             message: error.localizedDescription,
                             type: .notice)
    }
}
```

### Custom App Errors (`BMError`)

Domain-specific errors used outside of Firestore access (specifically, EventKit calendar operations) are declared in `berkeley-mobile/Data/BMError.swift` as a `LocalizedError` enum:

```swift
enum BMError: Error {
    case eventAlreadyAddedInCalendar
    case insufficientAccessToCalendar
    case mayExistedInCalendarAlready
    case unableToFindEventInCalendar
}

extension BMError: LocalizedError {
    public var errorDescription: String? {
        switch self {
        case .insufficientAccessToCalendar:
            return NSLocalizedString("Insufficient permissions to access your calendar. Please go to Settings to allow calendar access.", comment: "Insufficent Permissions Error")
        // ...
        }
    }
}
```

`BMError` cases are consumed in `berkeley-mobile/Data/BMEventManager.swift` (2 call sites found).

## External HTTP (Non-Firestore)

Remote image loading is implemented in `berkeley-mobile/Common/Images/ImageLoader.swift`:

```swift
class ImageLoader {
    public static var shared = ImageLoader()
    private var loadedImages = [URL: UIImage]()
    private var runningRequests = [UUID: URLSessionDataTask]()

    @discardableResult
    func getImage(url: URL, completion: @escaping (Result<UIImage, Error>) -> Void) -> UUID? {
        if let image = loadedImages[url] {
            completion(.success(image))
            return nil
        }
        let uuid = UUID()
        let task = URLSession.shared.dataTask(with: url) { data, response, error in
            // decode UIImage from data, cache in loadedImages, call completion on main queue
        }
        task.resume()
        runningRequests[uuid] = task
        return uuid
    }
}
```

- `ImageLoader` caches loaded `UIImage`s by `URL` in an in-memory dictionary (`loadedImages`) and tracks in-flight `URLSessionDataTask`s by `UUID` (`runningRequests`) so repeated requests for the same URL are not re-issued once cached.
- Completions are dispatched back to the main queue via `DispatchQueue.main.async`.

## Authentication

- Google Sign-In is integrated via the `GoogleSignIn` CocoaPod together with `FirebaseAuth`.
- `AppDelegate.swift` calls `FirebaseApp.configure()` at launch; no custom token storage or refresh logic was found — token lifecycle is delegated to the Firebase SDK.

## Push Notifications

Confirmed in `berkeley-mobile/AppDelegate.swift`:
- `Messaging.messaging().delegate = self` and `UNUserNotificationCenter.current().delegate = self` are set in `application(_:didFinishLaunchingWithOptions:)`.
- `MessagingDelegate.messaging(_:didReceiveRegistrationToken:)` posts an `FCMToken` `NotificationCenter` notification and calls `Messaging.messaging().subscribe(toTopic: "all")`.
- `UNUserNotificationCenterDelegate.userNotificationCenter(_:didReceive:)` sets `tabBarController?.selectedIndex = 2` to route a tapped notification to the Safety tab (index 2 of `[mapView, todayView, safetyView, resourcesView]` in `TabBarController.swift`).

## Not Applicable

- REST/GraphQL route documentation: not applicable — no HTTP route layer exists in this repository.
- API versioning/pagination conventions: not found in codebase.
