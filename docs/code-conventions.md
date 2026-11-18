<!-- steering-agent-last-run: 2026-11-18 18:30 UTC -->
# Code Conventions (observed)

## Naming
- App-specific types use a `BM` prefix: `BMConstants`, `BMNetworkingManager`, `BMLocationManager`, `BMEventManager`, `BMColor`, `BMFont`, `BMError`, `BMAlert`.
- Feature files: `<Feature>View.swift`, `<Feature>ViewModel.swift`, `<Feature>DataSource.swift`, `<Feature>ViewController.swift`.
- Item capabilities are protocols named `Has*` / `Can*` in `Data/ItemProtocols/`.
- Extensions: files named `<Type>+Extension.swift` / `+Extensions.swift` in `Utils/`.

## Patterns
- Singletons via `static let shared` (`DataManager`, `BMNetworkingManager`, `BMLocationManager`).
- DI through FactoryKit `Container` extensions with `.shared` / `.singleton` scopes; `@Injected(\.name)` property wrapper in `TabBarController`.
- View models: `@Observable` classes (e.g. `GymOccupancyViewModel`); `@ObservationIgnored` on non-observed members.
- Nested `private struct Constants` for per-type constants (`MapViewController`, `GuidePlacesStackedCollageView`, `OpenClosedStatusManager`).
- `// MARK: -` section comments; `///` doc comments on some types/functions.
- Thread-safe store: `AtomicDictionary` used by `DataManager`.
- File header comment with filename, author, date, `Copyright © ... ASUC OCTO`.
- Migrations are appended in `AppDelegate+Migration.checkForUpdate` (doc comment states old migrations should not be trimmed).
- Debug-only code gated by `#if DEBUG` (`debugViewModel`).

## Not found in codebase
A linter or formatter configuration file (SwiftLint/SwiftFormat) was not found at the repository root.
