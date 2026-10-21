<!-- steering-agent-last-run: 2026-10-21 16:32 UTC -->
# API / Interface Standards

Repository type is a mobile client; it exposes no server routes. This document covers the networking layer and service interfaces it consumes.

## Networking layer
- `BMNetworkingManager` (`berkeley-mobile/Data/BMNetworkingManager.swift`): singleton (`static let shared`) over `Firestore.firestore()`.
  - `fetchSafetyLogs() async throws -> [BMSafetyLog]` reads collection `BMConstants.safetyLogsCollectionName`, decodes with `data(as:)` using `compactMap { try? ... }`, sorts by `date` descending.
  - `fetchResourcesCategories() async throws -> [BMResourceCategory]` reads `BMConstants.resourceCategoriesCollectionName`, sorted by `name` descending.
- `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift`) with `fetchItems` and `fetchDispatch`; implemented by `MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource` (fetch via Firebase per `DataManager` comments). `DataManager.fetch(source:_:)` ensures each source is fetched once and caches results in an `AtomicDictionary`.
- `URLSession` usage found in `Common/Images/ImageLoader.swift` and `Home/Dining/MenuItemIconCacheManager.swift`.

## Contracts
- Firestore documents decode into `Codable` models, e.g. `BMSafetyLog` with `CodingKeys` mapping `date` to `"date_time"` (`Safety/SafetyViewModel.swift`).

## Push notifications
- `FirebaseMessaging` delegate posts `Notification.Name("FCMToken")` with the token and subscribes to topic `"all"` (`AppDelegate.swift`).

## Error handling
- Async fetches throw; `SafetyViewModel` catches errors and sets `alert = BMAlert(title: "Failed To Fetch Safety Logs", ...)`.
- `BMError` (calendar-related cases) conforms to `LocalizedError` with `NSLocalizedString` messages.

## Authentication
- `Firebase/Auth` and `GoogleSignIn` are declared in the `Podfile`; `GoogleSignIn` is imported in `AppDelegate.swift`. Sign-in flow usage: not verified in inspected areas.

## Authorization / validation
- Not found in codebase (in inspected areas).
