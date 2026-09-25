# Repository Structure

## Top-Level Organization

```
berkeley-mobile-ios/
├── berkeley-mobile/                 # Main iOS app target source
├── BerkeleyMobileWidget/            # WidgetKit extension target source
├── berkeley-mobile.xcodeproj/       # Xcode project (targets, build settings, schemes)
├── berkeley-mobile.xcworkspace/     # Xcode workspace (app + Pods + SwiftPM)
├── Pods/                            # CocoaPods-managed dependencies (Firebase, GoogleSignIn, etc.)
├── app_preview_images/              # Screenshots used in README.md
├── Podfile / Podfile.lock           # CocoaPods dependency manifest
├── README.md, CONTRIBUTING.md, LICENSE.md
```

This layout is directly observed via repository listing; the app target is registered in `berkeley-mobile.xcodeproj/project.pbxproj` (`PBXNativeTarget "berkeley-mobile"`, product `Berkeley.app`) and the widget extension is registered as `PBXNativeTarget "BerkeleyMobileWidgetExtension"` (product `BerkeleyMobileWidgetExtension.appex`).

## `berkeley-mobile/` — Main App Target

The repository organizes the main target by feature/responsibility folder:

- **`AppDelegate.swift`, `AppDelegate+Migration.swift`, `SceneDelegate.swift`** — app lifecycle entry points (root of `berkeley-mobile/`).
- **`TabBarController.swift`, `MainContainerViewController.swift`** — top-level navigation (root of `berkeley-mobile/`).
- **`BerkeleyMobile+Injection.swift`** — `FactoryKit` `Container` extension declaring all injectable view models (root of `berkeley-mobile/`).
- **`Data/`** — cross-feature data layer: `DataManager.swift` (fetch/cache coordinator), `DataSource.swift` (fetch protocol), `BMNetworkingManager.swift` (Firestore client for Safety/Resources), `BMLocationManager.swift`, `BMEventManager.swift`, `BMConstants.swift`, `BMError.swift`, `SortingFunctions.swift`, plus subfolders `ItemProtocols/` (shared model protocols: `HasImage`, `HasLocation`, `HasName`, `HasOpenClosedStatus`, `HasOpenTimes`, `HasPhoneNumber`, `HasWebsite`, `CanFavorite`, `SearchItem`, `BMCalendarEvent`) and `PropertyWrappers/` (`Display.swift`).
- **`Home/`** — the app's primary tab, containing `HomeView.swift`/`HomeViewModel.swift` and feature subfolders: `Map/` (incl. `MapDataSource/`), `Dining/` (incl. `DiningDataSource/`), `Fitness/` (incl. `GymDataSource/`, `GymClassDataSource/`), `Libraries/` (incl. `LibraryDataSource/`), `Guides/`, `Search/`, `Home Drawer/`, plus `OpenClosedStatusManager.swift`, `OpenClosedStatusView.swift`, `RedirectionManager.swift`.
- **`Safety/`** — `SafetyView`/`SafetyViewModel` and related filter types (`BMSafetyLog`, `BMSafetyLogFilterState`).
- **`Events/`** — `EventDataSource/` (contains `EventsViewModel.swift`, `EventsDataService`, `BMEventCalendarEntry.swift`) plus event UI (`EventDetailView.swift`, `AllDayEventBannerView.swift`, `BMAddedCalendarStatusOverlayView.swift`).
- **`Today/`** — Today tab UI, incl. `Tiles/` subfolder.
- **`FeedbackForm/`** — `FeedbackFormPresenter.swift`, `FeedbackFormView.swift`, `FeedbackFormViewModel.swift`.
- **`Debug/`** — `DebugView.swift`, `DebugViewModel.swift` (shake-to-open debug tool, `#if DEBUG`-gated per `berkeley-mobile/TabBarController.swift:34-37`).
- **`Drawer/`** — reusable pannable bottom-sheet system: `DrawerViewController.swift`, `DrawerViewDelegate.swift`, `MainDrawerViewDelegate.swift`, `SearchDrawerViewController.swift`, `SearchDrawerViewDelegate.swift`.
- **`Common/`** — shared UI components (`BMAlert.swift`, `BMActionButton.swift`, `BMCachedAsyncImageView.swift`, `CardView.swift`, `CollapsibleCardView.swift`, `TagView.swift`, `ReviewPrompter.swift`, etc.), with subfolders `DetailView/`, `FilterView/`, `Images/`.
- **`Assets/`** — `Colors/Colors.swift` (`BMColor`), `Fonts/` (`BMFont`).
- **`Utils/`** — extension files following the `Type+Extension.swift` / `Type+Ext.swift` naming pattern (e.g. `Date+Extension.swift`, `UIView+Extensions.swift`, `String+Extension.swift`, `UserDefaults+Extension.swift`, `Logger+Ext.swift`, `NSCoding+Extension.swift`), plus `AtomicDictionary.swift` and `DayOfWeek.swift`.
- **`Assets.xcassets`, `Base.lproj`, `Resources`** — asset catalogs, localization, and misc. resources.

## `BerkeleyMobileWidget/` — Widget Extension Target

Contains `GymOccupancyWidget.swift`, which implements `GymOccupancyEntry` (`TimelineEntry`) and `GymOccupancyProvider` (`TimelineProvider`), and its own `Assets.xcassets`.

## Architectural Boundaries

- The repository separates data-fetching (`Data/` and each feature's `*DataSource/` subfolder) from presentation (`*View.swift`, `*ViewController.swift`) and state (`*ViewModel.swift`), observed consistently across `Home/`, `Safety/`, `Events/`, `FeedbackForm/`, and `Debug/`.
- Dependencies between view models and view controllers/views are resolved through the `FactoryKit` `Container` (`berkeley-mobile/BerkeleyMobile+Injection.swift`) rather than direct instantiation in most feature areas — e.g. `berkeley-mobile/Home/Map/MapViewController.swift:81` resolves `HomeViewModel` via `Container.shared.homeViewModel.resolve()`.
- Each `*DataSource` type conforms to the `DataSource` protocol (`berkeley-mobile/Data/DataSource.swift:11`) and is registered in the fixed `kDataSources` list in `berkeley-mobile/Data/DataManager.swift:12-16`; newer features (`EventsDataService`, `DiningHallsViewModel`, `BMNetworkingManager`) instead call Firestore directly from within their own service/view-model classes rather than through `DataManager`.
- The main app target and the widget extension target are declared as separate `PBXNativeTarget`s in `berkeley-mobile.xcodeproj/project.pbxproj`, each with independent build settings (e.g. differing `IPHONEOS_DEPLOYMENT_TARGET` values of `18.0` and `17.0` respectively) and each importing `Firebase/Firestore` independently per `Podfile:9-21`.
