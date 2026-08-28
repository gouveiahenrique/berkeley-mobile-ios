# API / Interface Standards

This repository is a native iOS mobile application (see `docs/tech.md`). It does not expose HTTP routes, controllers, or server-side APIs — "API standards" here documents the app's outbound networking layer and service interfaces.

## Backend Data Contracts (Level 1)

### Firestore access

- `berkeley-mobile/Data/BMNetworkingManager.swift` is the primary Firestore access point, using `Firestore.firestore()` (Firebase/Firestore SDK) with `async`/`await`:
  - `fetchSafetyLogs() async throws -> [BMSafetyLog]` — reads collection `BMConstants.safetyLogsCollectionName` ("Safety Logs"), decodes each document as `BMSafetyLog` via `Codable` (`$0.data(as: BMSafetyLog.self)`), sorts by `date` descending.
  - `fetchResourcesCategories() async throws -> [BMResourceCategory]` — reads collection `BMConstants.resourceCategoriesCollectionName` ("Resource Categories"), decodes as `BMResourceCategory`, sorts by `name` descending.
- `berkeley-mobile/Today/Tiles/News Tile/NewsDataViewModel.swift` independently opens its own `Firestore.firestore()` instance and reads a hardcoded collection name `"Daily Cal News"` (`kNewsDataEndpoint`), decoding documents as `NewsArticle`.
- `berkeley-mobile/Data/DataManager.swift` fetches from `DataSource`-conforming types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) via a `fetchItems` completion-handler contract defined in `berkeley-mobile/Data/DataSource.swift`; the underlying transport for these specific sources was not inspected in this pass. Not found in codebase.
- Collection names and other Firestore/map constants are centralized in `berkeley-mobile/Data/BMConstants.swift` (e.g. `safetyLogsCollectionName`, `resourceCategoriesCollectionName`), except for `NewsDataViewModel`'s collection name, which is a local `private let` rather than a `BMConstants` entry.

### Decoding pattern

All observed Firestore reads use `try? $0.data(as: T.self)` / `try doc.data(as: T.self)` against `Codable`-conforming model structs (e.g. `BMSafetyLog`, `BMResourceCategory`, `NewsArticle`), with per-document decode failures either dropped (`compactMap`) or logged via `os.Logger` (see `NewsDataViewModel.fetchNewsArticles()`), not surfaced individually to the user.

### First-party system APIs

- **WeatherKit** (Apple framework) is used directly in `berkeley-mobile/Today/Tiles/Weather Tile/WeatherDataViewModel.swift` via `WeatherService.shared.weather(for:including:)`, requesting `.current` and `.daily` forecasts for a hardcoded Berkeley coordinate (`CLLocation(latitude: 37.8716, longitude: -122.2727)`).
- **Firebase Cloud Messaging** — `berkeley-mobile/AppDelegate.swift` registers as `MessagingDelegate`, forwards the FCM token via `NotificationCenter` (`Notification.Name("FCMToken")`), and subscribes to topic `"all"`.

## Client-Side Service Interfaces (Level 1)

- `protocol DataSource` (`berkeley-mobile/Data/DataSource.swift`) is the contract for pluggable data providers: a static `fetchItems(_:)` method plus a static `fetchDispatch: DispatchGroup` for one-time-fetch coordination, consumed by `DataManager`.
- `protocol FeedbackFormPresenterDelegate` (`berkeley-mobile/FeedbackForm/FeedbackFormPresenter.swift`) — decouples feedback-form trigger logic from UIKit presentation; implemented by `TabBarController`.
- `protocol MainDrawerViewDelegate` / `protocol DrawerViewDelegate` (`berkeley-mobile/Drawer/`) — internal UI-layer contracts for the drawer stack, not network-facing.

## Error Surfacing Pattern (Level 1)

View models expose errors to SwiftUI views via an `@Published`/`@Observable` `alert: BMAlert?` property (e.g. `berkeley-mobile/Resources/ResourcesViewModel.swift`), or a `showNotAvailable: Bool` flag (e.g. `WeatherDataViewModel`, `NewsDataViewModel`), set from `catch` blocks around the corresponding network/service call. `BMAlert` itself is defined in `berkeley-mobile/Common/BMAlert.swift` (not expanded in this pass).

## Authentication (Level 1 / Level 4)

- `Firebase/Auth` and `GoogleSignIn` are declared as dependencies (`Podfile`), and `GoogleSignIn` is imported in `berkeley-mobile/AppDelegate.swift`.
- No direct call site for `FirebaseAuth` APIs (e.g. `Auth.auth()`) or `GIDSignIn` sign-in flows was found in the inspected areas of `berkeley-mobile/`. This may exist in code paths not covered by this pass — not found in inspected repository areas.

## External Links / Outbound Integrations (Level 1)

- `berkeley-mobile/Resources/SafariWebView.swift` — in-app browser (`SFSafariViewController`-style wrapper, per file name) for opening external resource links.
- `berkeley-mobile/Home/RedirectionManager.swift` — handles outbound redirection (e.g. opening external URLs such as register/source links surfaced on `BMEventCalendarEntry`); internals not expanded in this pass.

## Not Applicable

- REST/GraphQL route definitions, request middleware, and server-side authentication/authorization: not applicable for this repository type (native mobile client, no backend source in this repo).
