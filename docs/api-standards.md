<!-- steering-agent-last-run: 2026-10-29 13:05 UTC -->
# API / Interface Standards (Mobile client)

The repository is an iOS client; it exposes no server routes. Server controllers: Not applicable for this repository type.

## Networking layer
- Backend is Cloud Firestore via the Firebase SDK (`import Firebase`, `Firestore.firestore()`).
- `DataSource` protocol (`Data/DataSource.swift`): `static func fetchItems(_ completion:)` and `static var fetchDispatch: DispatchGroup`. Implementations: `MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`.
- `DataManager` (`Data/DataManager.swift`) fetches the types listed in `kDataSources` (`MapDataSource`, `LibraryDataSource`, `GymDataSource`), caches results in an `AtomicDictionary`, and throttles with `fetchInterval = 60 * 60`.
- `BMNetworkingManager.shared` uses `async throws` methods (`fetchSafetyLogs`, `fetchResourcesCategories`) and decodes documents with `data(as:)` (`compactMap { try? ... }`).
- Firestore collection names: `"Map Marker"` (`MapDataSource`), `"Safety Logs"` and `"Resource Categories"` (`BMConstants`). Other collections are read in the files listed in `docs/tech.md`.
- Live updates: `SafetyViewModel.listenForSafetyLogs` exists; `addSnapshotListener` use was not otherwise found by the inspected search.
- `MapDataSource.parseMarker` maps Firestore keys (`tag`, `latitude`, `longitude`, `open_close_array`, `name`, ...) manually from dictionaries.

## Other external integrations
- Firebase Messaging / `UNUserNotificationCenter` (push notifications) in `AppDelegate.swift`.
- GoogleSignIn and Firebase Auth are declared in the `Podfile`.
- Image loading: `Common/Images/ImageLoader.swift`, `BMCachedAsyncImageView`, `MenuItemIconCacheManager` (use `URLSession`/`URLRequest`).
- `kBookingURL = "https://berkeley.libcal.com"` in `LibraryDetailViewController.swift`.

## Errors
- `BMError` enum (`Data/BMError.swift`) with `LocalizedError` descriptions for calendar-related failures.
- `MapDataSource.fetchItems` prints errors with `print("[Error @ ...]")`. `Logger` extensions exist in `Utils/Logger+Ext.swift` (e.g. `Logger.diningHallsViewModel`).

## Authentication / validation
- No custom API authentication layer found. `README.md` states the production `GoogleService-Info.plist` is not in the repository.
