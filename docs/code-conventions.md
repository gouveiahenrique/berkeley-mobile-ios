<!-- steering-agent-last-run: 2026-11-17 20:35 UTC -->
# Code Conventions (observed)

- Naming: project types use the `BM` prefix (`BMConstants`, `BMError`, `BMNetworkingManager`, `BMEventManager`, `BMLocationManager`, `BMColor`, `BMFont`).
- Files: extensions named `Type+Extension.swift` / `Type+Ext.swift` (`UserDefaults+Extension.swift`, `Logger+Ext.swift`, `AppDelegate+Migration.swift`).
- File headers: Xcode-style comment header with author, date and "ASUC OCTO" copyright.
- Sections: `// MARK: -` used to group code (e.g. `AppDelegate`, `BMNetworkingManager`).
- Singletons: `static let shared` (`DataManager`, `BMNetworkingManager`, `BMLocationManager`).
- Dependency injection: FactoryKit `Container` extensions returning `Factory<T>` with `.shared` or `.singleton` scope; consumed with `@Injected(\.name)` or `Container.shared.x.resolve()`.
- Protocols: capability protocols in `Data/ItemProtocols` (`HasName`, `HasLocation`, `CanFavorite`, ...).
- Typed UserDefaults keys: `UserDefaultsKeys` enum with typed `UserDefaults` extensions.
- Concurrency: async/await in `BMNetworkingManager` and `BMEventManager`; `DispatchGroup` and completion handlers in `DataManager`/`DataSource`; `AtomicDictionary` for shared storage; `@MainActor` closures in several factories.
- UI: SwiftUI views with `ObservableObject` view models; UIKit view controllers for map/drawer; shared via `UIHostingController`.
- Logging: `os.Logger` static instances in `Utils/Logger+Ext.swift`; some `print` usage (`AppDelegate+Migration.swift`).
- Debug-only code wrapped in `#if DEBUG`.
- Lint/format config (SwiftLint, SwiftFormat): Not found in codebase.
