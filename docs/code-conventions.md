# Code Conventions

## Naming Conventions

### Types
- Classes, structs, enums, and protocols use `UpperCamelCase`.
- App-specific types are prefixed with `BM` (e.g., `BMColor`, `BMFont`, `BMLibrary`, `BMGym`, `BMLocationManager`, `BMNetworkingManager`, `BMEventCalendarEntry`, `BMSafetyLog`, `BMAlert`, `BMDrawerView`, `BMCalendarEvent`, `BMCalendarEvent`).
- Color namespacing uses nested structs on `BMColor` (e.g., `BMColor.Calendar`, `BMColor.MapMarker`, `BMColor.Resource`).

### Constants
- File-private module-level constants use a `k` prefix in `camelCase` (e.g., `kMapEndpoint`, `kLibrariesEndpoint`, `kGymsEndpoint`, `kGymClassesEndpoint`, `kDataSources`).
- Struct-scoped constants are organized in a private `Constants` struct (e.g., `MapViewController.Constants`, `OpenClosedStatusManager.Constants`).

### Methods
- Methods and properties use `lowerCamelCase`.
- Static factory methods on data sources follow the pattern `fetchItems(_:)` and `parseXxx(_:)`.
- `@objc` notification-handler methods use descriptive names (e.g., `appWillEnterForeground`, `appDidEnterBackground`, `userLocationIsUpdated`).

### Files
- File names match the primary type they define (e.g., `BMLocationManager.swift`, `DataManager.swift`).
- Extensions of existing types use `TypeName+Extension.swift` (e.g., `Date+Extension.swift`, `View+Extension.swift`, `UserDefaults+Extension.swift`).
- Extensions of `AppDelegate` for isolated concerns use `AppDelegate+Topic.swift` (e.g., `AppDelegate+Migration.swift`).
- Injection extension follows `ProductName+Injection.swift` (`BerkeleyMobile+Injection.swift`).

## Architectural Patterns

### MVVM
The application uses Model-View-ViewModel. Views (SwiftUI `View` structs and UIKit view controllers) observe `ObservableObject` view models. View models are injected via FactoryKit.

### Singleton Services
Several infrastructure objects are implemented as singletons accessed via a `static let shared` property:
- `DataManager.shared`
- `BMNetworkingManager.shared`
- `BMLocationManager.shared`

### DataSource Protocol
The `DataSource` protocol (`DataSource.swift`) defines a `fetchItems` + `fetchDispatch` contract for classes that load data from Firestore. All conforming types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`, `GymClassDataSource`) are class types with static methods.

### Dependency Injection via FactoryKit
All view model instances are registered in `BerkeleyMobile+Injection.swift` as `Factory` providers on `Container`. Views use `@Injected`, `@InjectedObservable`, and `@InjectedObject` property wrappers. Factory scopes used: `.shared` (shared within a lifetime scope) and `.singleton` (process-lifetime singleton).

### UIKit / SwiftUI Interop
- SwiftUI views are embedded in UIKit hierarchies using `UIHostingController` (e.g., `TodayView`, `SafetyView`, `ResourcesView`, `HomeView` embedded in `TabBarController` and `MainContainerViewController`).
- UIKit view controllers are wrapped for SwiftUI using `UIViewControllerRepresentable` (e.g., `HomeMapView` wrapping `MapViewController`).

### NotificationCenter for Cross-Component Communication
`BMLocationManager` broadcasts location updates via `NotificationCenter.default` using the `BMLocationManager.locationUpdated` notification name. `OpenClosedStatusManager` observes `UIApplication.willEnterForegroundNotification` and `UIApplication.didEnterBackgroundNotification`.

### Property Wrappers
- `@Display` (`Display.swift`) — applied to `String` and `String?` fields on model types; trims whitespace and strips the replacement character on assignment.

## File Organization

- Feature code is organized by feature directory under `berkeley-mobile/` (e.g., `Home/`, `Today/`, `Safety/`, `Resources/`, `Events/`, `FeedbackForm/`).
- Shared infrastructure lives in `Data/`, `Common/`, and `Utils/`.
- Design tokens (colors, fonts) live in `Assets/Colors/` and `Assets/Fonts/`.

## MARK Comments

Swift `// MARK: -` comments are used throughout to separate logical sections within files (e.g., `// MARK: UISceneSession Lifecycle`, `// MARK: - UNUserNotificationCenterDelegate`, `// MARK: - Private Methods`, `// MARK: - Sample Data`).

## Error Logging
Errors from callback-based data sources are logged to the console using the format:
```
print("[Error @ ClassName.methodName()]: \(err)")
```

## iOS Version Compatibility
Code branches on `if #available(iOS 26.0, *)` (and `iOS 17.0`) to adopt newer APIs (glass effects, content transitions, confirm button roles) while providing fallback implementations for older OS versions.

## Recurring Implementation Patterns

### Open/Closed Hours
Items that have operating hours conform to `HasOpenClosedStatus` and/or `HasOpenTimes`. Hours are modeled as `WeeklyHours` (a `[DayOfWeek: [HoursInterval]]` wrapper). `OpenClosedStatusManager` schedules `Timer` objects to fire at the next open/close boundary for registered items.

### Detail Views
Campus entities (dining halls, gyms, libraries, map markers) share common detail view infrastructure under `Common/DetailView/` providing consistent card-based layouts for open times, overviews, and location information.

### Alert Presentation
Error and confirmation alerts are presented through a `BMAlert` model published on view models; the `.presentAlert(alert:)` view modifier on `View` applies a consistent `.alert` presentation pattern.
