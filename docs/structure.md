# Repository Structure

## Top-Level Layout (Level 1 — direct repository evidence)

```
.
├── berkeley-mobile.xcworkspace/     # CocoaPods + SPM workspace (opened for development)
├── berkeley-mobile.xcodeproj/       # Xcode project (2 targets: berkeley-mobile, BerkeleyMobileWidgetExtension)
├── berkeley-mobile/                 # Main application target source
├── BerkeleyMobileWidget/            # WidgetKit app-extension target source
├── Pods/                            # CocoaPods-managed dependencies (checked into the repo)
├── Podfile / Podfile.lock           # CocoaPods dependency manifest
├── app_preview_images/              # Screenshots referenced by README.md
├── README.md, CONTRIBUTING.md, LICENSE.md
```

Two Xcode native targets are defined in `berkeley-mobile.xcodeproj/project.pbxproj`:
- `berkeley-mobile` (`com.apple.product-type.application`) — sources under `berkeley-mobile/`.
- `BerkeleyMobileWidgetExtension` (`com.apple.product-type.app-extension`) — sources under `BerkeleyMobileWidget/`.

## `berkeley-mobile/` (main app target)

### App lifecycle / root composition (Level 1)

| File | Responsibility |
|---|---|
| `AppDelegate.swift` | `@UIApplicationMain` entry point; Firebase configuration, push-notification registration, initial data fetch, location request. |
| `AppDelegate+Migration.swift` | Version-comparison struct (`Version`) and `checkForUpdate()` migration runner, invoked from `AppDelegate`. |
| `SceneDelegate.swift` | `UIWindowSceneDelegate` — scene/window setup. |
| `MainContainerViewController.swift` | Hosts the SwiftUI `HomeView` inside UIKit; implements `MainDrawerViewDelegate` for the drawer stack. |
| `TabBarController.swift` | `UITabBarController` composing the 4 root tabs (Home/Map, Today, Safety, Resources) as `UIHostingController`-wrapped SwiftUI views (except Home, which uses `MainContainerViewController`). |
| `BerkeleyMobile+Injection.swift` | FactoryKit `Container` extension registering every view model as a `Factory<T>` (dependency-injection composition root). |

### Feature modules (Level 1, by folder)

- **`Data/`** — data-fetching/caching layer.
  - `DataManager.swift` — singleton coordinating one-time fetches across a fixed set of `DataSource` types (`MapDataSource`, `LibraryDataSource`, `GymDataSource`), backed by `Utils/AtomicDictionary.swift`.
  - `DataSource.swift` — protocol implemented by per-feature data sources.
  - `BMNetworkingManager.swift` — separate singleton for `async`/`await` Firestore reads (safety logs, resource categories).

- **`Home/`** — the "Home" tab (map-centric). Sub-areas:
  - `Map/` — `MapViewController`, `MapDataSource/` (`MapDataSource.swift`, `MapMarker.swift`), marker detail/dropdown views, `MapPlacemark.swift`.
  - `Dining/` — `DiningDataSource/` (dining hall/location/item/restriction/meal-type models), `DiningHallsView.swift`, `DiningDetailView.swift`, `MenuItemIconCacheManager.swift`.
  - `Fitness/` — `GymDataSource/`, `GymClassDataSource/`, `GymOccupancy/` (view + view model consumed by both the app and `BerkeleyMobileWidget`), `FitnessView.swift`, `GymDetailViewController.swift`.
  - `Libraries/` — `LibraryDataSource/`, `LibrariesView.swift`, `LibraryDetailViewController.swift`.
  - `Guides/` — `Guide.swift`, `GuidesView.swift`, `GuidesViewModel.swift`, `GuideDetailView.swift`.
  - `Search/` — `SearchViewModel.swift`, `SearchBarView.swift`, `SearchResultsView.swift`, `RecentSearchManager.swift`.
  - `Home Drawer/` — home-tab drawer contents (`BMHomeSectionListView.swift`, `HomeDrawerPinViewModel.swift`).
  - `HomeView.swift` / `HomeViewModel.swift` — top-level Home screen and its `ObservableObject` view model.
  - `OpenClosedStatusManager.swift` / `OpenClosedStatusView.swift` — open/closed status computation and display, shared across venue types.
  - `RedirectionManager.swift` — outbound link/redirect handling.

- **`Today/`** — the "Today" tab.
  - `TodayView.swift`, `TodayTileView.swift`, `TodayTileLayout.swift`, `TodayTileAttributes.swift` — tile-based layout for the Today feed.
  - `Tiles/Weather Tile/` — `TodayWeatherTileView.swift`, `WeatherDataViewModel.swift`.
  - `Tiles/News Tile/` — `NewsTileView.swift`, `NewsDataViewModel.swift`, `NewsArticle.swift`.

- **`Safety/`** — the "Safety" tab: `SafetyView.swift`, `SafetyViewModel.swift`, `SafetyMapView.swift`, `SafetyMapMarker.swift`, `SafetyLogDetailView.swift`, `SafetyLogFilterButton.swift`, `SafetyViewFilterScrollView.swift`. Backed by `BMNetworkingManager.fetchSafetyLogs()`.

- **`Resources/`** — the "Resources" tab: `ResourcesView.swift`, `ResourcesViewModel.swift`, `ResourcesSectionDropdown.swift`, `SafariWebView.swift` (in-app browser for external links). Backed by `BMNetworkingManager.fetchResourcesCategories()`.

- **`Events/`** — calendar/events feature: `EventsView.swift`, `CalendarView.swift`, `CalendarSectionView.swift`, `EventsDateSectionView.swift`, `EventRowView.swift`, `EventDetailView.swift`, `AllDayEventBannerView.swift`, `BMAddedCalendarStatusOverlayView.swift`, and `EventDataSource/` (`BMEventCalendarEntry.swift`, `EventsViewModel.swift`).

- **`FeedbackForm/`** — in-app feedback prompt: `FeedbackFormPresenter.swift` (presentation/trigger logic based on launch count in `UserDefaults`), `FeedbackFormView.swift`, `FeedbackFormViewModel.swift`.

- **`Drawer/`** — reusable bottom-sheet/drawer system shared by multiple tabs: `DrawerViewController.swift`, `DrawerViewDelegate.swift`, `MainDrawerViewDelegate.swift` (stack management for nested drawers), `SearchDrawerViewController.swift`, `SearchDrawerViewDelegate.swift`, `BarView.swift`.

- **`Common/`** — shared UI components used across features:
  - `DetailView/` — generic detail-screen building blocks (`DetailView.swift`, `OverviewCardView.swift`, `DescriptionCardView.swift`, `LocationDetailView.swift`, `OpenTimesCardView.swift`, `OpenTimesCardSwiftUIView.swift`).
  - `FilterView/` — `FilterView.swift`, `FilterViewCell.swift`.
  - `Images/` — `ImageLoader.swift`, `ImageViewCell.swift`.
  - Standalone components: `CardView.swift`, `CollapsibleCardView.swift`, `TagView.swift`, `IconPairView.swift`, `BMActionButton.swift` / `ActionButton.swift`, `BMAlert.swift`, `BMCachedAsyncImageView.swift`, `BMContentUnavailableView.swift`, `BMDrawerView.swift`, `BMFilterButton.swift`, `BMSegmentedControlView.swift`, `BMTopBlobView.swift`, `ScrollingStackView.swift`, `DetailTapGestureRecognizer.swift`.

- **`Debug/`** — `#if DEBUG`-gated diagnostic screen: `DebugView.swift`, `DebugViewModel.swift`, invoked via a shake gesture in `TabBarController.motionEnded`.

- **`Utils/`** — Foundation/UIKit/SwiftUI type extensions and small utility types: `AtomicDictionary.swift`, `Date+Extension.swift`, `String+Extension.swift`, `Collection+Extension.swift`, `TimeInterval+Ext.swift`, `NSCoding+Extension.swift`, `CLLocation+Extension.swift`, `UIDevice+Extensions.swift`, `UIImage+Extensions.swift`, `UIScrollView+GestureRecognizer.swift`, `UIStackView+Extensions.swift`, `UIView+Extensions.swift`, `UIViewController+Extensions.swift`, `View+Extension.swift`, `UserDefaults+Extension.swift` (typed `UserDefaultsKeys` enum), `DayOfWeek.swift`, `WeeklyHours.swift`, `DepthButtonStyle.swift`, `Logger+Ext.swift`.

- **`Assets/`** — non-catalog design assets:
  - `Colors/` — `Colors.swift` (`BMColor` struct) plus feature-specific color extensions (`Colors+ActionButton.swift`, `Colors+AlertView.swift`, `Colors+Calendar.swift`, `Colors+Event.swift`, `Colors+GymClass.swift`, `Colors+MapMarker.swift`, `Colors+Resource.swift`, `Colors+StudyPact.swift`, `Colors+TagView.swift`, `Colors+Text.swift`).
  - `Fonts.swift` — `BMFont` type; `Fonts/` — bundled `.otf` font files (Apercu family).
- **`Assets.xcassets`** — Xcode asset catalog (app icons, image sets).
- **`Base.lproj/LaunchScreen.storyboard`** — launch screen.
- **`Info.plist`**, **`berkeley-mobile.entitlements`** — app configuration and entitlements.

## `BerkeleyMobileWidget/` (WidgetKit extension target)

- `BerkeleyMobileWidgetBundle.swift` — `@main` widget bundle entry point.
- `GymOccupancyWidget.swift` — `GymOccupancyWidget: Widget`, `GymOccupancyProvider: TimelineProvider`, and associated SwiftUI entry views; reuses `GymOccupancyViewModel` from the main app's `Home/Fitness/GymOccupancy/` module.
- `Assets.xcassets/`, `Info.plist` — extension-specific assets and configuration.

## Dependency Boundaries (Level 1)

- **`Pods/`** — third-party CocoaPods dependencies (Firebase family, GoogleSignIn, AppAuth, gRPC, abseil, etc.), managed via `Podfile`/`Podfile.lock`. Not application code; not to be hand-edited.
- **SPM dependency** — `FactoryKit`, resolved via `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved` and referenced directly in `project.pbxproj`.
- The main app target (`berkeley-mobile`) and the widget extension target (`BerkeleyMobileWidgetExtension`) are separate build targets that both depend on `Firebase/Firestore`; the widget target directly reuses source from `berkeley-mobile/Home/Fitness/GymOccupancy/` (per `Podfile` target scoping and shared use of `GymOccupancyViewModel` observed in `BerkeleyMobileWidget/GymOccupancyWidget.swift`).

## Architectural Boundaries Not Found in Repository

- No dedicated test target/folder exists (see `docs/testing-standards.md`).
- No CI/CD configuration folder (e.g. `.github/`, `fastlane/`) exists. Not found in codebase.
