<!-- steering-agent-last-run: 2026-10-29 13:05 UTC -->
# Repository Structure

## Top level
| Path | Contents |
|---|---|
| `berkeley-mobile/` | Main iOS app sources and assets |
| `BerkeleyMobileWidget/` | WidgetKit-style extension target (`BerkeleyMobileWidgetBundle.swift`, `GymOccupancyWidget.swift`, `Assets.xcassets`, `Info.plist`) |
| `berkeley-mobile.xcodeproj`, `berkeley-mobile.xcworkspace` | Xcode project/workspace; shared scheme `berkeley-mobile` |
| `Podfile`, `Podfile.lock`, `Pods/` | CocoaPods dependencies |
| `app_preview_images/` | README screenshots |
| `README.md`, `CONTRIBUTING.md`, `LICENSE.md` | Project docs |

## `berkeley-mobile/` modules
| Folder | Responsibility (from file contents) |
|---|---|
| root files | `AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`, `TabBarController.swift`, `MainContainerViewController.swift`, `BerkeleyMobile+Injection.swift` |
| `Data/` | `DataManager`, `DataSource` protocol, `BMNetworkingManager`, `BMLocationManager`, `BMEventManager`, `BMConstants`, `BMError`, `ItemProtocols/` (`HasName`, `HasLocation`, `SearchItem`, ...), `PropertyWrappers/` |
| `Home/` | Feature subfolders: `Map`, `Libraries`, `Fitness`, `Dining`, `Guides`, `Search`, `Home Drawer`; plus `HomeView`, `HomeViewModel`, `OpenClosedStatusManager`, `RedirectionManager` |
| `Events/` | Events/calendar views and `EventDataSource/` (`EventsViewModel`, `BMEventCalendarEntry`) |
| `Safety/` | Safety log views, map and `SafetyViewModel` |
| `Resources/` | `ResourcesView`, `ResourcesViewModel`, `SafariWebView` |
| `Today/` | `TodayView`, tile layout, `Tiles/News Tile`, `Tiles/Weather Tile` |
| `Drawer/` | Drawer view controllers and delegates |
| `FeedbackForm/` | Feedback form view, view model, presenter |
| `Debug/` | `DebugView`, `DebugViewModel` |
| `Common/` | Reusable views (`BMActionButton`, `CardView`, `BMDrawerView`, `FilterView/`, `DetailView/`, `Images/`) |
| `Utils/` | Extensions (`Date`, `String`, `UIView`, ...), `AtomicDictionary`, `WeeklyHours`, `DayOfWeek` |
| `Assets.xcassets`, `Assets`, `Resources`, `Base.lproj` | Asset catalogs, launch screen |

## Dependency / boundary observations
- Feature folders obtain Firestore data either through `DataManager` + `DataSource` types (Map, Library, Gym), through `BMNetworkingManager` (safety logs, resource categories), or directly via `Firestore.firestore()` in view models.
- View models are registered in `Container` (FactoryKit) extensions.
- The widget target links only `Firebase/Firestore` (Podfile).
