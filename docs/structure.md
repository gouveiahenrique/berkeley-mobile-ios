# Repository Structure

## Top-Level Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/                 # Main application target source
├── BerkeleyMobileWidget/             # WidgetKit extension target source
├── berkeley-mobile.xcodeproj/        # Xcode project (schemes, build settings)
├── berkeley-mobile.xcworkspace/      # Xcode workspace (opens Pods + project + SPM deps)
├── Pods/                             # CocoaPods-managed third-party dependencies
├── Podfile / Podfile.lock            # CocoaPods dependency manifest
├── app_preview_images/               # Screenshots referenced by README.md
├── README.md
├── CONTRIBUTING.md
└── LICENSE.md
```

## `berkeley-mobile/` (main app target)

| Folder | Responsibility (evidence) |
|---|---|
| `Data/` | Central data-fetch orchestration: `DataManager` (singleton, fetch caching/dedup), `DataSource` protocol, `BMNetworkingManager` (Firestore access), `BMLocationManager`, `BMEventManager`, `BMConstants`, `BMError`. Subfolders `ItemProtocols/` (shared item capability protocols: `HasImage`, `HasLocation`, `HasName`, `HasOpenClosedStatus`, `HasOpenTimes`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `SearchItem`, `BMCalendarEvent`) and `PropertyWrappers/` (`Display.swift`). |
| `Home/` | Main tab screens and their per-feature data sources: `Map/` (+ `MapDataSource/`), `Dining/` (+ `DiningDataSource/`), `Libraries/` (+ `LibraryDataSource/`), `Fitness/` (+ `GymDataSource/`, `GymClassDataSource/`, `GymOccupancy/`), `Guides/`, `Search/`, `Home Drawer/`. Also contains `HomeView.swift` / `HomeViewModel.swift`, `OpenClosedStatusManager.swift`/`OpenClosedStatusView.swift`, `RedirectionManager.swift`. |
| `Events/` | Calendar/events feature: `EventsView.swift`, `CalendarView.swift`, `EventDetailView.swift`, and `EventDataSource/` (e.g. `BMEventCalendarEntry`, `EventsViewModel`). |
| `Safety/` | Safety-log map feature: `SafetyView.swift`, `SafetyViewModel.swift`, `SafetyMapView.swift`, `SafetyMapMarker.swift`, `SafetyLogDetailView.swift`, `SafetyLogFilterButton.swift`, `SafetyViewFilterScrollView.swift`. |
| `Resources/` | Campus-resources feature: `ResourcesView.swift`, `ResourcesViewModel.swift`, `ResourcesSectionDropdown.swift`, `SafariWebView.swift`. |
| `Today/` | Tile-based "Today" screen: `TodayView.swift`, `TodayTileView.swift`, `TodayTileAttributes.swift`, `TodayTileLayout.swift`, `Tiles/`. |
| `Drawer/` | Custom bottom-sheet/drawer UI infrastructure: `DrawerViewController.swift`, `DrawerViewDelegate.swift`, `MainDrawerViewDelegate.swift`, `SearchDrawerViewController.swift`, `SearchDrawerViewDelegate.swift`, `BarView.swift`. |
| `Common/` | Shared UI components used across features: `CardView.swift`, `CollapsibleCardView.swift`, `BMAlert.swift`, `BMActionButton.swift`, `ActionButton.swift`, `BMCachedAsyncImageView.swift`, `BMContentUnavailableView.swift`, `BMDrawerView.swift`, `BMFilterButton.swift`, `BMSegmentedControlView.swift`, `BMTopBlobView.swift`, `TagView.swift`, `IconPairView.swift`, `ScrollingStackView.swift`, `DetailTapGestureRecognizer.swift`, and subfolders `DetailView/` (e.g. `DetailView.swift`, `LocationDetailView.swift`, `OverviewCardView.swift`, `OpenTimesCardView.swift`, `OpenTimesCardSwiftUIView.swift`, `DescriptionCardView.swift`) and `FilterView/` (`FilterView.swift`, `FilterViewCell.swift`) and `Images/`. |
| `FeedbackForm/` | In-app feedback submission: `FeedbackFormPresenter.swift`, `FeedbackFormView.swift`, `FeedbackFormViewModel.swift`. |
| `Debug/` | In-app debug screen: `DebugView.swift`, `DebugViewModel.swift`. |
| `Assets/` | `Colors/` (`BMColor` static color palette) and `Fonts.swift` (`BMFont`). Distinct from `Assets.xcassets` (the Xcode asset catalog). |
| `Utils/` | Extensions on Foundation/UIKit types (`Date+Extension`, `String+Extension`, `Collection+Extension`, `CLLocation+Extension`, `NSCoding+Extension`, `TimeInterval+Ext`, `UIDevice+Extensions`, `UIImage+Extensions`, `UIScrollView+GestureRecognizer`, `UIStackView+Extensions`, `UIView+Extensions`, `UIViewController+Extensions`, `UserDefaults+Extension`, `View+Extension`) plus standalone utility types (`AtomicDictionary.swift`, `DayOfWeek.swift`, `DepthButtonStyle.swift`, `Logger+Ext.swift`, `WeeklyHours.swift`). |
| (root files) | `AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`, `TabBarController.swift`, `MainContainerViewController.swift`, `BerkeleyMobile+Injection.swift`, `Info.plist`, `berkeley-mobile.entitlements`, `Base.lproj/LaunchScreen.storyboard`. |

## `BerkeleyMobileWidget/` (widget extension target)

Contains `BerkeleyMobileWidgetBundle.swift` (widget bundle entry point) and `GymOccupancyWidget.swift` (`GymOccupancyEntry`, `GymOccupancyProvider: TimelineProvider`), its own `Assets.xcassets`, and `Info.plist`. The `Podfile` defines this as the `BerkeleyMobileWidgetExtension` target.

## Architectural Boundaries

- **Target boundary:** `berkeley-mobile` (app) and `BerkeleyMobileWidgetExtension` (widget) are separate Podfile targets, each with independent `Info.plist` and asset catalogs; the widget target depends only on `Firebase/Firestore`, while the app target depends on `Firebase/Analytics`, `Firebase`, `FirebaseMessaging`, `Firebase/Firestore`, `Firebase/Auth`, and `GoogleSignIn`.
- **Feature-module boundary:** Within `Home/`, each user-facing feature (`Map`, `Dining`, `Libraries`, `Fitness`) pairs a view/view-model with a co-located `*DataSource` subfolder implementing the `DataSource` protocol, which `DataManager` (`berkeley-mobile/Data/DataManager.swift:12-16`) references directly by type (`MapDataSource`, `LibraryDataSource`, `GymDataSource`).
- **Shared-capability boundary:** `Data/ItemProtocols/` defines small protocols (`HasImage`, `HasLocation`, `HasOpenTimes`, `CanFavorite`, etc.) that feature-specific model types (e.g. `BMEventCalendarEntry` in `Events/EventDataSource/BMEventCalendarEntry.swift:11`) conform to, allowing `Common/` views to render heterogeneous item types generically.
- **No test target boundary:** The checked-in scheme (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`) has an empty `TestAction`/`Testables` block, and no files under the repository import `XCTest`.

## Dependencies

- **Internal:** `DataManager` (`Data/`) is depended on by `AppDelegate`, `HomeViewModel`, `MapPlacemark`, `MapViewController`, and others (per CodeGraph blast-radius analysis). `BMNetworkingManager` is depended on by `ResourcesViewModel` and `SafetyViewModel`.
- **External:** Managed via CocoaPods (`Podfile`: Firebase Analytics/Core/Messaging/Firestore/Auth, GoogleSignIn) and Swift Package Manager (`berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`).
