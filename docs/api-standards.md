# API / Interface Standards

This repository is a native iOS mobile application (see `docs/tech.md`). "API standards" for this repository type concern its outbound networking/data-contract layer, not an HTTP API it serves. Backend route/controller/authentication-middleware documentation is not applicable for this repository type.

## Data Backend and Access Pattern

- **Backend**: The repository implements data access to Google Cloud Firestore via the Firebase iOS SDK (`import Firebase` / `import FirebaseFirestore`), confirmed in `berkeley-mobile/Data/BMNetworkingManager.swift`, `berkeley-mobile/Data/DataManager.swift`'s data sources (e.g. `GymClassDataSource`, `LibraryDataSource`), and `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift` (`EventsDataService`).
- **Two coexisting contract styles** (see `docs/tech.md` for full detail):
  1. Legacy: `protocol DataSource` (`berkeley-mobile/Data/DataSource.swift`) — a completion-handler contract (`static func fetchItems(_ completion: @escaping DataSource.completionHandler)`), implemented per data type (e.g. `LibraryDataSource`, `GymClassDataSource`).
  2. Modern: standalone service classes with `async throws` methods returning `Codable` model arrays, e.g. `BMNetworkingManager.fetchSafetyLogs() async throws -> [BMSafetyLog]` and `BMNetworkingManager.fetchResourcesCategories() async throws -> [BMResourceCategory]` (`berkeley-mobile/Data/BMNetworkingManager.swift`), and `EventsDataService.fetchEventsGroupedByDate() async -> [(Date, [BMEventCalendarEntry])]` (`berkeley-mobile/Events/EventDataSource/EventsViewModel.swift`).
- **Firestore collection names** are declared as string constants close to their call site, e.g. `kEventsDataServiceEndpoint = "Events"` (`EventsViewModel.swift:14`), `kLibrariesEndpoint = "Libraries"` (`LibraryDataSource.swift:12`), `kGymClassesEndpoint = "Gym Classes"` (`GymClassDataSource.swift:12`), and centrally in `BMConstants.swift` for some (`safetyLogsCollectionName = "Safety Logs"`, `resourceCategoriesCollectionName = "Resource Categories"`).
- **Decoding**: The modern pattern decodes Firestore documents directly into `Codable` structs via `try doc.data(as: T.self)` (e.g. `BMNetworkingManager.swift:24`, `EventsViewModel.swift:48`). The legacy pattern manually parses `[String: Any]` dictionaries (e.g. `LibraryDataSource.parseLibrary`, `GymClassDataSource.parseGymClass`).
- **Error handling in data fetches**: The modern pattern uses `try?`/`do-catch` with `Logger` output on decode failure (e.g. `EventsViewModel.swift:47-51`) or propagates via `async throws`. The legacy pattern uses `print(...)` on error and silently returns (e.g. `LibraryDataSource.swift:25-27`, `GymClassDataSource.swift:23-25`).

## Authentication

- `Podfile` declares `pod 'Firebase/Auth'` and `pod 'GoogleSignIn'` as dependencies. Concrete usage sites (sign-in flow, token handling) were not found in the inspected areas — "not found in codebase" beyond the dependency declaration.

## Push Notifications

- `berkeley-mobile/AppDelegate.swift` implements `MessagingDelegate.messaging(_:didReceiveRegistrationToken:)`, posting the FCM token via `NotificationCenter` and subscribing to the `"all"` topic (`Messaging.messaging().subscribe(toTopic: "all")`).
- `UNUserNotificationCenterDelegate` is implemented to handle foreground presentation (`willPresent`) and tap response (`didReceive response:`), the latter routing the user to tab index 2 (Safety) via `TabBarController.selectedIndex`.

## External Service Contracts

- **EventKit (calendar)**: `berkeley-mobile/Data/BMEventManager.swift` wraps `EKEventStore` for add/delete/existence-check of calendar events, translating errors into the app-defined `BMError` enum (`berkeley-mobile/Data/BMError.swift`).
- **WeatherKit**: declared as an entitlement (`com.apple.developer.weatherkit` in `berkeley-mobile/berkeley-mobile.entitlements`); a `WeatherDataViewModel` factory exists in `berkeley-mobile/BerkeleyMobile+Injection.swift`, consistent with a weather-tile feature, but the WeatherKit call sites themselves were not inspected in this pass.
- **Location**: `BMLocationManager.shared.requestLocation()` is called from `berkeley-mobile/AppDelegate.swift`; the `BMLocationManager` implementation itself was not inspected in this pass.

## App-Internal "Interfaces"

- **`DataSource` protocol** (`berkeley-mobile/Data/DataSource.swift`) is the internal contract every legacy data type conforms to, consumed uniformly by `DataManager.fetch(source:_:)`.
- **`DrawerViewDelegate` protocol** (`berkeley-mobile/Drawer/DrawerViewDelegate.swift`) defines the internal contract between drawer-hosting view controllers and the shared pan-gesture/positioning logic.
- **`FeedbackFormPresenterDelegate`** (referenced in `berkeley-mobile/TabBarController.swift:76-81`) is the internal contract for presenting the feedback form view controller.

## Not Found in Codebase

- No HTTP route/controller definitions (this app is a client, not a server).
- No GraphQL schema or client.
- No OpenAPI/Swagger contract files.
