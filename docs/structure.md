# Repository Structure

## Top-Level Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/                 # Main app target source
├── BerkeleyMobileWidget/            # WidgetKit extension target
├── berkeley-mobile.xcodeproj/       # Xcode project (build settings, schemes)
├── berkeley-mobile.xcworkspace/     # CocoaPods-generated workspace (open this, not the .xcodeproj)
├── Pods/                            # CocoaPods-managed third-party dependencies (generated)
├── app_preview_images/              # App Store / README screenshots
├── Podfile / Podfile.lock           # CocoaPods dependency manifest
├── README.md, CONTRIBUTING.md, LICENSE.md
```

## `berkeley-mobile/` (Main App Module)

Organized primarily by **feature/domain**, with a smaller set of cross-cutting `Common`/`Data`/`Utils`/`Assets` folders. This is a feature-folder structure rather than a strict MVC/MVVM layer-first structure.

| Folder | Responsibility |
|---|---|
| `AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift` | App/scene lifecycle, Firebase bootstrap, push notifications, versioned data migrations |
| `TabBarController.swift`, `MainContainerViewController.swift` | Root tab navigation and the Home tab's map + drawer container |
| `BerkeleyMobile+Injection.swift` | FactoryKit `Container` extension registering all app ViewModels for dependency injection |
| `Data/` | Cross-feature data layer: `DataManager` (fetch/cache orchestrator), `DataSource` protocol, `BMNetworkingManager` (async Firestore access), `BMEventManager` (EventKit), `BMLocationManager`, `BMConstants`, `BMError`, `SortingFunctions`, plus subfolders `ItemProtocols/` (shared model capability protocols: `HasLocation`, `HasOpenTimes`, `HasImage`, `HasName`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `SearchItem`) and `PropertyWrappers/` |
| `Home/` | The Home tab: `HomeView`/`HomeViewModel`, and domain subfolders `Map/` (MapKit-based `MapViewController`, `MapDataSource`, map markers/placemarks), `Dining/`, `Fitness/` (incl. `GymDataSource`, `GymClassDataSource`, `GymDetailViewController`), `Libraries/` (incl. `LibraryDataSource`, `LibraryDetailViewController`), `Guides/`, `Search/` (`SearchViewModel`), `Home Drawer/`, `OpenClosedStatusManager.swift`, `RedirectionManager.swift` |
| `Today/` | The Today tab: `TodayView`, `TodayTileView`/`TodayTileLayout`/`TodayTileAttributes`, and `Tiles/` subfolder containing individual tile features such as `Weather Tile/` (`WeatherDataViewModel`, WeatherKit) and `News Tile/` (`NewsDataViewModel`, `NewsArticle`, Firestore-backed) |
| `Safety/` | The Safety tab: `SafetyView`, `SafetyViewModel` (Firestore-backed `BMSafetyLog` model, MapKit region + filtering), `SafetyMapView`/`SafetyMapMarker`, `SafetyLogDetailView`, `SafetyLogFilterButton`/`SafetyViewFilterScrollView` |
| `Resources/` | The Resources tab: `ResourcesView`, `ResourcesViewModel`, `ResourcesSectionDropdown`, `SafariWebView` (in-app browser for external resource links) |
| `Events/` | Campus events feature: `EventsView`, `EventDataSource/` (`EventsViewModel`, `BerkeleyEvent`/`BerkeleyEventsDaySnapshot` models), `CalendarView`/`CalendarSectionView`, `EventDetailView`, `EventRowView`, `AllDayEventBannerView`, `BMAddedCalendarStatusOverlayView` |
| `FeedbackForm/` | In-app feedback survey: `FeedbackFormPresenter` (launch-count-gated presentation logic), `FeedbackFormViewModel`, `FeedbackFormView` |
| `Drawer/` | Reusable bottom-sheet/drawer UI infrastructure: `DrawerViewController`, `DrawerViewDelegate` (protocol with pan-gesture + state-transition logic), `MainDrawerViewDelegate` (stack-of-drawers management), `BarView`, `SearchDrawerViewController`/`SearchDrawerViewDelegate` |
| `Common/` | Shared, feature-agnostic UI components: `CardView`, `CollapsibleCardView`, `TagView`, `IconPairView`, `BMAlert`, `BMActionButton`/`ActionButton`, `BMDrawerView`, `BMFilterButton`, `BMSegmentedControlView`, `BMTopBlobView`, `BMContentUnavailableView`, `BMCachedAsyncImageView`, `ScrollingStackView`, `DetailTapGestureRecognizer`, plus subfolders `DetailView/` (protocol-driven detail card views: `LocationDetailView`, `OpenTimesCardView`/`OpenTimesCardSwiftUIView`, `OverviewCardView`) and `FilterView/` (`FilterView`, `FilterViewCell`) and `Images/` (`ImageLoader`) |
| `Debug/` | `#if DEBUG`-only developer tools view (`DebugView`, `DebugViewModel`), reachable via a shake gesture |
| `Assets/` | Non-.xcassets design tokens: `Fonts.swift` (`BMFont`), `Colors/` (`Colors.swift` / `BMColor` plus per-feature color extensions like `Colors+MapMarker.swift`, `Colors+Event.swift`, etc.), `Fonts/` (bundled `.otf` files) |
| `Assets.xcassets/` | Standard Xcode asset catalog (app icon, images, colors) |
| `Utils/` | Foundation/UIKit extensions and small utilities: `Date+Extension`, `String+Extension`, `Collection+Extension`, `CLLocation+Extension`, `NSCoding+Extension`, `TimeInterval+Ext`, `UIDevice+Extensions`, `UIImage+Extensions`, `UIView+Extensions`, `UIViewController+Extensions`, `UIStackView+Extensions`, `UIScrollView+GestureRecognizer`, `View+Extension` (SwiftUI), `UserDefaults+Extension` (typed `UserDefaultsKeys` enum), `AtomicDictionary`, `DayOfWeek`, `WeeklyHours`, `DepthButtonStyle`, `Logger+Ext` |
| `Base.lproj/` | `LaunchScreen.storyboard` |
| `Info.plist`, `berkeley-mobile.entitlements` | App configuration (entitlements include `aps-environment` for push notifications and `com.apple.developer.weatherkit`) |

## `BerkeleyMobileWidget/` (Widget Extension Module)

A separate WidgetKit target sharing the app's Firebase/Firestore backend:

- `BerkeleyMobileWidgetBundle.swift` — widget bundle entry point (`@main`), independently configures Firebase if not already configured.
- `GymOccupancyWidget.swift` — the widget's timeline provider/view.
- `Assets.xcassets/` — widget-specific assets (`AccentColor`, `AppIcon`, `WidgetBackground`).
- `Info.plist` — widget extension configuration.

## Architectural Boundaries

- **App target vs. Widget target**: Two distinct Xcode targets (`berkeley-mobile`, `BerkeleyMobileWidgetExtension`) with separate `Podfile` dependency sets — the widget only depends on `Firebase/Firestore`, not the full Firebase/Auth/Messaging/Analytics stack the main app uses.
- **Data layer vs. Feature layer**: `Data/` centralizes Firestore access/caching (`DataManager`, `DataSource` implementations, `BMNetworkingManager`) that feature ViewModels (`HomeViewModel`, `SafetyViewModel`, `ResourcesViewModel`) call into, rather than talking to Firestore directly (with the exception of `BMNetworkingManager`/`NewsDataViewModel`, which hold direct `Firestore.firestore()` references).
- **UIKit vs. SwiftUI boundary**: Legacy/complex interactive surfaces (Map, Drawer system) remain UIKit; newer feature tabs (Today, Safety, Resources) and many card/detail views are SwiftUI, bridged into the UIKit tab bar via `UIHostingController`.
- **Dependency injection boundary**: All ViewModels are constructed exclusively through the `Container` extension (`BerkeleyMobile+Injection.swift`) via FactoryKit, rather than being instantiated ad hoc by their consuming views/controllers (`@Injected`/`@InjectedObservable` property wrappers).
- **No test target boundary is enforced** — not found in codebase (no `*Tests` directory or target).
