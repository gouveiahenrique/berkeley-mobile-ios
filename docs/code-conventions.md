# Code Conventions

**Last updated:** 2026-08-03

## Naming Conventions

### Variables and Properties

- `camelCase` observed for variables, properties, and function parameters throughout the codebase.
- Boolean properties use `is`/`has` prefixes in observed code (e.g. `isLoading`, `isFetching` in ViewModels; `isEmailValid` in `FeedbackForm`).

### Functions and Methods

- `camelCase` for functions: `fetchSafetyLogs()`, `fetchItems(_:)`.
- Async methods share the same name as their synchronous predecessors would have — the `async` keyword alone signals the calling convention (no `Async` suffix observed).
- Sample/mock data factory methods are declared as `static` on the type, e.g. `BMEventCalendarEntry.sampleEntry` (`berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift:136`).

### Types (Classes, Structs, Enums, Protocols)

- `PascalCase` for all type names.
- App-specific types are prefixed `BM`: `BMSafetyLog`, `BMError`, `BMConstants`, `BMEventCalendarEntry`, `BMNetworkingManager`.
- SwiftUI view types do not carry the `BM` prefix: `SafetyView`, `TabBarController`'s hosted views (`TodayView`, `SafetyView`, `ResourcesView`).
- ViewModels are suffixed `ViewModel`: `SafetyViewModel`, `DiningHallsViewModel`, `EventsViewModel`, `GuidesViewModel`.
- Protocols are named by capability, not prefixed with `I`: `DataSource`, `CanFavorite`, `HasName`, `HasLocation`, `HasImage`, `HasOpenTimes`, `HasOpenClosedStatus`, `HasPhoneNumber`, `HasWebsite`, `BMCalendarEvent`, `SearchItem`, `MainDrawerViewDelegate`, `DrawerViewDelegate`.

### Constants

- `fileprivate let k<Name>` — file-scoped constants, most commonly Firestore collection/endpoint names, e.g. `fileprivate let kMapEndpoint = "Map Marker"` (`MapDataSource.swift`), `fileprivate let kGymsEndpoint = "Gyms"` (`GymDataSource.swift`).
- `static let <name>` on a struct for constants shared across files: `BMConstants.safetyLogsCollectionName`.
- Enum cases use `camelCase`.

### Files

- `PascalCase.swift` for Swift files: `SafetyViewModel.swift`, `DiningHallsView.swift`.
- Extension files follow `TypeName+Category.swift`: `Colors+Text.swift`, `AppDelegate+Migration.swift`, `Date+Extension.swift`, `CLLocation+Extension.swift`.

## Code Formatting

No linter or formatter configuration file was found in the repository (no `.swiftlint.yml`, no `.swiftformat`). The following describes patterns observed by inspection, not enforced conventions:

- 4-space indentation is used throughout inspected files.
- Opening braces are placed on the same line as the declaration (`func foo() {`).
- `// MARK: -` comments are used to divide files into sections, e.g. `// MARK: - UNUserNotificationCenterDelegate` and `// MARK: - MessagingDelegate` in `AppDelegate.swift`.

## ViewModel Patterns (Two Coexisting Approaches)

### `@Observable` macro

Observed in, e.g., `berkeley-mobile/Home/Fitness/GymOccupancy/GymOccupancyViewModel.swift`, `berkeley-mobile/Home/Home Drawer/HomeDrawerPinViewModel.swift`, `berkeley-mobile/Home/Dining/DiningDataSource/DiningHallsViewModel.swift`, `berkeley-mobile/Home/Search/SearchViewModel.swift`, `berkeley-mobile/Home/Guides/GuidesViewModel.swift`. The `@Observable` macro requires iOS 17+ (Level 2 platform capability); the app target's effective deployment target is iOS 18.0 (see `docs/tech.md`), so this constraint does not block its use in the main app target.

### `ObservableObject` / `@Published`

Observed in, e.g., `berkeley-mobile/Safety/SafetyViewModel.swift`, `berkeley-mobile/Home/HomeViewModel.swift`, `berkeley-mobile/Resources/ResourcesViewModel.swift`, `berkeley-mobile/Events/CalendarView.swift`. Example from `BMNetworkingManager`/`SafetyViewModel`-style code:

```swift
final class SafetyViewModel: NSObject, ObservableObject {
    @Published var safetyLogs = [BMSafetyLog]()
    @Published var isLoading = false

    @MainActor
    private func listenForSafetyLogs() async {
        do {
            defer { isLoading = false }
            safetyLogs = try await BMNetworkingManager.shared.fetchSafetyLogs()
        } catch {
            alert = BMAlert(title: "...", message: error.localizedDescription, type: .notice)
        }
    }
}
```

Both patterns coexist in the current codebase; no migration marker or deprecation comment favoring one over the other was found.

## Dependency Injection Pattern (`FactoryKit`)

ViewModels and services are registered in `berkeley-mobile/BerkeleyMobile+Injection.swift` as a `Container` extension:

```swift
extension Container {
    var diningHallsViewModel: Factory<DiningHallsViewModel> {
        self { DiningHallsViewModel() }.singleton
    }

    var eventsViewModel: Factory<EventsViewModel> {
        self { @MainActor in EventsViewModel() }.shared
    }
}
```

Injection sites use `@Injected(\.key)` (confirmed in `TabBarController.swift`: `@Injected(\.feedbackFormPresenter) private var feedbackFormPresenter`). 25 files in the repository reference `@InjectedObservable` or `@Injected(`. Scopes observed on `Factory<T>` registrations: `.singleton`, `.shared`, and default (unscoped, new instance per resolve).

## Error Handling

- App-domain errors specific to non-Firestore operations (calendar integration) are declared in `berkeley-mobile/Data/BMError.swift` as a `LocalizedError` enum.
- Firestore/network errors are caught at the ViewModel layer and surfaced to the UI via an observable property (e.g. `alert: BMAlert?` on `SafetyViewModel`).
- `compactMap { try? ... }` is used where individual document decode failures should be silently skipped (`BMNetworkingManager.fetchSafetyLogs`).
- Legacy `DataSource` subclasses (`MapDataSource`, `GymDataSource`, `LibraryDataSource`, `GymClassDataSource`) log fetch errors via `print(...)`, not `os.Logger`.

## Logging

Loggers for newer code are pre-declared in `berkeley-mobile/Utils/Logger+Ext.swift` using `os.Logger`:

```swift
extension Logger {
    static let diningHallsViewModel = Logger(
        subsystem: Bundle.main.bundleIdentifier!,
        category: String(describing: DiningHallsViewModel.self)
    )
}
```

Confirmed call sites using this pattern include `Logger.homeDrawerPinViewModel.error(...)` (`HomeDrawerPinViewModel.swift`), `Logger.diningHallsViewModel.error(...)` (`DiningHallsViewModel.swift`), `Logger.guidesViewModel.error(...)` (`GuidesViewModel.swift`), `Logger.weatherDataViewModel.error(...)` (`WeatherDataViewModel.swift`), `Logger.newsDataViewModel.error(...)` (`NewsDataViewModel.swift`).

This `os.Logger` pattern coexists with `print(...)` calls in legacy `DataSource` files — both exist in the current codebase; `print(...)` is confined to the older `DataSource` implementations in the files inspected.

## Design System Usage

- `BMColor` static properties are used in observed code instead of raw `UIColor(red:green:blue:alpha:)` literals, e.g. `tabBar.tintColor = BMColor.blackText` in `TabBarController.swift`.
- Color and font extensions are organized by feature under `berkeley-mobile/Assets/Colors/` (`Colors+Text.swift`, `Colors+Calendar.swift`, `Colors+GymClass.swift`, `Colors+ActionButton.swift`, `Colors+MapMarker.swift`, `Colors+Event.swift`, `Colors+StudyPact.swift`, `Colors+TagView.swift`, `Colors+Resource.swift`) and `berkeley-mobile/Assets/Fonts.swift`.

## Property Wrappers

`@Display` (`berkeley-mobile/Data/PropertyWrappers/Display.swift`) wraps `String`/`String?` properties to trim whitespace/newlines and strip a specific invalid replacement character (`�`) on every set:

```swift
@propertyWrapper struct Display<T> {
    private var _display: T
    var wrappedValue: T {
        get { return _display }
        set { _display = Display.wrap(newValue) }
    }
    private static func wrap(_ rawString: String) -> String {
        return rawString
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "�", with: "")
    }
}
```

Used on model properties intended for display, e.g. `@Display var name: String` and `@Display var descriptionText: String?` in `BMEventCalendarEntry`.

## Async/Await Patterns

- `async throws` is used for Firestore fetch methods in `BMNetworkingManager`.
- `Task { ... }` fire-and-forget blocks are used from `init()` in `@Observable` ViewModels, with `@MainActor` applied where UI state is updated directly.
