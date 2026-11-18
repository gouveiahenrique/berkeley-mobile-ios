<!-- steering-agent-last-run: 2026-11-18 12:26 UTC -->
# API / Interface Standards (Mobile client)

The app is a client; no server routes are defined in this repository.

## Backend communication
- Firestore is the data backend (README.md). Reads use `db.collection(<name>).getDocuments()`; the repository uses both completion-handler style (`LibraryDataSource`, `MapDataSource`, `GymDataSource`, `GymClassDataSource`) and async/await (`BMNetworkingManager`, `GuidesViewModel`, `NewsDataViewModel`, `DiningHallsViewModel`, `EventsViewModel`).
- `BMNetworkingManager.shared` (`Data/BMNetworkingManager.swift`): `fetchSafetyLogs()`, `fetchResourcesCategories()`; decodes with `data(as:)` using `compactMap { try? ... }`. Collection names: `BMConstants.safetyLogsCollectionName` = "Safety Logs", `resourceCategoriesCollectionName` = "Resource Categories".
- Other collections are referenced through file-level constants named `k...Endpoint` (e.g. `kGuidesEndpoint`, `kMapEndpoint`, `kGymsEndpoint`).
- Writes: `FeedbackFormViewModel` writes to `kFeedbackResponsesCollection` and reads a config document (`kFeedbackFormConfigEndpoint`/`kFeedbackFormConfigDocName`). `GymOccupancyViewModel` reads documents from a gym occupancy collection.
- `DataSource` protocol: `static func fetchItems(_:)` and `static var fetchDispatch: DispatchGroup`; `DataManager` fetches each source once and refetches at most every `fetchInterval` = 3600s via `fetchIfNecessary()`.
- HTTP: `URLSession.shared` is used for images (`Common/Images/ImageLoader.swift`) and dining menu icons (`Home/Dining/MenuItemIconCacheManager.swift`).
- Push: Firebase Cloud Messaging; topic "all" subscribed in `AppDelegate`.

## Errors
- Local `BMError` enum (calendar-related cases) conforming to `LocalizedError`.
- Fetch failures are handled with `try?`/guard or logged via `os.Logger` (`Utils/Logger+Ext.swift`).

## Authentication
Firebase/Auth and GoogleSignIn are in the Podfile; usage in app code was not confirmed in inspected areas.
