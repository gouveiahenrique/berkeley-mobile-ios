<!-- steering-agent-last-run: 2026-11-17 21:29 UTC -->
# API / Networking Standards (Mobile client)

The repository is a client; it implements no server routes or controllers.

## Backend communication
- Firestore (`import Firebase`) is the data backend. Collection reads use `db.collection(<name>).getDocuments(...)`.
- Collection names observed as constants: `BMConstants.safetyLogsCollectionName` ("Safety Logs"), `BMConstants.resourceCategoriesCollectionName` ("Resource Categories"); file-local constants such as `kGymClassesEndpoint` ("Gym Classes"), `kLibrariesEndpoint`, `kMapEndpoint`, `kGymsEndpoint`, `kGuidesEndpoint`, `kDiningHallEndpoint`, `kNewsDataEndpoint`, `kFeedbackResponsesCollection`.
- Writes: feedback responses are written to Firestore in `FeedbackFormViewModel`.

## Service interfaces
- `BMNetworkingManager.shared` (`Data/BMNetworkingManager.swift`): async/throwing `fetchSafetyLogs()` and `fetchResourcesCategories()`; decodes with `data(as:)`, drops undecodable documents via `compactMap { try? ... }`, and sorts results.
- `DataSource` protocol (`Data/DataSource.swift`): `static fetchItems(_:)` with completion handler and `static fetchDispatch: DispatchGroup`; orchestrated by `DataManager.fetch(source:_:)` (min interval `fetchInterval` = 3600 s).
- Both callback-style (data sources) and async/await (`BMNetworkingManager`, view models) are present.

## Other network use
- `URLSession.shared` is used for image/data loading (e.g. `BMCachedAsyncImageView`).
- Push: Firebase Cloud Messaging; token broadcast via `NotificationCenter` name `FCMToken`; topic `all`.

## Errors
- `BMError` (`Data/BMError.swift`) covers calendar errors only, conforming to `LocalizedError`. Firestore errors in data sources are handled per call site (e.g. `print`).

## Authentication
- Pods include `Firebase/Auth` and `GoogleSignIn`; `AppDelegate` imports `GoogleSignIn`. Sign-in flow usage: not verified in inspected areas.
