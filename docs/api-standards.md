# API Standards

## Repository Type

This is an iOS mobile application. It does not expose HTTP APIs. This document describes the interfaces and communication contracts the application uses to communicate with external systems and internal modules.

---

## External Data Interface: Firebase Firestore

All application data is fetched from Firebase Cloud Firestore. No REST/HTTP API client is observed in the production codebase.

### Firestore Collection Names

Collection names are defined as constants in `berkeley-mobile/Data/BMConstants.swift`:

| Constant | Firestore Collection Name | Used By |
|---|---|---|
| `BMConstants.safetyLogsCollectionName` | `"Safety Logs"` | `BMNetworkingManager.fetchSafetyLogs()` |
| `BMConstants.resourceCategoriesCollectionName` | `"Resource Categories"` | `BMNetworkingManager.fetchResourcesCategories()` |

Additional collection names are defined as file-level constants within individual data source files, such as `kLibrariesEndpoint` in `LibraryDataSource.swift`.

### Fetch Patterns

Two distinct Firestore fetch patterns are implemented:

**Pattern 1 — Callback-based (`DataSource` protocol)**

Used by `LibraryDataSource`, `GymDataSource`, and `MapDataSource`. Each conforming type implements:

```swift
// berkeley-mobile/Data/DataSource.swift:11
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

Example implementation (`LibraryDataSource.swift:21`):
- Opens a Firestore connection via `Firestore.firestore()`
- Calls `.getDocuments()` with a closure
- Maps raw document dictionaries to typed model objects
- Invokes `completion` with the resulting array

**Pattern 2 — Async/await (`BMNetworkingManager`)**

Used for Safety Logs and Resources Categories. `BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift:12`) holds a shared `Firestore.firestore()` reference and exposes async throwing functions:

```swift
func fetchSafetyLogs() async throws -> [BMSafetyLog]
func fetchResourcesCategories() async throws -> [BMResourceCategory]
```

Documents are decoded using Firestore's `data(as:)` method with `compactMap`.

### Caching Contract

`DataManager` (`berkeley-mobile/Data/DataManager.swift`) enforces that each `DataSource` is fetched from Firestore at most once per session using per-source `DispatchGroup` instances. A minimum re-fetch interval of `3600` seconds (`DataManager.fetchInterval`) is defined. Cached results are stored in an `AtomicDictionary<String, [Any]>` keyed by the data source type name.

---

## External Data Interface: Firebase Push Messaging (FCM)

`AppDelegate` subscribes the device to the `"all"` FCM topic on every launch:

```swift
// berkeley-mobile/AppDelegate.swift:83
Messaging.messaging().subscribe(toTopic: "all") { _ in }
```

The FCM registration token is broadcast locally via `NotificationCenter` with name `"FCMToken"`.

---

## External Data Interface: Image Loading

`ImageLoader` (`berkeley-mobile/Common/Images/ImageLoader.swift`) fetches images from arbitrary remote URLs using `URLSession.shared.dataTask(with:)`. Images are cached in-memory by `URL`. No base URL or URL construction convention is defined in this class — callers provide fully-formed URLs.

---

## Internal Module Interfaces

### `DataSource` Protocol

Defines the contract for all legacy Firestore data sources. Conforming types must be `class`-compatible (they use a `static var fetchDispatch`). The `completionHandler` typealias uses `[Any]` as the return type, requiring callers to cast results to the expected concrete type.

### `SearchItem` Protocol

`berkeley-mobile/Data/ItemProtocols/SearchItem.swift` defines a protocol adopted by entities that can appear in the home search results. `DataManager.searchable` aggregates all `SearchItem`-conforming objects from cached data sources.

### `DrawerViewDelegate` Protocol

`berkeley-mobile/Drawer/DrawerViewDelegate.swift` defines the pan-gesture and position management interface for the sliding drawer UI. `MainContainerViewController` conforms to `MainDrawerViewDelegate` (a specialization). Drawer positions are defined by the `DrawerState` enum with values: `.collapsed`, `.middle`, `.full`, `.hidden`.

### `FeedbackFormPresenterDelegate` Protocol

`berkeley-mobile/FeedbackForm/FeedbackFormPresenter.swift:12` — bridges UIKit presentation from `FeedbackFormPresenter` to `TabBarController`. The delegate method `feedbackFormDidPresent(withViewController:)` is the only declared method.

---

## Notification Center Contracts

| Notification Name | Source | Payload Key |
|---|---|---|
| `"FCMToken"` | `AppDelegate.messaging(_:didReceiveRegistrationToken:)` | `"token"` (String) |
| `BMLocationManager.locationUpdated` | `BMLocationManager` | Not found in inspected files |

---

## Firebase Auth / GoogleSignIn

`Firebase/Auth` and `GoogleSignIn` are declared as Podfile dependencies. Authentication-specific view controllers or session management code was not found in the inspected source files.
