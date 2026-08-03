# API / Interface Standards

## Repository Type Context

This repository is a native iOS mobile application. It does not expose an HTTP API of its own. This document covers how the application communicates with external systems and services — its networking/service contracts as consumer, not provider.

## External Data Sources

### Firebase / Cloud Firestore (primary backend)

The repository implements Firestore as its primary data backend. `README.md` states: "The application pulls data from Google Cloud Firestore." Firebase is configured once at launch via `FirebaseApp.configure()` in `AppDelegate.application(_:didFinishLaunchingWithOptions:)` (`berkeley-mobile/AppDelegate.swift:21`), and independently in the widget extension via `BerkeleyMobileWidgetBundle.configureFirebaseIfNeeded()` (`BerkeleyMobileWidget/BerkeleyMobileWidgetBundle.swift:23-28`).

Two access patterns are used to reach Firestore, both instantiating `Firestore.firestore()` directly (no shared abstraction over the SDK client):

**Pattern A — Legacy completion-handler `DataSource` types.** Each conforms to the `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift:11`), which requires:
```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```
Implementers query one Firestore collection with `db.collection(<name>).getDocuments()` and manually map each document's `[String: Any]` dictionary to a domain type. Examples:
- `GymDataSource.fetchItems` queries collection `"Gyms"` (`berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift:12,19-21`), parses into `BMGym` via a private `parseGym(_:docID:)`.
- `MapDataSource.fetchItems` queries collection `"Map Marker"` (`berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift:13,20-23`), parses into `MapMarker` grouped by marker type.
- `LibraryDataSource.fetchItems` queries collection `"Libraries"` (`berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift:12,21-24`), parses into `BMLibrary`.

These three types are the only ones registered with `DataManager` (`berkeley-mobile/Data/DataManager.swift:12-16`), which orchestrates them through `fetchAll()` / `fetchIfNecessary()` / `fetch(source:_:)`.

**Pattern B — async/await services returning `Codable` models.** Newer code queries Firestore with `try await collection.getDocuments()` and decodes documents directly via `Firestore`'s `DocumentSnapshot.data(as:)` (a `Codable`-based decode), rather than manual dictionary parsing:
- `BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift:12`) — `fetchSafetyLogs()` queries `BMConstants.safetyLogsCollectionName` (`"Safety Logs"`) into `[BMSafetyLog]`; `fetchResourcesCategories()` queries `BMConstants.resourceCategoriesCollectionName` (`"Resource Categories"`) into `[BMResourceCategory]`.
- `NewsDataViewModel.fetchNewsArticles()` queries collection `"Daily Cal News"` into `[NewsArticle]` (`berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift:23,33-48`).
- `EventsDataService.fetchEventsGroupedByDate()` queries collection `"Events"` into `[BerkeleyEventsDaySnapshot]` (`berkeley-mobile/Events/EventDataSource/EventsViewModel.swift:14,35-73`).

Collection name constants are inconsistently centralized: some are declared as `fileprivate let k*Endpoint` constants local to their file (e.g. `kGymsEndpoint`, `kMapEndpoint`, `kLibrariesEndpoint`, `kEventsDataServiceEndpoint`, `kNewsDataEndpoint`), while others live in the shared `BMConstants` struct (`safetyLogsCollectionName`, `resourceCategoriesCollectionName` — `berkeley-mobile/Data/BMConstants.swift:39-40`).

### Firebase Cloud Messaging

`AppDelegate` implements `MessagingDelegate.messaging(_:didReceiveRegistrationToken:)` (`berkeley-mobile/AppDelegate.swift:77-87`), which posts a local `NotificationCenter` notification named `"FCMToken"` and subscribes the device to the `"all"` topic via `Messaging.messaging().subscribe(toTopic:)`.

### Firebase Analytics

`Analytics.logEvent(_:parameters:)` is called directly at call sites needing analytics (e.g. `EventsViewModel.logAcademicCalendarTabAnalytics()`, `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift:94-96`). `Analytics.resetAnalyticsData()` is called during app-version migrations (`berkeley-mobile/AppDelegate+Migration.swift:85`).

### WeatherKit

`WeatherDataViewModel` (`berkeley-mobile/Today/Tiles/Weather Tile/WeatherDataViewModel.swift:16`) uses Apple's `WeatherKit` framework via `WeatherService.shared` to fetch `.current` and `.daily` weather for a hardcoded Berkeley coordinate. This is enabled by the `com.apple.developer.weatherkit` entitlement (`berkeley-mobile/berkeley-mobile.entitlements:7-8`).

### EventKit (device Calendar)

`BMEventManager` (`berkeley-mobile/Data/BMEventManager.swift:12`) wraps `EKEventStore` to add/delete/query events in the user's device calendar, requesting access via `requestFullAccessToEvents()` (iOS 17+) or `requestAccess(to:)` (`berkeley-mobile/Data/BMEventManager.swift:20-25`). Errors are surfaced through the repository-defined `BMError` enum (`berkeley-mobile/Data/BMError.swift:11`).

### Direct Image Loading (URLSession)

`ImageLoader` (`berkeley-mobile/Common/Images/ImageLoader.swift:12`) implements a custom in-memory image cache and loader using `URLSession.shared.dataTask(with:completion:)` directly (not via Firestore or a third-party image library), keyed by `URL` with cancellable in-flight requests tracked by `UUID`.

## Error / Result Contracts

- Firestore completion-handler call sites (Pattern A) print errors to the console (e.g. `print("[Error @ GymDataSource.fetchGyms()]: \(err)")`, `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift:23`) and otherwise silently drop the fetch (no data returned to the completion handler on error).
- Firestore async call sites (Pattern B) use `try?` to convert thrown errors into `nil`/empty results in some places (e.g. `NewsDataViewModel.fetchNewsArticles()`, `berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift:34`) or propagate via `async throws` and surface a `BMAlert` to the user in others (e.g. `SafetyViewModel.listenForSafetyLogs()`, `berkeley-mobile/Safety/SafetyViewModel.swift:85-100`).
- User-facing errors for Calendar operations use the repository's own `BMError: Error, LocalizedError` type (`berkeley-mobile/Data/BMError.swift`), whose `errorDescription` is shown directly in a `BMAlert` (`berkeley-mobile/Events/EventDataSource/EventsViewModel.swift:124-131`).
- `os.Logger` instances, one per consuming type, are declared centrally in `berkeley-mobile/Utils/Logger+Ext.swift` (e.g. `Logger.newsDataViewModel`, `Logger.weatherDataViewModel`, `Logger.eventsDataService`) and used for `.error(...)`/`.info(...)` logging at call sites, rather than `print(...)`, in newer (`Observable`-based) view models.

## Authentication

`Firebase/Auth` and `GoogleSignIn` are declared as dependencies in `Podfile`, and `GoogleSignIn` is imported in `berkeley-mobile/AppDelegate.swift:12`. A Google OAuth client URL scheme is registered in `berkeley-mobile/Info.plist:26` (`com.googleusercontent.apps.592064103331-...`). Not found in codebase: a call site invoking `GIDSignIn` or `Auth.auth()` sign-in within the inspected repository areas.

## Not Applicable

- REST/GraphQL route definitions, controllers, or server-side request handling: not applicable for this repository type (no backend server code was found).
- RPC/queue-based messaging contracts beyond Firebase Cloud Messaging: not found in codebase.
