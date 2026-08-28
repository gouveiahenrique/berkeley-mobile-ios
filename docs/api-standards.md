# API / Interface Standards

This repository is a mobile application (iOS client). It does not expose HTTP routes or a server API. This document covers how the application communicates with external services and how it structures those communication points internally.

## External Data Backend: Firebase / Cloud Firestore

The application's primary data backend is Google Cloud Firestore, accessed through the Firebase iOS SDK (`pod 'Firebase/Firestore'` in `Podfile`).

- `berkeley-mobile/Data/BMNetworkingManager.swift` centralizes some Firestore access: `fetchSafetyLogs()` (line 20) queries collection `BMConstants.safetyLogsCollectionName` (`"Safety Logs"`, `berkeley-mobile/BMConstants.swift:39`); `fetchResourcesCategories()` (line 31) queries `BMConstants.resourceCategoriesCollectionName` (`"Resource Categories"`, `berkeley-mobile/BMConstants.swift:40`).
- Several feature-specific data sources query Firestore directly rather than going through `BMNetworkingManager`, each with its own file-local collection-name constant:
  - `Home/Map/MapDataSource/MapDataSource.swift` — collection `"Map Marker"` (`kMapEndpoint`, line 13).
  - `Home/Libraries/LibraryDataSource/LibraryDataSource.swift` — collection `"Libraries"` (`kLibrariesEndpoint`, line 12).
  - `Home/Fitness/GymDataSource/GymDataSource.swift` — collection `"Gyms"` (`kGymsEndpoint`, line 12).
  - `Home/Fitness/GymClassDataSource/GymClassDataSource.swift` — collection `"Gym Classes"` (`kGymClassesEndpoint`, line 12).
  - `Home/Dining/DiningDataSource/DiningHallsViewModel.swift` — collections `"Dining Halls V2"` and `"Dining Halls"` (`kDiningHallEndpoint`/`kDiningHallAdditionalDataEndpoint`, lines 14-15).
  - `Events/EventDataSource/EventsViewModel.swift` — `EventsDataService` queries collection `"Events"` (`kEventsDataServiceEndpoint`, line 14).
- Each of these data sources conforms to the shared `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift`), which defines a `static func fetchItems(_ completion:)` contract and a `static var fetchDispatch: DispatchGroup`. `DataManager` (`berkeley-mobile/Data/DataManager.swift`) is the app-wide coordinator that calls `fetchItems` on a fixed list of `DataSource` types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`; see `kDataSources`, line 12-16) and caches the results.
- Firestore documents are decoded into Swift model types using the Firebase Firestore Swift Codable support (`document.data(as: <Type>.self)`), e.g. `BMSafetyLog` (`berkeley-mobile/Safety/SafetyViewModel.swift:12-28`) and `BerkeleyEventsDaySnapshot`/`BerkeleyEvent` (`berkeley-mobile/Events/EventDataSource/EventsViewModel.swift:16-33`). Decode failures on individual documents are dropped via `try?`/`compactMap` rather than surfaced as errors (e.g. `berkeley-mobile/Data/BMNetworkingManager.swift:24,35`).
- Two concurrency styles coexist for calling into this backend: `async`/`await` (`BMNetworkingManager`, `EventsDataService`) and completion-handler/`DispatchGroup`-based APIs (`DataSource.fetchItems`, `DataManager.fetch(source:_:)`).

## Image Loading (HTTP)

Direct `URLSession`-based HTTP networking (outside Firestore) is used only for fetching images, in two places:
- `berkeley-mobile/Common/Images/ImageLoader.swift` — a singleton (`ImageLoader.shared`) that caches loaded images in `loadedImages: [URL: UIImage]` and in-flight requests in `runningRequests: [UUID: URLSessionDataTask]`; `getImage(url:completion:)` issues a `URLSession.shared.dataTask(with:)` on cache miss and supports cancellation via `cancelLoad(_:)`.
- `berkeley-mobile/Home/Dining/MenuItemIconCacheManager.swift` — uses `try await URLSession.shared.data(from:)` (async form) inside an actor-based icon cache.

No other REST/HTTP API base URL or endpoint configuration was found in the inspected repository areas; `BMConstants.swift` contains only Firestore collection-name constants and UI constants, not a networking host configuration.

## Authentication

`GoogleSignIn` and `Firebase/Auth` are declared as dependencies (`Podfile`; `import GoogleSignIn` in `berkeley-mobile/AppDelegate.swift:12`), but no sign-in flow, `GIDSignIn` usage, `Auth.auth()` call, or authentication delegate/view controller was found anywhere in `berkeley-mobile/` app code in the inspected areas. Document as: "GoogleSignIn/Firebase Auth are available as linked dependencies; no wired-up authentication flow was found in application code."

## Push Notifications / Messaging

`berkeley-mobile/AppDelegate.swift` wires up Firebase Cloud Messaging: it sets `Messaging.messaging().delegate = self`, requests `UNUserNotificationCenter` authorization (lines 27-32), and implements `MessagingDelegate.messaging(_:didReceiveRegistrationToken:)` (line 77) which posts an `FCMToken` `NotificationCenter` notification and subscribes the device to the `"all"` topic (line 86). It also implements `UNUserNotificationCenterDelegate` to handle foreground presentation (line 58) and notification taps, which route the user to tab index 2 of the root `TabBarController` (lines 64-69).

## Internal "Contracts" Between App Layers

- `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift`) is the internal contract between `DataManager` and each feature's Firestore-backed data source.
- `HasImage`, `HasLocation`, `HasName`, `HasOpenClosedStatus`, `HasOpenTimes`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `SearchItem`, `BMCalendarEvent` (all under `berkeley-mobile/Data/ItemProtocols/`) are shared model-capability protocols consumed by shared UI components (e.g. `HasImage.fetchImage` in `berkeley-mobile/Data/ItemProtocols/HasImage.swift:29-42` is used by any model conforming to `HasImage`, decoupling image-capable views from a concrete model type).
- `DrawerViewDelegate` / `MainDrawerViewDelegate` (`berkeley-mobile/Drawer/`) form the internal contract between the custom drawer UI system and any view controller that hosts a drawer.

## Not Applicable

Backend route/controller documentation, request/response schema documentation for a server API, and GraphQL/RPC contract documentation are not applicable to this repository — it is a client application with no server-side code.
