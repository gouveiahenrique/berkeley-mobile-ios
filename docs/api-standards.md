# API Standards

## Applicability

This repository is a mobile application (iOS client). It does not define or host any HTTP/GraphQL/RPC server API. The relevant "interfaces" for this repository type are its outbound networking/data-access contracts: how the app communicates with its backend (Firebase) and with device/OS services.

Backend route/controller documentation, request-lifecycle middleware, and server-side authentication/authorization standards are **not applicable for this repository type**.

## Backend Communication: Firestore

The repository implements direct client access to Google Cloud Firestore as its primary backend interface, per `README.md`: "The application pulls data from Google Cloud Firestore."

### Access patterns

Two distinct Firestore access patterns exist in the repository:

1. **Callback-based, via the `DataSource` protocol** (`berkeley-mobile/Data/DataSource.swift`):
   ```swift
   protocol DataSource {
       typealias completionHandler = (_ resources: [Any]) -> Void
       static func fetchItems(_ completion: @escaping DataSource.completionHandler)
       static var fetchDispatch: DispatchGroup { get set }
   }
   ```
   Implementations (e.g. `berkeley-mobile/Home/Libraries/LibraryDataSource/LibraryDataSource.swift`, `berkeley-mobile/Home/Fitness/GymDataSource/GymDataSource.swift`, `berkeley-mobile/Home/Map/MapDataSource/MapDataSource.swift`) call `Firestore.firestore().collection(<name>).getDocuments()` directly and parse each `QueryDocumentSnapshot`'s `.data()` dictionary manually into a model struct (e.g. `LibraryDataSource.parseLibrary(_:docID:)`). Collection names are declared as file-local `fileprivate let` constants (e.g. `kLibrariesEndpoint = "Libraries"`, `kGymsEndpoint = "Gyms"`) rather than centralized.
   - These data sources are registered in a single fixed list, `kDataSources`, in `berkeley-mobile/Data/DataManager.swift`, and fetched/cached through `DataManager.shared`.
   - Errors from `getDocuments()` are handled by printing to the console (e.g. `print("Error getting documents: \(err)")` in `LibraryDataSource`, `print("[Error @ GymDataSource.fetchGyms()]: \(err)")` in `GymDataSource`) and returning early without calling the completion handler — not found: any user-facing error surfaced from this path.

2. **`async`/`await`-based, via `BMNetworkingManager`** (`berkeley-mobile/Data/BMNetworkingManager.swift`):
   ```swift
   func fetchSafetyLogs() async throws -> [BMSafetyLog] {
       let collection = db.collection(BMConstants.safetyLogsCollectionName)
       let querySnapshot = try await collection.getDocuments()
       ...
   }
   ```
   Collection names for this path are centralized as constants in `berkeley-mobile/Data/BMConstants.swift` (`safetyLogsCollectionName`, `resourceCategoriesCollectionName`). Documents are decoded with `Firestore`'s `Codable` support (`$0.data(as: BMSafetyLog.self)`) rather than manual dictionary parsing, and decode failures are silently dropped via `compactMap { try? ... }`. Callers (e.g. `berkeley-mobile/Safety/SafetyViewModel.swift`) `do`/`catch` around the `async` call and surface failures through a `@Published var alert: BMAlert?` property, e.g.:
   ```swift
   } catch {
       self.alert = BMAlert(title: "Failed To Fetch Safety Logs", message: error.localizedDescription, type: .notice)
   }
   ```

The repository does not have one single unified networking layer — both patterns coexist as of the inspected code (Level 1 evidence for both).

### Data contracts

- Where the callback-based `DataSource` pattern is used, the Firestore document schema (field names) is implicit in each data source's manual parsing code (e.g. `dict["name"] as? String`, `dict["latitude"] as? Double` in `LibraryDataSource.parseLibrary`). No shared/generated schema file was found for this path.
- Where the `async`/`BMNetworkingManager` pattern is used, the schema is explicit via `Codable` structs with `CodingKeys`, e.g. `berkeley-mobile/Safety/SafetyViewModel.swift`:
  ```swift
  struct BMSafetyLog: Identifiable, Codable, Hashable {
      var crime: String
      var date: Date
      ...
      enum CodingKeys: String, CodingKey {
          case crime
          case date = "date_time"
          ...
      }
  }
  ```

### Model capability protocols

Feature models compose a shared set of protocols from `berkeley-mobile/Data/ItemProtocols/` to expose a consistent surface to shared UI (e.g. search, detail views, favoriting): `HasName`, `HasLocation`, `HasImage`, `HasOpenTimes`, `HasOpenClosedStatus`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `SearchItem`, `BMCalendarEvent`. For example, `SearchItem` (`berkeley-mobile/Data/ItemProtocols/SearchItem.swift`) requires `searchName`, `location`, `locationName`, `icon`, and provides default implementations of `location`/`locationName` when the conforming type also conforms to `HasLocation`. This is the mechanism by which heterogeneous Firestore-backed models (`BMLibrary`, `BMGym`, map markers, etc.) are aggregated into `DataManager.shared.searchable: [SearchItem]`.

## Other External Integrations

- **Firebase Cloud Messaging** — `berkeley-mobile/AppDelegate.swift` conforms to `MessagingDelegate` and posts the FCM token via `NotificationCenter.default.post(name: Notification.Name("FCMToken"), ...)`; it also subscribes the device to the `"all"` topic (`Messaging.messaging().subscribe(toTopic: "all")`).
- **Firebase Analytics** — used directly at call sites for event logging, e.g. `berkeley-mobile/Home/HomeViewModel.swift`: `Analytics.logEvent("opened_food_screen", parameters: nil)`.
- **Google Sign-In** — imported in `AppDelegate.swift`; a corresponding reversed-client-ID URL scheme is declared in `berkeley-mobile/Info.plist` under `CFBundleURLTypes`. Not found in the sampled files: the code path that initiates the sign-in flow (outside `AppDelegate`'s import) — sign-in flow implementation was not located in the inspected areas.
- **WeatherKit** — declared as an entitlement (`com.apple.developer.weatherkit: true` in `berkeley-mobile/berkeley-mobile.entitlements`) and consumed by `berkeley-mobile/Today/Tiles/Weather Tile/WeatherDataViewModel.swift` (file present; not fully inspected for standards purposes beyond its existence).
- **EventKit (device Calendar)** — `berkeley-mobile/Data/BMEventManager.swift` and the `BMError` cases (`insufficientAccessToCalendar`, `eventAlreadyAddedInCalendar`, etc., in `berkeley-mobile/Data/BMError.swift`) indicate calendar read/write integration; usage descriptions are declared in `Info.plist` (`NSCalendarsUsageDescription`, `NSCalendarsFullAccessUsageDescription`).
- **Core Location** — `berkeley-mobile/Data/BMLocationManager.swift`, invoked from `AppDelegate.application(_:didFinishLaunchingWithOptions:)` via `BMLocationManager.shared.requestLocation()`; usage description declared in `Info.plist` (`NSLocationWhenInUseUsageDescription`).

## Networking Configuration

`berkeley-mobile/Info.plist` sets `NSAppTransportSecurity` → `NSAllowsArbitraryLoads: true`, which is a Level 1 direct repository configuration (ATS is disabled app-wide as configured, regardless of the reason). Not found in codebase: any narrower, per-domain ATS exception configuration.

## Errors

`berkeley-mobile/Data/BMError.swift` defines a single `enum BMError: Error` scoped to calendar operations (`eventAlreadyAddedInCalendar`, `insufficientAccessToCalendar`, `mayExistedInCalendarAlready`, `unableToFindEventInCalendar`), conforming to `LocalizedError` with user-facing `errorDescription` strings via `NSLocalizedString`. Not found in codebase: a generalized app-wide error type covering the Firestore data-source failures described above — those currently fail silently (callback path) or produce ad hoc alerts (`BMAlert`, e.g. in `SafetyViewModel`).
