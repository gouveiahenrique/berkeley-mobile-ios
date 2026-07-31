# API Standards

**Last updated:** 2026-07-31

## Overview

Berkeley Mobile does **not** expose or consume a custom REST API. All data access is through **Firebase Firestore** (NoSQL document database), **Apple WeatherKit**, and **iOS system frameworks** (EventKit, CoreLocation). There is no HTTP REST layer to version or paginate.

---

## Firebase Firestore Data Access

### Collection Naming

Firestore collection names use **Title Case with spaces** (matching the existing schema). Constants are defined in `BMConstants.swift`:

```swift
static let safetyLogsCollectionName = "Safety Logs"
static let resourceCategoriesCollectionName = "Resource Categories"
```

Feature-specific collection names are defined as `fileprivate` constants at the top of the relevant DataSource or ViewModel file:

```swift
fileprivate let kDiningHallEndpoint = "Dining Halls V2"
fileprivate let kLibrariesEndpoint = "Libraries"
```

### Fetch Patterns

**Pattern 1 — Legacy `DataSource` protocol** (used by `MapDataSource`, `LibraryDataSource`, `GymDataSource`):

```swift
class LibraryDataSource: DataSource {
    static var fetchDispatch: DispatchGroup = DispatchGroup()

    static func fetchItems(_ completion: @escaping DataSource.completionHandler) {
        let db = Firestore.firestore()
        db.collection(kLibrariesEndpoint).getDocuments() { (querySnapshot, err) in
            guard let docs = querySnapshot?.documents else { return }
            let items = docs.map { parseLibrary($0.data(), docID: $0.documentID) }
            completion(items)
        }
    }
}
```

**Pattern 2 — Direct async/await in ViewModel** (preferred for new code):

```swift
func fetchSafetyLogs() async throws -> [BMSafetyLog] {
    let db = Firestore.firestore()
    let querySnapshot = try await db.collection(BMConstants.safetyLogsCollectionName).getDocuments()
    return querySnapshot.documents.compactMap { try? $0.data(as: BMSafetyLog.self) }
        .sorted(by: { $0.date > $1.date })
}
```

**Pattern 3 — Firestore `Codable` decoding** (preferred for new models):

```swift
let data: GymOccupancyLocationData = try await docRef.getDocument(as: GymOccupancyLocationData.self)
```

Use `CodingKeys` to map Firestore field names to Swift property names:

```swift
enum CodingKeys: String, CodingKey {
    case id = "gymId"
    case sourcePageURL = "sourcePageUrl"
    case scrapedTimestamp = "scrapedAt"
}
```

### Error Handling for Firestore Calls

- **Async/await pattern:** use `try/catch`; log errors via `os.Logger` then return empty/default values — do not surface raw Firestore errors to the UI
- **Completion handler pattern:** check `err != nil` first; print with `print("Error getting documents: \(err)")` (legacy); new code should use `Logger`

```swift
// Preferred (new code)
guard let snap = try? await db.collection(endpoint).getDocuments() else {
    Logger.diningHallsViewModel.error("Failed to fetch documents")
    return []
}
```

---

## DataManager Caching Convention

`DataManager` provides a shared fetch cache keyed by `DataSource` type. Minimum refetch interval is 1 hour:

```swift
static let fetchInterval: TimeInterval = 60 * 60  // 1 hour
```

- Call `DataManager.shared.fetchIfNecessary()` from `SceneDelegate.sceneWillEnterForeground` and other entry points.
- Call `DataManager.shared.fetchAll()` on cold launch only.
- Individual features can call `DataManager.shared.fetch(source: SomeDataSource.self) { ... }` to get cached or freshly-fetched data.

---

## Apple WeatherKit

WeatherKit is consumed directly via `WeatherService.shared`. Calls are dispatched on a detached task at `userInitiated` priority to avoid blocking the main actor:

```swift
let forecast = try await Task.detached(priority: .userInitiated) {
    try await WeatherService.shared.weather(for: location, including: .current)
}.value
```

Errors are caught and logged; `showNotAvailable` flag is set on the ViewModel to show a fallback UI.

---

## Firebase Authentication

- **Google Sign-In 8.0** is integrated via `GoogleSignIn` pod.
- Auth state is managed by Firebase Auth; tokens are handled automatically by the SDK.
- No manual JWT handling is required.

---

## Push Notifications (FCM)

- All users are subscribed to the `"all"` topic on first launch.
- FCM token changes are broadcast via `NotificationCenter` with key `"FCMToken"`.
- Notification tap handling routes to `TabBarController.selectedIndex = 2` (Safety tab).

---

## Custom Error Type

App-specific errors are defined as `BMError` (`Data/BMError.swift`), conforming to `LocalizedError`:

```swift
enum BMError: Error {
    case eventAlreadyAddedInCalendar
    case insufficientAccessToCalendar
    case mayExistedInCalendarAlready
    case unableToFindEventInCalendar
}
```

Propagate `BMError` via `throw` and catch at the call site to show localized messages to the user.

---

## No REST/HTTP API

This project does **not** use `URLSession`, `Alamofire`, or any HTTP client for application data. If a future REST endpoint is added, follow these conventions:

- Define base URLs in `BMConstants.swift`
- Use `async throws` functions returning typed models
- Use `JSONDecoder` with `keyDecodingStrategy = .convertFromSnakeCase` where possible
- Map HTTP status codes to `BMError` cases
