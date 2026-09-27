# API / Interface Standards

This repository is a native iOS mobile application. There are no HTTP routes/controllers or REST/GraphQL server endpoints defined in this repository (that is server-side territory, not applicable here). The relevant "interfaces" are the app's networking/data-contract layer with its backend (Firebase) and its internal service interfaces.

## External Data Contracts (Firestore)

- LEVEL 1 — The app communicates with Google Cloud Firestore directly from the client using the Firebase iOS SDK (`import Firebase`, `Firestore.firestore()`), not through a custom backend API. See `berkeley-mobile/Data/BMNetworkingManager.swift`, `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift`, `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift`, `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift`, `berkeley-mobile/Home/Fitness/GymClassDataSource/GymClassDataSource.swift`, `berkeley-mobile/Home/Fitness/GymOccupancy/GymOccupancyViewModel.swift`.
- LEVEL 1 — Two data-access styles coexist in the repository:
  1. **Static `DataSource` conformers** with manual dictionary parsing (older pattern): each type implements `static func fetchItems(_ completion:)` and does `db.collection("<name>").getDocuments { (querySnapshot, err) in ... }`, then hand-maps `document.data()` dictionary keys (e.g., `dict["name"] as? String`, `dict["latitude"] as? Double`) into model structs. Examples: `MapDataSource.swift` (collection `"Map Marker"`), `LibraryDataSource.swift` (collection `"Libraries"`), `GymDataSource.swift` (collection `"Gyms"`), `GymClassDataSource.swift` (collection `"Gym Classes"`).
  2. **`async`/`await` + `Codable` decoding** (newer pattern): `BMNetworkingManager` and `GymOccupancyViewModel` use `try await collection.getDocuments()` / `try await docRef.getDocument(as: Type.self)` with `Codable` structs (`BMSafetyLog`, `BMResourceCategory`, `GymOccupancyLocationData`) decoded via `$0.data(as: T.self)`.
- LEVEL 1 — Firestore collection names are referenced as string literals scattered across files (e.g., `fileprivate let kMapEndpoint = "Map Marker"`, `fileprivate let kLibrariesEndpoint = "Libraries"`) and, separately, as named constants in `BMConstants.swift` (`safetyLogsCollectionName`, `resourceCategoriesCollectionName`). Not found in codebase: a single centralized registry of all Firestore collection names — both patterns (local `fileprivate` constants and `BMConstants` members) are used depending on the file.
- LEVEL 1 — Error surfacing from Firestore calls is inconsistent across data sources: some call sites only `print(...)` the error and return (e.g., `LibraryDataSource.fetchItems`, `GymDataSource.fetchItems`, `MapDataSource.fetchItems`), while `BMNetworkingManager` and `GymOccupancyViewModel` propagate/catch `Error` via Swift's `throws`/`async throws` and surface it to a `@Published`/`@Observable` property (e.g., `SafetyViewModel.listenForSafetyLogs()` catches and sets `self.alert = BMAlert(...)`).

## Internal Service Interfaces

- LEVEL 1 — `protocol DataSource` (`berkeley-mobile/Data/DataSource.swift`) is the contract for feature-specific fetchers: `static func fetchItems(_ completion: @escaping completionHandler)` where `completionHandler = (_ resources: [Any]) -> Void`, plus a `static var fetchDispatch: DispatchGroup` used to deduplicate concurrent fetch calls.
- LEVEL 1 — `DataManager` (`berkeley-mobile/Data/DataManager.swift`) is the single internal entry point other code uses to request data — callers use `DataManager.shared.fetch(source:_:)` or `DataManager.shared.fetchAll()`/`fetchIfNecessary()` rather than calling a `DataSource` type directly. Confirmed callers: `AppDelegate.swift` (`fetchAll()`), `SceneDelegate.swift` (`fetchIfNecessary()`), `HomeViewModel.swift` and `MapViewController.swift` (`fetch(source:_:)`).
- LEVEL 1 — Dependency wiring between view models and their consumers is expressed through `FactoryKit`'s `Container` extension (`berkeley-mobile/BerkeleyMobile+Injection.swift`) and consumed via property wrappers such as `@Injected`, `@InjectedObject`, `@InjectedObservable` (seen in `berkeley-mobile/Home/HomeView.swift`). This is the internal composition/interface mechanism between features, rather than a network or process boundary.

## Authentication

- LEVEL 1 — `Podfile` includes `Firebase/Auth` and `GoogleSignIn` pods for the `berkeley-mobile` target. `AppDelegate.swift` imports `GoogleSignIn`.
- Not found in codebase: any observed call site invoking Firebase Auth or Google Sign-In APIs (e.g., `Auth.auth()`, `GIDSignIn.sharedInstance`) within the inspected files. The import in `AppDelegate.swift` is the only located reference.

## Applicability of Other Interface Types

- GraphQL, message queues, RPC, native bridges (beyond the UIKit/SwiftUI interop already documented in `docs/tech.md`): Not found in codebase.
