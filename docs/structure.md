<!-- steering-agent-last-run: 2026-11-18 18:30 UTC -->
# Repository Structure

## Top level
| Path | Contents |
|---|---|
| `berkeley-mobile/` | Main app source |
| `BerkeleyMobileWidget/` | WidgetKit extension (`BerkeleyMobileWidgetBundle.swift`, `GymOccupancyWidget.swift`, assets, Info.plist) |
| `berkeley-mobile.xcodeproj`, `berkeley-mobile.xcworkspace` | Xcode project and workspace (shared scheme `berkeley-mobile`) |
| `Podfile`, `Podfile.lock`, `Pods/` | CocoaPods dependencies (Pods directory is present in the repository) |
| `app_preview_images/`, `README.md`, `CONTRIBUTING.md`, `LICENSE.md` | Documentation and assets |

## `berkeley-mobile/` modules
| Folder | Responsibility (observed) |
|---|---|
| root files | `AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`, `TabBarController.swift`, `MainContainerViewController.swift`, `BerkeleyMobile+Injection.swift`, `Info.plist`, entitlements |
| `Data/` | `DataManager`, `DataSource` protocol, `BMNetworkingManager` (Firestore async fetches), `BMLocationManager`, `BMEventManager`, `BMConstants`, `BMError`, `ItemProtocols/` (`HasName`, `HasLocation`, `HasOpenTimes`, `CanFavorite`, `SearchItem`, ...), `PropertyWrappers/Display.swift` |
| `Home/` | `Map/`, `Dining/`, `Fitness/` (incl. `GymOccupancy/`), `Libraries/`, `Guides/`, `Search/`, `Home Drawer/`, `HomeViewModel`, `OpenClosedStatusManager`, `RedirectionManager` |
| `Today/` | Today tab: `TodayView`, tile layout/attributes, `Tiles/` |
| `Events/` | Events/calendar views and `EventDataSource/` |
| `Safety/` | Safety tab views and `SafetyViewModel` |
| `Resources/` | Resources tab views and `ResourcesViewModel` |
| `Drawer/` | UIKit drawer controllers and delegates |
| `Common/` | Reusable views (`BMAlert`, `CardView`, `BMCachedAsyncImageView`, `ReviewPrompter`, `FilterView/`, `DetailView/`, ...) |
| `FeedbackForm/` | Feedback form view, view model, presenter |
| `Debug/` | `DebugView`, `DebugViewModel` (injection of `debugViewModel` is under `#if DEBUG`) |
| `Utils/` | Extensions (`Date+Extension`, `UIView+Extensions`, ...), `AtomicDictionary`, `WeeklyHours`, `DayOfWeek` |
| `Assets.xcassets`, `Assets/`, `Base.lproj/` | Resources |

## Boundaries and dependencies
- `DataManager` holds the registered `DataSource` types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) and is called from `AppDelegate` / `SceneDelegate`.
- Feature view models are registered in `Container` (FactoryKit) extensions.
- The widget target has its own `GymOccupancyViewModel` use and shares `BMFont` with the app (referenced in `GymOccupancyWidget.swift`); how files are shared between targets was not inspected.
