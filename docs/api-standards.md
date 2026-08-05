# API / Interface Standards

This repository is a mobile application (iOS). There are no backend routes/controllers to document. The relevant "interfaces" are: (1) the app's outbound networking/data contracts with its backend, and (2) internal service/data-source interfaces used across the codebase.

## External Interface: Firestore Data Contracts

The application communicates with Google Cloud Firestore as its backend (`Podfile` includes `Firebase/Firestore`; `berkeley-mobile/Data/BMNetworkingManager.swift` instantiates `Firestore.firestore()`).

Two access patterns exist in the repository:

1. **Typed, `Codable`-based access** via `BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift`):
   - `fetchSafetyLogs() async throws -> [BMSafetyLog]` queries the `"Safety Logs"` collection (`BMConstants.safetyLogsCollectionName`) and decodes each document with `try? $0.data(as: BMSafetyLog.self)`, dropping documents that fail to decode (`compactMap`), then sorts by `date` descending.
   - `fetchResourcesCategories() async throws -> [BMResourceCategory]` queries the `"Resource Categories"` collection (`BMConstants.resourceCategoriesCollectionName`), decodes with `data(as:)`, sorts by `name`.
   - `BMSafetyLog` (`berkeley-mobile/Safety/SafetyViewModel.swift:12-42`) declares explicit `CodingKeys`, mapping the Firestore field `date_time` to the Swift property `date`; other fields (`crime`, `detail`, `latitude`, `location`, `longitude`) map 1:1 by name.

2. **Manual dictionary parsing** in each feature's `DataSource` type, which query Firestore collections directly and parse `[String: Any]` document data into domain structs:
   - `MapDataSource.fetchItems` (`berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift`) queries collection `"Map Marker"`, parses fields `tag`, `latitude`, `longitude`, `name`, `description`, `address`, `on_campus`, `phone`, `email`, `open_close_array`, `by_appointment`, `Average_Meal`, `Cal1Card_Accepted`, `EatWell_Accepted`, `accessibleGIRs`, `nonAccessibleGIRs`, and (for `type == "Menstrual Products"`) a nested `rooms` array with `bathroomType`, `productType`, `floorName`, `roomNumber`.
   - `GymDataSource.fetchItems` (`berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift`) queries collection `"Gyms"`, parses `name`, `description`, `address`, `phone`, `picture`, `open_close_array`, `link`, `latitude`, `longitude`, plus the Firestore document ID.
   - `GymClassDataSource.fetchItems` (`berkeley-mobile/Home/Fitness/GymClassDataSource/GymClassDataSource.swift`) queries collection `"Gym Classes"`, parses a nested `open_close_array` dict with `open_time`/`close_time` (Unix timestamps as `Double`), `class`, `class type`, `location`, `link`, `trainer`; classes whose `end` time has already passed are filtered out client-side.
   - `LibraryDataSource.fetchItems` (`berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift`) queries collection `"Libraries"`, parses `name`, `description`, `address`, `phone`, `open_close_array`, `picture`, `latitude`, `longitude`, plus document ID.

- **Error handling in `DataSource` implementations**: each `fetchItems` prints an error to the console (e.g. `print("[Error @ MapDataSource.fetchItems()]: \(err)")`) and returns without invoking the completion handler when the Firestore query errors; there is no retry or user-facing error surfaced from these specific call sites. By contrast, `BMNetworkingManager`'s `async throws` methods propagate the error to callers (e.g. `SafetyViewModel.listenForSafetyLogs()` catches it and sets a `BMAlert` for display, `berkeley-mobile/Safety/SafetyViewModel.swift:84-99`).
- **Authentication**: `Firebase/Auth` and `GoogleSignIn` are declared as dependencies (`Podfile`), and `GoogleSignIn` is imported in `berkeley-mobile/AppDelegate.swift`. No call site invoking a sign-in flow (e.g. `GIDSignIn`, `Auth.auth()`) was found in the inspected repository areas.
- **Push notifications**: Firebase Cloud Messaging registration and token handling is implemented in `berkeley-mobile/AppDelegate.swift` (`MessagingDelegate.messaging(_:didReceiveRegistrationToken:)`), which posts an internal `NotificationCenter` notification named `"FCMToken"` and subscribes the device to the `"all"` topic via `Messaging.messaging().subscribe(toTopic:)`.

## Internal Interface: `DataSource` Protocol

`berkeley-mobile/Data/DataSource.swift` defines the internal contract each feature's data-fetching type must satisfy:

```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

- Conforming types are static/type-level (no instance), returning `[Any]` rather than a generic associated type — callers downcast the result (e.g. `HomeViewModel.swift:74`: `libraries as? [BMLibrary] ?? []`).
- `DataManager` (`berkeley-mobile/Data/DataManager.swift`) is the single internal consumer that dispatches through this protocol for its registered source list (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) and caches results keyed by type name (`asKey(_:)`, using `String(describing: source)`).

## Internal Interface: Dependency Injection Container

`berkeley-mobile/BerkeleyMobile+Injection.swift` extends the `FactoryKit` `Container` type with one `Factory<T>` property per injected view model/service (e.g. `homeViewModel`, `safetyViewModel`, `eventsViewModel`, `feedbackFormPresenter`, `feedbackFormViewModel`). Each declares an explicit lifetime scope: `.shared`, `.singleton`, or unscoped (default). Consumers request instances via the `@Injected(\.propertyName)` property wrapper (e.g. `berkeley-mobile/MainContainerViewController.swift:15`, `berkeley-mobile/TabBarController.swift:15`).

## Frontend/Mobile-Specific Notes

- Not applicable: this repository has no separate "API client" abstraction layer distinct from the `DataSource`/`BMNetworkingManager` types documented above — the Firestore SDK is called directly from feature code.
- Not applicable: no GraphQL, REST client library, or custom RPC layer was found in the repository.
