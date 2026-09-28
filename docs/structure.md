# Repository Structure

## Top-Level Layout

| Path | Responsibility |
|---|---|
| `berkeley-mobile/` | Main iOS application target source, assets, and Info.plist. |
| `BerkeleyMobileWidget/` | `BerkeleyMobileWidgetExtension` target — a WidgetKit extension (`GymOccupancyWidget`). |
| `berkeley-mobile.xcodeproj/` | Xcode project file, build settings, and shared schemes. |
| `berkeley-mobile.xcworkspace/` | Xcode workspace (combines the project with CocoaPods and SwiftPM dependencies). |
| `Pods/` | CocoaPods-managed third-party dependencies (Firebase, GoogleSignIn). |
| `app_preview_images/` | Static screenshots referenced by `README.md`. |
| `Podfile` / `Podfile.lock` | CocoaPods dependency manifest and lockfile. |
| `README.md`, `CONTRIBUTING.md`, `LICENSE.md` | Project documentation and contribution guidelines. |

## `berkeley-mobile/` Module Breakdown

Based on the folder names found under `berkeley-mobile/`:

- **`AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`, `TabBarController.swift`, `MainContainerViewController.swift`** — application entry points and root view controller wiring. `TabBarController` composes the four root tabs (`MainContainerViewController` for Home/Map, `TodayView`, `SafetyView`, `ResourcesView`).
- **`BerkeleyMobile+Injection.swift`** — central FactoryKit `Container` extension registering all view-model factories used via `@Injected`/`@InjectedObservable`.
- **`Assets/`, `Assets.xcassets/`** — fonts (`Fonts.swift`), colors, and image asset catalogs.
- **`Common/`** — shared UI components reused across screens: `CardView`, `CollapsibleCardView`, `BMAlert`, `BMDrawerView`, `BMFilterButton`, `TagView`, `DetailView/`, `FilterView/`, etc.
- **`Data/`** — data-access layer: `DataManager.swift`, `DataSource.swift` (legacy completion-handler fetch protocol), `BMNetworkingManager.swift` (modern async/await Firestore access), `BMEventManager.swift` (EventKit calendar integration), `BMConstants.swift`, `BMError.swift`, `BMLocationManager.swift`, `SortingFunctions.swift`, plus `ItemProtocols/` and `PropertyWrappers/` subfolders.
- **`Debug/`** — `DebugView.swift` / `DebugViewModel.swift`, presented only under `#if DEBUG` (triggered by a shake gesture in `TabBarController.motionEnded`).
- **`Drawer/`** — the bottom-drawer UI system: `DrawerViewController`, `DrawerViewDelegate` (protocol defining pan-gesture handling and drawer state), `MainDrawerViewDelegate`, `SearchDrawerViewController`, `SearchDrawerViewDelegate`, `BarView`.
- **`Events/`** — academic/campus calendar feature: `EventsView.swift`, `EventDetailView.swift`, `CalendarView.swift`, `EventRowView.swift`, and `EventDataSource/EventsViewModel.swift` (contains `EventsDataService`, `EventsViewModel`, `BerkeleyEvent`/`BerkeleyEventsDaySnapshot` models).
- **`FeedbackForm/`** — `FeedbackFormPresenter.swift`, `FeedbackFormView.swift`, `FeedbackFormViewModel.swift` — an in-app feedback form shown via `TabBarController.viewDidLoad`.
- **`Home/`** — the Home tab and its sub-features, each in its own subfolder: `Dining/`, `Fitness/`, `Guides/`, `Libraries/`, `Map/`, `Search/`, `Home Drawer/`, plus `HomeView.swift`/`HomeViewModel.swift`, `OpenClosedStatusManager.swift`/`OpenClosedStatusView.swift`, `RedirectionManager.swift`.
- **`Resources/`** — campus resources tab: `ResourcesView.swift`, `ResourcesViewModel.swift`, `ResourcesSectionDropdown.swift`, `SafariWebView.swift`.
- **`Safety/`** — safety log/map tab: `SafetyView.swift`, `SafetyViewModel.swift`, `SafetyMapView.swift`, `SafetyMapMarker.swift`, `SafetyLogDetailView.swift`, `SafetyLogFilterButton.swift`, `SafetyViewFilterScrollView.swift`.
- **`Today/`** — the Today tab, composed of tiles: `TodayView.swift`, `TodayTileView.swift`, `TodayTileLayout.swift`, `TodayTileAttributes.swift`, and a `Tiles/` subfolder (e.g. `News Tile/`, `Weather Tile/`).
- **`Utils/`** — extensions and small utilities: `Date+Extension.swift`, `String+Extension.swift`, `UIView+Extensions.swift`, `UIViewController+Extensions.swift`, `UIStackView+Extensions.swift`, `UIImage+Extensions.swift`, `View+Extension.swift`, `AtomicDictionary.swift`, `WeeklyHours.swift`, `DayOfWeek.swift`, `Logger+Ext.swift`, `NSCoding+Extension.swift`, `UserDefaults+Extension.swift`, `TimeInterval+Ext.swift`, `CLLocation+Extension.swift`, `DepthButtonStyle.swift`, `UIDevice+Extensions.swift`, `UIScrollView+GestureRecognizer.swift`, `Collection+Extension.swift`.

## `BerkeleyMobileWidget/` Module Breakdown

- **`BerkeleyMobileWidgetBundle.swift`** — `@main` `WidgetBundle` entry point; configures Firebase independently of the main app target (`configureFirebaseIfNeeded()`), then serves `GymOccupancyWidget()`.
- **`GymOccupancyWidget.swift`** — the widget's timeline/view implementation.
- **`Assets.xcassets/`, `Info.plist`** — widget-specific assets and configuration.

## Architectural Boundaries

- **App target vs. widget target**: `berkeley-mobile` and `BerkeleyMobileWidgetExtension` are separate `productType` build targets in `berkeley-mobile.xcodeproj/project.pbxproj`, each with its own Firebase configuration call and `Podfile` target block. `BerkeleyMobileWidget/` only depends on `Firebase/Firestore` (per `Podfile`), not the full Firebase/Auth/Messaging/GoogleSignIn set used by the main app.
- **Feature folders under `Home/`, `Events/`, `Safety/`, `Resources/`, `Today/`**: each pairs a `*View.swift` (SwiftUI) with a `*ViewModel.swift`, following a consistent View/ViewModel split (see `docs/code-conventions.md`).
- **Dependency direction**: Root wiring (`TabBarController`, `MainContainerViewController`) depends on feature view models via FactoryKit `@Injected`; feature view models depend on `Data/` layer classes (`DataManager`, `BMNetworkingManager`, `BMEventManager`); `Data/` layer depends on Firebase/EventKit SDKs. No reverse dependency from `Data/` back to feature UI was found in the inspected areas.
