<!-- steering-agent-last-run: 2026-11-17 20:35 UTC -->
# Interfaces and Communication

Repository type is a mobile client; no server routes are defined. Server controllers: Not applicable for this repository type.

## Networking layer
- Firestore (Firebase) is the observed backend. `BMNetworkingManager.shared` (`berkeley-mobile/Data/BMNetworkingManager.swift`) exposes `fetchSafetyLogs()` and `fetchResourcesCategories()` as `async throws`, reading `db.collection(...)` and decoding with `data(as:)` using `compactMap { try? ... }`.
- Collection names live in `BMConstants`: `safetyLogsCollectionName = "Safety Logs"`, `resourceCategoriesCollectionName = "Resource Categories"`.
- `DataSource` protocol (`Data/DataSource.swift`): `static func fetchItems(_ completion:)` with `completionHandler = ([Any]) -> Void` and a static `fetchDispatch: DispatchGroup`. Implementations observed: `MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`.
- Contract decoding example: `BMSafetyLog` is `Codable` with `CodingKeys` mapping `date` to `"date_time"`.
- Direct HTTP: `URLSession.shared` is used in `Common/Images/ImageLoader.swift` and `Home/Dining/MenuItemIconCacheManager.swift` for image/icon downloads.
- Push notifications: Firebase Messaging; FCM token posted via `NotificationCenter` name `"FCMToken"`; subscribes to topic `"all"`.

## Errors
- `BMError` enum (calendar-related cases) conforming to `LocalizedError` with `NSLocalizedString` descriptions.

## Authentication / validation
- Firebase/Auth and GoogleSignIn are declared in `Podfile`; usage in app sources: Not found in inspected areas (`AppDelegate` imports `GoogleSignIn`).
- Authorization requests: notifications (`AppDelegate`), calendar (`BMEventManager`), location (`BMLocationManager`).
