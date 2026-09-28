# Repository Structure

## Top-Level Layout

```
berkeley-mobile-ios/
├── berkeley-mobile/              # Main application target source
├── BerkeleyMobileWidget/         # Home Screen widget extension target
├── berkeley-mobile.xcodeproj/    # Xcode project (targets, schemes, build settings)
├── berkeley-mobile.xcworkspace/  # CocoaPods-generated workspace
├── Pods/                         # CocoaPods dependency checkouts
├── app_preview_images/           # Screenshots referenced by README.md
├── Podfile / Podfile.lock        # CocoaPods dependency manifest
├── README.md / CONTRIBUTING.md / LICENSE.md
```

The workspace (`berkeley-mobile.xcworkspace/contents.xcworkspacedata`) references two projects: `berkeley-mobile.xcodeproj` and `Pods/Pods.xcodeproj`, confirming CocoaPods is the primary dependency-integration mechanism for the main app target.

## `berkeley-mobile/` (Main App Target)

Top-level files:
- `AppDelegate.swift`, `AppDelegate+Migration.swift` — app lifecycle entry point; configures Firebase, requests notification authorization, triggers initial data fetch.
- `SceneDelegate.swift` — scene lifecycle; creates the root `TabBarController` and re-triggers data fetches on foreground.
- `MainContainerViewController.swift` — hosts the map/home drawer UI, embeds a SwiftUI `HomeView` via `UIHostingController`.
- `TabBarController.swift` — root `UITabBarController` wiring the four main tabs (Home/map, Today, Safety, Resources).
- `BerkeleyMobile+Injection.swift` — `FactoryKit` `Container` extension registering all view-model factories used across the app.
- `berkeley-mobile.entitlements`, `Info.plist` — app capabilities (push notifications, WeatherKit) and bundle metadata.

Subdirectories (from direct inspection of `berkeley-mobile/`):

| Directory | Responsibility (evidence-based) |
|---|---|
| `Data/` | Core data layer: `DataManager` (singleton fetch/cache orchestrator), `BMNetworkingManager` (direct Firestore queries), `DataSource` protocol, `BMLocationManager`, `BMConstants`, `BMError`, `BMEventManager`, `SortingFunctions`. |
| `Data/ItemProtocols/` | Composable domain-model protocols: `HasImage`, `HasLocation`, `HasName`, `HasWebsite`, `HasPhoneNumber`, `HasOpenClosedStatus`, `HasOpenTimes`, `CanFavorite`, `SearchItem`, `BMCalendarEvent`. |
| `Data/PropertyWrappers/` | Custom property wrapper `Display` (`berkeley-mobile/Data/PropertyWrappers/Display.swift`), used on model fields (e.g. `BMEventCalendarEntry.name`). |
| `Home/` | Home tab feature area: `HomeViewModel` (drawer state, dining/library/gym fetch orchestration), with sub-features `Home/Dining`, `Home/Fitness`, `Home/Guides`, `Home/Libraries`, `Home/Map`, `Home/Search`, `Home/Home Drawer`. |
| `Today/` | Today tab feature area, with `Today/Tiles` containing tile sub-features (`News Tile`, `Weather Tile`, per `NewsDataViewModel.swift` and `WeatherDataViewModel.swift`). |
| `Safety/` | Safety tab feature: `SafetyViewModel` fetches and filters `BMSafetyLog` records from `BMNetworkingManager`. |
| `Events/` | Calendar/events feature: `Events/EventDataSource` contains `EventsViewModel`, `EventsDataService`, `BMEventCalendarEntry`, plus supporting views (`AllDayEventBannerView`, `BMAddedCalendarStatusOverlayView`). |
| `FeedbackForm/` | In-app feedback form: `FeedbackFormPresenter`, `FeedbackFormViewModel`, `FeedbackFormView` (SwiftUI), gated by a Firestore-configured display threshold. |
| `Drawer/` | Reusable bottom-drawer UI/interaction system: `MainDrawerViewDelegate`, `DrawerViewDelegate`, `DrawerViewController`, `SearchDrawerViewDelegate`. |
| `Common/` | Shared UI components: `CardView`, `TagView`, `BMAlert`, `BMActionButton`, `BMDrawerView`, `CollapsibleCardView`, `BMCachedAsyncImageView`, and `Common/DetailView` (generic detail-view components: `DetailView`, `DescriptionCardView`, `OverviewCardView`, `OpenTimesCardSwiftUIView`), `Common/FilterView`, `Common/Images`. |
| `Assets/` | `Assets/Colors` (`BMColor` design tokens) and `Assets/Fonts`. |
| `Assets.xcassets` | Xcode asset catalog (app icon, images, map icons). |
| `Resources/` | `ResourcesViewModel` and related resource-category feature code. |
| `Utils/` | Cross-cutting extensions: `Date+Extension.swift`, `UserDefaults+Extension.swift`. |
| `Debug/` | `DebugViewModel`/`DebugView`, presented only `#if DEBUG` (triggered by a shake gesture in `TabBarController.motionEnded`). |
| `Base.lproj` | Localization base directory (Interface Builder-managed). |

## `BerkeleyMobileWidget/` (Widget Extension Target)

- `BerkeleyMobileWidgetBundle.swift` — widget bundle entry point.
- `GymOccupancyWidget.swift` — `TimelineProvider` (`GymOccupancyProvider`) and `TimelineEntry` (`GymOccupancyEntry`) implementing a Home Screen gym-occupancy widget, sharing `GymOccupancyViewModel` with the main app.
- `Assets.xcassets`, `Info.plist` — widget-specific resources and metadata.

## Architectural Boundaries

- The widget extension (`BerkeleyMobileWidgetExtension` target) depends on `Firebase/Firestore` independently (declared as its own `Podfile` target), and reuses `GymOccupancyViewModel` from the main app's `Home/Fitness/GymOccupancy` feature — indicating shared Swift source files are compiled into both targets rather than the widget depending on a separate framework module. Not found in codebase: an explicit shared-framework/module boundary (e.g. no internal Swift Package or framework target was found separating shared code from the app target).
- Dependency wiring is centralized in `BerkeleyMobile+Injection.swift` rather than being distributed across call sites — all `Factory<T>` registrations for view models are declared in this single file.
- No test target exists in the Xcode project (`berkeley-mobile.xcodeproj/project.pbxproj` contains no `com.apple.product-type.bundle.unit-test` or `.bundle.ui-testing` entries), so there is no dedicated `Tests/` directory in this repository.
