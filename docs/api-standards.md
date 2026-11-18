<!-- steering-agent-last-run: 2026-11-18 18:30 UTC -->
# API / Communication Standards

Repository type is a mobile client; no server routes are implemented. This document covers the networking layer.

## Backend
- Cloud Firestore is the data store accessed directly from the app (`Firestore.firestore()` used in `BMNetworkingManager`, `MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`, `GymOccupancyViewModel`, `EventsViewModel`, `GuidesViewModel`, `DiningHallsViewModel`, `NewsDataViewModel`).
- Collection names are centralized partly in `BMConstants` (`"Safety Logs"`, `"Resource Categories"`) and partly as file-local constants (e.g. `kMapEndpoint = "Map Marker"`, `GymOccupancyViewModel.Constants.gymOccupancyCollectionName = "Gym Occupancy Meters"`).

## Two observed fetch patterns
1. `DataSource` protocol (`Data/DataSource.swift`): `static func fetchItems(_ completion:)` with a static `fetchDispatch: DispatchGroup`; results are `[Any]`. Parsing is manual from `[String: Any]` dictionaries (e.g. `MapDataSource.parseMarker`). Sources are listed in `kDataSources` in `DataManager.swift`; `DataManager.fetchInterval` is 3600 seconds.
2. `BMNetworkingManager.shared` (`async throws`): `fetchSafetyLogs()` and `fetchResourcesCategories()` decode documents with `data(as:)` using `compactMap { try? ... }`, then sort.

## Push notifications
- `FirebaseMessaging` delegate in `AppDelegate`; FCM token is posted as `Notification.Name("FCMToken")`; app subscribes to topic `"all"`. Tapping a notification selects tab index 2 of `TabBarController`.

## Authentication
- `Firebase/Auth` and `GoogleSignIn` are in the Podfile; `GoogleSignIn` is imported in `AppDelegate.swift`. Sign-in flow usage was not found in inspected areas.

## Errors
- `Data/BMError.swift` exists; data sources print errors with the pattern `[Error @ Type.method()]: \(err)`.

## Not found in codebase
HTTP REST/GraphQL client code (not found in inspected areas).
