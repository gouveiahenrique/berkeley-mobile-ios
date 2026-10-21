<!-- steering-agent-last-run: 2026-10-21 13:37 UTC -->
# Code Conventions

## Naming
- Types prefixed `BM` for app-specific models/components: `BMGym`, `BMLibrary`, `BMDiningHall`, `BMAlert`, `BMColor`, `BMFont`, `BMLocationManager`, `BMEventManager`.
- Suffixes: `...ViewModel`, `...DataSource`, `...Manager`, `...View`, `...ViewController`, `...Presenter`.
- Firestore endpoint constants: `fileprivate let kXxxEndpoint = "..."`; other constants use `k` prefix too (`kDataSources`, `kLatestLaunchedVersionKey`).
- Extensions in files named `Type+Extension.swift`, `Type+Extensions.swift`, `Type+Ext.swift`, or `Type+Feature.swift` (`AppDelegate+Migration.swift`).
- Files carry the Xcode header comment (file name, author, `Copyright © <year> ASUC OCTO`); older files show `bm-persona` as the project name.

## File organization
- Feature folders (`Home/Dining`, `Events`, `Safety`, ...) with `DataSource` subfolders for fetch/model code; shared UI in `Common/`; extensions in `Utils/`.
- `// MARK: -` section comments for delegate extensions (`AppDelegate`, `TabBarController`).

## Patterns
- Mixed UIKit/SwiftUI: SwiftUI screens hosted via `UIHostingController` in `TabBarController`.
- Newer view models use the Observation framework (`@Observable`, `@MainActor`), e.g. `EventsViewModel`, `DiningHallsViewModel`, `GymOccupancyViewModel`; SwiftUI views read them with `@InjectedObservable(\.keyPath)`; UIKit uses `@Injected`.
- Factory scopes in `Container`: `.shared` and `.singleton`.
- Typed `UserDefaults` access through `UserDefaultsKeys` enum and extension methods.
- Delegate protocols with `weak var delegate` (`FeedbackFormPresenterDelegate`, `OpenClosedStatusManagerDelegate`).
- Concurrency: both `DispatchGroup`/completion handlers (legacy `DataSource`) and `async/await` / `Task` / `withTaskGroup` (newer code).
- Logging: `os.Logger` via static extensions in `Utils/Logger+Ext.swift` in newer code; `print` in older data sources.
- Debug-only code gated by `#if DEBUG`.
- Migrations: version-gated blocks in `AppDelegate.checkForUpdate()` using the `Version` struct; the code comment says old migrations are not to be trimmed.
- Linter/formatter configuration (e.g. SwiftLint): Not found in codebase.
