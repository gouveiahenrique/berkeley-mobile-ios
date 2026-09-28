# API / Interface Standards

This repository is a mobile application, not a backend/API service. There is no HTTP route/controller layer implemented in this repository. The sections below document how the app communicates with external systems.

## Backend Data Access (Firestore)

The repository implements two coexisting patterns for reading from Google Cloud Firestore (`import Firebase` / `Firestore.firestore()`):

1. **Per-feature `DataSource` types** (`berkeley-mobile/Data/DataSource.swift` protocol): each conforming type queries one Firestore collection directly inside a `static func fetchItems(_:)`, using the closure-based `getDocuments { (querySnapshot, err) in ... }` API and manual `document.data()` dictionary parsing into domain structs. Observed conformers and their collections:
   - `MapDataSource` (`berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift`) — collection `"Map Marker"`.
   - `LibraryDataSource` (`berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift`) — collection `"Libraries"`.
   - `GymDataSource` (`berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift`) — collection `"Gyms"`.
   - `GymClassDataSource` (`berkeley-mobile/Home/Fitness/GymClassDataSource/GymClassDataSource.swift`) — collection `"Gym Classes"`.
   Errors from this path are only logged (`print("[Error @ ...]: \(err)")`) — the `completion` handler is not invoked on error in `GymDataSource`/`LibraryDataSource`/`GymClassDataSource` (calling code must tolerate a no-callback outcome on failure), and errors are not surfaced to the UI in these types.

2. **`BMNetworkingManager` singleton** (`berkeley-mobile/Data/BMNetworkingManager.swift`): a shared manager wrapping `async throws` Firestore calls that decode documents via `Codable` (`try? $0.data(as: BMSafetyLog.self)` / `try? $0.data(as: BMResourceCategory.self)`), used by:
   - `SafetyViewModel.listenForSafetyLogs()` (`berkeley-mobile/Safety/SafetyViewModel.swift`) — calls `BMNetworkingManager.shared.fetchSafetyLogs()`, catches thrown errors and surfaces them via a `BMAlert` (`self.alert = BMAlert(title: "Failed To Fetch Safety Logs", message: error.localizedDescription, type: .notice)`).
   - `ResourcesViewModel` (`berkeley-mobile/Resources/ResourcesViewModel.swift`) — calls `BMNetworkingManager.shared.fetchResourcesCategories()`.
   Collection names used by this path are defined as constants in `BMConstants` (`safetyLogsCollectionName = "Safety Logs"`, `resourceCategoriesCollectionName = "Resource Categories"`), rather than inlined as string literals at the call site (unlike the `DataSource` types above, which inline collection name strings as `fileprivate let k*Endpoint` constants local to each file).

Both patterns query Firestore directly from the client; no intermediate backend/REST API layer was found in the inspected repository areas.

## Authentication

- The repository imports `GoogleSignIn` (Podfile, and `AppDelegate.swift`/other files per import count in `docs/tech.md`) and includes `Firebase/Auth` in the Podfile. Concrete call sites invoking `GIDSignIn`/`Auth.auth()` sign-in flows were not located within the areas inspected in this pass — not found confirmed beyond the dependency declarations.

## Push Notifications

- The repository implements Firebase Cloud Messaging registration in `AppDelegate.swift`: sets `Messaging.messaging().delegate = self`, requests `UNUserNotificationCenter` authorization for `[.alert, .badge, .sound]`, calls `application.registerForRemoteNotifications()`, and on token receipt (`messaging(_:didReceiveRegistrationToken:)`) posts a local `NotificationCenter` notification named `"FCMToken"` and subscribes the device to FCM topic `"all"`.
- `berkeley-mobile.entitlements` declares `aps-environment = development`.

## External Link / Web Content Integration

- `SafariWebView` (`berkeley-mobile/Resources/SafariWebView.swift`) wraps `SFSafariViewController` (`import SafariServices`) in a SwiftUI `UIViewControllerRepresentable`, used to open external URLs in-app.
- `RedirectionManager.swift` (`berkeley-mobile/Home/RedirectionManager.swift`) exists as a dedicated redirection-handling component; its exact routing logic was not read in this pass.

## Native Platform Integrations

- **EventKit (device calendar):** `BMEventManager` (`berkeley-mobile/Data/BMEventManager.swift`) wraps `EKEventStore` to add/delete/query events, requesting `.event` access (`requestFullAccessToEvents()` on iOS 17+, `requestAccess(to: .event)` otherwise) and throwing `BMError` cases (`insufficientAccessToCalendar`, `eventAlreadyAddedInCalendar`, `mayExistedInCalendarAlready`, `unableToFindEventInCalendar`) on specific failure conditions.
- **CoreLocation:** `BMLocationManager` (`berkeley-mobile/Data/BMLocationManager.swift`) fetches device location and posts `Notification.Name.locationUpdated` on updates.
- **WeatherKit:** imported in exactly one file (per import count in `docs/tech.md`); the repository declares the `com.apple.developer.weatherkit` entitlement.
- **WidgetKit:** `BerkeleyMobileWidget/GymOccupancyWidget.swift` implements `TimelineProvider`/`TimelineEntry` to surface gym occupancy data on a Home Screen widget, itself sourcing data via `GymOccupancyViewModel.fetchOccupancyPercentages()`.

## Data Contracts

Domain models are plain Swift `struct`/`class` types populated either by manual dictionary parsing (`MapDataSource.parseMarker`, `LibraryDataSource.parseLibrary`, `GymDataSource.parseGym`, `GymClassDataSource.parseGymClass` — each a `private static func` taking `[String: Any]` and returning a typed model, defaulting missing `name` fields to `"Unnamed"`) or via `Codable` Firestore document decoding (`BMSafetyLog`, `BMResourceCategory`, and other `Codable`-conforming types listed in the discovery pass: `NewsArticle`, `MapMarker`, `BMDiningLocation`, `MapPlacemark`, `Guide`, and others). No shared schema/contract validation layer beyond per-field optional casting (`as? String`, `as? Double`, etc.) was found in the inspected `DataSource` implementations.

## Not Applicable

- REST/GraphQL route definitions, controllers, server-side middleware, and request/response serialization contracts for an owned backend: not applicable for this repository type (the backend is an external Firestore project not present in this repository).
</content>
