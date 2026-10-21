<!-- steering-agent-last-run: 2026-10-21 13:37 UTC -->
# Repository Structure

## Top level
| Path | Contents |
|---|---|
| `berkeley-mobile/` | Main app source (Swift) |
| `BerkeleyMobileWidget/` | WidgetKit extension: `BerkeleyMobileWidgetBundle.swift`, `GymOccupancyWidget.swift` |
| `berkeley-mobile.xcodeproj`, `berkeley-mobile.xcworkspace` | Xcode project / CocoaPods workspace; shared scheme `berkeley-mobile` (empty `<Testables>`) |
| `Podfile`, `Podfile.lock`, `Pods/` | CocoaPods dependencies (Pods tracked in git) |
| `app_preview_images/` | README screenshots |
| `README.md`, `CONTRIBUTING.md`, `LICENSE.md` | Project docs |

## `berkeley-mobile/` modules
| Folder | Responsibility (from file names/contents) |
|---|---|
| root files | `AppDelegate.swift`, `AppDelegate+Migration.swift` (version-gated migrations), `SceneDelegate.swift`, `TabBarController.swift`, `MainContainerViewController.swift`, `BerkeleyMobile+Injection.swift` (DI container) |
| `Data/` | `DataManager` (singleton fetch/cache), `DataSource` protocol, `ItemProtocols/`, `PropertyWrappers/`, `BMEventManager` |
| `Home/` | Home screen and map: `HomeViewModel`, `Map/` (`MapViewController`, `MapDataSource`, `MapMarker`), `Libraries/`, `Dining/`, `Fitness/` (gym, classes, occupancy), `Guides/`, `Search/`, `Home Drawer/`, `OpenClosedStatusManager`, `RedirectionManager` |
| `Today/` | `TodayView`, tile layout/attributes, `Tiles/` |
| `Events/` | `EventsView`, `EventDataSource/EventsViewModel.swift` |
| `Safety/` | Safety map/log views and `SafetyViewModel` |
| `Resources/` | `ResourcesView`, `ResourcesViewModel`, `SafariWebView` |
| `FeedbackForm/` | `FeedbackFormPresenter`, view model and view |
| `Drawer/` | Drawer view infrastructure used by `MainContainerViewController`/`MapViewController` |
| `Common/` | Shared UI components (`BMAlert`, `CardView`, `BMContentUnavailableView`, `FilterView/`, `DetailView/`, `Images/`, `ReviewPrompter`, ...) |
| `Utils/` | Extensions (`Date`, `String`, `UIView`, `UserDefaults`, ...), `AtomicDictionary`, `Logger+Ext`, `WeeklyHours`, `DayOfWeek` |
| `Debug/` | `DebugView`, `DebugViewModel` (presented on shake under `#if DEBUG`) |
| `Assets/`, `Assets.xcassets`, `Base.lproj` | Colors, fonts, asset catalog, storyboards/launch resources |

## Boundaries and dependencies
- Views obtain view models through FactoryKit (`Container` properties); `DataManager` serves `MapDataSource`, `LibraryDataSource`, `GymDataSource` (`kDataSources`); other features (Events, Dining, Gym occupancy, Feedback) query Firestore directly from their view models/services.
- The widget target is a separate Xcode target that links Firestore via its own Podfile target.
