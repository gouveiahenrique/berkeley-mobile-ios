<!-- steering-agent-last-run: 2026-11-18 12:26 UTC -->
# Repository Structure

Top level: `berkeley-mobile/` (app source), `BerkeleyMobileWidget/` (widget extension), `berkeley-mobile.xcodeproj`, `berkeley-mobile.xcworkspace`, `Podfile`/`Podfile.lock`/`Pods/`, `app_preview_images/`, `README.md`, `CONTRIBUTING.md`, `LICENSE.md`.

## berkeley-mobile/ folders
| Folder | Contents |
|---|---|
| root files | `AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`, `TabBarController.swift`, `MainContainerViewController.swift`, `BerkeleyMobile+Injection.swift` |
| `Data/` | `DataManager`, `DataSource` protocol, `BMNetworkingManager`, `BMConstants`, `BMError`, `BMEventManager`, `BMLocationManager`, `ItemProtocols`, `PropertyWrappers`, `SortingFunctions` |
| `Home/` | Map, Dining, Fitness (gym data sources, `GymOccupancy`), Libraries, Guides, Search, Home Drawer, `HomeView`/`HomeViewModel` |
| `Today/` | `TodayView`, tiles (News, Weather) |
| `Events/` | Events views and `EventDataSource` |
| `Safety/`, `Resources/` | Safety map/log views and view model; resources views and view model |
| `Drawer/` | Drawer view controllers and delegates |
| `FeedbackForm/` | `FeedbackFormPresenter`, view, view model |
| `Common/` | Shared UI components (cards, buttons, `BMCachedAsyncImageView`, `ImageLoader`, `ReviewPrompter`) |
| `Utils/` | Extensions and helpers (`AtomicDictionary`, `Logger+Ext`, etc.) |
| `Debug/` | `DebugView`, `DebugViewModel` (DEBUG only, opened by shake in `TabBarController`) |
| `Assets/`, `Assets.xcassets/` | Colors, fonts, images |

## Boundaries and dependencies
- Views and view models use Firestore directly (e.g. `NewsDataViewModel`, `GuidesViewModel`, `DiningHallsViewModel`, `EventsViewModel`, `FeedbackFormViewModel`) or via `DataManager` + `DataSource` types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`) or `BMNetworkingManager`.
- View models are registered in `Container` (FactoryKit).
- Targets in project: app `berkeley-mobile` and app-extension `BerkeleyMobileWidgetExtension`.
