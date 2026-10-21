<!-- steering-agent-last-run: 2026-10-21 16:32 UTC -->
# Repository Structure

## Top level
| Path | Contents |
|---|---|
| `berkeley-mobile/` | Main iOS app source |
| `BerkeleyMobileWidget/` | WidgetKit extension (`BerkeleyMobileWidgetBundle.swift`, `GymOccupancyWidget.swift`, `Info.plist`, `Assets.xcassets`) |
| `berkeley-mobile.xcodeproj`, `berkeley-mobile.xcworkspace` | Xcode project and CocoaPods workspace |
| `Podfile`, `Podfile.lock`, `Pods/` | CocoaPods dependencies |
| `app_preview_images/` | Preview images |
| `README.md`, `CONTRIBUTING.md`, `LICENSE.md` | Project documents |

## `berkeley-mobile/` modules
| Folder / file | Responsibility (from source) |
|---|---|
| `AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift` | App/scene lifecycle; version-gated migrations (`Version`, `checkForUpdate`) |
| `TabBarController.swift` | Root tab bar (Home, Today, Safety, Resources) |
| `MainContainerViewController.swift` | Home tab container; hosts `HomeView` and drawer stack |
| `BerkeleyMobile+Injection.swift` | FactoryKit `Container` registrations |
| `Data/` | `DataManager`, `DataSource`, `BMNetworkingManager` (Firestore), `BMEventManager` (EventKit), `BMLocationManager`, `BMConstants`, `BMError`, `SortingFunctions`; `ItemProtocols/` (`HasName`, `HasLocation`, `HasOpenTimes`, `SearchItem`, `CanFavorite`, etc.); `PropertyWrappers/Display.swift` |
| `Home/` | Home UI: `HomeView`, `HomeViewModel`, plus `Map/`, `Search/`, `Dining/`, `Fitness/`, `Libraries/`, `Guides/`, `Home Drawer/` |
| `Drawer/` | Drawer controllers/delegates (`DrawerViewController`, `MainDrawerViewDelegate`, `SearchDrawerViewController`) |
| `Today/` | `TodayView`, tile layout/attributes, `Tiles/News Tile`, `Tiles/Weather Tile` |
| `Safety/` | `SafetyView`, `SafetyViewModel`, map and filter views |
| `Resources/` | `ResourcesView`, `ResourcesViewModel`, `SafariWebView` |
| `Events/` | Events/calendar views and `EventDataSource/` (`EventsViewModel`) |
| `FeedbackForm/` | `FeedbackFormPresenter`, view, view model |
| `Debug/` | `DebugView`, `DebugViewModel` (presented on shake under `#if DEBUG`) |
| `Common/` | Shared UI components (`CardView`, `BMAlert`, `BMDrawerView`, `ReviewPrompter`, `DetailView/`, `FilterView/`, `Images/`) |
| `Utils/` | Extensions and helpers (`AtomicDictionary`, `Date+Extension`, `UserDefaults+Extension`, `WeeklyHours`, etc.) |
| `Assets/`, `Assets.xcassets/`, `Base.lproj/` | Colors, fonts, image assets, storyboards/launch resources |

Data-source subfolders (e.g. `Home/Map/MapDataSource`, `Home/Libraries/LibraryDataSource`, `Home/Fitness/GymDataSource`, `Home/Fitness/GymClassDataSource`, `Home/Dining/DiningDataSource`) sit beside the feature views that use them.

## Dependencies and boundaries
- Feature view models call `BMNetworkingManager.shared` (`SafetyViewModel`, `ResourcesViewModel`) or `DataManager.shared` (`HomeViewModel`, `MapPlacemark`, `MapViewController`, `AppDelegate`).
- `DataManager` holds a fixed list `kDataSources` = `MapDataSource`, `LibraryDataSource`, `GymDataSource`.
- The widget target is a separate target; it uses `BMFont` and `GymOccupancyViewModel` (shared source membership between targets was not verified).
