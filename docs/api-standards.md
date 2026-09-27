# API Standards

This repository is a native iOS client application with no server-side API routes of its own. "APIs" here refers to how the app communicates with its external backend (Firebase/Firestore) and other services. Traditional REST route/controller/middleware conventions are **not applicable for this repository type** in the sense of routes/endpoints defined in-repo — the app is a Firestore client.

## Backend / Data Communication

- **Backend:** Google Cloud Firestore, accessed via the Firebase iOS SDK (`import Firebase` / `FirebaseFirestore`). There is no custom REST/GraphQL layer in this repository.
- **Collections accessed as string-literal endpoint names**, each defined as a `fileprivate`/`static` constant near its call site, e.g.:
  - `"Map Marker"` — `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift`
  - `"Libraries"` — `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift`
  - `"Gyms"` — `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift`
  - `"Gym Classes"` — `berkeley-mobile/Home/Fitness/GymClassDataSource/GymClassDataSource.swift`
  - `"Daily Cal News"` — `berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift`
  - `BMConstants.safetyLogsCollectionName` = `"Safety Logs"`, `BMConstants.resourceCategoriesCollectionName` = `"Resource Categories"` — `berkeley-mobile/Data/BMConstants.swift`, consumed by `berkeley-mobile/Data/BMNetworkingManager.swift`
- **Two coexisting data-access patterns** (an older completion-handler style and a newer async/await style — see `docs/code-conventions.md` for detail):
  1. **`DataSource` protocol pattern** (older): types conforming to `protocol DataSource` implement `static func fetchItems(_ completion: @escaping DataSource.completionHandler)` and expose a `static var fetchDispatch: DispatchGroup` to deduplicate concurrent fetches. Raw Firestore documents are manually parsed into typed models via private `parse...` helper functions operating on `[String: Any]` dictionaries (e.g. `MapDataSource.parseMarker`, `GymDataSource.parseGym`, `LibraryDataSource.parseLibrary`).
  2. **`BMNetworkingManager` pattern** (newer): `async throws` methods that use `Codable` (`try? $0.data(as: Type.self)` / `try doc.data(as: Type.self)`) to decode Firestore documents directly into Swift structs (e.g. `BMSafetyLog`, `BMResourceCategory`, `NewsArticle`).
- **Fetch coordination:** `DataManager` (`berkeley-mobile/Data/DataManager.swift`) is the central in-memory cache and fetch coordinator for `DataSource`-conforming types, exposing `fetch(source:completion:)`, `fetchAll()`, and `fetchIfNecessary()` (time-gated by `DataManager.fetchInterval` = 1 hour).

## Authentication

- `GoogleSignIn` and `Firebase/Auth` are declared as Pod dependencies (`Podfile`), and `AppDelegate.swift` imports `GoogleSignIn`.
- No sign-in flow, auth view, or credential-handling code was found invoking `GIDSignIn`/`Auth.auth()` APIs beyond the import in `AppDelegate.swift` — not found in codebase. (Auth capability appears present in dependencies but not wired into an observable user flow within the explored code.)

## External Integrations / Networking / Service Interfaces

| Integration | Purpose | Access pattern |
|---|---|---|
| Firebase Firestore | Primary data backend for map markers, libraries, gyms, gym classes, safety logs, resource categories, news articles | Direct Firestore SDK calls from `DataSource` implementations and `BMNetworkingManager`/`NewsDataViewModel` |
| Firebase Analytics | Usage analytics (screen views, feature engagement) | `Analytics.logEvent(...)` calls scattered in view controllers, e.g. `GymDetailViewController.viewWillAppear`, `LibraryDetailViewController.viewWillAppear`, `HomeViewModel.logOpenedDiningHomeSectionAnalytics()`; also `Analytics.resetAnalyticsData()` in `AppDelegate+Migration.swift` |
| Firebase Cloud Messaging | Push notifications | `AppDelegate.swift` — `Messaging.messaging().delegate`, FCM token registration posts `Notification.Name("FCMToken")`, auto-subscribes devices to topic `"all"` |
| WeatherKit | Current/daily weather for the Today tile | `berkeley-mobile/Today/Tiles/Weather Tile/WeatherDataViewModel.swift` — `WeatherService.shared.weather(for:including:)`, polled on a repeating `Timer` |
| EventKit | Reading/writing campus events to the user's device calendar | `berkeley-mobile/Data/BMEventManager.swift` — `EKEventStore`, async/await with iOS-17-conditional authorization APIs |
| CoreLocation | User location for distance calculations and map centering | `BMLocationManager` (`berkeley-mobile/Data/BMLocationManager.swift`), `CLLocation+Extension.swift` |
| MapKit | Map rendering, markers, region/zoom bounds, geocoding-adjacent placemark search | `berkeley-mobile/Home/Map/*.swift` |
| `SafariWebView` | In-app browsing of external resource URLs | `berkeley-mobile/Resources/SafariWebView.swift` |

## Data Contracts / Models

Domain models are `Codable`/`Identifiable` structs decoded from Firestore documents (newer pattern) or manually constructed from `[String: Any]` dictionaries (older pattern). Examples:

- `BMSafetyLog: Identifiable, Codable, Hashable` with explicit `CodingKeys` mapping `date` → `"date_time"` (`SafetyViewModel.swift`)
- `NewsArticle` (`Today/Tiles/News Tile/NewsArticle.swift`)
- `BerkeleyEvent: Codable` / `BerkeleyEventsDaySnapshot: Codable` (`Events/EventDataSource/EventsViewModel.swift`)
- `BMResourceCategory` (`Resources/ResourcesViewModel.swift`)

Shared model **capability protocols** (not network contracts, but a de facto data-shape contract layer) are defined in `berkeley-mobile/Data/ItemProtocols/`: `HasLocation`, `HasOpenTimes`, `HasImage`, `HasName`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `SearchItem`.

## Error Handling

- **Older completion-handler code** logs errors to the console (`print("[Error @ ...]: \(err)")`) and either returns early or (in `MapDataSource`) silently skips calling the completion handler on error — no user-facing error surface in these paths.
- **Newer async/await code** uses Swift's native `throws`/`try`/`catch`:
  - Domain-specific errors are modeled via `enum BMError: Error` (`berkeley-mobile/Data/BMError.swift`), conforming to `LocalizedError` with user-facing `errorDescription` strings (e.g. `.insufficientAccessToCalendar`, `.eventAlreadyAddedInCalendar`).
  - ViewModels surface errors to the UI via a `BMAlert` model (`berkeley-mobile/Common/BMAlert.swift`) — an `Identifiable`/`Equatable` struct with `title`, `message`, `type` (`.action`/`.notice`), and an optional completion closure — bound to SwiftUI's `.alert(...)` modifier via `AlertPresentationViewModifier` (`berkeley-mobile/Utils/View+Extension.swift`). Example: `SafetyViewModel.listenForSafetyLogs()` catches a Firestore fetch failure and sets `self.alert = BMAlert(title: "Failed To Fetch Safety Logs", message: error.localizedDescription, type: .notice)`.
  - `os.Logger` extensions (`berkeley-mobile/Utils/Logger+Ext.swift`) provide per-feature named loggers (e.g. `Logger.weatherDataViewModel`, `Logger.newsDataViewModel`) used for structured error/info logging alongside or instead of `print`.

## Validation

No dedicated request/response validation layer was found — not found in codebase. Parsing code performs optional-binding/defensive `guard`/`as?` casts when converting raw Firestore dictionaries to typed models (e.g. `MapDataSource.parseMarker` returns `nil` if required fields are missing), which serves as informal input validation at the data-ingestion boundary.
