# Code Conventions

## Naming Conventions

- **Type prefix `BM`**: Many domain and utility types use a `BM` prefix (Berkeley Mobile), e.g. `BMColor`, `BMConstants`, `BMError`, `BMEventManager`, `BMNetworkingManager`, `BMLocationManager`, `BMEventCalendarEntry`, `BMAlert`, `BMActionButton`, `BMDrawerView`, `BMSafetyLog`. 20 files under `berkeley-mobile/` match the `BM*.swift` pattern (of 174 total Swift files in that directory, per repository search). Not every type uses this prefix — e.g. `DataManager`, `TabBarController`, `HomeViewModel` do not — so this is an observed convention for a subset of types, not a universal rule.
- **`ViewModel` suffix**: View-model classes consistently use the `<Feature>ViewModel` naming pattern, e.g. `HomeViewModel`, `SafetyViewModel`, `EventsViewModel`, `FeedbackFormViewModel`, `GuidesViewModel`, `DiningHallsViewModel`, `GymOccupancyViewModel`, `SearchViewModel`, `DebugViewModel`, `ResourcesViewModel`, `NewsDataViewModel`, `WeatherDataViewModel`, `HomeDrawerPinViewModel` (13 files match `*ViewModel*.swift` under `berkeley-mobile/`).
- **`View` suffix for SwiftUI views**: e.g. `FeedbackFormView`, `HomeView`, `TodayView`, `SafetyView`, `ResourcesView`, `DebugView` (58 files match `*View.swift`).
- **`ViewController` suffix for UIKit controllers**: e.g. `MainContainerViewController`, `MapViewController` (6 files match `*ViewController.swift`).
- **Protocol naming via capability description**: item/model protocols in `Data/ItemProtocols/` are named for the capability they grant, following a `Has<Capability>` or `Can<Capability>` pattern: `HasImage`, `HasLocation`, `HasName`, `HasWebsite`, `HasPhoneNumber`, `HasOpenClosedStatus`, `HasOpenTimes`, `CanFavorite`.
- **File-private constants prefixed `k`**: e.g. `kDataSources` (`DataManager.swift`), `kEventsDataServiceEndpoint` (`EventsViewModel.swift`), `kFeedbackFormConfigEndpoint`, `kFeedbackFormConfigDocName`, `kFeedbackResponsesCollection` (`FeedbackFormViewModel.swift`).
- **`UserDefaultsKeys` enum for typed keys**: `berkeley-mobile/Utils/UserDefaults+Extension.swift` defines a `UserDefaultsKeys: String` enum rather than using raw string literals at call sites, paired with generic `UserDefaults` extension methods (`set<T>(_:forKey:)`, `integer(forKey:)`, `data(forKey:)`, `increment(forKey:)`) that accept the enum type.

## File Header Convention

Swift files consistently begin with a standard comment header, e.g. (`berkeley-mobile/Data/BMConstants.swift`):

```swift
//
//  BMConstants.swift
//  berkeley-mobile
//
//  Created by Justin Wong on 3/15/25.
//  Copyright © 2025 ASUC OCTO. All rights reserved.
//
```

This pattern (filename, target name, author/date, copyright line) is Xcode's default new-file template — a framework/tooling convention consistently present in inspected files rather than a custom repository standard.

## Architectural Pattern: MVVM with Dependency Injection

The repository implements an MVVM-oriented architecture for its SwiftUI-driven features:

- View models conform to `ObservableObject` (e.g. `class HomeViewModel: ObservableObject` in `berkeley-mobile/Home/HomeViewModel.swift`, using `@Published` properties) or to the newer Swift `@Observable` macro (e.g. `@Observable class EventsViewModel` in `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift`). The repository uses both patterns concurrently rather than a single, uniform observable-state approach.
- Dependency injection is implemented via the third-party `FactoryKit` package. All factories are declared in one file, `berkeley-mobile/BerkeleyMobile+Injection.swift`, as an `extension Container` with computed `Factory<T>` properties, each specifying a lifetime scope: `.shared`, `.singleton`, or the default (new instance per resolution). Consumers inject dependencies with property wrappers: `@Injected(\.homeViewModel)` (UIKit, `MainContainerViewController.swift`) and `@InjectedObservable(\.feedbackFormViewModel)` (SwiftUI, `FeedbackFormView.swift`).
- Some view models are conditionally registered, e.g. `debugViewModel` in `BerkeleyMobile+Injection.swift` is wrapped in `#if DEBUG`.

## Singleton Pattern

Several core services are implemented as singletons via `static let shared`, independent of the `FactoryKit` container:
- `DataManager.shared` (`berkeley-mobile/Data/DataManager.swift`)
- `BMNetworkingManager.shared` (`berkeley-mobile/Data/BMNetworkingManager.swift`)
- `EventsDataService.shared` (`berkeley-mobile/Events/EventDataSource/EventsViewModel.swift`)
- `BMLocationManager.shared` (referenced in `AppDelegate.swift`)

This is a distinct dependency-management pattern from the `FactoryKit`-based view-model registrations described above — the repository uses both a manual singleton pattern (for data/network services) and a DI container (for view models) rather than a single, unified pattern.

## Error Handling Pattern

Domain errors are modeled as `Error`-conforming enums with `LocalizedError` conformance for user-facing messages, e.g. `BMError` (`berkeley-mobile/Data/BMError.swift`), using `NSLocalizedString` for each case's `errorDescription`. Async call sites catch errors with `do`/`catch` and log via `os.Logger` (e.g. `Logger.eventsDataService.error(...)` in `EventsViewModel.swift`, `Logger.feedbackFormConfig.error(...)` in `FeedbackFormViewModel.swift`) and/or surface a `BMAlert` to the UI.

## Concurrency Patterns

The repository mixes two concurrency styles:
- Completion-handler/`DispatchGroup`-based concurrency in older code (`DataManager.fetch`, `DataSource.fetchItems`, `HomeViewModel.fetchHomeSectionsData`).
- Swift structured concurrency (`async`/`await`, `Task { }`, `@MainActor`) in newer code (`BMNetworkingManager`, `EventsViewModel`, `FeedbackFormPresenter.attemptShowFeedbackForm`, `GymOccupancyProvider` in the widget extension).

## Comments/Documentation Style

Inline documentation uses triple-slash (`///`) doc comments on utility methods, e.g. `berkeley-mobile/Utils/Date+Extension.swift`: `/// Returns true if the Date is before noon.` `MARK:` comments are used throughout to segment files into logical sections (e.g. `// MARK: - Firebase`, `// MARK: CalendarEvent Fields`, `// MARK: - UNUserNotificationCenterDelegate`).
