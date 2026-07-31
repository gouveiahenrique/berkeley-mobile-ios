# Technology Stack

**Last updated:** 2026-07-31

## Summary

Berkeley Mobile is a native iOS application written in Swift, targeting iPhone running iOS 18+. It uses Firebase as its primary backend (Firestore, Auth, Analytics, Messaging) and adopts a hybrid UIKit/SwiftUI architecture with dependency injection via the Factory library.

## Languages

- **Primary Language:** Swift 5.0+
- **Secondary Languages:** None (pure Swift codebase)

## Frameworks

### iOS Application

- **UI Framework:** SwiftUI (primary for new views) + UIKit (legacy views and `UIHostingController` bridges)
- **Navigation:** UITabBarController (app shell), NavigationStack/NavigationPath (SwiftUI screens)
- **Maps:** MapKit (MKMapView, MKAnnotation, MapKit Search)
- **Widgets:** WidgetKit (iOS 17+ home screen widget)
- **Calendar Integration:** EventKit
- **Location:** CoreLocation
- **Weather:** WeatherKit (Apple's native weather service, iOS 16+)
- **Notifications:** UserNotifications + Firebase Cloud Messaging (FCM)

### Backend / Data

- **Database:** Firebase Firestore (Cloud Firestore, NoSQL document store)
- **Authentication:** Firebase Auth + Google Sign-In 8.0
- **Analytics:** Firebase Analytics
- **Push Notifications:** Firebase Messaging 11.4.0

### Dependency Injection

- **DI Framework:** Factory 2.5.3 (Swift Package Manager, `hmlongco/Factory`)

### Image Effects

- **Blur Library:** Glur 1.1.0 (Swift Package Manager, `joogps/Glur`) — SwiftUI glass/blur effects

## Major Dependencies

### CocoaPods (Podfile.lock — version 1.16.2)

| Library | Version | Purpose |
|---------|---------|---------|
| Firebase | 11.2.0 | Firebase SDK umbrella pod |
| Firebase/Analytics | 11.2.0 | Usage analytics |
| Firebase/Auth | 11.2.0 | User authentication |
| Firebase/Firestore | 11.2.0 | Cloud Firestore NoSQL database |
| FirebaseMessaging | 11.4.0 | Push notification delivery |
| GoogleSignIn | 8.0.0 | Google OAuth sign-in |

### Swift Package Manager (Package.resolved)

| Package | Version | Purpose |
|---------|---------|---------|
| Factory (`hmlongco/Factory`) | 2.5.3 | Compile-time-safe dependency injection |
| Glur (`joogps/Glur`) | 1.1.0 | SwiftUI blur/glass visual effects |

## Build Tools

- **Package Manager:** CocoaPods 1.16.2 (third-party libraries) + Swift Package Manager (first-party SPM packages)
- **Workspace:** Xcode `.xcworkspace` (required when using CocoaPods)
- **IDE:** Xcode (latest stable recommended; scheme targets iOS 18 SDK)

## Development Tools

- **Build System:** Xcode Build System (xcodebuild)
- **Linter/Formatter:** None configured (no SwiftLint, no Prettier — code style is enforced by code review)
- **Pre-commit Hooks:** None configured
- **CI/CD:** None detected (no `.github/workflows`, no Fastlane, no Bitrise config)

## Runtime Environment

- **Platform:** iOS 18.0+ (main app target)
- **Widget Extension:** iOS 17.0+ (`BerkeleyMobileWidgetExtension` target)
- **Supported Devices:** iPhone only (`TARGETED_DEVICE_FAMILY = 1` for main app; `1,2` for widget)
- **App Version:** 11.14.1 (MARKETING_VERSION)
- **Bundle ID:** `org.asuc.ASUC`

## Custom Assets

- **Custom Font:** Apercu (Regular, Bold, Medium, Light, and italic variants — `.otf` files bundled in `Assets/Fonts/`)
- **Color System:** `BMColor` struct with adaptive dark/light mode colors

## External Services

- **Database/Backend:** Firebase Firestore (collections: `Libraries`, `Dining Halls V2`, `Dining Halls`, `Gym Occupancy Meters`, `Safety Logs`, `Resource Categories`)
- **Auth Provider:** Firebase Auth + Google Sign-In
- **Weather API:** Apple WeatherKit (via `WeatherKit` framework)
- **Push Notifications:** Firebase Cloud Messaging (topic: `"all"`)

## Constraints

- Xcode required for all builds (no CLI-only workflow without Xcode toolchain)
- CocoaPods must be installed and `pod install` run before opening the workspace
- iOS 18+ deployment target on the main app target; do not use APIs newer than iOS 13 without availability checks for any code paths that existed before the iOS 18 minimum was set
- Firebase config requires a valid `GoogleService-Info.plist` (not committed; must be provided separately)
- WeatherKit requires an Apple Developer entitlement; local builds need proper provisioning
