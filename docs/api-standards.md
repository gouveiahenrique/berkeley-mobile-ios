# API Standards

**Last updated:** 2026-08-04

## Overview

Berkeley Mobile iOS does **not** consume a traditional REST API. All backend data is fetched directly from **Google Cloud Firestore** using the Firebase iOS SDK. There is no custom HTTP API layer; data access conventions follow Firestore document/collection patterns.

---

## Firestore Data Access Patterns

### Collection Names

Collection names are defined as string constants in `BMConstants.swift` to avoid magic strings. Always add new collection names there.

```swift
// berkeley-mobile/Data/BMConstants.swift
struct BMConstants {
    static let safetyLogsCollectionName = "Safety Logs"
    static let resourceCategoriesCollectionName = "Resource Categories"
}
```

Feature-local collection names are declared as `fileprivate let` at the top of the relevant ViewModel:

```swift
// DiningHallsViewModel.swift
fileprivate let kDiningHallEndpoint = "Dining Halls V2"
fileprivate let kDiningHallAdditionalDataEndpoint = "Dining Halls"
```

### Fetch Pattern (Modern — async/await)

All new data fetches use `async/await`. Firestore reads are `try await`:

```swift
func fetchSafetyLogs() async throws -> [BMSafetyLog] {
    let collection = db.collection(BMConstants.safetyLogsCollectionName)
    let querySnapshot = try await collection.getDocuments()
    return querySnapshot.documents
        .compactMap { try? $0.data(as: BMSafetyLog.self) }
        .sorted(by: { $0.date > $1.date })
}
```

### Fetch Pattern (Legacy — closure-based)

Older DataSources use the `DataSource` protocol with completion handlers:

```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

New code should use `async/await` instead of the legacy pattern.

### Data Decoding

Models are decoded from Firestore documents using `Codable` + `data(as:)`:

```swift
// Preferred: typed decode with error logging
for doc in snap.documents {
    do {
        let item = try doc.data(as: MyModel.self)
        items.append(item)
    } catch {
        Logger.myViewModel.error("\(error)")
    }
}

// Acceptable for bulk decode where partial failure is OK:
let items = documents.compactMap { try? $0.data(as: MyModel.self) }
```

Use explicit `CodingKeys` when Firestore field names differ from Swift property names:

```swift
enum CodingKeys: String, CodingKey {
    case date = "date_time"
    case sourcePageURL = "sourcePageUrl"
    case scrapedTimestamp = "scrapedAt"
}
```

---

## Authentication

- **Provider:** Firebase Auth + Google Sign-In 8.0.0
- **Token management:** Handled entirely by the Firebase SDK; no manual JWT handling required
- **Firestore security rules:** Managed on the backend; the app relies on Firebase SDK enforcement

---

## Push Notifications

- **Provider:** Firebase Cloud Messaging (FCM) via `FirebaseMessaging` 11.4.0
- **Topic subscription:** All users subscribe to the `"all"` FCM topic on registration
- **Token refresh:** Handled in `AppDelegate`'s `MessagingDelegate`
- **Deep link behavior:** Incoming notifications navigate to the Safety tab (index 2)

```swift
// AppDelegate.swift
func userNotificationCenter(_ center: UNUserNotificationCenter,
                          didReceive response: UNNotificationResponse) async {
    let tabBarController = sceneDelegate?.window?.rootViewController as? TabBarController
    tabBarController?.selectedIndex = 2
}
```

---

## Analytics

- **Provider:** Firebase Analytics
- **Event logging:** Call `Analytics.logEvent(_:parameters:)` from within ViewModels (not Views)

```swift
// DiningHallsViewModel.swift
func logOpenedDiningDetailViewAnalytics(for diningHallName: String) {
    Analytics.logEvent("opened_food", parameters: ["dining_location": diningHallName])
}
```

---

## Error Handling

### Typed Errors

Define feature-specific errors as `enum` conforming to `LocalizedError`:

```swift
// BMError.swift
enum BMError: Error, LocalizedError {
    case eventAlreadyAddedInCalendar
    case insufficientAccessToCalendar
    case unableToFindEventInCalendar

    public var errorDescription: String? {
        switch self {
        case .insufficientAccessToCalendar:
            return NSLocalizedString("Insufficient permissions...", comment: "")
        // ...
        }
    }
}
```

### ViewModel Error Surface

ViewModels expose errors to the UI via `BMAlert`:

```swift
struct BMAlert: Equatable, Identifiable {
    enum BMAlertType { case action, notice }
    let id = UUID()
    var title: String
    var message: String
    var type: BMAlertType
}

// In ViewModel (ObservableObject):
@Published var alert: BMAlert?

// In ViewModel (@Observable):
var alert: BMAlert?
```

Views use the `.presentAlert(alert:)` modifier to display these:

```swift
.presentAlert(alert: $safetyViewModel.alert)
```

### Async Error Propagation

- `async throws` functions propagate errors to the caller
- ViewModels catch at the Task boundary and convert to `BMAlert`
- Log errors via `os.Logger` before surfacing to the UI:

```swift
do {
    let data = try await BMNetworkingManager.shared.fetchSafetyLogs()
    safetyLogs = data
} catch {
    self.alert = BMAlert(title: "Failed To Fetch Safety Logs",
                         message: error.localizedDescription,
                         type: .notice)
}
```

---

## Data Refresh Strategy

- **Legacy `DataManager`:** Minimum 1-hour interval between full re-fetches (`fetchInterval = 60 * 60`)
- **Modern ViewModels:** Fetch on `init()` inside a `Task`; `GymOccupancyViewModel` polls every 15 minutes (`refreshIntervalSecs = 15 * 60`)
- **No pagination:** All Firestore collection documents are fetched in full; the dataset is small enough that pagination is not used

---

## External Data Sources

| Feature | Firestore Collection | Notes |
|---------|---------------------|-------|
| Dining Halls | `"Dining Halls V2"` | Merged with `"Dining Halls"` additional data |
| Safety Logs | `"Safety Logs"` | Sorted by `date_time` descending |
| Resources | `"Resource Categories"` | Sorted by name descending |
| Feedback Form Config | `"Feedback Form Config"` / doc `"config-data"` | |
| Feedback Responses | `"Feedback Responses"` | Write-only from app |
| Gym Occupancy | `"Gym Occupancy Meters"` | Polled every 15 min |
| Map Markers | Legacy DataSource | Fetched once, cached by `DataManager` |
| Libraries | Legacy DataSource | Fetched once, cached by `DataManager` |
| Gyms | Legacy DataSource | Fetched once, cached by `DataManager` |
