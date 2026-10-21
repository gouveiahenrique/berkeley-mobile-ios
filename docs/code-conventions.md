<!-- steering-agent-last-run: 2026-10-21 16:32 UTC -->
# Code Conventions

Observed in inspected files; not an exhaustive audit.

## Naming
- App-specific types use a `BM` prefix: `BMNetworkingManager`, `BMEventManager`, `BMLocationManager`, `BMError`, `BMConstants`, `BMSafetyLog`, `BMAlert`, `BMColor`, `BMFont`.
- View models are named `<Feature>ViewModel` (`SafetyViewModel`, `HomeViewModel`, `ResourcesViewModel`, `EventsViewModel`).
- Data sources are named `<Feature>DataSource` and live in `<Feature>/<Feature>DataSource/` folders.
- Extension files use `Type+Extension.swift` or `Type+Ext.swift` (`Date+Extension.swift`, `TimeInterval+Ext.swift`, `UIView+Extensions.swift`).
- Protocol files in `Data/ItemProtocols` use `Has<Capability>` names (`HasName`, `HasLocation`, `HasOpenTimes`).

## File organization
- Feature-based folders under `berkeley-mobile/` (Home, Today, Safety, Resources, Events, FeedbackForm).
- `// MARK: - Section` comments separate sections and extensions (e.g. `AppDelegate.swift`, `SafetyViewModel.swift`, `TabBarController.swift`).
- Files begin with the Xcode header comment (file name, author, copyright).

## Patterns
- SwiftUI view models are `ObservableObject` classes with `@Published` properties (`SafetyViewModel`).
- UIKit/SwiftUI interop via `UIHostingController` (`TabBarController`, `MainContainerViewController`).
- Dependency injection via FactoryKit: `extension Container { var xViewModel: Factory<X> { self { X() }.shared / .singleton } }` in `BerkeleyMobile+Injection.swift`; consumed with `@Injected(\.x)` or `Container.shared.x.resolve()`. Some factories use `@MainActor` closures.
- Singletons via `static let shared` (`DataManager`, `BMNetworkingManager`, `BMLocationManager`).
- Newer networking code uses `async throws`; older code uses completion handlers (`DataSource.fetchItems`, `DataManager.fetch`) and `DispatchGroup`.
- Delegate protocols with extension default implementations for UIKit drawers (`MainDrawerViewDelegate`).
- Debug-only code is guarded with `#if DEBUG`.
- Doc comments use `///` or `/** */` on some types and functions (`Version`, `DataManager`).
