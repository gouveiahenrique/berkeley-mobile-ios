<!-- steering-agent-last-run: 2026-10-29 13:05 UTC -->
# Code Conventions (observed)

## Naming
- App-specific types use a `BM` prefix: `BMNetworkingManager`, `BMError`, `BMConstants`, `BMLocationManager`, `BMSafetyLog`, `BMResourceCategory`, `BMDiningHall`, `BMActionButton`.
- Data sources: `<Feature>DataSource` (`MapDataSource`, `GymDataSource`). View models: `<Feature>ViewModel`.
- Capability protocols are named `Has*` (`HasName`, `HasLocation`, `HasOpenTimes`) in `Data/ItemProtocols/`; `CanFavorite`, `SearchItem`.
- Extensions are in `Utils/` named `<Type>+Extension.swift` / `+Extensions.swift` / `+Ext.swift` (inconsistent suffix).
- File-private constants use a `k` prefix (`kMapEndpoint`, `kDataSources`, `kBookingURL`).

## Organization
- Feature-based folders (`Home/Map`, `Events`, `Safety`, ...); sources grouped inside with `DataSource` subfolders.
- `// MARK: -` section comments (e.g. `BMNetworkingManager`, `AppDelegate`).
- File header comments with author/date/copyright.

## Patterns
- Singletons via `static let shared` (`DataManager`, `BMNetworkingManager`).
- Dependency injection with FactoryKit `Container` extensions (`.shared`, `.singleton` scopes) in `BerkeleyMobile+Injection.swift`; `#if DEBUG` guards `debugViewModel`.
- Mixed UI stack: UIKit view controllers and SwiftUI views; view models use `@Observable` or `ObservableObject`.
- Callback-based `DataSource` with `DispatchGroup` and `async/await` in `BMNetworkingManager`.
- Localized strings via `NSLocalizedString` in `BMError`.
- Linter/formatter config (`.swiftlint.yml` etc.): Not found in inspected repository areas.
