<!-- steering-agent-last-run: 2026-11-17 20:35 UTC -->
# Repository Structure

## Top level
- `berkeley-mobile/` — main app sources and assets.
- `BerkeleyMobileWidget/` — WidgetKit extension (`BerkeleyMobileWidgetBundle.swift`, `GymOccupancyWidget.swift`, `Assets.xcassets`).
- `berkeley-mobile.xcodeproj`, `berkeley-mobile.xcworkspace`, `Podfile`, `Podfile.lock`, `Pods/` — build and dependency configuration.
- `app_preview_images/`, `README.md`, `CONTRIBUTING.md`, `LICENSE.md`.

## berkeley-mobile/ modules
| Path | Contents (observed) |
|---|---|
| `AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`, `TabBarController.swift`, `MainContainerViewController.swift` | App lifecycle, version migrations, root navigation |
| `BerkeleyMobile+Injection.swift` | FactoryKit `Container` registrations |
| `Data/` | `DataManager`, `DataSource`, `BMNetworkingManager`, `BMEventManager`, `BMLocationManager`, `BMConstants`, `BMError`, `ItemProtocols/` (`HasName`, `HasLocation`, `SearchItem`, ...), `PropertyWrappers/Display.swift` |
| `Home/` | `HomeView`, `HomeViewModel`, subfolders `Dining`, `Fitness`, `Guides`, `Home Drawer`, `Libraries`, `Map`, `Search` |
| `Today/` | `TodayView`, tiles (`Tiles/News Tile`, `Tiles/Weather Tile`) |
| `Events/` | Events and calendar views, `EventDataSource/` |
| `Safety/` | `SafetyView`, `SafetyViewModel`, map and filter views |
| `Resources/` | `ResourcesView`, `ResourcesViewModel` |
| `FeedbackForm/` | `FeedbackFormPresenter`, view, view model |
| `Drawer/` | Drawer view controllers and delegates |
| `Common/` | Shared views (`CardView`, `BMAlert`, `BMCachedAsyncImageView`, `DetailView/`, `FilterView/`, `Images/`) |
| `Utils/` | Extensions (`Date`, `String`, `UIView`, `UserDefaults`, ...), `AtomicDictionary`, `WeeklyHours`, `Logger+Ext` |
| `Debug/` | `DebugView`, `DebugViewModel` (presented on shake under `#if DEBUG`) |
| `Assets/`, `Assets.xcassets/` | Colors, fonts, images |

## Boundaries
- UI layers resolve view models via `Container` (FactoryKit) and read data through `DataManager` / `BMNetworkingManager`.
- The widget extension defines its own `GymOccupancyProvider` and uses `GymOccupancyViewModel`.
