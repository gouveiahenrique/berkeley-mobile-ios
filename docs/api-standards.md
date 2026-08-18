# API & Interface Standards

This repository is a mobile application client. There are no backend routes/controllers implemented here — "interfaces" in this document means how the app communicates with external services (Firestore, WeatherKit) and the internal service-layer contracts (`DataSource` protocol) used between the data layer and feature view models.

## Backend Communication: Google Cloud Firestore

The repository implements all primary content fetching through the Firebase/Firestore SDK (`import Firebase`, `import FirebaseFirestore`). Not found in codebase: any custom REST/GraphQL client, URLSession-based networking layer, or a self-hosted backend API — `README.md` states directly that "The application pulls data from Google Cloud Firestore."

### Fetch entry points

Two independent access patterns exist, both calling `Firestore.firestore()` directly:

1. **`DataManager`-mediated fetch** (`berkeley-mobile/Data/DataManager.swift`) — used for `MapDataSource`, `LibraryDataSource`, `GymDataSource` (`berkeley-mobile/Data/DataManager.swift:12-16`). Completion-handler based (`DataSource.completionHandler = (_ resources: [Any]) -> Void`), fetched once per app session per source and cached in-memory (`AtomicDictionary`).
2. **Direct `async`/`await` fetch**, bypassing `DataManager`, in `berkeley-mobile/Data/BMNetworkingManager.swift` (Safety logs, Resource categories) and in individual view models such as `berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift` (News) and `berkeley-mobile/FeedbackForm/FeedbackFormViewModel.swift` (Feedback form config/submission). These use `try await collection.getDocuments()` and Firestore's `Codable` decoding (`doc.data(as: T.self)`).

### `DataSource` protocol contract

Defined in `berkeley-mobile/Data/DataSource.swift`:

```swift
protocol DataSource {
    typealias completionHandler = (_ resources: [Any]) -> Void
    static func fetchItems(_ completion: @escaping DataSource.completionHandler)
    static var fetchDispatch: DispatchGroup { get set }
}
```

Each conforming type owns its own `DispatchGroup` (`fetchDispatch`) so that `DataManager.fetch(source:_:)` (`berkeley-mobile/Data/DataManager.swift:65-87`) can guarantee a given source is only fetched from Firestore once per app run, with subsequent callers receiving the cached result.

### Known Firestore collections (repository evidence)

Collection names are hardcoded as `fileprivate`/static string constants at each call site — there is no centralized API/endpoint registry beyond `BMConstants` for a subset of them.

| Collection name (as used in code) | Consumer | Source |
|---|---|---|
| `"Map Marker"` | `MapDataSource` | `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift:13` |
| `"Libraries"` | `LibraryDataSource` | `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift:12` |
| `"Gyms"` | `GymDataSource` | `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift:12` |
| `BMConstants.safetyLogsCollectionName` (`"Safety Logs"`) | `BMNetworkingManager.fetchSafetyLogs()` | `berkeley-mobile/Data/BMConstants.swift:39`, `berkeley-mobile/Data/BMNetworkingManager.swift:20-26` |
| `BMConstants.resourceCategoriesCollectionName` (`"Resource Categories"`) | `BMNetworkingManager.fetchResourcesCategories()` | `berkeley-mobile/Data/BMConstants.swift:40`, `berkeley-mobile/Data/BMNetworkingManager.swift:31-37` |
| `"Feedback Form Config"` (document `"config-data"`) | `FeedbackFormViewModel.fetchFeedbackFormConfig()` | `berkeley-mobile/FeedbackForm/FeedbackFormViewModel.swift:14-15` |
| `"Feedback Responses"` | `FeedbackFormViewModel.submitFeedbackForm(...)` (write path) | `berkeley-mobile/FeedbackForm/FeedbackFormViewModel.swift:16` |
| `"Daily Cal News"` | `NewsDataViewModel.fetchNewsArticles()` | `berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift:23` |

Not found in codebase: an exhaustive list of every Firestore collection used by every feature (e.g. `GymClassDataSource`, `DiningDataSource`) was not verified individually beyond the files read for this audit — the pattern (direct `Firestore.firestore().collection(<name>)` calls) is consistent across all inspected data sources.

### Firestore security / configuration

`README.md` states the production Firebase API key and `GoogleService-Info.plist` are intentionally excluded from the repository, meaning collaborators must supply their own Firebase project to run the app against live data.

## Apple Platform Service Integrations

- **WeatherKit** — `berkeley-mobile/Today/Tiles/Weather Tile/WeatherDataViewModel.swift` calls `WeatherService.shared.weather(for:including:)` for a hardcoded Berkeley coordinate (`CLLocation(latitude: 37.8716, longitude: -122.2727)`, line 25), on a repeating `Timer` (default `refreshInterval` of 5 minutes, line 31).
- **MapKit** — used for map rendering, geocoding-adjacent search (`MapPlacemark`), and region/zoom constraints (`BMConstants.mapBoundsRegion`, `berkeley-mobile/Data/BMConstants.swift:24-34`).
- **CoreLocation** — `berkeley-mobile/Data/BMLocationManager.swift` wraps `CLLocationManager`; the framework capability for background location is not used (`requestWhenInUseAuthorization()` only, line 43).
- **UserNotifications / Firebase Cloud Messaging** — registered in `berkeley-mobile/AppDelegate.swift:27-32`; FCM token delivery is broadcast internally via `NotificationCenter` (`"FCMToken"`, `berkeley-mobile/AppDelegate.swift:80-84`), and the app subscribes to the `"all"` topic.
- **Firebase Analytics** — `Analytics.logEvent(_:parameters:)` calls are scattered across feature code for user-interaction tracking (e.g. `berkeley-mobile/Home/Map/MapViewController.swift:216`, `berkeley-mobile/Home/HomeViewModel.swift:64`).

## Networking Data Contracts (Codable Models)

Types fetched via the `async`/`await`+`Codable` path conform to `Codable` directly (e.g. `FeedbackFormConfig`, `FeedbackFormSectionQuestions` in `berkeley-mobile/FeedbackForm/FeedbackFormViewModel.swift:18-30`; `BMSafetyLog`, `BMResourceCategory` referenced in `berkeley-mobile/Data/BMNetworkingManager.swift`). Types fetched via the completion-handler `DataSource` path are parsed manually field-by-field from `[String: Any]` dictionaries (e.g. `MapDataSource.parseMarker(_:)`, `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift:38-64`; `LibraryDataSource.parseLibrary(_:docID:)`, `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift:39-53`) rather than using `Codable` decoding. Both conventions coexist in the repository — see `docs/code-conventions.md` for further detail.

## Not Applicable

- REST/GraphQL route definitions, HTTP middleware, request/response serialization frameworks: not applicable — this repository is a Firestore-backed mobile client, not a server.
- Authentication middleware/authorization policies: `Firebase/Auth` and `GoogleSignIn` are declared pod dependencies (`Podfile`) and a Google URL scheme is registered (`berkeley-mobile/Info.plist:19-28`), but an active sign-in call site was not found in the inspected files.
