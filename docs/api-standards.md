# API / Interface Standards

This repository is a mobile application (see `docs/tech.md`). There are no HTTP routes, controllers, or server-side request handlers implemented in this repository; "API standards" below documents how the app communicates with its external backend and internal module boundaries, based on repository evidence.

## External Data Contract: Firestore

LEVEL 1: The application communicates with **Google Cloud Firestore** as its backend data store (per `README.md`: "The application pulls data from Google Cloud Firestore"). There is no REST/GraphQL API layer defined in this repository — consumers query Firestore collections directly using the Firebase iOS SDK (`Firebase/Firestore` pod, `Podfile`).

Observed collection names (Level 1, read directly from source):
- `"Gyms"` — `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift` (`kGymsEndpoint`)
- `"Gym Classes"` — `berkeley-mobile/Home/Fitness/GymClassDataSource/GymClassDataSource.swift` (`kGymClassesEndpoint`)
- `"Libraries"` — `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift` (`kLibrariesEndpoint`)
- `"Map Marker"` — `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift` (`kMapEndpoint`)
- `"Safety Logs"` — `berkeley-mobile/Data/BMConstants.swift` (`safetyLogsCollectionName`), queried in `berkeley-mobile/Data/BMNetworkingManager.swift`
- `"Resource Categories"` — `berkeley-mobile/Data/BMConstants.swift` (`resourceCategoriesCollectionName`), queried in `berkeley-mobile/Data/BMNetworkingManager.swift`

Two calling conventions coexist in the repository:
1. **Protocol-based, completion-handler style** — types conforming to `DataSource` (`berkeley-mobile/Data/DataSource.swift`) implement `static func fetchItems(_ completion: @escaping DataSource.completionHandler)`, calling `db.collection(...).getDocuments { querySnapshot, err in ... }` and manually mapping `document.data()` dictionaries into model structs (e.g. `GymDataSource.parseGym`, `MapDataSource.parseMarker`).
2. **`async`/`await` style** — `BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift`) uses `try await collection.getDocuments()` and decodes documents via `Codable` (`$0.data(as: BMSafetyLog.self)`, `$0.data(as: BMResourceCategory.self)`).

## Error Handling (data layer)

LEVEL 1: The `DataSource`-based fetchers (`GymDataSource`, `LibraryDataSource`, `MapDataSource`, `GymClassDataSource`) handle Firestore errors by printing to the console (e.g. `print("[Error @ GymDataSource.fetchGyms()]: \(err)")`) and, in most cases, returning without invoking the completion handler. `BMNetworkingManager`'s `async` methods use `try await` and propagate errors via Swift's `throws`; callers such as `SafetyViewModel.listenForSafetyLogs()` (`berkeley-mobile/Safety/SafetyViewModel.swift`) catch errors and surface them to the UI via a `BMAlert` published property (`self.alert = BMAlert(title: "Failed To Fetch Safety Logs", message: error.localizedDescription, type: .notice)`).

## Authentication

LEVEL 1: `GoogleSignIn` is a declared CocoaPods dependency (`Podfile`) and is imported in `berkeley-mobile/AppDelegate.swift`. `Firebase/Auth` is also a declared pod. No sign-in flow implementation (e.g. a view controller invoking `GIDSignIn`) was found in the files inspected during this analysis; the scope of authentication usage beyond these declarations was not confirmed.

## Push Notifications / Messaging

LEVEL 1: `berkeley-mobile/AppDelegate.swift` registers `UNUserNotificationCenter` and `FirebaseMessaging`'s `Messaging.messaging().delegate`. On receiving an FCM token (`messaging(_:didReceiveRegistrationToken:)`), the app posts a local `NotificationCenter` notification named `"FCMToken"` and subscribes the device to the Firebase Messaging topic `"all"`. This is an internal notification contract (`NotificationCenter`), not an external API.

## Internal Module Communication

LEVEL 1: Beyond Firestore, internal modules communicate via:
- **`NotificationCenter`** — e.g. `BMLocationManager` (`berkeley-mobile/Data/BMLocationManager.swift`) posts `.locationUpdated` notifications when the user's location changes or authorization changes.
- **Dependency injection via `Factory`/`FactoryKit`** — `@Injected` property wrappers resolve shared instances (e.g. `feedbackFormPresenter` in `TabBarController.swift`, `homeViewModel` in `MainContainerViewController.swift`). The injection container registrations are defined in `berkeley-mobile/BerkeleyMobile+Injection.swift` (not read in full during this analysis).
- **Delegate protocols** — e.g. `DrawerViewDelegate`/`MainDrawerViewDelegate` (`berkeley-mobile/Drawer/MainDrawerViewDelegate.swift`), `FeedbackFormPresenterDelegate` (`berkeley-mobile/TabBarController.swift`).

## Widget ↔ App Interface

LEVEL 1: The `BerkeleyMobileWidgetExtension` target independently invokes `GymOccupancyViewModel().fetchOccupancyPercentages()` (`BerkeleyMobileWidget/GymOccupancyWidget.swift`) rather than going through `DataManager`. No shared `App Group` entitlement was found in `berkeley-mobile/berkeley-mobile.entitlements` or in the project's package/entitlement configuration during this analysis, so no evidence of direct data sharing (e.g. via `UserDefaults(suiteName:)` or a shared container) between the app and widget was found in the inspected files.

## Not applicable / Not found in codebase

- REST/GraphQL/RPC route definitions: not applicable — this repository is a client application, not a backend service.
- API versioning scheme: not found in codebase.
- Request/response schema validation layer: not found in codebase (Firestore documents are mapped via manual dictionary parsing or `Codable`, with no separate validation step observed).
