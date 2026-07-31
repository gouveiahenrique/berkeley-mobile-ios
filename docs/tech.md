# Technology Stack

**Last updated:** 2026-07-31

## Summary

Berkeley Mobile iOS is a native Swift/SwiftUI application for UC Berkeley students, backed by Google Cloud Firestore. It is built with Xcode using CocoaPods for Firebase dependencies and Swift Package Manager for additional libraries.

## Languages

- **Primary Language:** Swift 5.0 (Xcode project setting `SWIFT_VERSION = 5.0`)
- **Secondary Languages:** None

## Frameworks

### Mobile (iOS)

- **UI Framework:** SwiftUI (primary, ~66 files) with UIKit interoperability (UIHostingController, ~26 files)
- **App Lifecycle:** UIKit AppDelegate + SceneDelegate with `@UIApplicationMain`
- **Observation:** Swift `@Observable` macro (iOS 17+) and `ObservableObject`/`@Published` (iOS 13+ fallback)
- **Dependency Injection:** Factory 2.5.3 (Swift Package Manager) — `import FactoryKit`
- **Map:** MapKit (native)
- **Calendar Integration:** EventKit (native)
- **Push Notifications:** UserNotifications + FirebaseMessaging
- **Authentication:** FirebaseAuth 11.2.0 + GoogleSignIn 8.0.0 + AppAuth 1.7.5 + GTMAppAuth
- **Image Blurring:** Glur 1.1.0 (SPM)

### Backend / Data

- **Database:** Google Cloud Firestore (via Firebase iOS SDK)
- **Authentication:** Firebase Auth (Google Sign-In via `GoogleSignIn` pod)
- **Analytics:** FirebaseAnalytics 11.2.0
- **Push Messaging:** FirebaseMessaging 11.4.0

## Major Dependencies

### CocoaPods Runtime Dependencies

| Pod | Version | Purpose |
|-----|---------|---------|
| Firebase/Analytics | 11.2.0 | Event analytics |
| Firebase/Auth | 11.2.0 | User authentication |
| Firebase/Firestore | 11.2.0 | NoSQL cloud database |
| FirebaseMessaging | 11.4.0 | Push notifications |
| GoogleSignIn | 8.0.0 | Google OAuth sign-in |
| AppAuth | 1.7.5 | OAuth 2.0 / OIDC |
| GTMSessionFetcher | 3.5.0 | HTTP session fetching (Google) |
| AppCheckCore | 11.2.0 | Firebase App Check |

### Swift Package Manager (SPM) Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Factory (hmlongco/Factory) | 2.5.3 | Compile-time safe DI container |
| Glur (joogps/Glur) | 1.1.0 | SwiftUI progressive blur effect |

## Build Tools

- **Package Manager (native deps):** CocoaPods 1.16.2 (`Podfile`, `Podfile.lock`)
- **Package Manager (SPM deps):** Xcode Swift Package Manager (`Package.resolved`)
- **Build System:** Xcode (`.xcworkspace` — must open `berkeley-mobile.xcworkspace`, not `.xcodeproj`)
- **Task Runner:** None (Xcode schemes only)

## Development Tools

- **IDE:** Xcode 13+ recommended (scheme `LastUpgradeVersion = 1130`)
- **Linter:** None configured (no SwiftLint, no `.swiftlint.yml`)
- **Formatter:** None configured
- **Type Checker:** Swift compiler (built into Xcode)
- **Pre-commit Hooks:** None configured

## Runtime Environment

- **Minimum iOS Deployment Target:** iOS 13.0 (main app)
- **Widget Extension Target:** iOS 17.0 minimum
- **Archive Target:** iOS 18.0 (latest build configuration)
- **Supported Devices:** iPhone (`TARGETED_DEVICE_FAMILY = 1`) and iPad for widget (`1,2`)
- **App Version:** 11.14.1

## External Services

- **Backend Database:** Google Cloud Firestore (production keys in `GoogleService-Info.plist`, not committed)
- **Authentication:** Firebase Auth / Google Sign-In
- **Analytics:** Firebase Analytics + Google App Measurement
- **Push Notifications:** Firebase Cloud Messaging (FCM)

## Constraints

- Must open `berkeley-mobile.xcworkspace` (not `.xcodeproj`) due to CocoaPods integration
- `GoogleService-Info.plist` is excluded from the repository — contact the team for production credentials
- Factory DI container is initialized at app startup via `Container` extensions in `BerkeleyMobile+Injection.swift`
- Swift `@Observable` macro requires iOS 17+; use `ObservableObject`/`@Published` when iOS 13 support is needed
