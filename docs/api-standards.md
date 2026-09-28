# API / Interface Standards

This repository is a mobile application (iOS client), not a backend service. It does not implement or expose HTTP routes, controllers, or a REST/GraphQL server. Sections below document the observed networking layer and data-contract patterns instead, per the `<interface_analysis>` guidance for mobile repositories.

## Backend Communication

The repository implements communication with **Google Cloud Firestore** as its backend data source. This is stated directly in `README.md`: "The application pulls data from Google Cloud Firestore." The production Firebase configuration file (`GoogleService-Info.plist`) is explicitly excluded from the repository, per `README.md`: "the production backend API key and GoogleService-Info.plist are not included in this repository."

Firestore access is implemented through Firebase's iOS SDK (`Firebase/Firestore` CocoaPod, declared in `Podfile`), accessed via `Firestore.firestore()`, observed in:
- `berkeley-mobile/Data/BMNetworkingManager.swift`
- `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift` (`EventsDataService`)
- `berkeley-mobile/FeedbackForm/FeedbackFormViewModel.swift`

## Data Source Abstraction

The repository defines a `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift`):

```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

`DataManager` (`berkeley-mobile/Data/DataManager.swift`) consumes an explicit, hardcoded list of conforming types (`kDataSources: [DataSource.Type] = [MapDataSource.self, LibraryDataSource.self, GymDataSource.self]`) and coordinates a single fetch per source using `DispatchGroup`, caching results in an in-memory `AtomicDictionary<String, [Any]>` keyed by type name.

A second, separate networking path exists in `BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift`), which uses Swift `async`/`await` directly against Firestore collections rather than the `DataSource` completion-handler protocol:

```swift
func fetchSafetyLogs() async throws -> [BMSafetyLog]
func fetchResourcesCategories() async throws -> [BMResourceCategory]
```

The observed implementation therefore uses two distinct data-access patterns: an older completion-handler-based `DataSource` protocol (used by `MapDataSource`, `LibraryDataSource`, `GymDataSource` via `DataManager`) and a newer `async`/`await` pattern used directly by feature-specific services (`BMNetworkingManager`, `EventsDataService`, `FeedbackFormViewModel`).

## Data Contracts

Firestore documents are decoded into typed Swift models using `Codable` conformance and the Firebase `data(as:)` decoding API, e.g.:
- `berkeley-mobile/Data/BMNetworkingManager.swift`: `$0.data(as: BMSafetyLog.self)`, `$0.data(as: BMResourceCategory.self)`
- `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift`: `doc.data(as: BerkeleyEventsDaySnapshot.self)`, and a nested `BerkeleyEvent: Codable` struct
- `berkeley-mobile/FeedbackForm/FeedbackFormViewModel.swift`: `docRef.getDocument(as: FeedbackFormConfig.self)`

Firestore collection names are defined as string constants rather than passed as literals at each call site, e.g. `BMConstants.safetyLogsCollectionName`, `BMConstants.resourceCategoriesCollectionName` (`berkeley-mobile/Data/BMConstants.swift`), and `kEventsDataServiceEndpoint`, `kFeedbackFormConfigEndpoint` (file-private constants declared at the top of their respective service files).

## Error Handling in Data Access

The repository defines a domain-specific error enum, `BMError` (`berkeley-mobile/Data/BMError.swift`), conforming to `LocalizedError` with user-facing messages (used for calendar-related failures: `.insufficientAccessToCalendar`, `.eventAlreadyAddedInCalendar`, etc.).

Firestore/network failures in `async` call sites are handled with `do`/`catch` and surfaced to the UI via observable alert state, e.g. `SafetyViewModel.listenForSafetyLogs()` (`berkeley-mobile/Safety/SafetyViewModel.swift`) sets `self.alert = BMAlert(title: "Failed To Fetch Safety Logs", message: error.localizedDescription, type: .notice)` on catch.

## Push Notifications

`AppDelegate.swift` implements `MessagingDelegate` for Firebase Cloud Messaging token registration and `UNUserNotificationCenterDelegate` for local notification presentation/handling — the only inbound "interface" from an external system observed in the repository beyond Firestore reads.

## Native Integrations

- `BMLocationManager` (`berkeley-mobile/Data/BMLocationManager.swift`) — wraps Core Location for user-location requests, invoked from `AppDelegate.didFinishLaunchingWithOptions`.
- WeatherKit capability is declared in `berkeley-mobile/berkeley-mobile.entitlements` (`com.apple.developer.weatherkit`); corresponding implementation is in `Today/Tiles/Weather Tile/WeatherDataViewModel.swift` (file located via directory listing; not read in detail for this document).
- GoogleSignIn is declared as a dependency (`Podfile`) and imported in `AppDelegate.swift`; the specific sign-in call sites were not inspected in this pass — not confirmed beyond the import and dependency declaration.

## Not Applicable

- REST/GraphQL route definitions, controllers, request validation middleware, and API authentication schemes in the backend sense: not applicable for this repository type — the repository is a Firestore client, not a server.
