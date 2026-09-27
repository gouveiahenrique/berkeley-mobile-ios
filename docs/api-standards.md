# API / Interface Standards

This repository is a mobile application client, not a backend service. There are no HTTP routes, controllers, or server-side request handlers implemented in this repository. The relevant "interfaces" are the application's outbound network/data contracts with its backend (Firebase/Firestore) and OS-level services.

## Data Contracts (Firestore)

The repository implements typed, `Codable`-based decoding of Firestore documents rather than a REST/GraphQL client.

- `berkeley-mobile/Data/BMNetworkingManager.swift` defines `BMNetworkingManager`, a singleton wrapping `Firestore.firestore()`. Methods:
  - `fetchSafetyLogs() async throws -> [BMSafetyLog]` — queries the collection named by `BMConstants.safetyLogsCollectionName` (`"Safety Logs"`), decodes each document via `$0.data(as: BMSafetyLog.self)` using `compactMap` (decode failures are silently dropped, not thrown), sorted descending by `date`.
  - `fetchResourcesCategories() async throws -> [BMResourceCategory]` — queries `BMConstants.resourceCategoriesCollectionName` (`"Resource Categories"`), same decode-and-sort pattern, sorted descending by `name`.
- `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift` defines `EventsDataService`, another Firestore-backed singleton, querying a collection named `"Events"` (`kEventsDataServiceEndpoint`) and decoding into `BerkeleyEventsDaySnapshot` (a `Codable` struct containing `date`, `displayDate`, `scrapedAt`, and an array of `BerkeleyEvent` — itself `Codable`, with fields `startTime`, `endTime`, `eventName`, `eventDescription`, `eventRegisterLinkURL`, `eventImageURL`, `eventURL`, `isAllDay`, `location`).
- `berkeley-mobile/Data/DataSource.swift` defines the `DataSource` protocol used by feature-specific data sources (`MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`): a static `fetchItems(_ completion:)` method with a `completionHandler` type alias `(_ resources: [Any]) -> Void`, and a static `fetchDispatch: DispatchGroup` used to deduplicate concurrent fetches of the same source.
- `berkeley-mobile/Data/DataManager.swift` defines `DataManager`, a singleton coordinating fetches across all `DataSource`-conforming types listed in the fileprivate `kDataSources` array, caching results in an `AtomicDictionary<String, [Any]>` keyed by type name.

Error handling in the Firestore layer uses Swift's `async throws` (`BMNetworkingManager`) alongside `try?`-based silent-failure decoding (`EventsDataService.fetchEventsGroupedByDate()`, `BMNetworkingManager.fetchSafetyLogs()`/`fetchResourcesCategories()` use `compactMap { try? ... }`), logging decode errors via `Logger.eventsDataService.error(...)` in `EventsDataService` only.

## Application-Level Error Types

- `BMError` (defined in a file located via search; not re-confirmed in this session's file list but referenced from `EventsViewModel.swift`) is an `Error`-conforming enum with cases `eventAlreadyAddedInCalendar`, `insufficientAccessToCalendar`, `mayExistedInCalendarAlready`, `unableToFindEventInCalendar`, each with a `LocalizedError.errorDescription` implementation providing a user-facing message.
- Calendar-related errors from `BMEventManager` (referenced in `EventsViewModel.swift:126,136`) propagate as `BMError` and are caught in `EventsViewModel` to drive `BMAlert` presentation (`berkeley-mobile/Common/BMAlert.swift` defines `BMAlertType`).

## Authentication

- `Podfile` declares `Firebase/Auth` and `GoogleSignIn` as dependencies of the `berkeley-mobile` target, and `berkeley-mobile/Info.plist` (via `CFBundleURLTypes`) registers a Google OAuth reversed-client-ID URL scheme (`com.googleusercontent.apps.592064103331-...`). This indicates the framework/platform capability for Google Sign-In is configured. Not found in codebase: an in-app call site (e.g. `GIDSignIn.sharedInstance.signIn(...)` or `Auth.auth().signIn(...)`) within the source files inspected in this session — the sign-in flow's implementation location was not located during this analysis pass.

## Push Notifications

- The repository implements Firebase Cloud Messaging integration in `berkeley-mobile/AppDelegate.swift`: `MessagingDelegate.messaging(_:didReceiveRegistrationToken:)` broadcasts the FCM token via `NotificationCenter` (name `"FCMToken"`) and subscribes the device to a topic named `"all"` (`Messaging.messaging().subscribe(toTopic: "all")`).
- `UNUserNotificationCenterDelegate` is implemented for foreground presentation (`willPresent` returns `[.banner, .sound]`) and for handling notification taps (`didReceive response:` selects tab index `2` on the `TabBarController`, corresponding to the Safety tab per `TabBarController.swift:66`).

## External Service Integrations

- **Firebase Analytics** — event logging via `Analytics.logEvent(_:parameters:)`, called from multiple view models (e.g. `EventsViewModel.swift:95,99`, `MapViewController.swift:376`).
- **EventKit (system Calendar)** — referenced via `BMEventManager` (`addEventToCalendar`, `deleteEvent`, `processEventsExistenceInCalendar`) in `EventsViewModel.swift`; `NSCalendarsUsageDescription` is declared in `berkeley-mobile/Info.plist`.
- **Google Sign-In** — declared as a pod dependency (see Authentication above).

## Not Applicable / Not Found

- REST or GraphQL API route definitions: not applicable — this repository is a client application with no server-side routing code.
- API versioning scheme: not found in codebase.
- Request/response middleware, rate limiting, or API gateway configuration: not applicable for this repository type.
