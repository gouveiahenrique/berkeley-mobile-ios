# Code Conventions

## Naming Conventions

### Types

- App-specific types are prefixed with `BM` (e.g. `BMGym`, `BMLibrary`, `BMDiningHall`, `BMColor`, `BMFont`, `BMError`, `BMAlert`, `BMNetworkingManager`).
- Constants structs use capitalised namespacing: `BMConstants`, `BMColor`, `BMFont`.
- Protocols that describe capabilities follow a `Has*` or `Can*` naming convention: `HasLocation`, `HasImage`, `HasOpenTimes`, `HasPhoneNumber`, `CanFavorite`, `HasOpenClosedStatus`, `HasWebsite`, `HasName`.
- View model classes end with `ViewModel` (e.g. `HomeViewModel`, `SafetyViewModel`, `GymOccupancyViewModel`).
- Data source classes end with `DataSource` (e.g. `LibraryDataSource`, `GymDataSource`).
- SwiftUI view structs generally end with `View` (e.g. `HomeView`, `SafetyView`, `TodayView`, `GymOccupancyView`).
- Firestore endpoint constants use `k` prefix as a file-scoped `fileprivate let` (e.g. `kLibrariesEndpoint`, `kGymsEndpoint`, `kDiningHallEndpoint`).

### Files

- Files containing an extension on a standard type use the format `Type+Domain.swift` (e.g. `Date+Extension.swift`, `UserDefaults+Extension.swift`, `Colors+Calendar.swift`).
- Files adding capabilities to the app delegate use `AppDelegate+Domain.swift` (e.g. `AppDelegate+Migration.swift`).

### Code Marks

`// MARK: -` sections are used throughout UIKit and SwiftUI files to organise related methods and properties. Examples: `// MARK: - UNUserNotificationCenterDelegate`, `// MARK: - FeedbackFormPresenterDelegate`, `// MARK: - Public Dictionary Methods`.

## Architectural Patterns

### MVVM

The observed pattern across feature modules is MVVM:

- View models are `ObservableObject` (UIKit-era, `@Published` properties) or Swift Observation `@Observable` (newer SwiftUI screens).
- Views reference view models via FactoryKit injection (`@InjectedObject`, `@InjectedObservable`, `@Injected`).
- View models own data fetching responsibilities and expose `@Published` / `@Observable` state.

### Protocol-oriented data modeling

Data items implement capability protocols rather than inheriting from a common base class. A `BMGym` struct, for example, conforms to `HomeDrawerSectionRowItemType`, `CanFavorite`, `HasPhoneNumber`, and `HasOpenTimes`. This allows shared UI components (`DetailView`, `TagView`, filter logic) to operate on any conforming type.

### `@Display` property wrapper

A custom `@Display` property wrapper is applied to user-visible string properties across model types (e.g. `@Display var name: String`, `@Display var address: String?`). The implementation is in `berkeley-mobile/Data/PropertyWrappers/`.

### UIKit / SwiftUI interoperability

- SwiftUI views hosted inside UIKit contexts use `UIHostingController`.
- UIKit view controllers embedded in SwiftUI use `UIViewControllerRepresentable` (e.g. `HomeMapView` wraps `MapViewController`).
- The `MainContainerViewController` pattern uses `addChild` / `didMove(toParent:)` lifecycle management.

### Singleton pattern

Core services use the `static let shared` singleton pattern: `DataManager.shared`, `BMNetworkingManager.shared`, `BMLocationManager.shared`, `ImageLoader.shared`, `EventsDataService.shared`.

### Dependency injection via FactoryKit

All view model instances are resolved through the FactoryKit `Container` extension in `BerkeleyMobile+Injection.swift`. View models are registered with one of three scopes: unscoped (new instance per resolution), `.shared` (one instance per scope reset), `.singleton` (process-lifetime). Views use the `@Injected`, `@InjectedObject`, and `@InjectedObservable` property wrappers.

### Thread safety for shared mutable state

`AtomicDictionary` (`berkeley-mobile/Utils/AtomicDictionary.swift`) wraps `pthread_rwlock_t` for concurrent reads and exclusive writes. It is used by `DataManager` to store fetched data.

### Notification-based decoupling

`BMLocationManager` publishes location updates via `NotificationCenter.default.post(name: .locationUpdated, ...)`. The notification name is defined as a `Notification.Name` extension.

FCM token updates are broadcast via `NotificationCenter.default.post(name: Notification.Name("FCMToken"), ...)`.

## iOS Version Handling

Several views use `if #available(iOS 26.0, *)` and `if #unavailable(iOS 26.0)` to branch between UI implementations (e.g. `BMActionButton` applies `.glassEffect` on iOS 26 and falls back to a rounded rectangle on earlier versions; `SafetyView` and `SafetyMapView` do the same). `if #available(iOS 17.0, *)` branches appear for `MapCameraBounds` and related MapKit APIs.

## File Organisation

Feature modules are organised as directories under `berkeley-mobile/`:

```
Home/
  Dining/
  Fitness/
  Guides/
  Libraries/
  Map/
  Search/
  Home Drawer/
Today/
  Tiles/
Safety/
Resources/
Events/
FeedbackForm/
Debug/
Data/
  ItemProtocols/
  PropertyWrappers/
Common/
  Images/
  DetailView/
  FilterView/
Drawer/
Utils/
Assets/
  Colors/
  Fonts/
```

Each data source type (`LibraryDataSource`, `GymDataSource`, etc.) is co-located with its model type in a `<Feature>DataSource/` subdirectory under the relevant feature folder.

## Color System

`BMColor` (`berkeley-mobile/Assets/Colors/Colors.swift`) provides semantic color properties as static computed properties that return dynamic `UIColor` values adapting to dark/light mode via `UITraitCollection`. Domain-specific color namespaces are defined as nested structs in extension files (`Colors+Calendar.swift`, `Colors+AlertView.swift`, `Colors+ActionButton.swift`, etc.).

## Font System

`BMFont` (`berkeley-mobile/Assets/Fonts/Fonts.swift`) provides closures returning `UIFont` for the Apercu typeface:

```swift
BMFont.regular(size)
BMFont.bold(size)
BMFont.medium(size)
BMFont.light(size)
BMFont.mediumItalic(size)
```

All closures fall back to `UIFont.systemFont(ofSize:)` if the named Apercu font is not found. In SwiftUI contexts, callers wrap via `Font(BMFont.regular(size))`.

## Logging

`os.Logger` instances are defined per component in `Logger+Ext.swift`, using `Bundle.main.bundleIdentifier!` as the subsystem and the component's type name as the category. Error conditions in view models log via these subsystem-specific loggers rather than `print()`.

## Analytics

Firebase Analytics events are logged via `Analytics.logEvent(_:parameters:)` in view models (e.g. `logOpenedDiningDetailViewAnalytics`, `logAcademicCalendarTabAnalytics`, `logCampuswideTabAnalytics`, `logOpenedDiningHomeSectionAnalytics`). Analytics calls originate from view models, not from views directly.

## SwiftUI Preview Helpers

Files include `#Preview` macro blocks using inline sample data or static helper methods (e.g. `SafetyViewModel.getSampleSafetyLog()`). These are present throughout the codebase for development-time preview support.
