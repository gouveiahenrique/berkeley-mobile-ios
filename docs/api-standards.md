# API Standards

**Last updated:** 2026-07-31

## Overview

Berkeley Mobile iOS does **not** expose or consume a traditional REST API. All data access goes through **Google Cloud Firestore** (NoSQL document database). There are no HTTP REST endpoints — the Firebase iOS SDK handles the network transport internally. This document describes the conventions used when reading/writing Firestore data.

## Firestore Data Access Patterns

### Collection Naming

Firestore collection names are defined as `fileprivate let` constants at the top of the file that owns the fetch logic. They use Title Case with spaces, matching the Firestore console names exactly:

```swift
fileprivate let kLibrariesEndpoint = "Libraries"
fileprivate let kDiningHallEndpoint = "Dining Halls V2"
fileprivate let kEventsDataServiceEndpoint = "Events"
fileprivate let kFeedbackResponsesCollection = "Feedback Responses"
```

Collection name constants in `BMConstants` are the exception — shared names used across multiple files are centralized there:

```swift
// BMConstants.swift
static let safetyLogsCollectionName = "Safety Logs"
static let resourceCategoriesCollectionName = "Resource Categories"
```

### Modern Pattern: async/await + Codable

New features use `async throws` functions on `BMNetworkingManager` or standalone service classes. Documents are decoded with `data(as:)` using `Codable` conformance:

```swift
// Preferred — async/await with Codable
func fetchSafetyLogs() async throws -> [BMSafetyLog] {
    let collection = db.collection(BMConstants.safetyLogsCollectionName)
    let querySnapshot = try await collection.getDocuments()
    return querySnapshot.documents
        .compactMap { try? $0.data(as: BMSafetyLog.self) }
        .sorted(by: { $0.date > $1.date })
}
```

Error propagation uses `throws` — callers handle errors with `do/catch` or `try?` for non-critical data:

```swift
// Non-critical fetch — use try? and return empty fallback
guard let snap = try? await db.collection(endpoint).getDocuments() else {
    return []
}

// Critical fetch — propagate error to ViewModel for user-visible alert
let snap = try await db.collection(endpoint).getDocuments()
```

### Legacy Pattern: Callback-based DataSource

Older features use the `DataSource` protocol with a completion callback. New features should use the async/await pattern instead.

```swift
// Legacy — DataSource protocol (do not use for new features)
static func fetchItems(_ completion: @escaping DataSource.completionHandler) {
    let db = Firestore.firestore()
    db.collection(kLibrariesEndpoint).getDocuments() { (querySnapshot, err) in
        guard let snapshot = querySnapshot else { return }
        let items = snapshot.documents.map { parseItem($0.data(), docID: $0.documentID) }
        completion(items)
    }
}
```

## Data Models

### Codable Models

Models that map directly to Firestore documents conform to `Codable` (and often `Identifiable`, `Hashable`). Use `CodingKeys` to map Firestore field names (snake_case or camelCase) to Swift property names:

```swift
struct BMSafetyLog: Identifiable, Codable, Hashable {
    var id = UUID()
    var crime: String
    var date: Date

    enum CodingKeys: String, CodingKey {
        case crime
        case date = "date_time"   // Firestore field name differs from Swift name
    }
}
```

### Manual Parsing (Legacy)

Older models parse `[String: Any]` dictionaries manually. New models should use `Codable`:

```swift
// Legacy — manual dict parsing (do not use for new models)
let library = BMLibrary(
    name: dict["name"] as? String ?? "Unnamed",
    address: dict["address"] as? String
)
```

## Error Handling

### Domain Errors

App-specific errors are defined in `BMError` as a `LocalizedError` enum. Add new cases here for user-visible error scenarios:

```swift
enum BMError: LocalizedError {
    case eventAlreadyAddedInCalendar
    case insufficientAccessToCalendar
    // ...

    public var errorDescription: String? {
        switch self {
        case .insufficientAccessToCalendar:
            return NSLocalizedString("Insufficient permissions...", comment: "...")
        }
    }
}
```

### ViewModel Error Presentation

ViewModels surface errors via a `@Published var alert: BMAlert?` property. Views observe this and present the alert:

```swift
// In ViewModel
do {
    let data = try await BMNetworkingManager.shared.fetchSafetyLogs()
    safetyLogs = data
} catch {
    withoutAnimation {
        self.alert = BMAlert(title: "Failed To Fetch Safety Logs", message: error.localizedDescription, type: .notice)
    }
}
```

### Logging Errors

Use `os.Logger` (via `Logger+Ext.swift`) for non-user-visible errors. Each ViewModel/service has a dedicated `Logger` category:

```swift
Logger.diningHallsViewModel.error("Cannot decode document: \(error.localizedDescription)")
```

## Authentication

- **Provider:** Google Sign-In (via `GoogleSignIn` pod) + Firebase Auth
- **Access pattern:** Firebase Auth handles session tokens transparently via the SDK. The app does not manually manage JWT tokens.
- **Sign-in flow:** `GIDSignIn` → Firebase credential → `Auth.auth().signIn(with:)`

## Push Notifications

- **Service:** Firebase Cloud Messaging (FCM)
- **Token handling:** `MessagingDelegate.messaging(_:didReceiveRegistrationToken:)` in `AppDelegate` posts the token via `NotificationCenter` and subscribes the device to the `"all"` topic.
- **Deep linking:** Notification tap routes to tab index 2 (Safety tab) via `TabBarController.selectedIndex`.

## Analytics

- **Service:** Firebase Analytics
- **Convention:** Log events with snake_case event names and camelCase parameter keys:

```swift
Analytics.logEvent("opened_food_screen", parameters: nil)
Analytics.logEvent("opened_food", parameters: ["dining_location": diningHallName])
```

## Versioning

There is no API versioning in the traditional REST sense. Firestore collection names are versioned by convention when breaking changes are needed (e.g., `"Dining Halls"` was superseded by `"Dining Halls V2"`). The old collection may be read in parallel for migration or supplementary data.
