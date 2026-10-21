<!-- steering-agent-last-run: 2026-10-21 13:37 UTC -->
# Interfaces and Communication Patterns

Repository type is a mobile client; it exposes no server routes. Server-side controllers: Not applicable for this repository type.

## Backend communication
- The app reads from Google Cloud Firestore via `Firestore.firestore()` (`README.md`; source files below). No `URLSession`-based REST client was surfaced in inspected areas.
- Firestore collection names are held in `fileprivate let k...Endpoint` constants in the file that uses them:
  - `Map Marker` (`MapDataSource`), `Libraries` (`LibraryDataSource`), `Gyms` (`GymDataSource`), `Gym Classes` (`GymClassDataSource`)
  - `Events` (`EventsDataService`), `Dining Halls V2` and `Dining Halls` (`DiningHallsViewModel`)
  - `Gym Occupancy Meters`, documents `rsf-weight-room` / `cms-fitness` (`GymOccupancyViewModel.Constants`)
- The app also references `FeedbackFormConfig` (`FeedbackFormViewModel.fetchFeedbackFormConfig()`); its source collection was not inspected.

## Two decoding patterns
1. Legacy `DataSource` protocol (`Data/DataSource.swift`): static `fetchItems(_ completion:)` and `fetchDispatch: DispatchGroup`; documents parsed manually from `[String: Any]` (`dict["name"] as? String`). Used by Map, Library, Gym, GymClass sources. `DataManager.fetch(source:)` ensures each source is fetched once and cached in `AtomicDictionary`; refetch interval `DataManager.fetchInterval` = 3600 s.
2. Codable decoding with `doc.data(as:)` / `getDocument(as:)` and `async/await` (`EventsDataService`, `DiningHallsViewModel`, `GymOccupancyViewModel`). Custom keys via `CodingKeys` (e.g. `GymOccupancyLocationData`: `gymId`, `sourcePageUrl`, `scrapedAt`).

## Error handling on the network path
- Legacy sources: `print("[Error @ Type.method()]: \(err)")`; several sources `return` without calling the completion on error.
- Async paths: decode failures logged via `os.Logger` (`Logger.eventsDataService`, `Logger.diningHallsViewModel`, defined in `Utils/Logger+Ext.swift`); fetch failures return empty results (`[]`, `[:]`, or `0.0` for occupancy).

## Push notifications
`FirebaseMessaging`: FCM token delegate posts `Notification.Name("FCMToken")`; subscribes to topic `all`. `UNUserNotificationCenterDelegate` presents `.banner, .sound` in foreground.

## Other interfaces
- Analytics: `Analytics.logEvent("opened_food", ...)`, `"opened_academic_calendar"`, `"opened_campus_wide_events"`.
- Widget: `BerkeleyMobileWidget/GymOccupancyWidget.swift` (`GymOccupancyProvider.getTimeline`) shows gym occupancy.
- Authentication: `Firebase/Auth` and `GoogleSignIn` are in the Podfile; `GoogleSignIn` is imported in `AppDelegate.swift`. Sign-in flow usage was not found in inspected areas.
