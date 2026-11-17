<!-- steering-agent-last-run: 2026-11-17 21:29 UTC -->
# Code Conventions (observed)

## Naming
- App-specific types use the `BM` prefix: `BMConstants`, `BMError`, `BMNetworkingManager`, `BMLocationManager`, `BMEventCalendarEntry`, `BMAlert`.
- View models end in `ViewModel` (`HomeViewModel`, `ResourcesViewModel`, `SafetyViewModel`); data sources end in `DataSource` (`MapDataSource`, `GymDataSource`).
- Extensions files named `Type+Extension.swift` / `Type+Extensions.swift` in `Utils/`; `AppDelegate+Migration.swift`.
- Constants: file-private `k`-prefixed globals (`kDataSources`, `kLatestLaunchedVersionKey`, `kGymClassesEndpoint`) and nested `private struct Constants` inside types.

## File organization
- Feature folders (`Home`, `Events`, `Safety`, `Resources`, `Today`) with views and `*ViewModel` side by side.
- `// MARK: -` sections used to group code; Xcode-style file header comments with author/copyright.

## Patterns
- Singletons via `static let shared` (`DataManager`, `BMNetworkingManager`).
- Dependency injection via Factory `Container` extension (`BerkeleyMobile+Injection.swift`), with `.shared`/`.singleton` scopes.
- Protocol-based capabilities in `Data/ItemProtocols` (e.g. `HasOpenClosedStatus`, `HasImage`, `CanFavorite`, `SearchItem`).
- Property wrappers in `Data/PropertyWrappers` (e.g. `@Display`).
- Delegates for UIKit components (`DrawerViewDelegate`, `OpenClosedStatusManagerDelegate`); `ObservableObject` view models for SwiftUI.
- App-version migrations in `checkForUpdate()`, with a comment stating not to trim old migrations.
- Linter/formatter configuration (e.g. SwiftLint): not found in inspected repository areas.
