# Technology Stack

**Last updated:** 2026-07-31

## Summary

Berkeley Mobile iOS is a native iOS application built in Swift using SwiftUI (primary) and UIKit (legacy/interop). It uses Firebase as its backend (Firestore, Auth, Analytics, Messaging) and CocoaPods + Swift Package Manager for dependency management.

## Languages

- **Primary Language:** Swift 5.0
- **Secondary Languages:** None

## Frameworks

### iOS UI

- **Primary UI:** SwiftUI (iOS 17+, main feature views)
- **Legacy UI:** UIKit (map view, older screens bridged via `UIViewControllerRepresentable` / `UIHostingController`)
- **Widget Extension:** WidgetKit (Gym Occupancy widget targeting iOS 17+)

### Data & Networking

- **Backend:** Google Cloud Firestore (via Firebase iOS SDK 11.2.0)
- **Authentication:** Firebase Auth 11.2.0 + Google Sign-In 8.0.0
- **Push Notifications:** Firebase Cloud Messaging 11.4.0
- **Analytics:** Firebase Analytics 11.2.0

### Maps

- **Map Framework:** MapKit (native iOS)

## Major Dependencies

### Runtime Dependencies (CocoaPods)

| Library | Version | Purpose |
|---------|---------|---------|
| Firebase | 11.2.0 | Core Firebase SDK umbrella |
| Firebase/Analytics | 11.2.0 | Event tracking and user analytics |
| Firebase/Auth | 11.2.0 | User authentication |
| Firebase/Firestore | 11.2.0 | NoSQL cloud database (primary data store) |
| FirebaseMessaging | 11.4.0 | Push notifications (FCM) |
| GoogleSignIn | 8.0.0 | Google OAuth sign-in |

### Runtime Dependencies (Swift Package Manager)

| Library | Version | Purpose |
|---------|---------|---------|
| Factory (FactoryKit) | 2.5.3 | Dependency injection container |
| Glur | 1.1.0 | Image blur effects |

### Development Dependencies

| Tool | Version | Purpose |
|------|---------|---------|
| CocoaPods | latest | Manages Firebase and Google SDK pods |
| Xcode | 15+ recommended (16 for iOS 18 APIs) | IDE, build, simulator |
| Swift Package Manager | built-in | Manages FactoryKit and Glur |

## Build Tools

- **Package Manager:** CocoaPods (Podfile) + Swift Package Manager (Package.resolved)
- **Build System:** Xcode build system (`.xcworkspace`)
- **Workspace:** `berkeley-mobile.xcworkspace` (must be opened, not `.xcodeproj`)

## Runtime Environment

- **Minimum iOS Version:** iOS 17.0 (main app), iOS 13.0 (widget extension targets vary)
- **Targeted Device:** iPhone (TARGETED_DEVICE_FAMILY = 1); iPad added for some extensions ("1,2")
- **App Version:** 11.14.1
- **Swift Version:** 5.0

## External Services

- **Primary Database:** Google Cloud Firestore (via Firebase project)
- **Authentication:** Firebase Auth + Google Sign-In
- **Push Notifications:** Firebase Cloud Messaging (topic: "all")
- **Analytics:** Firebase Analytics
- **Configuration:** `GoogleService-Info.plist` (not in repository — must be obtained separately)

## Constraints

- `GoogleService-Info.plist` is excluded from the repository; contributors must obtain it from the team to build against the production backend.
- The `.xcworkspace` must be opened (not `.xcodeproj`) to include CocoaPods dependencies.
- CocoaPods must be installed and `pod install` run before building.
- iOS 17+ APIs are used in the main app (`glassEffect`, `@Observable`); Xcode 15+ required.
- iOS 26 APIs are conditionally used (`#available(iOS 26.0, *)` guards are present).
