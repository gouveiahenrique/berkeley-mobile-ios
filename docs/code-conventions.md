# Code Conventions

## File Header Comments

Swift files in the repository consistently begin with a standard Xcode-generated header block, e.g. (`berkeley-mobile/Home/Search/SearchViewModel.swift`):

```swift
//
//  SearchViewModel.swift
//  berkeley-mobile
//
//  Created by Baurzhan on 3/19/25.
//  Copyright © 2025 ASUC OCTO. All rights reserved.
//
```

This pattern (filename, module name, author/date, ASUC OCTO copyright) was observed across files spanning multiple authors and years (2019–2026), including `berkeley-mobile/AppDelegate.swift`, `berkeley-mobile/Data/PropertyWrappers/Display.swift`, `berkeley-mobile/Safety/SafetyViewModel.swift`, and `BerkeleyMobileWidget/GymOccupancyWidget.swift`.

## Naming Conventions

### `BM` prefix for model/utility types

Several model, manager, and reusable-UI types use a `BM` (Berkeley Mobile) prefix, both in type name and filename. Confirmed instances include: `BMColor`, `BMConstants`, `BMError`, `BMEventCalendarEntry`, `BMEventManager`, `BMLocationManager`, `BMNetworkingManager`, `BMGym`, `BMLibrary`, `BMDiningLocation`, `BMCalendarEvent`, `BMDrawerView`, `BMActionButton`, `BMAlert`, `BMFilterButton`, `BMTopBlobView`, `BMSegmentedControlView`, `BMCachedAsyncImageView`, `BMContentUnavailableView`, `BMAddedCalendarStatusOverlayView`, `BMHomeSectionListView`. This prefix is not applied universally — many types (e.g. `HomeViewModel`, `DataManager`, `DataSource`, `CalendarView`, `MapViewController`) do not use it. The prefix appears concentrated in domain models, cross-cutting managers/singletons, and some shared UI components.

### `*ViewModel` suffix

View model types consistently use the `ViewModel` suffix in both type name and filename, one per feature area, e.g.: `HomeViewModel`, `DiningHallsViewModel`, `GymOccupancyViewModel`, `SearchViewModel`, `SafetyViewModel`, `ResourcesViewModel`, `GuidesViewModel`, `FeedbackFormViewModel`, `EventsViewModel`, `DebugViewModel`, `HomeDrawerPinViewModel`, `NewsDataViewModel`, `WeatherDataViewModel`.

### Protocol naming

Protocols observed in the repository follow several recurring shapes, without one single universal rule:
- Descriptive-capability protocols named `Has<Noun>` or `Can<Verb>`: `HasImage`, `HasLocation`, `HasName`, `HasOpenTimes`, `HasOpenClosedStatus`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite` (all in `berkeley-mobile/Data/ItemProtocols/`).
- Delegate protocols named `<Type>Delegate`: `DrawerViewDelegate`, `SearchDrawerViewDelegate`, `MainDrawerViewDelegate`, `OpenClosedStatusManagerDelegate`, `FeedbackFormPresenterDelegate`, `MapMarkerDetailViewDelegate`, `FilterViewDelegate`, `DetailViewDelegate`, `SearchResultsViewDelegate`.
- Data-contract protocols with domain-specific names: `DataSource`, `SearchItem`, `BMCalendarEvent`, `HomeDrawerSectionRowItemType`, `MenuItemIconCaching`.

### Constants

Firestore collection-name string literals are frequently declared as `fileprivate let k<Name>` module-level constants directly above the type that uses them, e.g. `kGymClassesEndpoint` in `berkeley-mobile/Home/Fitness/GymClassDataSource/GymClassDataSource.swift`, `kMapEndpoint` in `MapDataSource.swift`, `kLibrariesEndpoint` in `LibraryDataSource.swift`, `kGymsEndpoint` in `GymDataSource.swift`. Other collection names are centralized as `static let` members of `BMConstants` (`berkeley-mobile/Data/BMConstants.swift`), e.g. `safetyLogsCollectionName`, `resourceCategoriesCollectionName`. Both patterns coexist; `DiningHallsViewModel.swift` uses a third variant, declaring `fileprivate let kDiningHallAdditionalDataEndpoint` / `kDiningHallEndpoint` directly in its own file.

### Extension file naming

Swift extensions on both first-party and system types are split into dedicated files named `<TypeBeingExtended>+<Purpose>.swift`, placed under `berkeley-mobile/Utils/` for system-type extensions (e.g. `Date+Extension.swift`, `String+Extension.swift`, `CLLocation+Extension.swift`, `Collection+Extension.swift`, `UIView+Extensions.swift`, `UIViewController+Extensions.swift`, `UIImage+Extensions.swift`, `UIStackView+Extensions.swift`, `UIScrollView+GestureRecognizer.swift`, `UIDevice+Extensions.swift`, `NSCoding+Extension.swift`, `TimeInterval+Ext.swift`, `Logger+Ext.swift`, `View+Extension.swift`, `UserDefaults+Extension.swift`) and colocated with the primary type for first-party extensions (e.g. `berkeley-mobile/Assets/Colors/Colors+ActionButton.swift`, `Colors+Calendar.swift`, `Colors+Event.swift`, `Colors+GymClass.swift`, `Colors+MapMarker.swift`, `Colors+Resource.swift`, `Colors+StudyPact.swift`, `Colors+TagView.swift`, `Colors+Text.swift`, `Colors+AlertView.swift`, all extending `BMColor` defined in `Colors.swift`). `berkeley-mobile/BerkeleyMobile+Injection.swift` and `berkeley-mobile/AppDelegate+Migration.swift` follow the same `<Type>+<Purpose>.swift` naming for app-level extensions.

## Code Organization Within Files

`// MARK:` comments are used to divide files into logical sections (124 occurrences across 51 files under `berkeley-mobile/`, per repository-wide search), e.g. `// MARK: - UNUserNotificationCenterDelegate`, `// MARK: - MessagingDelegate` in `berkeley-mobile/AppDelegate.swift`, and `// MARK: CalendarEvent Fields` in `berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift`. Extension blocks on the primary type declared in a file are a recurring pattern for grouping protocol conformance (e.g. `extension AppDelegate: UNUserNotificationCenterDelegate { ... }`, `extension AppDelegate: MessagingDelegate { ... }`, both in `berkeley-mobile/AppDelegate.swift`; `extension DiningHallsViewModel: OpenClosedStatusManagerDelegate { ... }` in `DiningHallsViewModel.swift`).

## Property Wrappers

The repository defines at least one custom `@propertyWrapper`: `Display<T>` (`berkeley-mobile/Data/PropertyWrappers/Display.swift`), constrained to `T == String` or `T == String?`, which trims whitespace/newlines and strips a specific invalid-character sequence (`�`) on write. It is applied to display-facing model fields, e.g. `@Display var name: String` and `@Display var descriptionText: String?` in `berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift`.

## State Management Patterns

Two Swift state-management approaches coexist in view model types (see `docs/tech.md` for detail): the older Combine-based `ObservableObject` + `@Published` pattern (e.g. `HomeViewModel`), and the newer Observation-framework `@Observable` macro pattern (e.g. `DiningHallsViewModel`, `SearchViewModel`, `GymOccupancyViewModel`). `@Observable` classes use `@ObservationIgnored` to exclude properties (typically closures/timers) from observation tracking, e.g. `@ObservationIgnored private var timer: Timer?` in `GymOccupancyViewModel`.

## Dependency Injection

View model instantiation is centralized through `Factory` (`FactoryKit`) registrations in `berkeley-mobile/BerkeleyMobile+Injection.swift`, an extension on `Container` exposing one computed `Factory<T>` property per view model, using explicit `Factory` scopes (`.shared`, `.singleton`, or unscoped/default) rather than instantiating view models ad hoc at call sites. SwiftUI views consume injected view models via the `@InjectedObject` property wrapper (e.g. `berkeley-mobile/Events/CalendarView.swift`: `@InjectedObject(\.calendarViewModel) private var viewModel`).

## Logging

`os.Logger` (Apple's unified logging system) is used in newer files (e.g. `Logger.diningHallsViewModel.error("\(error)")` in `berkeley-mobile/Home/Dining/DiningDataSource/DiningHallsViewModel.swift`, via `berkeley-mobile/Utils/Logger+Ext.swift`), while older data-source code uses `print(...)` directly for error reporting (e.g. `GymClassDataSource.fetchItems`). Both approaches coexist in the repository.
