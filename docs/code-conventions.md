# Code Conventions

## Naming Conventions

- **`BM` prefix:** Repository-defined types commonly (though not exclusively) use a `BM` prefix, e.g. `BMConstants`, `BMError`, `BMEventManager`, `BMLocationManager`, `BMNetworkingManager`, `BMColor`, `BMFont`, `BMAlert`, `BMActionButton`, `BMCachedAsyncImageView`, `BMContentUnavailableView`, `BMDrawerView`, `BMFilterButton`, `BMSegmentedControlView`, `BMTopBlobView`, `BMSafetyLog`, `BMEventCalendarEntry`, `BMResourceCategory` (referenced in `BMNetworkingManager.swift`), `BMCalendarEvent` (protocol). A repository-wide search found 30 files declaring a top-level `class`/`struct`/`enum`/`protocol` beginning with `BM`. Not all types use this prefix (e.g. `DataManager`, `DataSource`, `TabBarController`, `TagView`, `CardView`, `SafetyViewModel`, `MapViewController` do not), so the prefix is an observed pattern, not a project-wide rule confirmed to apply to every type.
- **`*ViewModel` suffix:** View-model types are suffixed `ViewModel` (e.g. `HomeViewModel`, `SafetyViewModel`, `ResourcesViewModel`, `FeedbackFormViewModel`, `DebugViewModel`, `EventsViewModel`, `GymOccupancyViewModel`).
- **`*View` / `*ViewController` suffix:** SwiftUI view types are suffixed `View` (e.g. `SafetyView`, `TodayView`, `HomeView`, `EventsView`, `OpenTimesCardSwiftUIView`); UIKit view controllers are suffixed `ViewController` (e.g. `MapViewController`, `DrawerViewController`, `TabBarController`, `SearchDrawerViewController`).
- **`*DataSource` suffix / subfolder:** Types and folders responsible for fetching a specific domain's data are named `*DataSource` (e.g. `MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`, `DiningDataSource`, `EventDataSource`), each conforming to the shared `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift`).
- **`Has*` / `Can*` protocol naming:** Capability protocols in `Data/ItemProtocols/` follow an adjective/verb-phrase naming style: `HasImage`, `HasLocation`, `HasName`, `HasOpenClosedStatus`, `HasOpenTimes`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`.
- **File-scoped constants struct pattern:** Private nested `struct ArgumentNames` (or similarly-named) with `static let` string keys is used for `NSCoding` key names, e.g. `BMEventCalendarEntry.ArgumentNames` (`berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift:12-22`).

## File Organization

- Source files are grouped by feature/domain under `berkeley-mobile/` (`Home/`, `Events/`, `Safety/`, `Resources/`, `Today/`, `Drawer/`, `FeedbackForm/`, `Debug/`), each containing its view(s), view model(s), and (where applicable) a nested `*DataSource` subfolder — see `docs/structure.md` for the full breakdown.
- Cross-cutting concerns live in dedicated top-level folders: `Data/` (data access, constants, errors), `Common/` (shared UI components), `Utils/` (type extensions and small helpers), `Assets/` (colors, fonts).
- File headers follow the standard Xcode template comment block (file name, project name, author, copyright), consistently present at the top of inspected files (e.g. `AppDelegate.swift:1-7`, `BMEventCalendarEntry.swift:1-7`, `MainDrawerViewDelegate.swift:1-7`).
- `// MARK: -` comments are used to divide sections within a file (e.g. `AppDelegate.swift:37`, `:54`, `:74`; `DataManager.swift`; `SafetyViewModel.swift:55`, `:155`).

## Architectural Patterns

- **Singleton managers:** Several manager types expose a single shared instance via `static let shared`, e.g. `DataManager.shared` (`Data/DataManager.swift:21`), `BMNetworkingManager.shared` (`Data/BMNetworkingManager.swift:13`), `BMLocationManager.shared`. These centralize a single responsibility (data fetch/cache, Firestore access, location) behind one process-wide access point.
- **Protocol-oriented data sources:** Domain-specific data fetchers conform to the `DataSource` protocol (`fetchItems(_:)`, `fetchDispatch`), letting `DataManager` treat heterogeneous sources uniformly via `[DataSource.Type]` (`Data/DataManager.swift:12-16`).
- **Protocol-oriented item capabilities:** Model types compose small capability protocols (`HasImage`, `HasLocation`, `CanFavorite`, `BMCalendarEvent`, etc.) rather than deep class inheritance — e.g. `BMEventCalendarEntry: NSObject, NSCoding, Identifiable, BMCalendarEvent, HasImage, CanFavorite` (`Events/EventDataSource/BMEventCalendarEntry.swift:11`).
- **Property wrappers:** A custom `@Display` property wrapper (`Data/PropertyWrappers/Display.swift`) is applied to model fields intended for UI display, e.g. `@Display var name: String` in `BMEventCalendarEntry` (`BMEventCalendarEntry.swift:25,28-29`).
- **MVVM with `ObservableObject`:** SwiftUI-facing view models are `final class ... : NSObject, ObservableObject` with `@Published` state, e.g. `SafetyViewModel` (`Safety/SafetyViewModel.swift:57-68`), driving derived/filtered state (`filteredSafetyLogs`, `crimeInfos`) from a `didSet` observer on `@Published var selectedSafetyLogFilterStates`.
- **Protocol extensions for shared behavior:** Default/shared behavior is implemented via `protocol X where Self: UIViewController { }` extensions rather than base classes, e.g. `MainDrawerViewDelegate` (`Drawer/MainDrawerViewDelegate.swift:22-106`) supplies `dismissTop`, `coverTop`, `hideTop`, `showTop`, `moveCurrentDrawer`, `showMainDrawer` as protocol-extension methods.
- **`NSCoding` persistence for models:** Model types intended for local persistence implement `encode(with:)` / `init?(coder:)` directly (e.g. `BMEventCalendarEntry.swift:93-131`) rather than relying solely on `Codable`.
- **`Codable` + `CodingKeys` for Firestore models:** Types fetched via `BMNetworkingManager` are `Codable` structs with explicit `CodingKeys` mapping Firestore field names to Swift property names, e.g. `BMSafetyLog` mapping `date_time` → `date` (`Safety/SafetyViewModel.swift:12-28`).
- **Static sample-data extensions:** Sample/preview data is added via an `extension` on the production type rather than a separate mock type, e.g. `extension BMEventCalendarEntry { static let sampleEntry = ... }` (`BMEventCalendarEntry.swift:134-147`) and `extension SafetyViewModel { static func getSampleSafetyLog() -> BMSafetyLog }` (`SafetyViewModel.swift:157-161`).

## Error Handling Patterns

- Repository-defined `Error` enums conform to `LocalizedError` and supply `errorDescription`, e.g. `BMError` (`Data/BMError.swift`).
- View models catch `async throws` networking errors and store them in a `@Published var alert: BMAlert?` for UI presentation, wrapped in a `withoutAnimation { }` call when setting state (`SafetyViewModel.swift:95-99`).
- Firestore document decoding failures are handled by silently dropping the document via `compactMap { try? $0.data(as: T.self) }` rather than propagating a decode error (`Data/BMNetworkingManager.swift:24,35`).

## Recurring Implementation Patterns

- `DispatchGroup`-based single-fetch guarantees for shared/expensive resources (`Data/DataManager.swift:65-87`).
- Extension-based augmentation of Foundation/UIKit types placed in `Utils/` (e.g. `Date+Extension.swift`, `UIView+Extensions.swift`, `UserDefaults+Extension.swift`) rather than free functions.
- Dark-mode-aware colors defined as computed properties returning `UIColor { traitCollection in ... }` closures, e.g. `BMColor.searchBarIconColor`, `BMColor.modalBackground`, `BMColor.cardBackground` (`Assets/Colors/Colors.swift:15-47`).
