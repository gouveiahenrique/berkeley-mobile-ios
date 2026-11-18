<!-- steering-agent-last-run: 2026-11-18 12:26 UTC -->
# Code Conventions (observed)

- Naming: app types use `BM` prefix (`BMConstants`, `BMError`, `BMNetworkingManager`, `BMLocationManager`); view models end in `ViewModel`; data sources end in `DataSource`; extension files named `Type+Extension.swift` / `+Ext`/`+Extensions`.
- Organization: feature folders (Home, Today, Safety, Resources, Events); `// MARK: -` sections used across the code.
- Singletons: `static let shared` (`DataManager`, `BMNetworkingManager`, `BMLocationManager`).
- DI: `FactoryKit` `Container` properties with `.shared` / `.singleton` scopes, `@Injected(\.x)` in `TabBarController`; `@MainActor` closures for main-actor view models.
- UI: mix of UIKit view controllers and SwiftUI views, bridged with `UIHostingController`.
- Constants: private nested `Constants` structs inside types; file-level `fileprivate let k...` constants for endpoints; `UserDefaultsKeys` enum for UserDefaults keys.
- Concurrency: async/await in newer files; `DispatchGroup`/completion handlers in older `DataSource` files; `AtomicDictionary` for thread-safe storage.
- Logging: `os.Logger` static instances in `Logger+Ext.swift`.
- Debug code guarded by `#if DEBUG`.
- Linter config (e.g. `.swiftlint.yml`): Not found in codebase.
- File headers: Xcode template header comment with author, date and "ASUC OCTO" copyright.
