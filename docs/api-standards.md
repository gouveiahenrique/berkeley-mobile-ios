# API Standards

**Last updated:** 2026-07-31

## Overview

Berkeley Mobile does **not** implement a custom REST API. All data access is through **Google Cloud Firestore**, accessed directly from the app via the Firebase iOS SDK. There are no HTTP endpoints, no URL routing, and no request/response JSON envelopes. This document describes the conventions for interacting with Firestore collections from Swift code.

---

## Firestore Access Patterns

### Collection Name Constants

All Firestore collection names are declared as `fileprivate let` constants at the top of the file that owns the fetch, or as `static let` in `BMConstants.swift` for shared collections.

```swift
// File-scoped (preferred for single-use endpoints)
fileprivate let kEventsDataServiceEndpoint = "Events"
fileprivate let kDiningHallEndpoint = "Dining Halls V2"

// Shared cross-feature constants (BMConstants.swift)
static let safetyLogsCollectionName = "Safety Logs"
static let resourceCategoriesCollectionName = "Resource Categories"
```

### Two Access Patterns in the Codebase

#### 1. Modern: async/await + Codable (preferred for new code)

Use `async throws` with Firestore's native `data(as:)` decoder. This pattern is used by `BMNetworkingManager`, `DiningHallsViewModel`, `EventsDataService`, and `FeedbackFormViewModel`.

```swift
func fetchSafetyLogs() async throws -> [BMSafetyLog] {
    let collection = db.collection(BMConstants.safetyLogsCollectionName)
    let querySnapshot = try await collection.getDocuments()
    return querySnapshot.documents.compactMap { try? $0.data(as: BMSafetyLog.self) }
}
```

#### 2. Legacy: callback-based + manual dictionary parsing

Used by `DataSource`-conforming classes (`LibraryDataSource`, `GymDataSource`, `MapDataSource`). Do not introduce this pattern in new code.

```swift
static func fetchItems(_ completion: @escaping DataSource.completionHandler) {
    let db = Firestore.firestore()
    db.collection(kLibrariesEndpoint).getDocuments { snapshot, err in
        guard let docs = snapshot?.documents else { return }
        let items = docs.map { parseLibrary($0.data(), docID: $0.documentID) }
        completion(items)
    }
}
```

---

## Data Model Conventions

### Codable Models (modern — preferred)

Models fetched via `data(as:)` must conform to `Codable`. Use `CodingKeys` to map Firestore snake_case field names to Swift `camelCase` properties.

```swift
struct BMSafetyLog: Identifiable, Codable, Hashable {
    var id = UUID()
    var crime: String
    var date: Date

    enum CodingKeys: String, CodingKey {
        case crime
        case date = "date_time"   // Firestore field name differs from Swift name
        case detail
        case latitude
        case location
        case longitude
    }
}
```

### Manual Parsing (legacy — avoid in new code)

Legacy data sources parse `[String: Any]` dictionaries from Firestore document data directly:

```swift
let name = dict["name"] as? String ?? "Unnamed"
let latitude = dict["latitude"] as? Double
```

---

## Error Handling

### Async/await style (modern)

Wrap Firestore calls in `do/catch`. Log errors with `os.Logger` (category-specific logger from `Logger+Ext.swift`). Use `compactMap { try? $0.data(as:) }` to silently skip malformed documents when partial results are acceptable.

```swift
do {
    let snap = try await db.collection(endpoint).getDocuments()
    let items: [T] = try snap.documents.map { try $0.data(as: T.self) }
    return items
} catch {
    Logger.diningHallsViewModel.error("\(error)")
    return []
}
```

### Typed errors

App-specific errors are defined in `BMError.swift` as a `LocalizedError` enum. Use these when surfacing actionable failures to the user (e.g., calendar permission denied).

```swift
enum BMError: Error {
    case eventAlreadyAddedInCalendar
    case insufficientAccessToCalendar
    // ...
}
```

### User-facing error presentation

ViewModels expose an optional `BMAlert` property:

```swift
@Published var alert: BMAlert?

// On failure:
self.alert = BMAlert(title: "Failed To Fetch Safety Logs",
                     message: error.localizedDescription,
                     type: .notice)
```

Views observe `alert` and present it as a SwiftUI `.alert` modifier.

---

## Authentication

- **Google Sign-In** (GoogleSignIn 8.0.0 + Firebase Auth): used for user identity where required.
- **Anonymous access:** Most data endpoints (libraries, gyms, dining, safety) are read publicly from Firestore without authentication.
- **FCM token registration:** On app launch, `AppDelegate` registers for remote notifications and subscribes to the `"all"` FCM topic.

```swift
Messaging.messaging().subscribe(toTopic: "all") { _ in }
```

---

## Firestore Write Conventions

Writes are rare. The only write path currently is `FeedbackFormViewModel.submitFeedbackForm`, which writes to the `"Feedback Responses"` collection.

```swift
let docID = "\(currDateString)/\(email)/\(currTimeString)"
try await db.collection(kFeedbackResponsesCollection)
    .document(docID)
    .setData(feedbackData)
```

Use `FieldValue.serverTimestamp()` for any timestamp fields written to Firestore (never client `Date()`).

---

## Analytics Event Conventions

Firebase Analytics events follow snake_case naming and are logged from ViewModels, not Views:

```swift
Analytics.logEvent("opened_food_screen", parameters: nil)
Analytics.logEvent("opened_food", parameters: ["dining_location": diningHallName])
```

- Event names: `snake_case`
- Parameter keys: `snake_case`
- Log from ViewModel, triggered by View's `.onAppear` or user action
- Do not log PII (no email addresses, user IDs) in event parameters
