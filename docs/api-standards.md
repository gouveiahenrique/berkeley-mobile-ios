# API / Interface Standards

This repository is a mobile client, not a backend service. There are no repository-defined HTTP routes, controllers, or server-side request handlers. The relevant "interfaces" are how the app communicates with its external backends. Two integration patterns were found: direct Firestore access, and one first-party system framework client (WeatherKit).

## Primary Data Contract: Google Cloud Firestore

The application implements direct client access to Firestore (`import Firebase` / `import FirebaseFirestore`, `Firestore.firestore()`), not a custom REST/GraphQL layer. Each feature area reads one or more named collections directly. Collection names observed in the repository:

| Collection name (string literal) | Read by |
|---|---|
| `"Map Marker"` | `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift` |
| `"Libraries"` | `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift` |
| `"Gyms"` | `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift` |
| `"Gym Classes"` | `berkeley-mobile/Home/Fitness/GymClassDataSource/GymClassDataSource.swift` |
| `"Events"` | `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift` (`kEventsDataServiceEndpoint`) |
| `"Daily Cal News"` | `berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift` (`kNewsDataEndpoint`) |
| `BMConstants.safetyLogsCollectionName` = `"Safety Logs"` | `berkeley-mobile/Data/BMNetworkingManager.swift` |
| `BMConstants.resourceCategoriesCollectionName` = `"Resource Categories"` | `berkeley-mobile/Data/BMNetworkingManager.swift` |
| Dining hall / additional dining data endpoints (named constants `kDiningHallEndpoint`, `kDiningHallAdditionalDataEndpoint`) | `berkeley-mobile/Home/Dining/DiningDataSource/DiningHallsViewModel.swift` |
| Guides endpoint (`kGuidesEndpoint`) | `berkeley-mobile/Home/Guides/GuidesViewModel.swift` |
| Gym occupancy collection (`Constants.gymOccupancyCollectionName`, keyed by `gymLocation.documentName`) | `berkeley-mobile/Home/Fitness/GymOccupancy/GymOccupancyViewModel.swift` |
| Feedback form config/response collections (`kFeedbackFormConfigEndpoint`, `kFeedbackResponsesCollection`) | `berkeley-mobile/FeedbackForm/FeedbackFormViewModel.swift` |

Not found in codebase: a single centralized list of all collection names. `BMConstants.swift` centralizes some (`safetyLogsCollectionName`, `resourceCategoriesCollectionName`), but other collection name constants (`kMapEndpoint`, `kLibrariesEndpoint`, `kGymsEndpoint`, `kGymClassesEndpoint`, `kEventsDataServiceEndpoint`, `kNewsDataEndpoint`, `kGuidesEndpoint`, dining and feedback-form endpoints) are declared `fileprivate`/`private` inside their own consuming file.

### Two access patterns for Firestore reads

1. **Coordinated through `DataManager`** — used only for the three sources it lists explicitly in `berkeley-mobile/Data/DataManager.swift` (`MapDataSource`, `LibraryDataSource`, `GymDataSource`). These types conform to the `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift`):
   ```swift
   protocol DataSource {
       typealias completionHandler = (_ resources: [Any]) -> Void
       static func fetchItems(_ completion: @escaping DataSource.completionHandler)
       static var fetchDispatch: DispatchGroup { get set }
   }
   ```
   `DataManager.fetch(source:_:)` uses each type's `fetchDispatch` `DispatchGroup` to guarantee a given source is only fetched from Firestore once per app session, caching the result in an in-memory `AtomicDictionary`.
2. **Direct, uncoordinated reads** — most other features (safety logs, resource categories, events, news, dining, guides, gym occupancy, feedback form) call `Firestore.firestore().collection(...)` directly from their own service/view-model type (e.g. `BMNetworkingManager`, `EventsDataService`, `NewsDataViewModel`, `GuidesViewModel`, `DiningHallsViewModel`, `GymOccupancyViewModel`, `FeedbackFormViewModel`), without going through `DataManager` and without the once-per-session caching it provides.

### Decoding conventions

Two decoding styles are both present in the repository:

- **Manual dictionary parsing** — the three `DataManager`-coordinated sources call `document.data()` to get a raw `[String: Any]` dictionary and parse it manually (e.g. `MapDataSource.parseMarker(_:)`, `GymDataSource.parseGym(_:docID:)`, `LibraryDataSource.parseLibrary(_:docID:)`), reading individual keys such as `"name"`, `"latitude"`, `"open_close_array"`.
- **`Codable` via `DocumentSnapshot.data(as:)`** — newer, non-`DataManager` services decode directly into `Codable` structs, e.g. `try doc.data(as: BMSafetyLog.self)` (`BMNetworkingManager.swift`), `try doc.data(as: BerkeleyEventsDaySnapshot.self)` (`EventsViewModel.swift`), `try doc.data(as: NewsArticle.self)` (`NewsDataViewModel.swift`). `BMSafetyLog` (`berkeley-mobile/Safety/SafetyViewModel.swift`) demonstrates custom `CodingKeys` to map a Firestore field name (`date_time`) to a Swift property name (`date`).

### Error handling pattern

Reads generally use one of two styles: `try?` with a `guard`/fallback to an empty array (e.g. `EventsViewModel.fetchEventsGroupedByDate()`, `NewsDataViewModel.fetchNewsArticles()`), or `do/catch` with logging via `os.Logger` (e.g. `berkeley-mobile/Utils/Logger+Ext.swift` extension points such as `Logger.eventsDataService`, `Logger.newsDataViewModel`, `Logger.weatherDataViewModel`) or `print(...)` (older `DataSource` implementations such as `GymDataSource`, `LibraryDataSource`, `MapDataSource` print errors to the console rather than logging through `os.Logger`).

## Secondary Client: WeatherKit

`berkeley-mobile/Today/Tiles/Weather Tile/WeatherDataViewModel.swift` uses Apple's `WeatherKit` framework directly (`import WeatherKit`, `WeatherService.shared.weather(for:including:)`) for a fixed Berkeley `CLLocation` (37.8716, -122.2727). This is a first-party Apple system framework call, not a repository-defined network contract.

## Authentication

`GoogleSignIn` and `Firebase/Auth` are declared as dependencies (`Podfile`), and `import GoogleSignIn` appears in `berkeley-mobile/AppDelegate.swift`. Not found in codebase (within the areas inspected in this pass): a sign-in flow invoking `GIDSignIn`/`Auth.auth()` APIs. The import in `AppDelegate.swift` was observed; a full authentication flow was not located in the files read for this documentation pass — treat this as "not found in inspected repository areas," not as evidence that no sign-in flow exists.

## Push Notifications

`berkeley-mobile/AppDelegate.swift` implements `MessagingDelegate` (`FirebaseMessaging`) and `UNUserNotificationCenterDelegate`. On receiving a notification response, it posts a `Notification.Name("FCMToken")` local notification and switches the root tab bar to index 2 (the Safety tab, per `TabBarController.setupTabbar()`).

## Not Applicable

- REST/GraphQL route documentation: not applicable — the repository defines no server-side routes.
- RPC/queue-based messaging contracts: not found in codebase.
