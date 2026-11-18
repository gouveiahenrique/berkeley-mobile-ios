<!-- steering-agent-last-run: 2026-11-17 21:29 UTC -->
# Repository Structure

## Top level
- `berkeley-mobile/` — main app target sources.
- `BerkeleyMobileWidget/` — widget extension (`BerkeleyMobileWidgetBundle.swift`, `GymOccupancyWidget.swift`).
- `berkeley-mobile.xcodeproj`, `berkeley-mobile.xcworkspace` — Xcode project/workspace; shared scheme `berkeley-mobile`.
- `Podfile`, `Podfile.lock`, `Pods/` — CocoaPods dependencies.
- `README.md`, `CONTRIBUTING.md`, `LICENSE.md`, `app_preview_images/`.

## `berkeley-mobile/` modules
| Folder | Contents (observed) |
|---|---|
| root files | `AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`, `TabBarController.swift`, `MainContainerViewController.swift`, `BerkeleyMobile+Injection.swift`, `Info.plist`, entitlements |
| `Data/` | `DataManager`, `DataSource` protocol, `BMNetworkingManager`, `BMConstants`, `BMError`, `BMEventManager`, `BMLocationManager`, `ItemProtocols/`, `PropertyWrappers/`, `SortingFunctions` |
| `Home/` | `HomeView`, `HomeViewModel`, subfolders `Dining`, `Fitness`, `Guides`, `Home Drawer`, `Libraries`, `Map`, `Search`; `OpenClosedStatusManager`, `RedirectionManager` |
| `Events/` | Events/calendar views, `EventDataSource/` (`BMEventCalendarEntry`, `EventsViewModel`) |
| `Resources/` | `ResourcesView`, `ResourcesViewModel`, `SafariWebView` |
| `Safety/` | Safety log map/list views and `SafetyViewModel` |
| `Today/` | `TodayView`, tile layout, `Tiles/` |
| `FeedbackForm/` | Presenter, view, view model |
| `Drawer/` | Drawer view controllers and delegates |
| `Common/` | Shared UI components (`CardView`, `BMAlert`, `BMCachedAsyncImageView`, `ReviewPrompter`, etc.) |
| `Utils/` | Extensions (`Date+Extension`, `UIView+Extensions`, …), `AtomicDictionary`, `DayOfWeek` |
| `Debug/` | `DebugView`, `DebugViewModel` |
| `Assets/`, `Assets.xcassets/`, `Base.lproj/` | Colors, fonts, images, launch screen |

## Boundaries and dependencies
- Views depend on view models (`*ViewModel`) resolved via `Container.shared` (Factory).
- Data sources (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) conform to `DataSource` and are registered in `kDataSources` in `DataManager.swift`.
- Firestore is accessed from data sources, view models (`GuidesViewModel`, `DiningHallsViewModel`, `NewsDataViewModel`, `FeedbackFormViewModel`) and `BMNetworkingManager`.
- Test targets: Not found in codebase.
