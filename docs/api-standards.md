# API Standards

**Last updated:** 2026-07-31

## Overview

Berkeley Mobile iOS does not expose or consume a traditional REST API. All backend data access is through **Google Cloud Firestore** (NoSQL document database). There is no HTTP REST layer — no URL routing, no status codes, no pagination headers. This document describes the Firestore data-access conventions used throughout the app.

## Firestore Data Access Conventions

### Collection Naming

Firestore collection names are declared as `fileprivate` or `static` constants near the call site, never hardcoded inline:

```swift
// In BMConstants.swift — shared across multiple files
struct BMConstants {
    static let safetyLogsCollectionName = "Safety Logs"
    static let resourceCategoriesCollectionName = "Resource Categories"
}

// In a ViewModel — feature-specific, fileprivate
fileprivate let kEventsDataServiceEndpoint = "Events"
fileprivate let kDiningHallEndpoint = "Dining Halls V2"
```

**Convention:** `k` prefix for `fileprivate` constants in a file, `BMConstants.*` for globally shared names.

### Fetch Pattern (async/await — preferred)

All new Firestore fetches use `async throws`:

```swift
func fetchSafetyLogs() async throws -> [BMSafetyLog] {
    let collection = db.collection(BMConstants.safetyLogsCollectionName)
    let querySnapshot = try await collection.getDocuments()
    return querySnapshot.documents
        .compactMap { try? $0.data(as: BMSafetyLog.self) }
        .sorted(by: { $0.date > $1.date })
}
```

- Use `compactMap { try? $0.data(as:) }` to silently skip malformed documents.
- Use `try $0.data(as:)` inside `do/catch` with `Logger.error(...)` when individual decode errors must be logged.
- Always sort results deterministically after fetch; Firestore does not guarantee order.

### Fetch Pattern (legacy callback — existing DataSources only)

Older `DataSource` subclasses use completion handlers and `DispatchGroup` to prevent duplicate fetches:

```swift
static func fetchItems(_ completion: @escaping DataSource.completionHandler) {
    fetchDispatch.notify(queue: .main) {
        // fetch from Firebase, call completion([Any])
    }
}
```

Do not create new `DataSource` subclasses — use the async/await ViewModel pattern instead.

### Data Models

All Firestore document models conform to `Codable` (specifically `Decodable`) so that `DocumentSnapshot.data(as:)` works:

```swift
struct BMSafetyLog: Identifiable, Codable, Hashable {
    var id = UUID()
    var crime: String
    var date: Date

    enum CodingKeys: String, CodingKey {
        case crime
        case date = "date_time"   // maps Swift camelCase to Firestore snake_case field
    }
}
```

- Use `CodingKeys` to map Firestore field names (often snake_case or spaces) to Swift property names (camelCase).
- Synthesized `id` properties (not from Firestore) should use `UUID()` defaults and be excluded from `CodingKeys`.
- Date fields decoded from Firestore `Timestamp` are handled automatically by the Firebase SDK's `Firestore.Decoder`.

### Error Handling

Firestore errors are caught at the ViewModel layer, not inside data service methods:

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

- Always propagate errors to the UI via an `@Published var alert: BMAlert?` or equivalent observable property.
- Never swallow errors silently — log with `os.Logger` at minimum.

### Custom App Errors (`BMError`)

Domain-specific errors are declared in `BMError.swift` as a `LocalizedError` enum:

```swift
enum BMError: Error {
    case eventAlreadyAddedInCalendar
    case insufficientAccessToCalendar
    case unableToFindEventInCalendar
}

extension BMError: LocalizedError {
    public var errorDescription: String? {
        switch self {
        case .insufficientAccessToCalendar:
            return NSLocalizedString("...", comment: "...")
        }
    }
}
```

Add new cases to `BMError` for domain-level failures; use `throw BMError.caseName` at call sites.

## External HTTP (Image Loading)

For loading remote images (e.g., dining hall photos), `ImageLoader.shared` uses `URLSession.shared.dataTask`:

```swift
ImageLoader.shared.getImage(url: url) { result in
    switch result {
    case .success(let image): // update UI
    case .failure(let error): // handle gracefully
    }
}
```

- All image loads go through the shared `ImageLoader` cache — never instantiate `URLSession` directly in views.
- `AsyncImage` (SwiftUI) is used for simpler cases where caching is not required (e.g., news article thumbnails).

## Authentication

- **Google Sign-In** is handled via `GoogleSignIn` pod + `FirebaseAuth`.
- Auth state is managed by Firebase; the app does not implement its own token storage.
- The app does not use JWT directly — Firebase manages token refresh transparently.
- The `berkeley.edu` email domain is validated for feedback form submissions:
  ```swift
  var isEmailValid: Bool { email.contains("@berkeley.edu") }
  ```

## Push Notifications

- Notification topics are subscribed via FCM: `Messaging.messaging().subscribe(toTopic: "all")`
- Deep-link navigation from notification tap goes to Safety tab (`tabBarController?.selectedIndex = 2`)
- No custom notification payload parsing — tap routing is handled in `AppDelegate.userNotificationCenter(_:didReceive:)`
