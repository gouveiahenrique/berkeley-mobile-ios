# Code Conventions

## Naming Conventions

- **Type prefix**: Application-specific model, manager, and utility types are commonly prefixed `BM` (e.g. `BMError`, `BMConstants`, `BMLocationManager`, `BMNetworkingManager`, `BMEventManager`, `BMLibrary`, `BMGym`, `BMDiningLocation`, `BMEventCalendarEntry`, `BMCalendarEvent`, `BMAlert`, `BMActionButton`, `BMDrawerView`, `BMFilterButton`, `BMSegmentedControlView`, `BMTopBlobView`, `BMCachedAsyncImageView`, `BMContentUnavailableView`, `BMHomeSectionListView`). At least 20 files under `berkeley-mobile/` use this prefix.
- **View suffix**: SwiftUI view structs are named with a `View` suffix (58 files matching `*View.swift`, e.g. `HomeView.swift`, `SafetyView.swift`, `EventsView.swift`, `CalendarView.swift`).
- **ViewModel suffix**: `ObservableObject` view-model classes are named with a `ViewModel` suffix (13 files matching `*ViewModel.swift`, e.g. `HomeViewModel.swift`, `EventsViewModel.swift`, `SafetyViewModel.swift`, `ResourcesViewModel.swift`, `GuidesViewModel.swift`, `DebugViewModel.swift`, `FeedbackFormViewModel.swift`).
- **DataSource suffix**: Firestore-backed fetch implementations are named `<Feature>DataSource` and conform to the `DataSource` protocol (`MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource` — see `berkeley-mobile/Data/DataSource.swift`).
- **Type extension files**: Extensions on framework types follow a `TypeName+Extension.swift` or `TypeName+Ext.swift` pattern in `berkeley-mobile/Utils/` (e.g. `Date+Extension.swift`, `String+Extension.swift`, `Collection+Extension.swift`, `UIView+Extensions.swift`, `UIViewController+Extensions.swift`, `NSCoding+Extension.swift`, `TimeInterval+Ext.swift`, `Logger+Ext.swift`).
- **File-scoped constants**: Endpoint names and file-local constants are declared `fileprivate let k<Name>` (e.g. `kLibrariesEndpoint`, `kGymsEndpoint`, `kMapEndpoint`, `kGymClassesEndpoint`, `kDiningHallEndpoint`, `kLatestLaunchedVersionKey`, `kViewMargin`, `kCardPadding`), observed across `Data/DataSource.swift`-conforming files and detail view controllers.
- **Nested `Constants` structs**: Some types define a private nested `struct Constants` or `struct ArgumentNames` holding string/layout literals scoped to that type (e.g. `ArgumentNames` in `berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift:12`, `Constants` in `berkeley-mobile/Utils/View+Extension.swift:136` and `berkeley-mobile/Home/Map/MapViewController.swift`).

## File Organization

- Feature code is grouped by screen/domain under `berkeley-mobile/<Feature>/`, with data-access code isolated into a `<Feature>DataSource/` subfolder where a feature reads from Firestore (e.g. `Home/Map/MapDataSource/`, `Home/Libraries/LibraryDataSource/`, `Home/Fitness/GymDataSource/`, `Events/EventDataSource/`). See `docs/structure.md` for the full folder map.
- Cross-cutting UI components live in `Common/`; cross-cutting non-UI utilities/extensions live in `Utils/`; app-wide singletons and protocols live in `Data/`.
- Every source file observed begins with a standard Xcode header comment block (filename, project name, author, copyright line), e.g.:
  ```swift
  //
  //  DataManager.swift
  //  bm-persona
  //
  //  Created by Kevin Hu on 12/5/19.
  //  Copyright © 2019 RJ Pimentel. All rights reserved.
  //
  ```
  Newer files use `berkeley-mobile` as the project name and `ASUC OCTO` as the copyright holder (e.g. `berkeley-mobile/Data/BMError.swift`).

## Architectural Patterns

- **Protocol-oriented data access**: Feature data sources conform to the `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift`) exposing a static `fetchItems(_:)` and a static `fetchDispatch: DispatchGroup`, and are invoked centrally through `DataManager.shared` (`berkeley-mobile/Data/DataManager.swift`).
- **Small capability protocols composed on models**: Model types conform to multiple narrow protocols rather than one large interface, e.g. `BMEventCalendarEntry: NSObject, NSCoding, Identifiable, BMCalendarEvent, HasImage, CanFavorite` (`berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift:11`). Capability protocols live in `berkeley-mobile/Data/ItemProtocols/`.
- **Dependency injection via FactoryKit**: View models are registered as `Factory<T>` properties on `Container` in `berkeley-mobile/BerkeleyMobile+Injection.swift`, using `.shared` or `.singleton` scopes, and consumed via `@Injected`/`@InjectedObject`/`@InjectedObservable` property wrappers (e.g. `@InjectedObject(\.calendarViewModel)` in `berkeley-mobile/Events/CalendarView.swift:63`, `@Injected(\.feedbackFormPresenter)` in `berkeley-mobile/TabBarController.swift:15`).
- **SwiftUI hosted inside UIKit**: The root `TabBarController` (UIKit) hosts SwiftUI screens via `UIHostingController` (e.g. `UIHostingController(rootView: TodayView())` in `berkeley-mobile/TabBarController.swift`), indicating a UIKit shell with SwiftUI feature screens.
- **`@propertyWrapper` for value sanitization**: `Display` (`berkeley-mobile/Data/PropertyWrappers/Display.swift`) wraps `String`/`String?` properties to trim whitespace and strip invalid characters on write.
- **Singletons for app-wide services**: `DataManager.shared`, `BMLocationManager.shared`, `BMNetworkingManager.shared` are singletons (`static let shared = ...`) providing single points of access to data-fetching and location services.
- **Custom `Error` enums conforming to `LocalizedError`**: `BMError` (`berkeley-mobile/Data/BMError.swift`) supplies user-facing `errorDescription` strings via `NSLocalizedString`.

## Section Organization Within Files

`// MARK:` comments are used to delineate sections within some files (e.g. 3 occurrences in `berkeley-mobile/AppDelegate.swift` separating `UNUserNotificationCenterDelegate` and `MessagingDelegate` extensions), though usage is not universal — some files (e.g. `berkeley-mobile/Home/HomeViewModel.swift`, `berkeley-mobile/Data/DataManager.swift`) contain no `// MARK:` comments.

## Not Found in Codebase

- No `.swiftlint.yml`, `.swiftformat`, or other linter/formatter configuration file was found, so no repository-enforced style-linting rules can be documented beyond the patterns observed directly in source.
