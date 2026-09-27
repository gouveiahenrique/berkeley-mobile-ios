# API / Interface Standards

This repository is a native iOS mobile application; it does not implement or host HTTP routes, controllers, or server-side APIs. This document covers the repository's outbound data-communication interfaces: its Firestore data-access contracts and its one direct HTTP client usage.

## Firestore as the Primary Data Interface

The repository implements all structured backend communication through the Firebase Firestore SDK (`import Firebase`). There are two distinct implemented access patterns, coexisting in the codebase:

### Pattern 1 — `DataSource` protocol + completion handlers

Defined in `berkeley-mobile/Data/DataSource.swift`:

```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

Conforming types implement `fetchItems(_:)` as a `static func` that queries a single named Firestore collection via `Firestore.firestore().collection(<name>).getDocuments { querySnapshot, err in ... }`, manually maps each `QueryDocumentSnapshot.data()` dictionary into a domain model via a private `parse...` function, and invokes the completion handler with `[Any]`. Implementations found: `MapDataSource` (collection `"Map Marker"`), `LibraryDataSource` (collection `"Libraries"`), `GymDataSource` (collection `"Gyms"`), `GymClassDataSource` (collection `"Gym Classes"`).

Callers do not invoke `fetchItems` directly; they go through `DataManager.shared.fetch(source:_:)` (`berkeley-mobile/Data/DataManager.swift:65`), which de-duplicates concurrent fetches for the same `DataSource` type using the type's own `fetchDispatch: DispatchGroup`, and caches results in-memory for the app's lifetime (or until `DataManager.fetchIfNecessary()` is called after `DataManager.fetchInterval` — one hour — has elapsed, per `SceneDelegate.sceneWillEnterForeground`).

Error handling in this pattern: errors from `getDocuments` are logged via `print(...)` and the completion handler is not invoked (implementations return early on error), meaning the caller receives no result for that fetch. This is the observed behavior in `LibraryDataSource.fetchItems` and `GymDataSource.fetchItems`; `MapDataSource.fetchItems` similarly prints and does not call `completion` on error.

### Pattern 2 — `async`/`await` with `Codable` decoding

Defined in `berkeley-mobile/Data/BMNetworkingManager.swift`, a singleton (`BMNetworkingManager.shared`) exposing `async throws` methods:

```swift
func fetchSafetyLogs() async throws -> [BMSafetyLog]
func fetchResourcesCategories() async throws -> [BMResourceCategory]
```

Each method queries a Firestore collection (`BMConstants.safetyLogsCollectionName` = `"Safety Logs"`, `BMConstants.resourceCategoriesCollectionName` = `"Resource Categories"`) via `try await collection.getDocuments()`, then decodes each document with `try? $0.data(as: T.self)` (silently dropping documents that fail to decode via `compactMap`), and returns a sorted array. A third `async`-based data path is `EventsDataService.fetchEventsGroupedByDate()` (`berkeley-mobile/Events/EventDataSource/EventsViewModel.swift`), which follows the same `getDocuments()` + `data(as:)` decode pattern against the `"Events"` collection, decoding into `BerkeleyEventsDaySnapshot: Codable`.

Errors in this pattern propagate as Swift `throws`/`async throws`, in contrast to Pattern 1's completion-handler + print-and-drop approach. Both patterns exist concurrently in the current codebase; this document does not assert which pattern is preferred, only that both are implemented in files with more recent authorship dates (`BMNetworkingManager.swift`, `EventsViewModel.swift` are dated 2025 in file headers) alongside the older `DataSource`-conforming types (dated 2019–2020 in file headers).

## Direct HTTP Usage

`berkeley-mobile/Common/Images/ImageLoader.swift` implements direct `URLSession.shared.dataTask(with:)` calls to fetch and cache images by `URL`, independent of Firestore. This is the only direct (non-Firestore) network client implementation found in the repository during this pass.

## Data Contracts (Models)

Feature models conform to shared protocols declared in `berkeley-mobile/Data/ItemProtocols/` to expose a consistent contract to shared UI (e.g. `OverviewCardView`, `SearchItem`-driven search/map results):

- `HasName`, `HasLocation`, `HasImage`, `HasOpenTimes`, `HasWebsite`, `HasPhoneNumber`, `CanFavorite`, `SearchItem`.
- `SearchItem` (`berkeley-mobile/Data/ItemProtocols/SearchItem.swift`) requires `searchName`, `location`, `locationName`, `icon`, and supplies default `location`/`locationName` implementations when the conforming type also conforms to `HasLocation`.
- Fields sourced from Firestore free-text (e.g. names, descriptions) are frequently wrapped in the `@Display` property wrapper (`berkeley-mobile/Data/PropertyWrappers/Display.swift`) which trims whitespace and strips a specific invalid replacement character (`"�"`) on assignment.

## Authentication

`Firebase/Auth` and `GoogleSignIn` are declared as pod dependencies in `Podfile`. A concrete call site invoking sign-in was not located during this pass — not found in codebase.

## Not Applicable

- REST/GraphQL route definitions, request middleware, and server-side request lifecycle: not applicable for this repository type (no server-side code exists in this repository).
