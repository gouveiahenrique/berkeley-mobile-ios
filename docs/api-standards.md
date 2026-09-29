# API / Interface Standards

## Repository Classification for This Document

This repository is a mobile application client. It does not expose HTTP routes, controllers, or server-side APIs. The relevant interface layer is the app's networking/data-access contract with its backend (Firebase/Firestore) and, secondarily, external web/link integrations.

## Backend Communication Layer

### Firestore Client Access

The repository implements direct Firestore SDK access in multiple places rather than a single unified API client:

- **`berkeley-mobile/Data/BMNetworkingManager.swift`** — a singleton (`BMNetworkingManager.shared`) wrapping `Firestore.firestore()`, exposing two `async throws` methods:
  - `fetchSafetyLogs() async throws -> [BMSafetyLog]` — queries collection named by `BMConstants.safetyLogsCollectionName` ("Safety Logs"), decodes each document via `try? $0.data(as: BMSafetyLog.self)`, and sorts by `date` descending.
  - `fetchResourcesCategories() async throws -> [BMResourceCategory]` — queries collection named by `BMConstants.resourceCategoriesCollectionName` ("Resource Categories"), decodes via `Codable`, sorts by `name`.
  - Callers: `berkeley-mobile/Resources/ResourcesViewModel.swift`, `berkeley-mobile/Safety/SafetyViewModel.swift`.
- **`DataSource` protocol** (`berkeley-mobile/Data/DataSource.swift`) — a completion-handler-based contract (`static func fetchItems(_ completion: @escaping (_ resources: [Any]) -> Void)`, `static var fetchDispatch: DispatchGroup`) implemented independently by feature data sources that each open their own `Firestore.firestore()` instance and query a hardcoded collection name string (e.g. `GymDataSource.swift` queries collection `"Gyms"` via a `fileprivate let kGymsEndpoint` constant, then manually maps each Firestore document dictionary into a model struct such as `BMGym` through a `private static func parse<Type>(_ dict: [String: Any], docID: String)` function). The same pattern (endpoint constant + `parse...` function + completion handler) is used by `LibraryDataSource.swift`, `MapDataSource.swift`, `GymClassDataSource.swift`.
  - These `DataSource` implementations are orchestrated by `DataManager` (`berkeley-mobile/Data/DataManager.swift`), which fetches each source at most once per app session (cached in an `AtomicDictionary`) and re-fetches only after `DataManager.fetchInterval` (60 minutes) has elapsed since the last fetch (`fetchIfNecessary()`).
- **View-model-local Firestore access** — some view models query Firestore directly without going through `BMNetworkingManager` or `DataSource`, e.g. `berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift` queries collection `"Daily Cal News"` directly inside the view model using `db.collection(kNewsDataEndpoint).getDocuments()`, and `GymOccupancyViewModel` (`berkeley-mobile/Home/Fitness/GymOccupancy/GymOccupancyViewModel.swift`) queries collection `"Gym Occupancy Meters"` directly, decoding into `GymOccupancyLocationData: Codable`.

### Data Contracts

Firestore documents are decoded into Swift model types using two different approaches found in the repository:
1. `Codable` conformance decoded via `try doc.data(as: Type.self)` — used by `BMSafetyLog`, `BMResourceCategory`, `NewsArticle`, `GymOccupancyLocationData`.
2. Manual dictionary parsing (`doc.data()` → `[String: Any]` → hand-written `parse...` function reading string keys like `dict["name"] as? String`) — used by `GymDataSource`, `LibraryDataSource`, `MapDataSource`, `GymClassDataSource`.

Model types conform to shared capability protocols defined in `berkeley-mobile/Data/ItemProtocols/` (`HasLocation`, `HasImage`, `HasName`, `HasWebsite`, `HasPhoneNumber`, `HasOpenClosedStatus`, `HasOpenTimes`, `CanFavorite`, `SearchItem`, `BMCalendarEvent`), which each define a small property/behavior contract implemented by feature model structs (e.g. `BMGym: HomeDrawerSectionRowItemType, CanFavorite, HasPhoneNumber, HasOpenTimes`).

### Error Handling in the Data Layer

- `BMNetworkingManager` methods are `async throws`; document-level decode failures are swallowed per-document via `try?` and `compactMap` (a document that fails to decode is silently dropped rather than surfacing an error) — direct repository observation, not a documented convention.
- `DataSource.fetchItems` implementations (completion-handler style) log fetch errors via `print("[Error @ <Type>.<method>()]: \(err)")` (e.g. `GymDataSource.swift:23`) and return early without invoking the completion handler on failure.
- Some newer code uses `os.Logger` instead of `print` for error/info logging, centralized in `berkeley-mobile/Utils/Logger+Ext.swift` (e.g. `Logger.newsDataViewModel.error(...)` in `NewsDataViewModel.swift:43`).
- `berkeley-mobile/Data/BMError.swift` defines an `enum BMError: Error, LocalizedError` (`eventAlreadyAddedInCalendar`, `insufficientAccessToCalendar`, `mayExistedInCalendarAlready`, `unableToFindEventInCalendar`) used by `berkeley-mobile/Data/BMEventManager.swift`'s `throw`ing calendar-integration methods.
- `berkeley-mobile/Common/Images/ImageLoader.swift` uses a `Result<UIImage, Error>` completion-handler signature (`getImage(url:completion:) -> UUID?`), distinct from both patterns above.

Not found in codebase: a single unified networking/error-handling abstraction shared across all data sources; retry logic; centralized request/response logging middleware.

## Authentication

The repository implements Google Sign-In via the `GoogleSignIn` CocoaPod (declared in `Podfile`) and Firebase Auth via the `Firebase/Auth` CocoaPod. Direct call sites of these SDKs beyond the `Podfile` dependency declaration were not inspected in this pass — not found in codebase evidence gathered for this document beyond the dependency declaration itself.

## Push Notifications

The repository implements Firebase Cloud Messaging registration in `berkeley-mobile/AppDelegate.swift`: `Messaging.messaging().delegate = self`, `UNUserNotificationCenter.current().delegate = self`, requests `.alert, .badge, .sound` authorization, and subscribes the device to topic `"all"` on receiving an FCM token (`messaging(_:didReceiveRegistrationToken:)`, `AppDelegate.swift:77-87`).

## External Web/Link Integrations

- `berkeley-mobile/Resources/SafariWebView.swift` — present in the `Resources` feature for displaying external resource links (file exists; not read in full during this analysis).
- `BMEventCalendarEntry` (`berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift`) stores `registerLink: URL?` and `sourceLink: URL?` fields pointing to external event pages.

## Client-Side Contracts Consumed by the Widget Extension

The `BerkeleyMobileWidgetExtension` target (declared in `Podfile`) depends on `Firebase/Firestore` directly and reuses `GymOccupancyViewModel` (shared with the main app) to fetch occupancy data for the `GymOccupancyWidget` (`BerkeleyMobileWidget/GymOccupancyWidget.swift`). This is an in-process Swift API boundary (shared view model), not a network or IPC contract — not found in codebase evidence of any App Group/shared-container mechanism between the app and widget beyond this shared Swift code.

## Not Applicable

The repository does not implement, and this document does not cover: REST route definitions, GraphQL schemas, server-side controllers/middleware, or RPC service definitions — these do not apply to this repository type.
