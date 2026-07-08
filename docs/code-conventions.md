# Code Conventions

## Naming Conventions

### Types
- Custom types use the `BM` prefix for domain model types: `BMLibrary`, `BMDiningHall`, `BMGym`, `BMSafetyLog`, `BMFont`, `BMColor`, `BMLocationManager`, `BMNetworkingManager`, `BMAlert`, `BMCalendarEvent`.
- Protocol names are descriptive and unprefixed: `SearchItem`, `HasLocation`, `CanFavorite`, `HasImage`, `HasOpenTimes`, `DetailView`, `DetailViewDelegate`, `DataSource`.
- Enum cases use camelCase: `case thisWeek`, `case aggravatedAssault`, `case rsf`.

### Constants
- File-scoped private constants use the `k` prefix: `kViewMargin`, `kCardPadding`, `kDataSources`, `kMapEndpoint`, `kGymsEndpoint`, `kGymClassesEndpoint`, `kDiningHallEndpoint`.
- App-wide string constants are grouped in `BMConstants` (`berkeley-mobile/Data/BMConstants.swift`).
- `UserDefaults` keys are centralized in the `UserDefaultsKeys` enum (`berkeley-mobile/Utils/UserDefaults+Extension.swift`).

### Methods
- Delegate callback methods follow Apple UIKit patterns: `func feedbackFormDidPresent(withViewController:)`, `func detailsUpdated(for:)`.
- `@objc` selector methods are named after their action: `toggleFave(sender:)`, `locationUpdated(_:)`, `addressTapped(_:)`.

### Files
- Extensions are named `TypeName+Feature.swift`: `AppDelegate+Migration.swift`, `UserDefaults+Extension.swift`, `UIImage+Extensions.swift`, `Logger+Ext.swift`, `Colors+ActionButton.swift`.
- View models follow the `<Feature>ViewModel` pattern: `SafetyViewModel`, `DiningHallsViewModel`, `GymOccupancyViewModel`, `SearchViewModel`, `HomeViewModel`.
- Data sources follow the `<Feature>DataSource` pattern: `GymDataSource`, `LibraryDataSource`, `MapDataSource`, `GymClassDataSource`.

## File Organization

- Each file begins with a standard comment block including filename, project, author, and copyright year.
- `MARK: -` pragmas are used to section files: `// MARK: - DataSource`, `// MARK: UISceneSession Lifecycle`, `// MARK: - MessagingDelegate`.
- Protocol conformances are placed in separate `extension` blocks: `extension AppDelegate: MessagingDelegate`, `extension BMLibrary: Hashable`, `extension SafetyViewModel`.

## Architectural Patterns

### Protocol-Oriented Model Design
Model types conform to capability protocols instead of inheriting from base classes. For example:
- `BMLibrary` conforms to `HomeDrawerSectionRowItemType`, `CanFavorite`, `HasPhoneNumber`, `HasOpenTimes`.
- `BMDiningHall` conforms to `HomeDrawerSectionRowItemType`, `HasPhoneNumber`, `HasOpenClosedStatus`, `Hashable`.
- `SearchItem` extends `HasName`; `HasLocation` provides a default `distanceToUser` implementation.

### Singleton Services
Core services are singletons accessed via `.shared`: `DataManager.shared`, `BMLocationManager.shared`, `BMNetworkingManager.shared`, `ImageLoader.shared`.

### DataSource Pattern
Data fetching from Firestore is encapsulated in `DataSource`-conforming classes. `DataManager` holds a static list of registered sources and dispatches fetches using `DispatchGroup`. Each source uses its own `fetchDispatch: DispatchGroup` to prevent duplicate Firestore calls.

### Observable / @Observable ViewModels
Newer view models use the `@Observable` macro (Swift Observation framework): `DiningHallsViewModel`, `GymOccupancyViewModel`, `SearchViewModel`. Older patterns use `ObservableObject` with `@Published`: `SafetyViewModel`.

### Dependency Injection via FactoryKit
All view models and services are registered in `BerkeleyMobile+Injection.swift` as `Factory` instances. Property wrappers `@Injected`, `@InjectedObject`, `@InjectedObservable` are used at injection sites throughout SwiftUI views and UIKit view controllers.

### UIKit and SwiftUI Interoperability
UIKit view controllers are bridged into SwiftUI using `UIViewControllerRepresentable` (`HomeMapView` wrapping `MapViewController`) and `UIHostingController` (used for all four tab bar children and feedback form presentation).

### Notification-Based Reactivity
`BMLocationManager` broadcasts location updates via `NotificationCenter`. Views and view models observe `.locationUpdated` using `addObserver(_:selector:name:object:)`. This pattern is observed in `LocationDetailView`.

### Property Wrappers on Model Fields
The `@Display` property wrapper is applied to model fields across `BMLibrary`, `BMGym`, `GymClass`, `BMEventCalendarEntry`. Its implementation was not directly inspected, but observed usage suggests it marks fields for display in generic detail views.

## Error Handling

- Data source errors print to console with a location tag: `print("[Error @ MapDataSource.fetchItems()]: \(err)")`.
- `BMNetworkingManager` methods use Swift `async throws`; callers catch errors and assign `BMAlert` objects for UI presentation.
- `SafetyViewModel` catches fetch errors and surfaces them via `self.alert = BMAlert(title:message:type:)`.
- The `ImageLoader` ignores `NSURLErrorCancelled` errors and reports other errors through the completion callback.

## Concurrency

- Legacy data sources use callback-based GCD patterns with `DispatchQueue.main.async` for UI updates.
- Newer code uses Swift Concurrency (`async/await`, `Task`, `@MainActor`).
- `AtomicDictionary` is used by `DataManager` for thread-safe storage of fetched items.
- `GymOccupancyViewModel.fetchOccupancyPercentages()` uses `withTaskGroup` for parallel Firestore document fetches.

## Design Tokens

- Colors are defined in `BMColor` (`berkeley-mobile/Assets/Colors/Colors.swift`) with dark-mode adaptive variants using `UIColor { trait in ... }` closures.
- Typography uses `BMFont` (`berkeley-mobile/Assets/Fonts.swift`) wrapping the Apercu font family (Regular, Bold, Medium, MediumItalic, Light) with system font fallbacks.
